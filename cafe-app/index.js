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
        <li class="floaty">
          <a class="menu-card" href="menus/detail.html?id=${m.id}">
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

  /* ── 히어로 추천 메뉴 슬라이더 ── */
  const trackEl = qs("#hero-track");
  const dotsEl = qs("#hero-dots");

  let slides = menus.filter(isFeatured);
  if (slides.length < 3) {
    slides = slides.concat(menus.filter((m) => !isFeatured(m)));
  }
  slides = slides.slice(0, 5);

  trackEl.innerHTML = slides
    .map((m) => {
      const tag = (m.tags || [])[0]
        ? `<span class="hero-slide-tag">${m.tags[0]}</span>`
        : "";
      return `
        <a class="hero-slide" href="menus/detail.html?id=${m.id}">
          <img src="${m.image}" alt="${m.name}" />
          <div class="hero-slide-cap">
            ${tag}
            <div class="hero-slide-name">${m.name}</div>
            <div class="hero-slide-price">${formatPrice(m.price)}</div>
          </div>
        </a>`;
    })
    .join("");

  dotsEl.innerHTML = slides
    .map(
      (_, i) =>
        `<button class="hero-dot ${
          i === 0 ? "active" : ""
        }" data-i="${i}" aria-label="${i + 1}번째 추천 메뉴"></button>`
    )
    .join("");

  const dots = Array.from(dotsEl.children);
  let slideIdx = 0;

  function goToSlide(i) {
    slideIdx = (i + slides.length) % slides.length;
    trackEl.style.transform = `translateX(-${slideIdx * 100}%)`;
    dots.forEach((d, di) => d.classList.toggle("active", di === slideIdx));
  }

  let slideTimer = setInterval(() => goToSlide(slideIdx + 1), 3500);
  dotsEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".hero-dot");
    if (!btn) return;
    goToSlide(Number(btn.dataset.i));
    clearInterval(slideTimer);
    slideTimer = setInterval(() => goToSlide(slideIdx + 1), 3500);
  });

  /* ── 배경 원두 파티클 ── */
  const beanField = qs("#bean-field");
  if (beanField) {
    const N = 14;
    let html = "";
    for (let i = 0; i < N; i++) {
      const s = (14 + Math.random() * 22).toFixed(0); // 14~36px
      const left = (Math.random() * 100).toFixed(1); // vw
      const dur = (20 + Math.random() * 22).toFixed(0); // 20~42s
      const delay = (-Math.random() * dur).toFixed(1); // 시작 분산
      const x = (Math.random() * 160 - 80).toFixed(0); // 좌우 흔들
      const r = (Math.random() * 360).toFixed(0);
      html += `<span class="bean" style="left:${left}vw;--s:${s}px;--d:${dur}s;--delay:${delay}s;--x:${x}px;--r:${r}deg"></span>`;
    }
    beanField.innerHTML = html;
  }
})();
