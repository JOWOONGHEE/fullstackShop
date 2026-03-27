"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useState } from "react";

type ProductForm = {
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  stock: string;
};

const emptyForm: ProductForm = { name: "", description: "", price: "", imageUrl: "", stock: "" };

export default function AdminProductsPage() {
  const products = useQuery(api.products.list);
  const createProduct = useMutation(api.products.create);
  const updateProduct = useMutation(api.products.update);
  const removeProduct = useMutation(api.products.remove);

  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [editingId, setEditingId] = useState<Id<"products"> | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  function startEdit(product: NonNullable<typeof products>[number]) {
    setEditingId(product._id);
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      imageUrl: product.imageUrl,
      stock: String(product.stock),
    });
    setShowForm(true);
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        imageUrl: form.imageUrl,
        stock: Number(form.stock),
      };
      if (editingId) {
        await updateProduct({ id: editingId, ...data });
      } else {
        await createProduct(data);
      }
      resetForm();
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">상품 관리</h1>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl"
        >
          + 상품 등록
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 mb-8 space-y-4"
        >
          <h2 className="font-semibold text-lg">{editingId ? "상품 수정" : "새 상품 등록"}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {([
              ["name", "상품명", "text"],
              ["price", "가격 (원)", "number"],
              ["stock", "재고", "number"],
              ["imageUrl", "이미지 URL", "url"],
            ] as [keyof ProductForm, string, string][]).map(([key, label, type]) => (
              <div key={key}>
                <label className="text-sm text-slate-600 dark:text-slate-400">{label}</label>
                <input
                  type={type}
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  required
                  className="mt-1 w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
          <div>
            <label className="text-sm text-slate-600 dark:text-slate-400">상품 설명</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              required
              rows={3}
              className="mt-1 w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white px-6 py-2 rounded-lg"
            >
              {saving ? "저장 중..." : "저장"}
            </button>
            <button type="button" onClick={resetForm} className="border px-6 py-2 rounded-lg">
              취소
            </button>
          </div>
        </form>
      )}

      {products === undefined ? (
        <div className="animate-pulse space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-left">
                <th className="pb-3 pr-4">이미지</th>
                <th className="pb-3 pr-4">상품명</th>
                <th className="pb-3 pr-4">가격</th>
                <th className="pb-3 pr-4">재고</th>
                <th className="pb-3">관리</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-3 pr-4">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-12 h-12 object-cover rounded-lg" />
                    ) : (
                      <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg" />
                    )}
                  </td>
                  <td className="py-3 pr-4 font-medium">{product.name}</td>
                  <td className="py-3 pr-4">₩{product.price.toLocaleString()}</td>
                  <td className="py-3 pr-4">{product.stock}</td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(product)}
                        className="text-blue-500 hover:underline"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("정말 삭제하시겠습니까?")) {
                            removeProduct({ id: product._id });
                          }
                        }}
                        className="text-red-500 hover:underline"
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && (
            <p className="text-slate-500 text-center py-12">등록된 상품이 없습니다.</p>
          )}
        </div>
      )}
    </main>
  );
}
