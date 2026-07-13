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
    getCartTotal,
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
        const subtotal = menu.price * item.qty;
        return `
          <li class="cart-item" data-id="${menu.id}">
            <img class="cart-thumb" src="${window.CAFE_PIXEL ? CAFE_PIXEL.menuArt(menu) : menu.image}" alt="${menu.name}" />
            <div class="cart-info">
              <p class="cart-name">${menu.name}</p>
              <p class="cart-unit">${formatPrice(menu.price)}</p>
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
    const total = getCartTotal();
    summaryCountEl.textContent = `${getCartCount()}개`;
    summaryTotalEl.textContent = formatPrice(total);
    summaryFinalEl.textContent = formatPrice(total);
  }

  /* 항목 조작 (이벤트 위임) */
  listEl.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-act]");
    if (!btn) return;
    const li = btn.closest(".cart-item");
    const id = Number(li.dataset.id);
    const act = btn.dataset.act;

    if (act === "remove") {
      removeFromCart(id);
    } else {
      const current = getCart().find((c) => c.menuId === id);
      if (!current) return;
      const nextQty = act === "plus" ? current.qty + 1 : current.qty - 1;
      updateCartQty(id, nextQty); // 0 이하이면 내부에서 제거됨
    }
    render();
  });

  /* 주문하기 */
  qs("#btn-order").addEventListener("click", () => {
    const order = createOrderFromCart();
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
