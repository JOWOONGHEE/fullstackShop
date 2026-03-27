import { internalMutation, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// 장바구니 기반으로 pending 주문 생성 후 orderId, totalAmount, orderName 반환
export const createPendingOrder = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    const cartItems = await ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .take(100);

    if (cartItems.length === 0) throw new Error("Cart is empty");

    const itemsWithProducts = [];
    let totalAmount = 0;
    const productNames: string[] = [];

    for (const item of cartItems) {
      const product = await ctx.db.get(item.productId);
      if (!product) continue;
      totalAmount += product.price * item.quantity;
      productNames.push(product.name);
      itemsWithProducts.push({ item, product });
    }

    // TossPayments orderId로 Convex _id를 사용
    const orderId = await ctx.db.insert("orders", {
      userId: user._id,
      status: "pending",
      totalAmount,
      stripeSessionId: "", // 결제 확인 후 paymentKey로 업데이트
    });

    for (const { item, product } of itemsWithProducts) {
      await ctx.db.insert("orderItems", {
        orderId,
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
      });
    }

    const orderName =
      productNames.length === 1
        ? productNames[0]
        : `${productNames[0]} 외 ${productNames.length - 1}건`;

    return { orderId: orderId as string, totalAmount, orderName };
  },
});

// 결제 완료 처리: paymentKey 저장 + status paid + 장바구니 비우기
export const fulfillOrder = internalMutation({
  args: {
    convexOrderId: v.string(),
    paymentKey: v.string(),
  },
  handler: async (ctx, args) => {
    const orderId = args.convexOrderId as Id<"orders">;
    const order = await ctx.db.get(orderId);
    if (!order) throw new Error("Order not found");

    await ctx.db.patch(orderId, {
      status: "paid",
      stripeSessionId: args.paymentKey,
    });

    const cartItems = await ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", order.userId))
      .take(100);
    for (const item of cartItems) {
      await ctx.db.delete(item._id);
    }
  },
});

// 결제 실패/취소 시 pending 주문 삭제
export const cancelOrder = internalMutation({
  args: { convexOrderId: v.string() },
  handler: async (ctx, args) => {
    const orderId = args.convexOrderId as Id<"orders">;
    const orderItems = await ctx.db
      .query("orderItems")
      .withIndex("by_order", (q) => q.eq("orderId", orderId))
      .take(100);
    for (const item of orderItems) await ctx.db.delete(item._id);
    await ctx.db.delete(orderId);
  },
});
