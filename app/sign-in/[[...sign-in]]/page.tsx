import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex">
      {/* 왼쪽 브랜딩 영역 */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 flex-col justify-center items-center text-white p-12">
        <div className="max-w-md text-center">
          <h1 className="text-5xl font-bold mb-4">ShopMall</h1>
          <p className="text-xl text-blue-100 mb-8">
            원하는 상품을 간편하게 쇼핑하세요
          </p>
          <div className="space-y-4 text-left">
            {[
              { icon: "🛍️", text: "다양한 상품 구경하기" },
              { icon: "🛒", text: "장바구니에 담고 한번에 결제" },
              { icon: "📦", text: "실시간 주문 현황 확인" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3 bg-white/10 rounded-xl px-5 py-3">
                <span className="text-2xl">{item.icon}</span>
                <span className="text-blue-50">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 오른쪽 로그인 영역 */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 bg-slate-50 dark:bg-slate-950">
        <div className="mb-8 text-center lg:hidden">
          <h1 className="text-3xl font-bold text-blue-600">ShopMall</h1>
          <p className="text-slate-500 mt-1">로그인 후 쇼핑을 시작하세요</p>
        </div>
        <SignIn
          appearance={{
            elements: {
              rootBox: "w-full max-w-md",
              card: "shadow-lg rounded-2xl",
            },
          }}
        />
      </div>
    </div>
  );
}
