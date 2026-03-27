"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

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

const NEXT_STATUS: Record<string, string> = {
  paid: "shipping",
  shipping: "delivered",
};

export default function AdminOrdersPage() {
  const orders = useQuery(api.orders.getAllOrders);
  const updateStatus = useMutation(api.orders.updateStatus);

  if (orders === undefined) {
    return (
      <main className="p-8">
        <h1 className="text-3xl font-bold mb-8">주문 관리</h1>
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 bg-slate-100 dark:bg-slate-800 rounded-xl" />
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-8">주문 관리</h1>
      {orders.length === 0 ? (
        <p className="text-slate-500 text-center py-12">주문이 없습니다.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="border border-slate-200 dark:border-slate-700 rounded-xl p-6"
            >
              <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                <div>
                  <p className="font-semibold">
                    {order.user?.name ?? "알 수 없는 사용자"}{" "}
                    <span className="text-slate-400 text-sm font-normal">({order.user?.email})</span>
                  </p>
                  <p className="text-sm text-slate-500">
                    {new Date(order._creationTime).toLocaleString("ko-KR")}
                  </p>
                  <p className="text-sm text-slate-400 truncate max-w-xs">{order._id}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      STATUS_COLORS[order.status] ?? "bg-slate-100 text-slate-800"
                    }`}
                  >
                    {STATUS_LABELS[order.status] ?? order.status}
                  </span>
                  {NEXT_STATUS[order.status] && (
                    <button
                      onClick={() =>
                        updateStatus({
                          orderId: order._id,
                          status: NEXT_STATUS[order.status] as "shipping" | "delivered",
                        })
                      }
                      className="text-sm bg-slate-700 hover:bg-slate-800 text-white px-3 py-1 rounded-lg"
                    >
                      → {STATUS_LABELS[NEXT_STATUS[order.status]]}
                    </button>
                  )}
                </div>
              </div>
              <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                {order.items.map((item) => (
                  <div key={item._id} className="flex justify-between">
                    <span>{item.product?.name ?? "삭제된 상품"} × {item.quantity}</span>
                    <span>₩{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-100 dark:border-slate-800 mt-4 pt-3 flex justify-end">
                <p className="font-bold">합계: ₩{order.totalAmount.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
