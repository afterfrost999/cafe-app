/* ============================================
   Supabase 클라이언트 + 행 매핑 헬퍼
   전역 노출: window.CAFE_DB (client), window.CAFE_MAP (매핑)
   ※ 이 파일보다 먼저 supabase-js UMD 스크립트가 로드돼 있어야 함
   ============================================ */

const SUPABASE_URL = "https://ljjldcbzjyingmemxffc.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_2vjlWfzywStWlnXPre036Q_VdV0JZzR";

// supabase-js UMD 는 전역 `supabase` 로 노출된다.
const CAFE_DB =
  window.supabase && typeof window.supabase.createClient === "function"
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
    : null;

if (!CAFE_DB) {
  console.warn(
    "[cafe] Supabase 클라이언트를 만들지 못했어요. supabase-js 스크립트 로드 순서를 확인하세요."
  );
}

/* ── DB(snake_case) ↔ 앱(camelCase) 매핑 ── */
const CAFE_MAP = {
  // menus
  menuFromRow: (r) => ({
    id: r.id,
    categoryId: r.category_id,
    name: r.name,
    description: r.description || "",
    price: r.price,
    image: r.image || "",
    tags: Array.isArray(r.tags) ? r.tags : [],
    soldOut: !!r.sold_out,
  }),
  menuToRow: (m) => ({
    category_id: m.categoryId,
    name: m.name,
    description: m.description || "",
    price: Number(m.price),
    image: m.image || "",
    tags: Array.isArray(m.tags) ? m.tags : [],
    sold_out: !!m.soldOut,
  }),

  // events
  eventFromRow: (r) => ({
    id: r.id,
    kind: r.kind,
    badge: r.badge || "",
    title: r.title,
    description: r.description || "",
    period: r.period || "",
  }),
  eventToRow: (e) => ({
    kind: e.kind || "fire",
    badge: e.badge || "",
    title: e.title,
    description: e.description || "",
    period: e.period || "",
  }),

  // notices
  noticeFromRow: (r) => ({
    id: r.id,
    title: r.title,
    content: r.content || "",
    createdAt: r.created_at,
  }),
  noticeToRow: (n) => ({
    title: n.title,
    content: n.content || "",
  }),

  // members
  memberFromRow: (r) => ({
    username: r.username,
    password: r.password,
    name: r.name,
    email: r.email || "",
    role: r.role,
  }),

  // coupons: 앱의 coupon.id === DB의 code
  couponFromRow: (r) => ({
    id: r.code,
    name: r.name,
    benefit: r.benefit || "",
    condition: r.condition || "",
    issuedAt: r.issued_at,
    validDays: r.valid_days,
    used: !!r.used,
    usedAt: r.used_at || undefined,
    orderId: r.order_id || undefined,
  }),

  // orders: order + order_items(rows) → 앱 주문 객체
  orderFromRows: (o, itemRows) => ({
    id: o.id,
    createdAt: o.created_at,
    status: o.status,
    memberUsername: o.member_username || null,
    fulfillment: o.fulfillment,
    request: o.request || "",
    subtotal: o.subtotal,
    discount: o.discount,
    total: o.total,
    coupon: o.coupon_code
      ? { id: o.coupon_code, name: o.coupon_name || "" }
      : null,
    items: (itemRows || []).map((it) => ({
      menuId: it.menu_id,
      name: it.name,
      basePrice: it.base_price,
      price: it.price,
      qty: it.qty,
      options: {
        temperature: it.temperature || undefined,
        size: it.size,
        extraShot: !!it.extra_shot,
        syrup: it.syrup || "",
      },
    })),
  }),
  orderItemToRow: (orderId, it) => ({
    order_id: orderId,
    menu_id: it.menuId,
    name: it.name,
    base_price: it.basePrice,
    price: it.price,
    qty: it.qty,
    temperature: (it.options && it.options.temperature) || null,
    size: (it.options && it.options.size) || "regular",
    extra_shot: !!(it.options && it.options.extraShot),
    syrup: (it.options && it.options.syrup) || "",
  }),
};

window.CAFE_DB = CAFE_DB;
window.CAFE_MAP = CAFE_MAP;
