/* ============================================
   고객 - 메뉴 목록 로직
   ============================================ */

(function () {
  const { CATEGORIES } = window.CAFE_DATA;
  const {
    formatPrice,
    getMenusByCategory,
    addToCart,
    getCartCount,
    getQueryParam,
    showToast,
    qs,
  } = window.CAFE_UTILS;

  const tabsEl = qs("#category-tabs");
  const gridEl = qs("#menu-grid");
  const emptyEl = qs("#empty");
  const cartCountEl = qs("#cart-count");

  // 현재 선택된 카테고리 (URL ?category= 로 초기화)
  let activeCategory = getQueryParam("category") || "all";

  /* 장바구니 카운트 갱신 */
  function refreshCartCount() {
    cartCountEl.textContent = getCartCount();
  }

  /* 카테고리 탭 렌더 */
  function renderTabs() {
    const all = [{ id: "all", name: "전체", emoji: "🍽️" }, ...CATEGORIES];
    tabsEl.innerHTML = all
      .map(
        (c) => `
          <button class="cat-tab ${c.id === activeCategory ? "active" : ""}"
                  data-category="${c.id}">
            ${c.emoji} ${c.name}
          </button>`
      )
      .join("");

    tabsEl.querySelectorAll(".cat-tab").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeCategory = btn.dataset.category;
        renderTabs();
        renderMenus();
      });
    });
  }

  /* 메뉴 카드 렌더 */
  function renderMenus() {
    const menus = getMenusByCategory(activeCategory);
    emptyEl.hidden = menus.length > 0;

    gridEl.innerHTML = menus
      .map((m) => {
        const tags = (m.tags || [])
          .map((t) => `<span class="menu-tag">${t}</span>`)
          .join("");
        const soldOut = m.soldOut
          ? `<div class="soldout-overlay">품절</div>`
          : "";
        return `
          <li class="menu-card">
            <a href="detail.html?id=${m.id}">
              <div class="menu-thumb">
                <img src="${m.image}" alt="${m.name}" loading="lazy" />
                <div class="menu-tags">${tags}</div>
                ${soldOut}
              </div>
              <div class="menu-body">
                <h3 class="menu-name">${m.name}</h3>
                <p class="menu-desc">${m.description}</p>
              </div>
            </a>
            <div class="menu-body" style="padding-top:0">
              <div class="menu-foot">
                <span class="menu-price">${formatPrice(m.price)}</span>
                <button class="add-btn" data-id="${m.id}" ${
          m.soldOut ? "disabled" : ""
        } aria-label="${m.name} 담기">+</button>
              </div>
            </div>
          </li>`;
      })
      .join("");

    // 담기 버튼 (a 태그 이동과 분리되어 있음)
    gridEl.querySelectorAll(".add-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const id = Number(btn.dataset.id);
        addToCart(id, 1);
        refreshCartCount();
        showToast("장바구니에 담았어요 🛒");
      });
    });
  }

  /* 초기화 */
  renderTabs();
  renderMenus();
  refreshCartCount();
})();
