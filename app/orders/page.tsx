"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import EmptyState from "@/components/EmptyState";

const STEPS = ["pending", "paid", "shipping", "delivered"] as const;
type Status = typeof STEPS[number];

const STATUS_LABELS: Record<Status, string> = {
  pending: "결제 대기",
  paid: "결제 완료",
  shipping: "배송 중",
  delivered: "배송 완료",
};

const STATUS_ICONS: Record<Status, string> = {
  pending: "⏳",
  paid: "✅",
  shipping: "🚚",
  delivered: "📦",
};

function OrderStatusBar({ status }: { status: string }) {
  const currentIdx = STEPS.indexOf(status as Status);
  return (
    <div className="flex items-center gap-0 my-4">
      {STEPS.map((step, idx) => {
        const isCompleted = idx <= currentIdx;
        const isCurrent = idx === currentIdx;
        return (
          <div key={step} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-shrink-0">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  isCompleted
                    ? isCurrent
                      ? "bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900"
                      : "bg-blue-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                }`}
              >
                {isCompleted ? (isCurrent ? STATUS_ICONS[step] : "✓") : idx + 1}
              </div>
              <span
                className={`text-xs mt-1 font-medium whitespace-nowrap ${
                  isCurrent ? "text-blue-600 dark:text-blue-400" : isCompleted ? "text-slate-600 dark:text-slate-400" : "text-slate-300"
                }`}
              >
                {STATUS_LABELS[step]}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 mb-5 ${idx < currentIdx ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-700"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function OrdersContent() {
  const orders = useQuery(api.orders.getMyOrders);
  const searchParams = useSearchParams();
  const success = searchParams.get("success");

  if (orders === undefined) {
    return (
      <div className="space-y-4 animate-pulse">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-48 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <>
      {success && (
        <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <span className="text-2xl">🎉</span>
          <div>
            <p className="font-semibold">결제가 완료되었습니다!</p>
            <p className="text-sm opacity-80">주문이 접수되어 처리 중입니다.</p>
          </div>
        </div>
      )}

      {orders.length === 0 ? (
        <EmptyState
          icon="📋"
          title="주문 내역이 없습니다"
          description="첫 번째 주문을 해보세요!"
          ctaLabel="쇼핑하러 가기"
          ctaHref="/"
        />
      ) : (
        <div className="space-y-5">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm"
            >
              {/* 헤더 */}
              <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                <div>
                  <p className="font-bold">
                    주문 #{order._id.slice(-8).toUpperCase()}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {new Date(order._creationTime).toLocaleString("ko-KR")}
                  </p>
                </div>
                <p className="font-bold text-blue-600 dark:text-blue-400 text-lg">
                  ₩{order.totalAmount.toLocaleString()}
                </p>
              </div>

              {/* Progress Bar */}
              <OrderStatusBar status={order.status} />

              {/* 상품 목록 */}
              <div className="space-y-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                {order.items.map((item) => (
                  <div key={item._id} className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden flex-shrink-0">
                      {item.product?.imageUrl ? (
                        <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300 text-lg">📦</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.product?.name ?? "삭제된 상품"}</p>
                      <p className="text-xs text-slate-400">{item.quantity}개 × ₩{item.price.toLocaleString()}</p>
                    </div>
                    <p className="text-sm font-semibold flex-shrink-0">
                      ₩{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export default function OrdersPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-8">주문 내역</h1>
      <Suspense fallback={<div className="animate-pulse h-32 bg-slate-100 dark:bg-slate-800 rounded-2xl" />}>
        <OrdersContent />
      </Suspense>
    </main>
  );
}
