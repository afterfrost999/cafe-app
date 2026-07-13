/* ============================================
   메뉴 / 카테고리 데이터
   전역 공유 자원 (window.CAFE_DATA 로 노출)
   ============================================ */

const CATEGORIES = [
  { id: "coffee", name: "커피" },
  { id: "tea", name: "티" },
  { id: "ade", name: "에이드/주스" },
  { id: "dessert", name: "디저트" },
];

const MENUS = [
  {
    id: 1,
    categoryId: "coffee",
    name: "아메리카노",
    description: "깊고 진한 에스프레소에 물을 더한 클래식 커피",
    price: 4000,
    image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600",
    tags: ["베스트", "HOT/ICE"],
    soldOut: false,
  },
  {
    id: 2,
    categoryId: "coffee",
    name: "카페라떼",
    description: "부드러운 우유 거품과 에스프레소의 조화",
    price: 4500,
    image: "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600",
    tags: ["베스트", "HOT/ICE"],
    soldOut: false,
  },
  {
    id: 3,
    categoryId: "coffee",
    name: "카푸치노",
    description: "풍성한 우유 거품이 매력적인 이탈리안 커피",
    price: 4500,
    image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600",
    tags: ["HOT"],
    soldOut: false,
  },
  {
    id: 4,
    categoryId: "coffee",
    name: "바닐라 라떼",
    description: "달콤한 바닐라 시럽이 더해진 라떼",
    price: 5000,
    image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600",
    tags: ["HOT/ICE"],
    soldOut: false,
  },
  {
    id: 5,
    categoryId: "tea",
    name: "얼그레이 티",
    description: "베르가못 향이 은은한 홍차",
    price: 4500,
    image: "https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?w=600",
    tags: ["HOT/ICE"],
    soldOut: false,
  },
  {
    id: 6,
    categoryId: "tea",
    name: "캐모마일 티",
    description: "편안하고 부드러운 허브 티",
    price: 4500,
    image: "https://images.unsplash.com/photo-1563911892437-1feda0179e1b?w=600",
    tags: ["HOT"],
    soldOut: false,
  },
  {
    id: 7,
    categoryId: "ade",
    name: "자몽 에이드",
    description: "상큼한 자몽과 톡 쏘는 탄산의 조화",
    price: 5500,
    image: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=600",
    tags: ["ICE", "시즌"],
    soldOut: false,
  },
  {
    id: 8,
    categoryId: "ade",
    name: "청포도 에이드",
    description: "청량한 청포도 향이 가득한 에이드",
    price: 5500,
    image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600",
    tags: ["ICE"],
    soldOut: true,
  },
  {
    id: 9,
    categoryId: "dessert",
    name: "치즈 케이크",
    description: "진하고 부드러운 뉴욕 스타일 치즈 케이크",
    price: 6000,
    image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600",
    tags: ["베스트"],
    soldOut: false,
  },
  {
    id: 10,
    categoryId: "dessert",
    name: "티라미수",
    description: "커피와 마스카포네 크림의 이탈리안 디저트",
    price: 6500,
    image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600",
    tags: ["신메뉴"],
    soldOut: false,
  },
  {
    id: 11,
    categoryId: "dessert",
    name: "크로플",
    description: "겉은 바삭 속은 촉촉한 크로와상 와플",
    price: 5000,
    image: "https://images.unsplash.com/photo-1509365465985-25d11c17e812?w=600",
    tags: ["신메뉴"],
    soldOut: false,
  },
  {
    id: 12,
    categoryId: "coffee",
    name: "콜드브루",
    description: "12시간 저온 추출한 부드러운 콜드브루",
    price: 5000,
    image: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600",
    tags: ["ICE"],
    soldOut: false,
  },
];

/* 이벤트 (고객 이벤트 페이지 / 관리자 이벤트 관리 공용)
   kind: 픽셀아트 종류 (fire | coffee | dessert) → 카드 배경/아이콘에 사용 */
const EVENTS = [
  {
    id: 1,
    kind: "fire",
    badge: "진행 중",
    title: "불씨 스탬프 두 배 적립",
    description:
      "평일 오후 2시부터 5시까지 모든 음료의 스탬프를 두 배로 적립해 드려요.",
    period: "2026.07.01 — 2026.07.31",
  },
  {
    id: 2,
    kind: "coffee",
    badge: "상시",
    title: "첫 주문 웰컴 쿠폰",
    description:
      "Chimchar Cafe의 첫 주문이라면 원하는 음료를 20% 할인받을 수 있어요.",
    period: "신규 고객 대상",
  },
  {
    id: 3,
    kind: "dessert",
    badge: "주말 한정",
    title: "디저트 페어링",
    description:
      "주말에 커피와 디저트를 함께 주문하면 디저트를 1,000원 할인해 드려요.",
    period: "매주 토요일·일요일",
  },
];

/* 공지사항 (고객 공지 페이지 / 관리자 공지 관리 공용) */
const NOTICES = [
  {
    id: 1,
    title: "신메뉴 출시 안내",
    content:
      "새로운 여름 시즌 메뉴 '흑임자 라떼'와 '청귤 에이드'가 추가됐어요. 고소함과 상큼함을 매장과 앱에서 지금 만나보세요!",
    createdAt: "2026-07-10T10:00:00",
  },
  {
    id: 2,
    title: "7월 휴무일 안내",
    content:
      "7월 정기 휴무는 매주 월요일입니다. 다만 7월 27일은 내부 사정으로 하루 휴무하며, 그 외 공휴일은 정상 영업하니 방문에 참고 부탁드려요.",
    createdAt: "2026-07-01T09:00:00",
  },
  {
    id: 3,
    title: "여름 영업시간 연장 안내",
    content:
      "7월과 8월 한정으로 평일 영업시간을 08:00 - 23:00로 연장 운영합니다. 시원한 음료 한 잔과 함께 여유로운 밤 시간을 보내세요.",
    createdAt: "2026-06-28T14:30:00",
  },
  {
    id: 4,
    title: "불씨 스탬프 두 배 적립 이벤트",
    content:
      "이벤트 기간 동안 평일 오후 2시부터 5시까지 모든 음료의 스탬프를 두 배로 적립해 드려요. 자세한 내용은 이벤트 페이지에서 확인하실 수 있어요.",
    createdAt: "2026-06-20T11:00:00",
  },
];

/* 초기 샘플 주문 (관리자 주문 관리/고객 주문 내역 데모용) */
const SAMPLE_ORDERS = [
  {
    id: "ORD-20260705-001",
    createdAt: "2026-07-05T10:24:00",
    status: "completed", // pending | making | completed | canceled
    items: [
      { menuId: 1, name: "아메리카노", price: 4000, qty: 2 },
      { menuId: 9, name: "치즈 케이크", price: 6000, qty: 1 },
    ],
    total: 14000,
  },
  {
    id: "ORD-20260706-002",
    createdAt: "2026-07-06T09:12:00",
    status: "making",
    items: [{ menuId: 2, name: "카페라떼", price: 4500, qty: 1 }],
    total: 4500,
  },
];

/* 주문 상태 메타데이터 */
const ORDER_STATUS = {
  pending: { label: "접수 대기", color: "var(--color-info)" },
  making: { label: "제조 중", color: "var(--color-warning)" },
  completed: { label: "완료", color: "var(--color-success)" },
  canceled: { label: "취소", color: "var(--color-danger)" },
};

/* 전역 노출 */
window.CAFE_DATA = {
  CATEGORIES,
  MENUS,
  EVENTS,
  NOTICES,
  SAMPLE_ORDERS,
  ORDER_STATUS,
};
