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

/* ── 데모 회원 / 로그인 ── */

const USERS_KEY = "cafe_users";
const SESSION_KEY = "cafe_session";
const DEFAULT_USERS = [
  {
    username: "seungjok",
    password: "1234",
    name: "김승조",
    role: "customer",
  },
  {
    username: "admin",
    password: "1234",
    name: "관리자",
    role: "admin",
  },
];

function ensureDefaultUser() {
  const storedUsers = storageGet(USERS_KEY, []);
  const users = Array.isArray(storedUsers) ? storedUsers : [];
  DEFAULT_USERS.forEach((defaultUser) => {
    const defaultIndex = users.findIndex(
      (user) => user.username === defaultUser.username
    );
    if (defaultIndex === -1) {
      users.push({ ...defaultUser });
    } else {
      users[defaultIndex] = { ...defaultUser };
    }
  });
  storageSet(USERS_KEY, users);
  return users;
}

function getCurrentUser() {
  const username = storageGet(SESSION_KEY);
  if (!username) return null;
  return (
    ensureDefaultUser().find((user) => user.username === username) || null
  );
}

function login(username, password) {
  const user = ensureDefaultUser().find(
    (item) => item.username === username && item.password === password
  );
  if (!user) return null;
  storageSet(SESSION_KEY, user.username);
  applyPendingFavorite();
  return user;
}

function logout() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    /* 저장소 접근 실패 무시 */
  }
}

function registerUser({ username, password, name, email }) {
  const users = ensureDefaultUser();
  if (users.some((user) => user.username === username)) {
    return { ok: false, message: "이미 사용 중인 아이디입니다." };
  }
  const user = { username, password, name, email, role: "customer" };
  users.push(user);
  storageSet(USERS_KEY, users);
  storageSet(SESSION_KEY, username);
  applyPendingFavorite();
  return { ok: true, user };
}

function rootPrefix() {
  return /\/(menus|orders|my|basket|events|auth|recommend|notices)\//.test(
    window.location.pathname
  )
    ? "../"
    : "";
}

function escapeHTML(value) {
  const el = document.createElement("span");
  el.textContent = value;
  return el.innerHTML;
}

function initAuthUI() {
  ensureDefaultUser();
  const user = getCurrentUser();
  const nav = document.querySelector("[data-auth-nav]");
  const prefix = rootPrefix();

  if (nav) {
    if (user) {
      const adminButton =
        user.role === "admin"
          ? `<a class="nav-link auth-admin" href="${prefix}admin/index.html">카페 관리</a>`
          : "";
      nav.innerHTML = `<span class="auth-greeting">${escapeHTML(
        user.name
      )}님 안녕하세요</span>${adminButton}<button class="nav-link auth-logout" type="button">로그아웃</button><a class="nav-link auth-cart" href="${prefix}basket/list.html">장바구니<span class="auth-cart-count" data-cart-count hidden>0</span></a>`;
    } else {
      nav.innerHTML = `<a class="nav-link" href="${prefix}auth/login.html">로그인</a><a class="nav-link auth-signup" href="${prefix}auth/signup.html">회원가입</a>`;
    }

    const logoutButton = nav.querySelector(".auth-logout");
    if (logoutButton) {
      logoutButton.addEventListener("click", () => {
        logout();
        window.location.reload();
      });
    }
  }

  document.querySelectorAll("[data-auth-only]").forEach((element) => {
    element.hidden = !user;
  });

  refreshCartBadges();

  return user;
}

function requireLogin() {
  if (getCurrentUser()) return true;
  const next = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  window.location.href = `${rootPrefix()}auth/login.html?next=${encodeURIComponent(
    next
  )}`;
  return false;
}

/* ── 찜한 메뉴 (계정별 저장) ── */

const FAVORITES_KEY = "cafe_favorites";
const PENDING_FAVORITE_KEY = "cafe_pending_favorite";

function getFavoriteStore() {
  const stored = storageGet(FAVORITES_KEY, {});
  return stored && typeof stored === "object" && !Array.isArray(stored)
    ? stored
    : {};
}

function getFavorites() {
  const user = getCurrentUser();
  if (!user) return [];
  const favorites = getFavoriteStore()[user.username];
  return Array.isArray(favorites) ? favorites.map(Number) : [];
}

function isFavorite(menuId) {
  return getFavorites().includes(Number(menuId));
}

function addFavorite(menuId) {
  const user = getCurrentUser();
  if (!user) return false;
  const store = getFavoriteStore();
  const favorites = Array.isArray(store[user.username])
    ? store[user.username].map(Number)
    : [];
  const id = Number(menuId);
  if (!favorites.includes(id)) favorites.push(id);
  store[user.username] = favorites;
  storageSet(FAVORITES_KEY, store);
  return true;
}

function removeFavorite(menuId) {
  const user = getCurrentUser();
  if (!user) return false;
  const store = getFavoriteStore();
  const id = Number(menuId);
  store[user.username] = (store[user.username] || [])
    .map(Number)
    .filter((favoriteId) => favoriteId !== id);
  storageSet(FAVORITES_KEY, store);
  return true;
}

function toggleFavorite(menuId) {
  if (!getCurrentUser()) return false;
  if (isFavorite(menuId)) {
    removeFavorite(menuId);
    return false;
  }
  addFavorite(menuId);
  return true;
}

function setPendingFavorite(menuId) {
  storageSet(PENDING_FAVORITE_KEY, Number(menuId));
}

function applyPendingFavorite() {
  const pendingId = storageGet(PENDING_FAVORITE_KEY);
  if (pendingId === null || pendingId === undefined || !getCurrentUser()) {
    return false;
  }
  addFavorite(pendingId);
  try {
    localStorage.removeItem(PENDING_FAVORITE_KEY);
  } catch {
    /* 저장소 접근 실패 무시 */
  }
  return true;
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
  refreshCartBadges();
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
  refreshCartBadges();
  return cart;
}

/** 장바구니 항목 제거 */
function removeFromCart(menuId) {
  const cart = getCart().filter((item) => item.menuId !== menuId);
  storageSet(CART_KEY, cart);
  refreshCartBadges();
  return cart;
}

/** 장바구니 비우기 */
function clearCart() {
  storageSet(CART_KEY, []);
  refreshCartBadges();
}

/* ── 로그인 후 자동 담기 (비로그인 상태에서 담기 → 로그인 후 이어서 담김) ── */
const PENDING_ADD_KEY = "cafe_pending_add";

/** 로그인 전에 담으려던 메뉴를 보관 */
function setPendingCartAdd(menuId, qty = 1) {
  storageSet(PENDING_ADD_KEY, { menuId, qty });
}

/** 로그인되어 있고 대기 중인 담기가 있으면 장바구니에 담고 비움 */
function applyPendingCartAdd() {
  const pending = storageGet(PENDING_ADD_KEY);
  if (!pending || !getCurrentUser()) return;
  try {
    localStorage.removeItem(PENDING_ADD_KEY);
  } catch {
    /* 저장소 접근 실패 무시 */
  }
  addToCart(pending.menuId, pending.qty || 1);
  showToast("장바구니에 담았어요 🛒");
}

/** 장바구니 총 수량 */
function getCartCount() {
  return getCart().reduce((sum, item) => sum + item.qty, 0);
}

/** 헤더 등에 표시되는 장바구니 개수 배지를 모두 갱신 (0이면 숨김) */
function refreshCartBadges() {
  const count = getCartCount();
  document.querySelectorAll("[data-cart-count]").forEach((el) => {
    el.textContent = count;
    el.hidden = count <= 0;
  });
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
const MENUS_VER_KEY = "cafe_menus_ver";
// data.js 의 기본 메뉴를 바꾸면 이 숫자를 올려 저장된 캐시를 새로 시딩한다.
const MENUS_VERSION = 3;

/** 전체 메뉴 목록 (최초 호출 또는 버전 변경 시 data.js 기본 데이터로 초기화) */
function getAllMenus() {
  let menus = storageGet(MENUS_KEY);
  const ver = storageGet(MENUS_VER_KEY);
  if (!menus || ver !== MENUS_VERSION) {
    menus = ((window.CAFE_DATA && window.CAFE_DATA.MENUS) || []).map((m) => ({ ...m }));
    storageSet(MENUS_KEY, menus);
    storageSet(MENUS_VER_KEY, MENUS_VERSION);
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

/* ── 이벤트 (Event) : localStorage 오버레이하여 관리자 CRUD 반영 ── */

const EVENTS_KEY = "cafe_events";
const EVENTS_VER_KEY = "cafe_events_ver";
// data.js 의 기본 이벤트를 바꾸면 이 숫자를 올려 저장된 캐시를 새로 시딩한다.
const EVENTS_VERSION = 1;

/** 전체 이벤트 목록 (최초 호출 또는 버전 변경 시 data.js 기본 데이터로 초기화) */
function getAllEvents() {
  let events = storageGet(EVENTS_KEY);
  const ver = storageGet(EVENTS_VER_KEY);
  if (!events || ver !== EVENTS_VERSION) {
    events = ((window.CAFE_DATA && window.CAFE_DATA.EVENTS) || []).map((e) => ({
      ...e,
    }));
    storageSet(EVENTS_KEY, events);
    storageSet(EVENTS_VER_KEY, EVENTS_VERSION);
  }
  return events;
}

function saveAllEvents(events) {
  storageSet(EVENTS_KEY, events);
}

/** id 로 이벤트 찾기 */
function getEventById(id) {
  return getAllEvents().find((e) => e.id === Number(id)) || null;
}

/** 이벤트 추가 (id 자동 부여) */
function createEvent(data) {
  const events = getAllEvents();
  const nextId = events.reduce((max, e) => Math.max(max, e.id), 0) + 1;
  const event = { kind: "fire", ...data, id: nextId };
  events.push(event);
  saveAllEvents(events);
  return event;
}

/** 이벤트 수정 */
function updateEvent(id, changes) {
  const events = getAllEvents();
  const idx = events.findIndex((e) => e.id === Number(id));
  if (idx === -1) return null;
  events[idx] = { ...events[idx], ...changes, id: events[idx].id };
  saveAllEvents(events);
  return events[idx];
}

/** 이벤트 삭제 */
function deleteEvent(id) {
  const events = getAllEvents().filter((e) => e.id !== Number(id));
  saveAllEvents(events);
}

/* ── 공지사항 (Notice) : localStorage 오버레이하여 관리자 CRUD 반영 ── */

const NOTICES_KEY = "cafe_notices";
const NOTICES_VER_KEY = "cafe_notices_ver";
// data.js 의 기본 공지를 바꾸면 이 숫자를 올려 저장된 캐시를 새로 시딩한다.
const NOTICES_VERSION = 1;

/** 전체 공지 목록 (최초 호출 또는 버전 변경 시 data.js 기본 데이터로 초기화) */
function getAllNotices() {
  let notices = storageGet(NOTICES_KEY);
  const ver = storageGet(NOTICES_VER_KEY);
  if (!notices || ver !== NOTICES_VERSION) {
    notices = ((window.CAFE_DATA && window.CAFE_DATA.NOTICES) || []).map((n) => ({
      ...n,
    }));
    storageSet(NOTICES_KEY, notices);
    storageSet(NOTICES_VER_KEY, NOTICES_VERSION);
  }
  return notices;
}

function saveAllNotices(notices) {
  storageSet(NOTICES_KEY, notices);
}

/** id 로 공지 찾기 */
function getNoticeById(id) {
  return getAllNotices().find((n) => n.id === Number(id)) || null;
}

/** 공지 추가 (id 자동 부여, 등록일 자동 기록) */
function createNotice(data) {
  const notices = getAllNotices();
  const nextId = notices.reduce((max, n) => Math.max(max, n.id), 0) + 1;
  const notice = {
    createdAt: new Date().toISOString(),
    ...data,
    id: nextId,
  };
  notices.push(notice);
  saveAllNotices(notices);
  return notice;
}

/** 공지 수정 */
function updateNotice(id, changes) {
  const notices = getAllNotices();
  const idx = notices.findIndex((n) => n.id === Number(id));
  if (idx === -1) return null;
  notices[idx] = { ...notices[idx], ...changes, id: notices[idx].id };
  saveAllNotices(notices);
  return notices[idx];
}

/** 공지 삭제 */
function deleteNotice(id) {
  const notices = getAllNotices().filter((n) => n.id !== Number(id));
  saveAllNotices(notices);
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

/** 모든 페이지에서 공통으로 사용하는 커서 불빛 */
function initCursorGlow() {
  let glow = document.getElementById("cursor-glow");
  if (!glow) {
    glow = document.createElement("div");
    glow.id = "cursor-glow";
    glow.className = "cursor-glow";
    glow.setAttribute("aria-hidden", "true");
    document.body.appendChild(glow);
  }

  window.addEventListener(
    "pointermove",
    (event) => {
      glow.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
    },
    { passive: true }
  );
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
  ensureDefaultUser,
  getCurrentUser,
  login,
  logout,
  registerUser,
  initAuthUI,
  requireLogin,
  getFavorites,
  isFavorite,
  addFavorite,
  removeFavorite,
  toggleFavorite,
  setPendingFavorite,
  applyPendingFavorite,
  getCart,
  addToCart,
  updateCartQty,
  removeFromCart,
  clearCart,
  getCartCount,
  getCartTotal,
  refreshCartBadges,
  setPendingCartAdd,
  applyPendingCartAdd,
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
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getAllNotices,
  getNoticeById,
  createNotice,
  updateNotice,
  deleteNotice,
  escapeHTML,
  getQueryParam,
  qs,
  qsa,
  initCursorGlow,
  showToast,
};

initAuthUI();
applyPendingFavorite();
applyPendingCartAdd();
initCursorGlow();
