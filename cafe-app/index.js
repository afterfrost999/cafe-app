/* ============================================
   고객 - 메인 페이지 로직
   ============================================ */

(function () {
  const { CATEGORIES } = window.CAFE_DATA;
  const { formatPrice, getAllMenus, getCartCount, qs } = window.CAFE_UTILS;

  const categoryGridEl = qs("#category-grid");
  const featuredGridEl = qs("#featured-grid");

  // 헤더 장바구니 카운트
  qs("#cart-count").textContent = getCartCount();

  /* 카테고리 바로가기 렌더 */
  categoryGridEl.innerHTML = CATEGORIES.map(
    (c) => `
      <li>
        <a class="category-card" href="menus/list.html?category=${c.id}">
          <span class="category-emoji">${c.emoji}</span>
          <span class="category-name">${c.name}</span>
        </a>
      </li>`
  ).join("");

  /* 추천 메뉴: 베스트/신메뉴 태그 우선, 품절 제외, 최대 4개 */
  const menus = getAllMenus().filter((m) => !m.soldOut);
  const isFeatured = (m) =>
    (m.tags || []).some((t) => t === "베스트" || t === "신메뉴");

  let featured = menus.filter(isFeatured);
  if (featured.length < 4) {
    // 부족하면 나머지 메뉴로 채움
    featured = featured.concat(menus.filter((m) => !isFeatured(m)));
  }
  featured = featured.slice(0, 4);

  featuredGridEl.innerHTML = featured
    .map((m) => {
      const tag = (m.tags || [])[0]
        ? `<span class="menu-tag">${m.tags[0]}</span>`
        : "";
      return `
        <li class="menu-card">
          <a href="menus/detail.html?id=${m.id}">
            <div class="menu-thumb">
              <img src="${m.image}" alt="${m.name}" loading="lazy" />
              ${tag}
            </div>
            <div class="menu-body">
              <h3 class="menu-name">${m.name}</h3>
              <span class="menu-price">${formatPrice(m.price)}</span>
            </div>
          </a>
        </li>`;
    })
    .join("");
})();
