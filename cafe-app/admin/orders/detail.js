/* ============================================
   관리자 - 주문 상세 로직
   ============================================ */

(function () {
  if (window.CAFE_PIXEL) {
    document.documentElement.style.setProperty(
      "--paper-tex",
      `url(${window.CAFE_PIXEL.paperTexture()})`
    );
    window.CAFE_PIXEL.applyFloor(document.body, null, true);
  }

  const { ORDER_STATUS } = window.CAFE_DATA;
  const {
    formatPrice,
    formatDate,
    getOrderById,
    updateOrderStatus,
    getQueryParam,
    showToast,
    qs,
  } = window.CAFE_UTILS;

  const detailEl = qs("#detail");
  const id = getQueryParam("id");
  let order = getOrderById(id);

  /* 주문 없음 */
  if (!order) {
    detailEl.innerHTML = `
      <p class="not-found">
        존재하지 않는 주문입니다.<br />
        <a href="list.html" class="back-link">주문 관리로 돌아가기</a>
      </p>`;
    return;
  }

  const statusKeys = Object.keys(ORDER_STATUS);

  function itemsHtml() {
    return order.items
      .map(
        (it) => `
          <div class="order-item">
            <div>
              <p class="item-name">${it.name}</p>
              <p class="item-unit">${formatPrice(it.price)}</p>
            </div>
            <span class="item-qty">x ${it.qty}</span>
            <span class="item-subtotal">${formatPrice(it.price * it.qty)}</span>
          </div>`
      )
      .join("");
  }

  function statusBtnsHtml() {
    return statusKeys
      .map((key) => {
        const meta = ORDER_STATUS[key];
        const active = key === order.status;
        const style = active ? `style="background:${meta.color}"` : "";
        return `<button class="status-btn ${
          active ? "active" : ""
        }" data-status="${key}" ${style}>${meta.label}</button>`;
      })
      .join("");
  }

  function render() {
    const status = ORDER_STATUS[order.status] || {
      label: order.status,
      color: "var(--color-text-muted)",
    };
    detailEl.innerHTML = `
      <div class="order-head">
        <div>
          <p class="order-id">${order.id}</p>
          <p class="order-date">${formatDate(order.createdAt)}</p>
        </div>
        <span class="order-status" style="background:${status.color}">
          ${status.label}
        </span>
      </div>

      <div class="status-control">
        <h2 class="section-title">주문 상태 변경</h2>
        <div class="status-btns" id="status-btns">${statusBtnsHtml()}</div>
      </div>

      <h2 class="section-title">주문 메뉴</h2>
      <div class="item-list">${itemsHtml()}</div>

      <div class="pay-box">
        <dl class="pay-row">
          <dt>총 상품금액</dt>
          <dd>${formatPrice(order.total)}</dd>
        </dl>
        <div class="pay-divider"></div>
        <dl class="pay-row pay-final">
          <dt>결제 금액</dt>
          <dd>${formatPrice(order.total)}</dd>
        </dl>
      </div>`;

    // 상태 변경 버튼 바인딩
    qs("#status-btns").addEventListener("click", (e) => {
      const btn = e.target.closest(".status-btn");
      if (!btn) return;
      const nextStatus = btn.dataset.status;
      if (nextStatus === order.status) return;
      const updated = updateOrderStatus(order.id, nextStatus);
      if (updated) {
        order = updated;
        render();
        showToast(`상태가 '${ORDER_STATUS[nextStatus].label}'(으)로 변경됐어요`);
      }
    });
  }

  render();
})();
