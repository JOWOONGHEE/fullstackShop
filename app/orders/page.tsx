"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const STATUS_LABELS: Record<string, string> = {
  pending: "결제 대기",
  paid: "결제 완료",
  shipping: "배송 중",
  delivered: "배송 완료",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-blue-100 text-blue-800",
  shipping: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
};

function OrdersContent() {
  const orders = useQuery(api.orders.getMyOrders);
  const searchParams = useSearchParams();
  const success = searchParams.get("success");

  if (orders === undefined) {
    return (
      <div className="space-y-4 animate-pulse">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-32 bg-slate-100 dark:bg-slate-800 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <>
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl p-4 mb-6">
          결제가 완료되었습니다! 주문이 처리 중입니다.
        </div>
      )}
      {orders.length === 0 ? (
        <p className="text-slate-500 text-center py-12">주문 내역이 없습니다.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="border border-slate-200 dark:border-slate-700 rounded-xl p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-slate-500">
                    주문일: {new Date(order._creationTime).toLocaleDateString("ko-KR")}
                  </p>
                  <p className="text-sm text-slate-500 truncate max-w-xs">
                    주문번호: {order._id}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    STATUS_COLORS[order.status] ?? "bg-slate-100 text-slate-800"
                  }`}
                >
                  {STATUS_LABELS[order.status] ?? order.status}
                </span>
              </div>
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={item._id} className="flex justify-between text-sm">
                    <span>
                      {item.product?.name ?? "삭제된 상품"} × {item.quantity}
                    </span>
                    <span>₩{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-100 dark:border-slate-800 mt-4 pt-4 flex justify-end">
                <p className="font-bold">
                  합계: ₩{order.totalAmount.toLocaleString()}
                </p>
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
    <main className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">주문 내역</h1>
      <Suspense fallback={<div className="animate-pulse h-32 bg-slate-100 rounded-xl" />}>
        <OrdersContent />
      </Suspense>
    </main>
  );
}
