/* ============================================
   공통 유틸리티 (카트, 포맷, 스토리지 등)
   전역 공유 자원 (window.CAFE_UTILS 로 노출)
   ============================================ */

/* ── 포맷 ── */

/** 숫자를 원화 문자열로: 4000 → "4,000원" */
function formatPrice(value) {
  return `${Number(value).toLocaleString("ko-KR")}원`;
}

/** ISO 날짜를 "2026.07.06 09:12" 형태로 */
function formatDate(iso) {
  const d = new Date(iso);
  if (isNaN(d)) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

/* ── 로컬 스토리지 헬퍼 ── */

function storageGet(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function storageSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* 저장 실패 무시 */
  }
}

/* ── 장바구니 (Cart) ── */

const CART_KEY = "cafe_cart";

/** 장바구니 배열 반환: [{ menuId, qty }] */
function getCart() {
  return storageGet(CART_KEY, []);
}

/** 장바구니에 담기 (이미 있으면 수량 증가) */
function addToCart(menuId, qty = 1) {
  const cart = getCart();
  const found = cart.find((item) => item.menuId === menuId);
  if (found) {
    found.qty += qty;
  } else {
    cart.push({ menuId, qty });
  }
  storageSet(CART_KEY, cart);
  return cart;
}

/** 장바구니 항목 수량 변경 (0 이하이면 제거) */
function updateCartQty(menuId, qty) {
  let cart = getCart();
  if (qty <= 0) {
    cart = cart.filter((item) => item.menuId !== menuId);
  } else {
    const found = cart.find((item) => item.menuId === menuId);
    if (found) found.qty = qty;
  }
  storageSet(CART_KEY, cart);
  return cart;
}

/** 장바구니 항목 제거 */
function removeFromCart(menuId) {
  const cart = getCart().filter((item) => item.menuId !== menuId);
  storageSet(CART_KEY, cart);
  return cart;
}

/** 장바구니 비우기 */
function clearCart() {
  storageSet(CART_KEY, []);
}

/** 장바구니 총 수량 */
function getCartCount() {
  return getCart().reduce((sum, item) => sum + item.qty, 0);
}

/** 장바구니 총 금액 */
function getCartTotal() {
  return getCart().reduce((sum, item) => {
    const menu = getMenuById(item.menuId);
    return menu ? sum + menu.price * item.qty : sum;
  }, 0);
}

/* ── 주문 (Order) ── */

const ORDERS_KEY = "cafe_orders";

/** 전체 주문 목록 (없으면 data.js 의 SAMPLE_ORDERS 로 초기화) */
function getOrders() {
  let orders = storageGet(ORDERS_KEY);
  if (!orders) {
    orders = ((window.CAFE_DATA && window.CAFE_DATA.SAMPLE_ORDERS) || []).map(
      (o) => ({ ...o })
    );
    storageSet(ORDERS_KEY, orders);
  }
  return orders;
}

/** id 로 주문 찾기 */
function getOrderById(id) {
  return getOrders().find((o) => o.id === id) || null;
}

/** 주문번호 생성: ORD-YYYYMMDD-NNN */
function generateOrderId(orders) {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const ymd = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(
    now.getDate()
  )}`;
  const todayCount = orders.filter((o) => o.id.includes(`-${ymd}-`)).length;
  return `ORD-${ymd}-${String(todayCount + 1).padStart(3, "0")}`;
}

/**
 * 현재 장바구니로 주문 생성 후 장바구니 비우기.
 * 반환: 생성된 주문 객체 (장바구니가 비었으면 null)
 */
function createOrderFromCart() {
  const cart = getCart();
  if (cart.length === 0) return null;

  const items = cart
    .map((c) => {
      const menu = getMenuById(c.menuId);
      if (!menu) return null;
      return { menuId: menu.id, name: menu.name, price: menu.price, qty: c.qty };
    })
    .filter(Boolean);
  if (items.length === 0) return null;

  const orders = getOrders();
  const order = {
    id: generateOrderId(orders),
    createdAt: new Date().toISOString(),
    status: "pending",
    items,
    total: items.reduce((sum, it) => sum + it.price * it.qty, 0),
  };

  orders.unshift(order);
  storageSet(ORDERS_KEY, orders);
  clearCart();
  return order;
}

/** 주문 상태 변경 후 저장 (반환: 갱신된 주문 또는 null) */
function updateOrderStatus(id, status) {
  const orders = getOrders();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx === -1) return null;
  orders[idx] = { ...orders[idx], status };
  storageSet(ORDERS_KEY, orders);
  return orders[idx];
}

/* ── 데이터 조회 헬퍼 (메뉴는 localStorage 에 오버레이하여 관리자 CRUD 반영) ── */

const MENUS_KEY = "cafe_menus";

/** 전체 메뉴 목록 (최초 호출 시 data.js 의 기본 데이터로 초기화) */
function getAllMenus() {
  let menus = storageGet(MENUS_KEY);
  if (!menus) {
    menus = ((window.CAFE_DATA && window.CAFE_DATA.MENUS) || []).map((m) => ({ ...m }));
    storageSet(MENUS_KEY, menus);
  }
  return menus;
}

function saveAllMenus(menus) {
  storageSet(MENUS_KEY, menus);
}

/** id 로 메뉴 찾기 */
function getMenuById(id) {
  return getAllMenus().find((m) => m.id === Number(id)) || null;
}

/** 카테고리 id 로 메뉴 필터 ("all" 이면 전체) */
function getMenusByCategory(categoryId) {
  const menus = getAllMenus();
  if (!categoryId || categoryId === "all") return menus;
  return menus.filter((m) => m.categoryId === categoryId);
}

/** 메뉴 추가 (id 자동 부여) */
function createMenu(data) {
  const menus = getAllMenus();
  const nextId = menus.reduce((max, m) => Math.max(max, m.id), 0) + 1;
  const menu = { soldOut: false, tags: [], ...data, id: nextId };
  menus.push(menu);
  saveAllMenus(menus);
  return menu;
}

/** 메뉴 수정 */
function updateMenu(id, changes) {
  const menus = getAllMenus();
  const idx = menus.findIndex((m) => m.id === Number(id));
  if (idx === -1) return null;
  menus[idx] = { ...menus[idx], ...changes, id: menus[idx].id };
  saveAllMenus(menus);
  return menus[idx];
}

/** 메뉴 삭제 */
function deleteMenu(id) {
  const menus = getAllMenus().filter((m) => m.id !== Number(id));
  saveAllMenus(menus);
}

/** 품절 상태 토글 */
function toggleMenuSoldOut(id) {
  const menu = getMenuById(id);
  if (!menu) return null;
  return updateMenu(id, { soldOut: !menu.soldOut });
}

/* ── DOM / 기타 ── */

/** URL 쿼리 파라미터 값 반환 */
function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

/** 짧은 querySelector 별칭 */
function qs(selector, parent = document) {
  return parent.querySelector(selector);
}
function qsa(selector, parent = document) {
  return Array.from(parent.querySelectorAll(selector));
}

/** 간단한 토스트 메시지 */
function showToast(message, duration = 2000) {
  let toast = document.getElementById("cafe-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "cafe-toast";
    toast.style.cssText = `
      position: fixed; left: 50%; bottom: 32px; transform: translateX(-50%) translateY(20px);
      background: var(--color-primary, #6f4e37); color: #fff; padding: 12px 20px;
      border-radius: 999px; font-weight: 600; box-shadow: 0 6px 20px rgba(0,0,0,.2);
      opacity: 0; transition: opacity .25s, transform .25s; z-index: 9999; pointer-events: none;
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  requestAnimationFrame(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateX(-50%) translateY(0)";
  });
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(-50%) translateY(20px)";
  }, duration);
}

/* 전역 노출 */
window.CAFE_UTILS = {
  formatPrice,
  formatDate,
  storageGet,
  storageSet,
  getCart,
  addToCart,
  updateCartQty,
  removeFromCart,
  clearCart,
  getCartCount,
  getCartTotal,
  getOrders,
  getOrderById,
  createOrderFromCart,
  updateOrderStatus,
  getAllMenus,
  getMenuById,
  getMenusByCategory,
  createMenu,
  updateMenu,
  deleteMenu,
  toggleMenuSoldOut,
  getQueryParam,
  qs,
  qsa,
  showToast,
};
