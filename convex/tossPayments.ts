import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// TossPayments 결제 확인 + Convex 주문 fulfill
export const confirmPayment = action({
  args: {
    paymentKey: v.string(),
    orderId: v.string(),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const secretKey = process.env.TOSS_SECRET_KEY;
    if (!secretKey) throw new Error("TOSS_SECRET_KEY not configured");

    // TossPayments 결제 확인 API 호출
    const basicToken = btoa(secretKey + ":");
    const response = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        paymentKey: args.paymentKey,
        orderId: args.orderId,
        amount: args.amount,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      throw new Error(errorBody.message ?? "결제 확인에 실패했습니다.");
    }

    // Convex 주문 상태 업데이트 + 장바구니 비우기
    await ctx.runMutation(internal.tossOrders.fulfillOrder, {
      convexOrderId: args.orderId,
      paymentKey: args.paymentKey,
    });

    return { success: true };
  },
});

// 결제 실패/취소 시 주문 정리
export const cancelPayment = action({
  args: { orderId: v.string() },
  handler: async (ctx, args) => {
    await ctx.runMutation(internal.tossOrders.cancelOrder, {
      convexOrderId: args.orderId,
    });
    return { success: true };
  },
});
