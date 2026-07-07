/* ============================================
   고객 - 주문 상세 로직
   ============================================ */

(function () {
  const { ORDER_STATUS } = window.CAFE_DATA;
  const {
    formatPrice,
    formatDate,
    getOrderById,
    getCartCount,
    getQueryParam,
    qs,
  } = window.CAFE_UTILS;

  const detailEl = qs("#detail");
  qs("#cart-count").textContent = getCartCount();

  const id = getQueryParam("id");
  const order = getOrderById(id);

  /* 주문 없음 */
  if (!order) {
    detailEl.innerHTML = `
      <p class="not-found">
        존재하지 않는 주문입니다.<br />
        <a href="list.html" class="back-link">주문 내역으로 돌아가기</a>
      </p>`;
    return;
  }

  const status = ORDER_STATUS[order.status] || {
    label: order.status,
    color: "var(--color-text-muted)",
  };

  const itemsHtml = order.items
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

    <h2 class="section-title">주문 메뉴</h2>
    <div class="item-list">${itemsHtml}</div>

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
})();
