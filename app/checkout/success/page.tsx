"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const confirmPayment = useAction(api.tossPayments.confirmPayment);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const confirmedRef = useRef(false);

  useEffect(() => {
    if (confirmedRef.current) return;
    confirmedRef.current = true;

    const paymentKey = searchParams.get("paymentKey");
    const orderId = searchParams.get("orderId");
    const amountStr = searchParams.get("amount");

    if (!paymentKey || !orderId || !amountStr) {
      setErrorMsg("결제 정보가 올바르지 않습니다.");
      setStatus("error");
      return;
    }

    confirmPayment({ paymentKey, orderId, amount: Number(amountStr) })
      .then(() => {
        setStatus("success");
        setTimeout(() => router.push("/orders"), 2500);
      })
      .catch((e: unknown) => {
        setErrorMsg(e instanceof Error ? e.message : "결제 확인에 실패했습니다.");
        setStatus("error");
      });
  }, [searchParams, confirmPayment, router]);

  if (status === "loading") {
    return (
      <main className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-600 dark:text-slate-400 font-medium">결제를 확인하고 있습니다...</p>
        </div>
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="text-center max-w-sm space-y-4">
          <div className="text-5xl">❌</div>
          <h1 className="text-2xl font-bold">결제 확인 실패</h1>
          <p className="text-slate-500 text-sm">{errorMsg}</p>
          <div className="flex gap-3 justify-center pt-2">
            <Link href="/cart" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors">
              장바구니로 돌아가기
            </Link>
            <Link href="/" className="border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors">
              홈으로
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="text-center max-w-sm space-y-4">
        <div className="text-6xl animate-bounce">🎉</div>
        <h1 className="text-2xl font-bold">결제가 완료되었습니다!</h1>
        <p className="text-slate-500 text-sm">주문 내역 페이지로 이동합니다...</p>
        <Link href="/orders" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors mt-2">
          주문 내역 보기
        </Link>
      </div>
    </main>
  );
}
