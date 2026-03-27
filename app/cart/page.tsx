"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CartPage() {
  const router = useRouter();
  const items = useQuery(api.cart.getMyCart);
  const updateQuantity = useMutation(api.cart.updateQuantity);
  const removeItem = useMutation(api.cart.removeItem);
  const createCheckout = useMutation(api.stripe.createCheckoutSession);
  const [checkingOut, setCheckingOut] = useState(false);

  if (items === undefined) {
    return (
      <main className="p-8 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">장바구니</h1>
        <div className="space-y-4 animate-pulse">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-slate-100 dark:bg-slate-800 rounded-xl" />
          ))}
        </div>
      </main>
    );
  }

  const total = items.reduce(
    (sum, item) => sum + (item.product?.price ?? 0) * item.quantity,
    0
  );

  async function handleCheckout() {
    if (items!.length === 0) return;
    setCheckingOut(true);
    try {
      const url = await createCheckout({});
      if (url) window.location.href = url;
    } catch (e) {
      console.error(e);
      setCheckingOut(false);
    }
  }

  if (items.length === 0) {
    return (
      <main className="p-8 max-w-3xl mx-auto flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-xl text-slate-500 mb-4">장바구니가 비어있습니다.</p>
        <button
          onClick={() => router.push("/")}
          className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700"
        >
          쇼핑하러 가기
        </button>
      </main>
    );
  }

  return (
    <main className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">장바구니</h1>
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item._id}
            className="flex items-center gap-4 border border-slate-200 dark:border-slate-700 rounded-xl p-4"
          >
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden flex-shrink-0">
              {item.product?.imageUrl ? (
                <img
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                  없음
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="font-semibold">{item.product?.name}</p>
              <p className="text-blue-600 dark:text-blue-400 text-sm">
                ₩{item.product?.price.toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  item.quantity > 1
                    ? updateQuantity({ itemId: item._id, quantity: item.quantity - 1 })
                    : removeItem({ itemId: item._id })
                }
                className="w-8 h-8 border rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                -
              </button>
              <span className="w-8 text-center">{item.quantity}</span>
              <button
                onClick={() =>
                  updateQuantity({ itemId: item._id, quantity: item.quantity + 1 })
                }
                className="w-8 h-8 border rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                +
              </button>
            </div>
            <p className="w-24 text-right font-semibold">
              ₩{((item.product?.price ?? 0) * item.quantity).toLocaleString()}
            </p>
            <button
              onClick={() => removeItem({ itemId: item._id })}
              className="text-slate-400 hover:text-red-500 transition-colors ml-2"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <div className="mt-8 border-t border-slate-200 dark:border-slate-700 pt-6 flex justify-between items-center">
        <div>
          <p className="text-slate-500">합계</p>
          <p className="text-2xl font-bold">₩{total.toLocaleString()}</p>
        </div>
        <button
          onClick={handleCheckout}
          disabled={checkingOut}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-semibold py-3 px-8 rounded-xl transition-colors"
        >
          {checkingOut ? "처리 중..." : "결제하기"}
        </button>
      </div>
    </main>
  );
}
