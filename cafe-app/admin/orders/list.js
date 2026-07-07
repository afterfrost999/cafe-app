/* ============================================
   관리자 - 주문 목록 로직
   ============================================ */

(function () {
  const { ORDER_STATUS } = window.CAFE_DATA;
  const {
    formatPrice,
    formatDate,
    getOrders,
    getQueryParam,
    qs,
  } = window.CAFE_UTILS;

  const tabsEl = qs("#filter-tabs");
  const bodyEl = qs("#order-body");
  const emptyEl = qs("#empty");
  const tableWrap = qs("#table-wrap");

  // 최신순 정렬된 전체 주문
  const allOrders = getOrders()
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // 현재 필터 (URL ?status= 초기값)
  let activeStatus = getQueryParam("status") || "all";

  /** 메뉴 요약 라벨 */
  function itemsLabel(items) {
    if (!items || items.length === 0) return "";
    const first = items[0].name;
    const restCount = items.reduce((s, it) => s + it.qty, 0) - items[0].qty;
    return restCount > 0 ? `${first} 외 ${restCount}개` : first;
  }

  /* 상태 필터 탭 렌더 */
  function renderTabs() {
    const statusKeys = Object.keys(ORDER_STATUS);
    const tabs = [
      { key: "all", label: "전체" },
      ...statusKeys.map((k) => ({ key: k, label: ORDER_STATUS[k].label })),
    ];

    tabsEl.innerHTML = tabs
      .map((t) => {
        const count =
          t.key === "all"
            ? allOrders.length
            : allOrders.filter((o) => o.status === t.key).length;
        return `
          <button class="filter-tab ${
            t.key === activeStatus ? "active" : ""
          }" data-status="${t.key}">
            ${t.label}
            <span class="filter-count">${count}</span>
          </button>`;
      })
      .join("");

    tabsEl.querySelectorAll(".filter-tab").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeStatus = btn.dataset.status;
        renderTabs();
        renderRows();
      });
    });
  }

  /* 주문 행 렌더 */
  function renderRows() {
    const orders =
      activeStatus === "all"
        ? allOrders
        : allOrders.filter((o) => o.status === activeStatus);

    const isEmpty = orders.length === 0;
    emptyEl.hidden = !isEmpty;
    tableWrap.hidden = isEmpty;

    bodyEl.innerHTML = orders
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
  }

  /* 행 클릭 → 관리자 주문 상세 */
  bodyEl.addEventListener("click", (e) => {
    const tr = e.target.closest("tr[data-id]");
    if (!tr) return;
    window.location.href = `detail.html?id=${tr.dataset.id}`;
  });

  renderTabs();
  renderRows();
})();
