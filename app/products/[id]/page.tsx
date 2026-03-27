"use client";

import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { useToast } from "@/components/Toast";

const TABS = ["상품 정보", "배송 안내"] as const;
type Tab = typeof TABS[number];

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const product = useQuery(api.products.getById, { id: id as Id<"products"> });
  const addItem = useMutation(api.cart.addItem);
  const createCheckout = useAction(api.stripe.createCheckoutSession);

  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("상품 정보");

  if (product === undefined) {
    return (
      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="animate-pulse flex flex-col md:flex-row gap-10">
          <div className="md:w-1/2 aspect-square bg-slate-200 dark:bg-slate-700 rounded-2xl" />
          <div className="md:w-1/2 space-y-4">
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
            <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>
        </div>
      </main>
    );
  }

  if (product === null) {
    return (
      <main className="p-8 text-center">
        <p className="text-xl text-slate-500">상품을 찾을 수 없습니다.</p>
        <Link href="/" className="text-blue-500 underline mt-4 block">홈으로 돌아가기</Link>
      </main>
    );
  }

  async function handleAddToCart() {
    setAdding(true);
    try {
      await addItem({ productId: product!._id, quantity: qty });
      showToast(`장바구니에 ${qty}개 담겼습니다!`, "success");
    } catch {
      showToast("로그인이 필요합니다.", "error");
      router.push("/sign-in");
    } finally {
      setAdding(false);
    }
  }

  async function handleBuyNow() {
    setBuyingNow(true);
    try {
      await addItem({ productId: product!._id, quantity: qty });
      const url = await createCheckout({});
      if (url) window.location.href = url;
    } catch {
      showToast("로그인이 필요합니다.", "error");
      router.push("/sign-in");
    } finally {
      setBuyingNow(false);
    }
  }

  const isSoldOut = product.stock === 0;

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      <Link href="/" className="text-blue-500 hover:underline text-sm mb-8 inline-flex items-center gap-1">
        ← 목록으로
      </Link>

      <div className="flex flex-col md:flex-row gap-12 mt-4">
        {/* 이미지 */}
        <div className="md:w-1/2">
          <div className="relative rounded-2xl overflow-hidden aspect-square bg-slate-100 dark:bg-slate-800">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className={`w-full h-full object-cover ${isSoldOut ? "grayscale opacity-60" : ""}`}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300 text-6xl">📦</div>
            )}
            {isSoldOut && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-black/70 text-white text-lg font-bold px-6 py-2 rounded-full">품절</span>
              </div>
            )}
          </div>
        </div>

        {/* 정보 */}
        <div className="md:w-1/2 flex flex-col gap-5">
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              ₩{product.price.toLocaleString()}
            </p>
          </div>

          {/* 재고 상태 */}
          <div className="flex items-center gap-2 text-sm">
            <span className={`w-2 h-2 rounded-full ${isSoldOut ? "bg-red-400" : "bg-green-400"}`} />
            <span className={isSoldOut ? "text-red-500" : "text-green-600 dark:text-green-400"}>
              {isSoldOut ? "품절" : `재고 ${product.stock}개`}
            </span>
          </div>

          {/* 수량 선택 */}
          {!isSoldOut && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-500">수량</span>
              <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-lg"
                >
                  −
                </button>
                <span className="w-12 text-center font-semibold">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(product!.stock, q + 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-lg"
                >
                  +
                </button>
              </div>
              <span className="text-sm text-slate-400">
                합계 <strong className="text-slate-700 dark:text-slate-200">₩{(product.price * qty).toLocaleString()}</strong>
              </span>
            </div>
          )}

          {/* 버튼 */}
          <div className="flex flex-col gap-3 mt-2">
            <button
              onClick={handleAddToCart}
              disabled={adding || isSoldOut}
              className="w-full py-3 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 font-semibold rounded-xl transition-colors disabled:border-slate-300 disabled:text-slate-400"
            >
              {adding ? "담는 중..." : "🛒 장바구니에 담기"}
            </button>
            <button
              onClick={handleBuyNow}
              disabled={buyingNow || isSoldOut}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-semibold rounded-xl transition-colors"
            >
              {buyingNow ? "처리 중..." : "⚡ 바로 구매"}
            </button>
          </div>

          {/* 탭 */}
          <div className="mt-4">
            <div className="flex border-b border-slate-200 dark:border-slate-700">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="py-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {activeTab === "상품 정보" ? (
                <p>{product.description}</p>
              ) : (
                <ul className="space-y-2">
                  <li>📦 주문 후 1~3 영업일 이내 출고</li>
                  <li>🚚 무료 배송 (제주·도서산간 제외)</li>
                  <li>🔄 수령 후 7일 이내 교환/반품 가능</li>
                  <li>⚠️ 단순 변심 반품 시 배송비 고객 부담</li>
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
