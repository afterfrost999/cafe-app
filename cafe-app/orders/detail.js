/* ============================================
   고객 - 주문 상세 로직
   ============================================ */

(function () {
  const { ORDER_STATUS } = window.CAFE_DATA;
  const {
    formatPrice,
    formatDate,
    getMyOrderById,
    getCartCount,
    getQueryParam,
    formatMenuOptions,
    escapeHTML,
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

  const detailEl = qs("#detail");
  const cartCountEl = qs("#cart-count");
  if (cartCountEl) cartCountEl.textContent = getCartCount();

  const id = getQueryParam("id");
  const order = getMyOrderById(id);

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
      (it) => {
        const optionLabel = formatMenuOptions(it.options || {});
        return `
        <div class="order-item">
          <div>
            <p class="item-name">${escapeHTML(it.name)}</p>
            ${optionLabel ? `<p class="item-options">${escapeHTML(optionLabel)}</p>` : ""}
            <p class="item-unit">${formatPrice(it.price)}</p>
          </div>
          <span class="item-qty">x ${it.qty}</span>
          <span class="item-subtotal">${formatPrice(it.price * it.qty)}</span>
        </div>`;
      }
    )
    .join("");

  const fulfillmentLabel = order.fulfillment === "dine-in" ? "매장" : "포장";
  const requestText = order.request ? escapeHTML(order.request) : "없음";
  const subtotal = order.subtotal ?? order.total;
  const discount = order.discount || 0;
  const couponRow = discount > 0
    ? `<dl class="pay-row pay-discount">
        <dt>${escapeHTML(order.coupon?.name || "쿠폰 할인")}</dt>
        <dd>-${formatPrice(discount)}</dd>
      </dl>`
    : "";

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

    <div class="order-preferences">
      <dl><dt>이용 방법</dt><dd>${fulfillmentLabel}</dd></dl>
      <dl><dt>요청사항</dt><dd>${requestText}</dd></dl>
    </div>

    <h2 class="section-title">주문 메뉴</h2>
    <div class="item-list">${itemsHtml}</div>

    <div class="pay-box">
      <dl class="pay-row">
        <dt>총 상품금액</dt>
        <dd>${formatPrice(subtotal)}</dd>
      </dl>
      ${couponRow}
      <div class="pay-divider"></div>
      <dl class="pay-row pay-final">
        <dt>결제 금액</dt>
        <dd>${formatPrice(order.total)}</dd>
      </dl>
    </div>`;
})();
