/* ============================================
   고객 - 메뉴 상세 로직
   ============================================ */

(function () {
  const { CATEGORIES } = window.CAFE_DATA;
  const {
    formatPrice,
    getMenuById,
    getQueryParam,
    addToCart,
    getCartCount,
    showToast,
    qs,
  } = window.CAFE_UTILS;

  const detailEl = qs("#detail");
  const cartCountEl = qs("#cart-count");

  function refreshCartCount() {
    cartCountEl.textContent = getCartCount();
  }
  refreshCartCount();

  const id = getQueryParam("id");
  const menu = getMenuById(id);

  /* 메뉴 없음 */
  if (!menu) {
    detailEl.innerHTML = `
      <p class="not-found">
        존재하지 않는 메뉴입니다.<br />
        <a href="list.html" class="back-link">메뉴 목록으로 돌아가기</a>
      </p>`;
    return;
  }

  const category = CATEGORIES.find((c) => c.id === menu.categoryId);
  const tags = (menu.tags || [])
    .map((t) => `<span class="badge">${t}</span>`)
    .join("");
  const soldOut = menu.soldOut
    ? `<div class="detail-soldout">품절</div>`
    : "";

  detailEl.innerHTML = `
    <div class="detail-media">
      <img src="${menu.image}" alt="${menu.name}" />
      ${soldOut}
    </div>
    <div class="detail-info">
      <span class="detail-cat">${category ? category.emoji + " " + category.name : ""}</span>
      <h1 class="detail-name">${menu.name}</h1>
      <div class="detail-tags">${tags}</div>
      <p class="detail-desc">${menu.description}</p>
      <p class="detail-price">${formatPrice(menu.price)}</p>

      <div class="qty-row">
        <span class="qty-label">수량</span>
        <div class="qty-control">
          <button class="qty-btn" id="qty-minus" aria-label="수량 감소">−</button>
          <span class="qty-value" id="qty-value">1</span>
          <button class="qty-btn" id="qty-plus" aria-label="수량 증가">+</button>
        </div>
      </div>

      <div class="detail-actions">
        <button class="btn btn-outline" id="btn-cart" ${
          menu.soldOut ? "disabled" : ""
        }>장바구니 담기</button>
        <button class="btn btn-primary" id="btn-order" ${
          menu.soldOut ? "disabled" : ""
        }>바로 주문</button>
      </div>
    </div>`;

  /* 수량 조절 */
  let qty = 1;
  const qtyValueEl = qs("#qty-value");
  qs("#qty-minus").addEventListener("click", () => {
    qty = Math.max(1, qty - 1);
    qtyValueEl.textContent = qty;
  });
  qs("#qty-plus").addEventListener("click", () => {
    qty += 1;
    qtyValueEl.textContent = qty;
  });

  /* 장바구니 담기 */
  qs("#btn-cart").addEventListener("click", () => {
    addToCart(menu.id, qty);
    refreshCartCount();
    showToast(`${menu.name} ${qty}개를 담았어요 🛒`);
  });

  /* 바로 주문 → 담고 장바구니로 이동 */
  qs("#btn-order").addEventListener("click", () => {
    addToCart(menu.id, qty);
    window.location.href = "../basket/list.html";
  });
})();
