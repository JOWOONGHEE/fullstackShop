"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";

export default function Navbar() {
  const { isSignedIn } = useUser();
  const currentUser = useQuery(api.users.current);
  const cartItems = useQuery(api.cart.getMyCart);

  const cartCount = cartItems?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  const isAdmin = (currentUser?.role ?? "user") === "admin";

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <Link href="/" className="font-bold text-xl text-blue-600 dark:text-blue-400">
          ShopMall
        </Link>
        <nav className="hidden md:flex items-center gap-4 text-sm">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            홈
          </Link>
          {isAdmin && (
            <Link href="/admin" className="text-purple-600 hover:text-purple-700 font-medium transition-colors">
              관리자
            </Link>
          )}
        </nav>
      </div>
      <div className="flex items-center gap-4">
        {isSignedIn && (
          <Link href="/orders" className="text-sm hover:text-blue-600 transition-colors hidden md:block">
            주문내역
          </Link>
        )}
        <Link href="/cart" className="relative hover:text-blue-600 transition-colors">
          <span className="text-xl">🛒</span>
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {cartCount > 99 ? "99+" : cartCount}
            </span>
          )}
        </Link>
        {isSignedIn ? (
          <UserButton afterSignOutUrl="/" />
        ) : (
          <SignInButton mode="modal">
            <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors">
              로그인
            </button>
          </SignInButton>
        )}
      </div>
    </header>
  );
}
