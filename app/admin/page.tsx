"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import Link from "next/link";
import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

const STATUS_LABELS: Record<string, string> = {
  pending: "결제 대기", paid: "결제 완료", shipping: "배송 중", delivered: "배송 완료",
};
const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-blue-100 text-blue-800",
  shipping: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
};

export default function AdminDashboard() {
  const stats = useQuery(api.admin.getSalesStats);
  const recentOrders = useQuery(api.admin.getRecentOrders);
  const claimFirstAdmin = useMutation(api.users.claimFirstAdmin);
  const currentUser = useQuery(api.users.current);
  const [claiming, setClaiming] = useState(false);
  const [claimError, setClaimError] = useState("");

  if (currentUser !== undefined && (currentUser?.role ?? "user") !== "admin") {
    return (
      <main className="p-8 max-w-md mx-auto mt-20 text-center">
        <p className="text-2xl font-bold mb-2">접근 권한 없음</p>
        <p className="text-slate-500 mb-6">관리자 계정이 아닙니다.</p>
        <button
          onClick={async () => {
            setClaiming(true); setClaimError("");
            try { await claimFirstAdmin({}); window.location.reload(); }
            catch (e: unknown) { setClaimError(e instanceof Error ? e.message : "오류가 발생했습니다."); }
            finally { setClaiming(false); }
          }}
          disabled={claiming}
          className="bg-purple-600 hover:bg-purple-700 disabled:bg-slate-400 text-white px-6 py-2 rounded-xl"
        >
          {claiming ? "처리 중..." : "첫 번째 관리자로 설정"}
        </button>
        {claimError && <p className="text-red-500 mt-3 text-sm">{claimError}</p>}
        <p className="text-xs text-slate-400 mt-4">이미 관리자가 존재하면 이 버튼은 작동하지 않습니다.</p>
      </main>
    );
  }

  if (stats === undefined) {
    return (
      <main className="p-8 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 7 }).map((_, i) => <div key={i} className="h-28 bg-slate-100 dark:bg-slate-800 rounded-2xl" />)}
          </div>
          <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
        </div>
      </main>
    );
  }

  const statCards = [
    { label: "오늘 매출", value: `₩${stats.dailyTotal.toLocaleString()}`, icon: "📅", color: "border-blue-200 dark:border-blue-800" },
    { label: "이번 달 매출", value: `₩${stats.monthlyTotal.toLocaleString()}`, icon: "📆", color: "border-green-200 dark:border-green-800" },
    { label: "올해 매출", value: `₩${stats.yearlyTotal.toLocaleString()}`, icon: "🗓️", color: "border-purple-200 dark:border-purple-800" },
    { label: "총 매출", value: `₩${stats.totalRevenue.toLocaleString()}`, icon: "💰", color: "border-yellow-200 dark:border-yellow-800" },
    { label: "전체 주문", value: `${stats.totalOrders}건`, icon: "📋", color: "border-slate-200 dark:border-slate-700" },
    { label: "결제 완료", value: `${stats.paidOrders}건`, icon: "✅", color: "border-teal-200 dark:border-teal-800" },
    { label: "등록 상품", value: `${stats.totalProducts}개`, icon: "📦", color: "border-orange-200 dark:border-orange-800" },
  ];

  return (
    <main className="max-w-7xl mx-auto px-6 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">관리자 대시보드</h1>
        <div className="flex gap-3">
          <Link href="/admin/products" className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-xl transition-colors">상품 관리</Link>
          <Link href="/admin/orders" className="bg-slate-700 hover:bg-slate-800 text-white text-sm px-4 py-2 rounded-xl transition-colors">주문 관리</Link>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className={`bg-white dark:bg-slate-900 border-2 ${card.color} rounded-2xl p-5`}>
            <div className="text-2xl mb-2">{card.icon}</div>
            <p className="text-xs text-slate-500 mb-1">{card.label}</p>
            <p className="text-xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      {/* 차트 + 위젯 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 매출 차트 */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6">
          <h2 className="font-bold text-lg mb-4">최근 7일 매출</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.dailyChart} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => v >= 10000 ? `${(v / 10000).toFixed(0)}만` : String(v)} />
              <Tooltip formatter={(v: number) => [`₩${v.toLocaleString()}`, "매출"]} />
              <Bar dataKey="amount" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 사이드 위젯 */}
        <div className="flex flex-col gap-4">
          {/* 최근 주문 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 flex-1">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold">최근 주문</h2>
              <Link href="/admin/orders" className="text-xs text-blue-500 hover:underline">전체 보기</Link>
            </div>
            <div className="space-y-2.5">
              {recentOrders === undefined
                ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />)
                : recentOrders.length === 0
                ? <p className="text-slate-400 text-sm text-center py-4">주문 없음</p>
                : recentOrders.map((order) => (
                  <div key={order._id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium truncate max-w-[120px]">{order.user?.name ?? "알 수 없음"}</p>
                      <p className="text-slate-400 text-xs">₩{order.totalAmount.toLocaleString()}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status] ?? "bg-slate-100"}`}>
                      {STATUS_LABELS[order.status]}
                    </span>
                  </div>
                ))
              }
            </div>
          </div>

          {/* 재고 부족 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold flex items-center gap-1.5">
                ⚠️ 재고 부족
              </h2>
              <Link href="/admin/products" className="text-xs text-blue-500 hover:underline">관리</Link>
            </div>
            {stats.lowStockProducts.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-2">재고 부족 상품 없음 ✓</p>
            ) : (
              <div className="space-y-2">
                {stats.lowStockProducts.map((p) => (
                  <div key={p._id} className="flex items-center justify-between text-sm">
                    <span className="truncate max-w-[140px]">{p.name}</span>
                    <span className={`font-bold text-xs ${p.stock === 0 ? "text-red-500" : "text-orange-500"}`}>
                      {p.stock === 0 ? "품절" : `${p.stock}개`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
