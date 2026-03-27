"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import Link from "next/link";
import { useState } from "react";
import { useToast } from "@/components/Toast";
import EmptyState from "@/components/EmptyState";

export default function Home() {
  const products = useQuery(api.products.list);
  const addItem = useMutation(api.cart.addItem);
  const { showToast } = useToast();
  const [addingId, setAddingId] = useState<string | null>(null);

  async function handleQuickAdd(e: React.MouseEvent, productId: Id<"products">, stock: number) {
    e.preventDefault();
    if (stock === 0) return;
    setAddingId(productId);
    try {
      await addItem({ productId, quantity: 1 });
      showToast("장바구니에 담겼습니다!", "success");
    } catch {
      showToast("로그인이 필요합니다.", "error");
    } finally {
      setAddingId(null);
    }
  }

  if (products === undefined) {
    return (
      <main>
        <HeroBanner />
        <section className="max-w-7xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-slate-100 dark:bg-slate-800 rounded-2xl h-80 animate-pulse" />
            ))}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main>
      <HeroBanner />
      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">전체 상품</h2>
          <span className="text-slate-400 text-sm">{products.length}개 상품</span>
        </div>

        {products.length === 0 ? (
          <EmptyState
            icon="🛍️"
            title="등록된 상품이 없습니다"
            description="아직 등록된 상품이 없어요. 곧 새로운 상품이 준비될 예정입니다."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link key={product._id} href={`/products/${product._id}`} className="group block">
                <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 bg-white dark:bg-slate-900">
                  {/* 이미지 */}
                  <div className="relative h-52 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                          product.stock === 0 ? "grayscale opacity-60" : ""
                        }`}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300 text-4xl">
                        📦
                      </div>
                    )}

                    {/* 품절 오버레이 */}
                    {product.stock === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <span className="bg-white text-slate-800 text-xs font-bold px-3 py-1 rounded-full">
                          품절
                        </span>
                      </div>
                    )}

                    {/* 빠른 담기 버튼 */}
                    {product.stock > 0 && (
                      <button
                        onClick={(e) => handleQuickAdd(e, product._id, product.stock)}
                        disabled={addingId === product._id}
                        className="absolute bottom-3 right-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md disabled:bg-slate-400"
                      >
                        {addingId === product._id ? "담는 중..." : "🛒 담기"}
                      </button>
                    )}
                  </div>

                  {/* 정보 */}
                  <div className="p-4">
                    <h3 className="font-semibold text-base truncate">{product.name}</h3>
                    <p className="text-slate-400 text-xs truncate mt-0.5">{product.description}</p>
                    <div className="flex items-center justify-between mt-3">
                      <p className="text-blue-600 dark:text-blue-400 font-bold text-lg">
                        ₩{product.price.toLocaleString()}
                      </p>
                      {product.stock > 0 && product.stock <= 5 && (
                        <span className="text-orange-500 text-xs font-medium">
                          잔여 {product.stock}개
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function HeroBanner() {
  return (
    <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
      <div className="max-w-7xl mx-auto px-6 py-16 flex flex-col md:flex-row items-center justify-between gap-8">
        <div>
          <p className="text-blue-200 text-sm font-medium mb-2 uppercase tracking-widest">Welcome to</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            ShopMall
          </h1>
          <p className="text-blue-100 text-lg mb-8 max-w-md">
            원하는 상품을 쉽고 빠르게.<br />지금 바로 쇼핑을 시작해보세요.
          </p>
          <Link
            href="#products"
            className="inline-block bg-white text-blue-700 font-semibold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors shadow-lg"
          >
            쇼핑 시작하기 →
          </Link>
        </div>
        <div className="text-8xl hidden md:block select-none">🛍️</div>
      </div>
    </div>
  );
}
