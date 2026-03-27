"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import Link from "next/link";

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isSignedIn } = useUser();
  const product = useQuery(api.products.getById, { id: id as Id<"products"> });
  const currentUser = useQuery(api.users.current);
  const addItem = useMutation(api.cart.addItem);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  if (product === undefined) {
    return (
      <main className="p-8 max-w-4xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
          <div className="h-96 bg-slate-200 dark:bg-slate-700 rounded" />
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
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }
    setAdding(true);
    try {
      await addItem({ productId: product!._id, quantity: 1 });
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } finally {
      setAdding(false);
    }
  }

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <Link href="/" className="text-blue-500 hover:underline text-sm mb-6 block">
        ← 목록으로
      </Link>
      <div className="flex flex-col md:flex-row gap-10">
        <div className="md:w-1/2">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full rounded-xl object-cover aspect-square"
            />
          ) : (
            <div className="w-full aspect-square bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400">
              이미지 없음
            </div>
          )}
        </div>
        <div className="md:w-1/2 flex flex-col gap-4">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            ₩{product.price.toLocaleString()}
          </p>
          <p className="text-slate-600 dark:text-slate-400">{product.description}</p>
          <p className="text-sm text-slate-500">
            재고: {product.stock > 0 ? `${product.stock}개` : <span className="text-red-500">품절</span>}
          </p>
          <button
            onClick={handleAddToCart}
            disabled={adding || product.stock === 0}
            className="mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            {added ? "✓ 담겼습니다!" : adding ? "추가 중..." : "장바구니에 담기"}
          </button>
          {!isSignedIn && (
            <p className="text-sm text-slate-400">장바구니를 이용하려면 로그인이 필요합니다.</p>
          )}
        </div>
      </div>
    </main>
  );
}
