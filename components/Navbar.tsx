"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { isSignedIn, user } = useUser();
  const currentUser = useQuery(api.users.current);
  const cartItems = useQuery(isSignedIn ? api.cart.getMyCart : "skip");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  const cartCount = cartItems?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  const isAdmin = (currentUser?.role ?? "user") === "admin";

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // 경로 변경 시 메뉴 닫기
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  const navLinks = [
    { href: "/", label: "홈" },
    { href: "/orders", label: "주문내역", authRequired: true },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-200 ${
        scrolled
          ? "bg-white/80 dark:bg-slate-950/80 backdrop-blur-md shadow-sm"
          : "bg-white dark:bg-slate-950"
      } border-b border-slate-200 dark:border-slate-800`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* 로고 */}
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-xl text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
            🛍️ ShopMall
          </Link>
          {/* PC 메뉴 */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, authRequired }) =>
              authRequired && !isSignedIn ? null : (
                <Link
                  key={href}
                  href={href}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    pathname === href
                      ? "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400"
                      : "text-slate-600 dark:text-slate-400 hover:text-blue-600 hover:bg-slate-50 dark:hover:bg-slate-900"
                  }`}
                >
                  {label}
                </Link>
              )
            )}
            {isAdmin && (
              <Link
                href="/admin"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname.startsWith("/admin")
                    ? "bg-purple-600 text-white"
                    : "bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 hover:bg-purple-200"
                }`}
              >
                관리자
              </Link>
            )}
          </nav>
        </div>

        {/* 우측 영역 */}
        <div className="flex items-center gap-3">
          <Link href="/cart" className="relative p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
            <span className="text-xl">🛒</span>
            {cartCount > 0 && (
              <span className="absolute top-0.5 right-0.5 bg-blue-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </Link>

          {isSignedIn ? (
            <div className="flex items-center gap-2">
              <span className="hidden md:block text-sm text-slate-500 max-w-[80px] truncate">
                {user?.firstName ?? currentUser?.name?.split(" ")[0]}
              </span>
              <UserButton afterSignOutUrl="/sign-in" />
            </div>
          ) : (
            <SignInButton mode="modal">
              <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
                로그인
              </button>
            </SignInButton>
          )}

          {/* 햄버거 버튼 (모바일) */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            aria-label="메뉴"
          >
            <div className="w-5 flex flex-col gap-1">
              <span className={`block h-0.5 bg-current transition-all duration-200 ${menuOpen ? "rotate-45 translate-y-1.5" : ""}`} />
              <span className={`block h-0.5 bg-current transition-all duration-200 ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`block h-0.5 bg-current transition-all duration-200 ${menuOpen ? "-rotate-45 -translate-y-1.5" : ""}`} />
            </div>
          </button>
        </div>
      </div>

      {/* 모바일 드롭다운 메뉴 */}
      {menuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 px-6 py-4 flex flex-col gap-1">
          {navLinks.map(({ href, label, authRequired }) =>
            authRequired && !isSignedIn ? null : (
              <Link
                key={href}
                href={href}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  pathname === href
                    ? "bg-blue-50 dark:bg-blue-950 text-blue-600"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900"
                }`}
              >
                {label}
              </Link>
            )
          )}
          {isAdmin && (
            <Link
              href="/admin"
              className="px-4 py-3 rounded-xl text-sm font-medium bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300"
            >
              관리자 페이지
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
