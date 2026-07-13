/* ============================================
   관리자 - 대시보드 로직
   ============================================ */

(function () {
  const { ORDER_STATUS } = window.CAFE_DATA;
  const {
    formatPrice,
    formatDate,
    getOrders,
    getAllMenus,
    qs,
  } = window.CAFE_UTILS;

  /* 랜딩 두 번째 섹션과 동일한 픽셀 나무 바닥·카펫 */
  if (window.CAFE_PIXEL) {
    document.documentElement.style.setProperty(
      "--paper-tex",
      `url(${window.CAFE_PIXEL.paperTexture()})`
    );
    window.CAFE_PIXEL.applyFloor(document.body, null, true);
  }

  const orders = getOrders()
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  /* ── KPI 통계 ── */
  const totalOrders = orders.length;
  const totalRevenue = orders
    .filter((o) => o.status !== "canceled")
    .reduce((sum, o) => sum + o.total, 0);
  const inProgress = orders.filter(
    (o) => o.status === "pending" || o.status === "making"
  ).length;
  const menuCount = getAllMenus().length;

  qs("#stat-orders").textContent = `${totalOrders}건`;
  qs("#stat-revenue").textContent = formatPrice(totalRevenue);
  qs("#stat-progress").textContent = `${inProgress}건`;
  qs("#stat-menus").textContent = `${menuCount}개`;

  /* ── 최근 주문 (최대 5건) ── */
  const bodyEl = qs("#recent-body");
  const emptyEl = qs("#recent-empty");
  const tableWrap = qs(".table-wrap");
  const recent = orders.slice(0, 5);

  const isEmpty = recent.length === 0;
  emptyEl.hidden = !isEmpty;
  tableWrap.hidden = isEmpty;

  function itemsLabel(items) {
    if (!items || items.length === 0) return "";
    const first = items[0].name;
    const restCount = items.reduce((s, it) => s + it.qty, 0) - items[0].qty;
    return restCount > 0 ? `${first} 외 ${restCount}개` : first;
  }

  bodyEl.innerHTML = recent
    .map((o) => {
      const status = ORDER_STATUS[o.status] || {
        label: o.status,
        color: "var(--color-text-muted)",
      };
      return `
        <tr data-id="${o.id}">
          <td class="order-id">${o.id}</td>
          <td>${formatDate(o.createdAt)}</td>
          <td class="order-menu">${itemsLabel(o.items)}</td>
          <td class="ta-right order-amount">${formatPrice(o.total)}</td>
          <td class="ta-center">
            <span class="status-badge" style="background:${status.color}">
              ${status.label}
            </span>
          </td>
        </tr>`;
    })
    .join("");

  /* 행 클릭 → 관리자 주문 상세 */
  bodyEl.addEventListener("click", (e) => {
    const tr = e.target.closest("tr[data-id]");
    if (!tr) return;
    window.location.href = `orders/detail.html?id=${tr.dataset.id}`;
  });
})();
