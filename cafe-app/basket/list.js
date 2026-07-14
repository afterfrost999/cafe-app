/* ============================================
   고객 - 장바구니 로직
   ============================================ */

(function () {
  const {
    formatPrice,
    getCart,
    getMenuById,
    updateCartQty,
    removeFromCart,
    clearCart,
    getCartCount,
    getCartPricing,
    getAvailableCoupons,
    getCartItemUnitPrice,
    formatMenuOptions,
    escapeHTML,
    createOrderFromCart,
    showToast,
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

  const listEl = qs("#cart-list");
  const summaryEl = qs("#summary");
  const emptyEl = qs("#empty");
  const cartCountEl = qs("#cart-count");
  const summaryCountEl = qs("#summary-count");
  const summaryTotalEl = qs("#summary-total");
  const summaryFinalEl = qs("#summary-final");
  const summaryDiscountEl = qs("#summary-discount");
  const couponSelectEl = qs("#coupon-select");
  const couponHelpEl = qs("#coupon-help");
  const requestEl = qs("#order-request");
  const requestCountEl = qs("#request-count");

  const availableCoupons = getAvailableCoupons();
  if (availableCoupons.length > 0) {
    couponSelectEl.innerHTML = `
      <option value="">쿠폰 적용 안 함</option>
      ${availableCoupons
        .map(
          (coupon) =>
            `<option value="${escapeHTML(coupon.id)}">${escapeHTML(
              coupon.name
            )} · ${escapeHTML(coupon.benefit)}</option>`
        )
        .join("")}`;
  } else {
    couponSelectEl.innerHTML = `<option value="">사용 가능한 쿠폰이 없어요</option>`;
    couponSelectEl.disabled = true;
    couponHelpEl.textContent = "사용하지 않았고 유효기간이 남은 쿠폰이 없습니다.";
  }

  /* 전체 렌더 */
  function render() {
    const cart = getCart();

    // 빈 장바구니 처리
    const isEmpty = cart.length === 0;
    emptyEl.hidden = !isEmpty;
    listEl.hidden = isEmpty;
    summaryEl.hidden = isEmpty;

    if (cartCountEl) cartCountEl.textContent = getCartCount();

    if (isEmpty) return;

    // 항목 렌더 (유효하지 않은 메뉴는 자동 정리)
    listEl.innerHTML = cart
      .map((item) => {
        const menu = getMenuById(item.menuId);
        if (!menu) return "";
        const unitPrice = getCartItemUnitPrice(item);
        const subtotal = unitPrice * item.qty;
        const optionLabel = formatMenuOptions(item.options);
        return `
          <li class="cart-item" data-line-id="${item.lineId}">
            <img class="cart-thumb" src="${window.CAFE_PIXEL ? CAFE_PIXEL.menuArt(menu) : menu.image}" alt="${menu.name}" />
            <div class="cart-info">
              <p class="cart-name">${menu.name}</p>
              ${optionLabel ? `<p class="cart-options">${optionLabel}</p>` : ""}
              <p class="cart-unit">${formatPrice(unitPrice)}</p>
            </div>
            <div class="cart-controls">
              <span class="cart-subtotal">${formatPrice(subtotal)}</span>
              <div class="qty-control">
                <button class="qty-btn" data-act="minus" aria-label="수량 감소">−</button>
                <span class="qty-value">${item.qty}</span>
                <button class="qty-btn" data-act="plus" aria-label="수량 증가">+</button>
              </div>
              <button class="cart-remove" data-act="remove">삭제</button>
            </div>
          </li>`;
      })
      .join("");

    // 요약 갱신
    const pricing = getCartPricing(couponSelectEl.value);
    summaryCountEl.textContent = `${getCartCount()}개`;
    summaryTotalEl.textContent = formatPrice(pricing.subtotal);
    summaryDiscountEl.textContent = `-${formatPrice(pricing.discount)}`;
    summaryFinalEl.textContent = formatPrice(pricing.total);
    if (couponSelectEl.value) {
      couponHelpEl.textContent = pricing.discount > 0
        ? `${pricing.coupon.benefit}이 적용되었습니다.`
        : "음료 메뉴가 있어야 이 쿠폰을 적용할 수 있어요.";
    } else if (availableCoupons.length > 0) {
      couponHelpEl.textContent = "쿠폰을 선택하면 할인 금액이 반영돼요.";
    }
  }

  /* 항목 조작 (이벤트 위임) */
  listEl.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-act]");
    if (!btn) return;
    const li = btn.closest(".cart-item");
    const lineId = li.dataset.lineId;
    const act = btn.dataset.act;

    if (act === "remove") {
      removeFromCart(lineId);
    } else {
      const current = getCart().find((c) => c.lineId === lineId);
      if (!current) return;
      const nextQty = act === "plus" ? current.qty + 1 : current.qty - 1;
      updateCartQty(lineId, nextQty); // 0 이하이면 내부에서 제거됨
    }
    render();
  });

  /* 주문하기 */
  qs("#btn-order").addEventListener("click", () => {
    const fulfillment = qs('input[name="fulfillment"]:checked');
    const order = createOrderFromCart({
      fulfillment: fulfillment ? fulfillment.value : "takeout",
      request: requestEl ? requestEl.value : "",
      couponId: couponSelectEl ? couponSelectEl.value : "",
    });
    if (!order) {
      showToast("장바구니가 비어 있어요.");
      return;
    }
    showToast("주문이 완료되었어요 🎉");
    // 주문 상세로 이동
    setTimeout(() => {
      window.location.href = `../orders/detail.html?id=${order.id}`;
    }, 700);
  });

  couponSelectEl.addEventListener("change", render);

  if (requestEl && requestCountEl) {
    requestEl.addEventListener("input", () => {
      requestCountEl.textContent = requestEl.value.length;
    });
  }

  /* 장바구니 비우기 */
  qs("#btn-clear").addEventListener("click", () => {
    if (getCart().length === 0) return;
    if (confirm("장바구니를 모두 비울까요?")) {
      clearCart();
      render();
    }
  });

  render();
})();
