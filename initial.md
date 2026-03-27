# Fullstack Shop — MVP 프로젝트 아이디어

## 기술 스택

- **Frontend**: Next.js 16 + React 19 + Tailwind CSS
- **Backend**: Convex (DB + 실시간 쿼리 + 서버 함수)
- **Auth**: Clerk (회원가입/로그인)
- **결제**: Stripe (Checkout + Webhook)

---

## 핵심 기능 (MVP 범위)

### 1. 인증
- 회원가입 / 로그인 / 로그아웃 (Clerk)
- 로그인한 유저 정보 Convex DB에 저장

### 2. 상품
- 상품 목록 조회 (이미지, 이름, 가격)
- 상품 상세 페이지
- 관리자: 상품 등록 / 수정 / 삭제

### 3. 장바구니
- 상품 담기 / 수량 변경 / 삭제
- 유저별 장바구니 (로그인 필수)

### 4. 주문 & 결제
- Stripe Checkout으로 결제
- 결제 완료 후 Stripe Webhook → 주문 상태 업데이트
- 주문 내역 조회

### 5. 관리자
- 상품 관리 (CRUD)
- 주문 목록 조회 및 상태 변경 (결제완료 → 배송중 → 배송완료)
- 매출 현황 조회 (일별 / 월별 / 연별)

---

## DB 스키마 (Convex)

### users
| 필드 | 타입 | 설명 |
|------|------|------|
| externalId | string | Clerk user ID |
| name | string | 유저 이름 |
| email | string | 이메일 |
| role | "user" \| "admin" | 권한 |

### products
| 필드 | 타입 | 설명 |
|------|------|------|
| name | string | 상품명 |
| description | string | 상품 설명 |
| price | number | 가격 (원 단위) |
| imageUrl | string | 상품 이미지 URL |
| stock | number | 재고 수량 |

### cartItems
| 필드 | 타입 | 설명 |
|------|------|------|
| userId | id("users") | 유저 참조 |
| productId | id("products") | 상품 참조 |
| quantity | number | 수량 |

### orders
| 필드 | 타입 | 설명 |
|------|------|------|
| userId | id("users") | 유저 참조 |
| status | "pending" \| "paid" \| "shipping" \| "delivered" | 주문 상태 |
| totalAmount | number | 총 결제 금액 |
| stripeSessionId | string | Stripe Checkout session ID |

### orderItems
| 필드 | 타입 | 설명 |
|------|------|------|
| orderId | id("orders") | 주문 참조 |
| productId | id("products") | 상품 참조 |
| quantity | number | 수량 |
| price | number | 결제 당시 가격 |

---

## 페이지 구조

```
/                   상품 목록 (홈)
/products/[id]      상품 상세
/cart               장바구니
/checkout           결제 (Stripe Checkout으로 리다이렉트)
/orders             내 주문 내역
/admin              관리자 대시보드
/admin/products     상품 관리
/admin/orders       주문 관리
```

---

## Stripe 결제 흐름

1. 유저가 장바구니에서 결제 버튼 클릭
2. Convex Action → Stripe Checkout Session 생성
3. 유저를 Stripe 결제 페이지로 리다이렉트
4. 결제 완료 → Stripe가 `/api/stripe-webhook`으로 webhook 전송
5. Webhook에서 주문 상태를 `pending` → `paid`로 업데이트

---

## UI 개선 계획

> 현재 구현된 화면이 기능 중심의 단순한 레이아웃이므로 아래 항목들을 개선한다.

---

### 1. 홈 (/) — 상품 목록

**현재 문제**
- 타이틀 "상품 목록" 텍스트만 있고 Hero 섹션이 없음
- 상품 카드에 hover 효과가 shadow만 있어 단조로움
- 품절 상품과 판매 중인 상품 구분이 약함
- 카테고리 필터 없음

**개선 항목**
- [ ] 상단 Hero 배너 추가 (배경 그라데이션 + 슬로건 + CTA 버튼)
- [ ] 상품 카드 hover 시 이미지 살짝 확대(scale) 애니메이션
- [ ] 품절 상품에 흑백 필터 + "품절" 오버레이 뱃지 표시
- [ ] 상품 카드에 "장바구니 담기" 아이콘 버튼 오버레이 (상세 페이지 안 들어가도 담기)
- [ ] 신상품 / 인기 등 뱃지 표시 (DB 필드 추가 필요)

---

### 2. 상품 상세 (/products/[id])

**현재 문제**
- 이미지와 정보만 있는 단순 2단 레이아웃
- 구매 수량 선택 불가 (항상 1개 담김)
- 상품 설명이 짧은 텍스트 한 줄

**개선 항목**
- [ ] 구매 수량 선택 UI (- 1 +) 추가 후 장바구니 담기
- [ ] 상품 설명 영역을 탭(상품정보 / 배송안내)으로 구분
- [ ] 이미지 클릭 시 확대 라이트박스
- [ ] "바로 구매" 버튼 추가 (장바구니 거치지 않고 바로 결제)
- [ ] 하단에 관련 상품(같은 가격대 등) 추천 섹션

---

### 3. 장바구니 (/cart)

**현재 문제**
- 배경이 흰색 단색 카드만 나열
- 상품 소계/배송비/최종 금액 구분 없음
- 빈 장바구니 화면이 텍스트만 있음

**개선 항목**
- [ ] 오른쪽 사이드에 주문 요약 패널 (소계 / 배송비 무료 / 최종금액)
- [ ] 빈 장바구니 화면에 일러스트 또는 아이콘 + 쇼핑 시작 CTA
- [ ] 상품 이미지 클릭 시 해당 상품 상세 페이지로 이동
- [ ] 전체 삭제 버튼 추가

---

### 4. 주문 내역 (/orders)

**현재 문제**
- 텍스트 기반 목록으로 시각적 구분이 약함
- 주문 상태 흐름(진행 단계)이 표시되지 않음

**개선 항목**
- [ ] 주문 상태 스텝 표시 (pending → paid → shipping → delivered) Progress bar
- [ ] 주문별 상품 이미지 썸네일 표시
- [ ] 주문 상태별 색상 아이콘 강화

---

### 5. Navbar

**현재 문제**
- 로고 옆 메뉴가 텍스트만 나열
- 모바일 메뉴 없음 (햄버거 메뉴 미구현)

**개선 항목**
- [ ] 모바일 햄버거 메뉴 (홈 / 주문내역 / 관리자)
- [ ] 로그인한 유저 이름 표시 (UserButton 옆)
- [ ] Navbar 스크롤 시 배경 blur 효과 (`backdrop-blur`)

---

### 6. 관리자 대시보드 (/admin)

**현재 문제**
- 매출 카드 나열만 있고 차트가 없음
- 상품/주문 바로가기 버튼 2개만 있어 단조로움

**개선 항목**
- [ ] 최근 7일 / 30일 매출 막대 차트 (recharts 또는 chart.js)
- [ ] 최근 주문 5건 바로 확인 위젯
- [ ] 재고 부족 상품 알림 위젯 (stock < 5)

---

### 7. 공통 디자인 시스템

**개선 항목**
- [ ] 폰트: Pretendard 또는 Noto Sans KR 적용
- [ ] 색상 테마: blue 계열 primary, 카드 그림자 일관성 통일
- [ ] 빈 상태(Empty State) 컴포넌트 통일 (아이콘 + 메시지 + CTA)
- [ ] Toast 알림 컴포넌트 (장바구니 담기 성공, 에러 등)
- [ ] 페이지 전환 로딩 인디케이터

---

## 환경변수

```
# Convex
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_JWT_ISSUER_DOMAIN=
CLERK_WEBHOOK_SECRET=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```
