"use node";

import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import Stripe from "stripe";
import { Id } from "./_generated/dataModel";

export const createCheckoutSession = action({
  args: {},
  handler: async (ctx): Promise<string | null> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const cartItems = (await ctx.runMutation(internal.stripeInternal.getCartForCheckout, {})) as {
      itemId: Id<"cartItems">;
      productId: Id<"products">;
      name: string;
      price: number;
      quantity: number;
      imageUrl: string;
    }[];

    if (cartItems.length === 0) throw new Error("Cart is empty");

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-03-25.dahlia",
    });

    const totalAmount = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const orderId = (await ctx.runMutation(internal.stripeInternal.createPendingOrder, {
      totalAmount,
      items: cartItems.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        price: i.price,
      })),
    })) as Id<"orders">;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: cartItems.map((item) => ({
        price_data: {
          currency: "krw",
          product_data: {
            name: item.name,
            images: item.imageUrl ? [item.imageUrl] : [],
          },
          unit_amount: item.price,
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/orders?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
      metadata: { orderId: orderId as string },
    });

    await ctx.runMutation(internal.stripeInternal.updateOrderStripeSession, {
      orderId,
      stripeSessionId: session.id,
    });

    return session.url;
  },
});
