import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const getCartForCheckout = internalMutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    const items = await ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .take(100);

    const result = [];
    for (const item of items) {
      const product = await ctx.db.get(item.productId);
      if (product) {
        result.push({
          itemId: item._id,
          productId: item.productId,
          name: product.name,
          price: product.price,
          quantity: item.quantity,
          imageUrl: product.imageUrl,
        });
      }
    }
    return result;
  },
});

export const createPendingOrder = internalMutation({
  args: {
    totalAmount: v.number(),
    items: v.array(
      v.object({
        productId: v.id("products"),
        quantity: v.number(),
        price: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    const orderId = await ctx.db.insert("orders", {
      userId: user._id,
      status: "pending",
      totalAmount: args.totalAmount,
      stripeSessionId: "",
    });

    for (const item of args.items) {
      await ctx.db.insert("orderItems", {
        orderId,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      });
    }

    return orderId;
  },
});

export const updateOrderStripeSession = internalMutation({
  args: { orderId: v.id("orders"), stripeSessionId: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.orderId, { stripeSessionId: args.stripeSessionId });
  },
});

export const fulfillOrder = internalMutation({
  args: { stripeSessionId: v.string() },
  handler: async (ctx, args) => {
    const order = await ctx.db
      .query("orders")
      .withIndex("by_stripeSession", (q) =>
        q.eq("stripeSessionId", args.stripeSessionId)
      )
      .unique();

    if (!order) throw new Error("Order not found");
    await ctx.db.patch(order._id, { status: "paid" });

    const cartItems = await ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", order.userId))
      .take(100);
    for (const item of cartItems) {
      await ctx.db.delete(item._id);
    }
  },
});
