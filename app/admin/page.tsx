"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import Link from "next/link";

export default function AdminDashboard() {
  const stats = useQuery(api.admin.getSalesStats);

  if (stats === undefined) {
    return (
      <main className="p-8">
        <h1 className="text-3xl font-bold mb-8">관리자 대시보드</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-28 bg-slate-100 dark:bg-slate-800 rounded-xl" />
          ))}
        </div>
      </main>
    );
  }

  const cards = [
    { label: "오늘 매출", value: `₩${stats.dailyTotal.toLocaleString()}`, color: "bg-blue-50 dark:bg-blue-950" },
    { label: "이번 달 매출", value: `₩${stats.monthlyTotal.toLocaleString()}`, color: "bg-green-50 dark:bg-green-950" },
    { label: "올해 매출", value: `₩${stats.yearlyTotal.toLocaleString()}`, color: "bg-purple-50 dark:bg-purple-950" },
    { label: "총 매출", value: `₩${stats.totalRevenue.toLocaleString()}`, color: "bg-yellow-50 dark:bg-yellow-950" },
    { label: "전체 주문", value: `${stats.totalOrders}건`, color: "bg-slate-50 dark:bg-slate-900" },
    { label: "결제 완료 주문", value: `${stats.paidOrders}건`, color: "bg-teal-50 dark:bg-teal-950" },
    { label: "등록 상품", value: `${stats.totalProducts}개`, color: "bg-orange-50 dark:bg-orange-950" },
  ];

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-8">관리자 대시보드</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {cards.map((card) => (
          <div key={card.label} className={`${card.color} rounded-xl p-6 border border-slate-200 dark:border-slate-700`}>
            <p className="text-sm text-slate-500 mb-1">{card.label}</p>
            <p className="text-2xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-4">
        <Link
          href="/admin/products"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
        >
          상품 관리 →
        </Link>
        <Link
          href="/admin/orders"
          className="bg-slate-700 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
        >
          주문 관리 →
        </Link>
      </div>
    </main>
  );
}
