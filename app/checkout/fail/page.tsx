"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function CheckoutFailPage() {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get("code");
  const errorMsg = searchParams.get("message");

  return (
    <main className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="text-center max-w-sm space-y-4">
        <div className="text-5xl">😢</div>
        <h1 className="text-2xl font-bold">결제에 실패했습니다</h1>
        {errorMsg && (
          <p className="text-slate-500 text-sm">{errorMsg}</p>
        )}
        {errorCode && (
          <p className="text-xs text-slate-400">오류 코드: {errorCode}</p>
        )}
        <div className="flex gap-3 justify-center pt-2">
          <Link
            href="/cart"
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            다시 시도하기
          </Link>
          <Link
            href="/"
            className="border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            홈으로
          </Link>
        </div>
      </div>
    </main>
  );
}
