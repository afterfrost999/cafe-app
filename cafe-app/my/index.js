/* ============================================
   고객 - 마이페이지 로직
   ============================================ */

(function () {
  const { ORDER_STATUS } = window.CAFE_DATA;
  const {
    formatPrice,
    formatDate,
    getMyOrders,
    getCurrentUser,
    getAvailableCoupons,
    getCartCount,
    qs,
  } = window.CAFE_UTILS;

  // 로그인 사용자 이름 표시 (아바타에는 첫 글자)
  const user = getCurrentUser();
  const nameEl = qs(".profile-name");
  const avatarEl = qs(".profile-avatar");
  if (user) {
    if (nameEl) nameEl.textContent = `${user.name}님`;
    if (avatarEl) avatarEl.textContent = user.name.trim().charAt(0);
  }

  // 배경을 불규칙 나무 바닥 + 카펫 질감으로 (메뉴 리스트와 동일)
  if (window.CAFE_PIXEL) {
    document.documentElement.style.setProperty(
      "--paper-tex",
      `url(${CAFE_PIXEL.paperTexture()})`
    );
    CAFE_PIXEL.applyFloor(document.body, null, true);
  }

  // 헤더 장바구니 카운트
  const cartCountEl = qs("#cart-count");
  if (cartCountEl) cartCountEl.textContent = getCartCount();

  const orders = getMyOrders()
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  /* ── 통계 ── */
  const totalCount = orders.length;
  const totalSpent = orders
    .filter((o) => o.status !== "canceled")
    .reduce((sum, o) => sum + o.total, 0);
  const inProgress = orders.filter(
    (o) => o.status === "pending" || o.status === "making"
  ).length;

  qs("#stat-count").textContent = `${totalCount}건`;
  qs("#stat-total").textContent = formatPrice(totalSpent);
  qs("#stat-progress").textContent = `${inProgress}건`;

  /* ── 보유 쿠폰 ── */
  const coupons = getAvailableCoupons();
  const couponListEl = qs("#coupon-list");
  const couponEmptyEl = qs("#coupon-empty");
  const couponCountEl = qs("#coupon-count");

  couponCountEl.textContent = `${coupons.length}장`;
  couponEmptyEl.hidden = coupons.length > 0;
  couponListEl.hidden = coupons.length === 0;

  function couponExpiry(coupon) {
    const issuedAt = new Date(coupon.issuedAt);
    issuedAt.setDate(issuedAt.getDate() + Number(coupon.validDays || 30));
    const pad = (value) => String(value).padStart(2, "0");
    return `${issuedAt.getFullYear()}.${pad(issuedAt.getMonth() + 1)}.${pad(
      issuedAt.getDate()
    )}까지`;
  }

  couponListEl.innerHTML = coupons
    .map(
      (coupon) => `
        <li class="coupon-card">
          <div class="coupon-benefit">
            <span class="coupon-pixel" aria-hidden="true">%</span>
            <div>
              <p class="coupon-name">${coupon.name}</p>
              <p class="coupon-value">${coupon.benefit}</p>
            </div>
          </div>
          <div class="coupon-meta">
            <span class="coupon-status">사용 가능</span>
            <span>${coupon.condition}</span>
            <span>${couponExpiry(coupon)}</span>
          </div>
        </li>`
    )
    .join("");

  /* ── 최근 주문 (최대 3건) ── */
  const listEl = qs("#recent-list");
  const emptyEl = qs("#recent-empty");
  const recent = orders.slice(0, 3);

  emptyEl.hidden = recent.length > 0;
  listEl.hidden = recent.length === 0;

  function itemsLabel(items) {
    if (!items || items.length === 0) return "";
    const first = items[0].name;
    const restCount = items.reduce((s, it) => s + it.qty, 0) - items[0].qty;
    return restCount > 0 ? `${first} 외 ${restCount}개` : first;
  }

  listEl.innerHTML = recent
    .map((o) => {
      const status = ORDER_STATUS[o.status] || {
        label: o.status,
        color: "var(--color-text-muted)",
      };
      return `
        <li>
          <a class="recent-card" href="../orders/detail.html?id=${o.id}">
            <div class="recent-main">
              <p class="recent-items">${itemsLabel(o.items)}</p>
              <p class="recent-date">${formatDate(o.createdAt)}</p>
            </div>
            <div class="recent-right">
              <span class="recent-status" style="background:${status.color}">
                ${status.label}
              </span>
              <span class="recent-total">${formatPrice(o.total)}</span>
            </div>
          </a>
        </li>`;
    })
    .join("");
})();
