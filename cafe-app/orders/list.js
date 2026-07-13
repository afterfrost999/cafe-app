/* ============================================
   고객 - 주문 내역 목록 로직
   ============================================ */

(function () {
  const { ORDER_STATUS } = window.CAFE_DATA;
  const {
    formatPrice,
    formatDate,
    getOrders,
    getCartCount,
    qs,
  } = window.CAFE_UTILS;

  /* 배경을 불규칙 나무 바닥 + 카펫 질감으로 (메뉴 리스트와 동일) */
  if (window.CAFE_PIXEL) {
    document.documentElement.style.setProperty(
      "--paper-tex",
      `url(${CAFE_PIXEL.paperTexture()})`
    );
    CAFE_PIXEL.applyFloor(document.body, null, true);
  }

  const listEl = qs("#order-list");
  const emptyEl = qs("#empty");
  const cartCountEl = qs("#cart-count");

  // 헤더 장바구니 카운트
  if (cartCountEl) cartCountEl.textContent = getCartCount();

  /** 주문 항목 요약 문구: "아메리카노 외 2개" */
  function itemsLabel(items) {
    if (!items || items.length === 0) return "";
    const first = items[0].name;
    const restCount = items.reduce((sum, it) => sum + it.qty, 0) - items[0].qty;
    return restCount > 0 ? `${first} 외 ${restCount}개` : first;
  }

  /* 최신순 정렬 후 렌더 */
  const orders = getOrders()
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  emptyEl.hidden = orders.length > 0;
  listEl.hidden = orders.length === 0;

  listEl.innerHTML = orders
    .map((o) => {
      const status = ORDER_STATUS[o.status] || {
        label: o.status,
        color: "var(--color-text-muted)",
      };
      return `
        <li>
          <a class="order-card" href="detail.html?id=${o.id}">
            <div class="order-top">
              <span class="order-id">${o.id}</span>
              <span class="order-status" style="background:${status.color}">
                ${status.label}
              </span>
            </div>
            <p class="order-date">${formatDate(o.createdAt)}</p>
            <div class="order-summary">
              <span class="order-items">${itemsLabel(o.items)}</span>
              <span class="order-total">${formatPrice(o.total)}</span>
            </div>
          </a>
        </li>`;
    })
    .join("");
})();
