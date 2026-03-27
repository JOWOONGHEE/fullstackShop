"use client";

import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import Link from "next/link";

export default function Home() {
  const products = useQuery(api.products.list);

  if (products === undefined) {
    return (
      <main className="p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-slate-100 dark:bg-slate-800 rounded-xl h-72 animate-pulse" />
          ))}
        </div>
      </main>
    );
  }

  if (products.length === 0) {
    return (
      <main className="p-8 flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-xl text-slate-500">등록된 상품이 없습니다.</p>
      </main>
    );
  }

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-8">상품 목록</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <Link key={product._id} href={`/products/${product._id}`}>
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
              <div className="relative h-48 bg-slate-100 dark:bg-slate-800">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    이미지 없음
                  </div>
                )}
              </div>
              <div className="p-4">
                <h2 className="font-semibold text-lg truncate">{product.name}</h2>
                <p className="text-slate-500 text-sm truncate mt-1">{product.description}</p>
                <p className="text-blue-600 dark:text-blue-400 font-bold mt-2">
                  ₩{product.price.toLocaleString()}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  재고: {product.stock > 0 ? `${product.stock}개` : "품절"}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
