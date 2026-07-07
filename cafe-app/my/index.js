/* ============================================
   고객 - 마이페이지 로직
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

  // 헤더 장바구니 카운트
  qs("#cart-count").textContent = getCartCount();

  const orders = getOrders()
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
