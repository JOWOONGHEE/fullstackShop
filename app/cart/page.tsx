"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import Link from "next/link";
import EmptyState from "@/components/EmptyState";
import { useToast } from "@/components/Toast";

export default function CartPage() {
  const { showToast } = useToast();
  const items = useQuery(api.cart.getMyCart);
  const updateQuantity = useMutation(api.cart.updateQuantity);
  const removeItem = useMutation(api.cart.removeItem);
  const clearCart = useMutation(api.cart.clearCart);
  const createPendingOrder = useMutation(api.tossOrders.createPendingOrder);
  const [checkingOut, setCheckingOut] = useState(false);

  if (items === undefined) {
    return (
      <main className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-8">장바구니</h1>
        <div className="flex gap-8">
          <div className="flex-1 space-y-4 animate-pulse">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-28 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
            ))}
          </div>
          <div className="w-72 h-56 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
        </div>
      </main>
    );
  }

  const subtotal = items.reduce((sum, item) => sum + (item.product?.price ?? 0) * item.quantity, 0);
  const shipping = 0;
  const total = subtotal + shipping;

  async function handleCheckout() {
    setCheckingOut(true);
    try {
      const { orderId, totalAmount, orderName } = await createPendingOrder({});
      const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
      if (!clientKey) throw new Error("NEXT_PUBLIC_TOSS_CLIENT_KEY not configured");
      const { loadTossPayments } = await import("@tosspayments/tosspayments-sdk");
      const tossPayments = await loadTossPayments(clientKey);
      const payment = tossPayments.payment({ customerKey: "GUEST_" + Date.now() });
      await payment.requestPayment({
        method: "CARD",
        amount: { currency: "KRW", value: totalAmount },
        orderId,
        orderName,
        successUrl: `${window.location.origin}/checkout/success`,
        failUrl: `${window.location.origin}/checkout/fail`,
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "결제 중 오류가 발생했습니다.";
      if (!msg.includes("PAY_PROCESS_CANCELED")) {
        showToast(msg, "error");
      }
      setCheckingOut(false);
    }
  }

  async function handleClearCart() {
    if (!confirm("장바구니를 모두 비우시겠습니까?")) return;
    await clearCart({});
    showToast("장바구니를 비웠습니다.", "info");
  }

  if (items.length === 0) {
    return (
      <main className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-8">장바구니</h1>
        <EmptyState
          icon="🛒"
          title="장바구니가 비어있어요"
          description="원하는 상품을 장바구니에 담아보세요."
          ctaLabel="쇼핑 시작하기"
          ctaHref="/"
        />
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">장바구니</h1>
        <button
          onClick={handleClearCart}
          className="text-sm text-slate-400 hover:text-red-500 transition-colors"
        >
          전체 삭제
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* 상품 목록 */}
        <div className="flex-1 space-y-3">
          {items.map((item) => (
            <div
              key={item._id}
              className="flex items-center gap-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-sm"
            >
              <Link href={`/products/${item.productId}`} className="flex-shrink-0">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden">
                  {item.product?.imageUrl ? (
                    <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300 text-2xl">📦</div>
                  )}
                </div>
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/products/${item.productId}`}>
                  <p className="font-semibold truncate hover:text-blue-600 transition-colors">{item.product?.name}</p>
                </Link>
                <p className="text-blue-600 dark:text-blue-400 text-sm mt-0.5">
                  ₩{item.product?.price.toLocaleString()}
                </p>
              </div>
              <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                <button
                  onClick={() =>
                    item.quantity > 1
                      ? updateQuantity({ itemId: item._id, quantity: item.quantity - 1 })
                      : removeItem({ itemId: item._id })
                  }
                  className="w-9 h-9 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  −
                </button>
                <span className="w-9 text-center text-sm font-semibold">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity({ itemId: item._id, quantity: item.quantity + 1 })}
                  className="w-9 h-9 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  +
                </button>
              </div>
              <div className="text-right min-w-[80px]">
                <p className="font-bold text-sm">₩{((item.product?.price ?? 0) * item.quantity).toLocaleString()}</p>
              </div>
              <button
                onClick={() => removeItem({ itemId: item._id })}
                className="text-slate-300 hover:text-red-500 transition-colors ml-1 text-lg leading-none"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* 주문 요약 패널 */}
        <div className="lg:w-72 flex-shrink-0">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm sticky top-24">
            <h2 className="font-bold text-lg mb-5">주문 요약</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>상품 금액</span>
                <span>₩{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>배송비</span>
                <span className="text-green-600 font-medium">무료</span>
              </div>
              <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex justify-between font-bold text-base">
                <span>최종 결제 금액</span>
                <span className="text-blue-600 dark:text-blue-400">₩{total.toLocaleString()}</span>
              </div>
            </div>
            <button
              onClick={handleCheckout}
              disabled={checkingOut}
              className="mt-6 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-bold py-3.5 rounded-xl transition-colors"
            >
              {checkingOut ? "처리 중..." : "결제하기"}
            </button>
            <Link href="/" className="block text-center text-sm text-slate-400 hover:text-blue-600 mt-3 transition-colors">
              쇼핑 계속하기
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
