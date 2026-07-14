/* ============================================
   고객 - 메뉴 목록 로직
   ============================================ */

(function () {
  const { CATEGORIES } = window.CAFE_DATA;
  const {
    formatPrice,
    getMenusByCategory,
    getMenuById,
    addToCart,
    openCartOptionModal,
    getCartCount,
    getQueryParam,
    getCurrentUser,
    requireLogin,
    setPendingCartAdd,
    isFavorite,
    toggleFavorite,
    setPendingFavorite,
    showToast,
    qs,
  } = window.CAFE_UTILS;

  const tabsEl = qs("#category-tabs");
  const gridEl = qs("#menu-grid");
  const emptyEl = qs("#empty");
  const cartCountEl = qs("#cart-count");
  const pageTitleEl = qs("#page-title");
  const pageDescriptionEl = qs("#page-description");

  const favoritesOnly = getQueryParam("favorites") === "1";

  if (favoritesOnly && !getCurrentUser()) {
    requireLogin();
    return;
  }

  if (favoritesOnly) {
    document.title = "찜한 메뉴 | Chimchar Cafe";
    pageTitleEl.textContent = "찜한 메뉴";
    pageDescriptionEl.textContent = "마음에 담아둔 메뉴를 한곳에서 만나보세요";
    emptyEl.textContent = "아직 찜한 메뉴가 없습니다.";
    emptyEl.classList.add("favorites-empty");
  }

  // 현재 선택된 카테고리 (URL ?category= 로 초기화)
  let activeCategory = getQueryParam("category") || "all";

  /* 장바구니 카운트 갱신 */
  function refreshCartCount() {
    if (cartCountEl) cartCountEl.textContent = getCartCount();
  }

  /* 카테고리 탭 렌더 */
  function renderTabs() {
    const all = [{ id: "all", name: "전체" }, ...CATEGORIES];
    tabsEl.innerHTML = all
      .map(
        (c) => `
          <button class="cat-tab ${c.id === activeCategory ? "active" : ""}"
                  data-category="${c.id}">
            ${c.name}
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
    const categoryMenus = getMenusByCategory(activeCategory);
    const menus = favoritesOnly
      ? categoryMenus.filter((menu) => isFavorite(menu.id))
      : categoryMenus;
    emptyEl.hidden = menus.length > 0;

    gridEl.innerHTML = menus
      .map((m) => {
        const tags = (m.tags || [])
          .map((t) => `<span class="menu-tag">${t}</span>`)
          .join("");
        const soldOut = m.soldOut
          ? `<div class="soldout-overlay">품절</div>`
          : "";
        const favorite = isFavorite(m.id);
        const detailHref = m.soldOut ? "#" : `detail.html?id=${m.id}`;
        return `
          <li class="floaty">
            <div class="menu-card">
              <a
                class="menu-detail-link ${m.soldOut ? "is-sold-out" : ""}"
                href="${detailHref}"
                data-sold-out="${m.soldOut}"
                ${m.soldOut ? 'aria-disabled="true"' : ""}
              >
                <div class="menu-thumb">
                  <img src="${window.CAFE_PIXEL ? CAFE_PIXEL.menuArt(m) : m.image}" alt="${m.name}" loading="lazy" />
                  <div class="menu-tags">${tags}</div>
                  ${soldOut}
                </div>
                <div class="menu-body">
                  <h3 class="menu-name">${m.name}</h3>
                  <p class="menu-desc">${m.description}</p>
                </div>
              </a>
              <button
                class="favorite-btn ${favorite ? "is-favorite" : ""}"
                type="button"
                data-id="${m.id}"
                aria-pressed="${favorite}"
                aria-label="${m.name} ${favorite ? "찜 해제" : "찜하기"}"
                title="${favorite ? "찜 해제" : "찜하기"}"
              ><span aria-hidden="true">${favorite ? "♥" : "♡"}</span></button>
              <div class="menu-body" style="padding-top:0">
                <div class="menu-foot">
                  <span class="menu-price">${formatPrice(m.price)}</span>
                  <button class="add-btn" data-id="${m.id}" ${
          m.soldOut ? "disabled" : ""
        } aria-label="${m.name} 담기">+</button>
                </div>
              </div>
            </div>
          </li>`;
      })
      .join("");

    // 품절 메뉴는 상세 페이지로 이동하지 않고 현재 화면에서 안내
    gridEl
      .querySelectorAll('.menu-detail-link[data-sold-out="true"]')
      .forEach((link) => {
        link.addEventListener("click", (event) => {
          event.preventDefault();
          showToast("해당 메뉴는 품절됐어요.");
        });
      });

    // 담기 버튼 (a 태그 이동과 분리되어 있음)
    gridEl.querySelectorAll(".add-btn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        e.preventDefault();
        const id = Number(btn.dataset.id);
        const menu = getMenuById(id);
        const options = await openCartOptionModal(menu, 1);
        if (options === null) return;
        if (!getCurrentUser()) {
          setPendingCartAdd(id, 1, options);
          requireLogin();
          return;
        }
        addToCart(id, 1, options);
        refreshCartCount();
        showToast("장바구니에 담았어요 🛒");
      });
    });

    gridEl.querySelectorAll(".favorite-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = Number(btn.dataset.id);
        if (!getCurrentUser()) {
          setPendingFavorite(id);
          requireLogin();
          return;
        }

        const favorite = toggleFavorite(id);
        renderMenus();
        showToast(favorite ? "찜한 메뉴에 담았어요 ♥" : "찜을 해제했어요");
      });
    });
  }

  /* 메뉴 리스트 배경을 불규칙 나무 바닥 질감으로 */
  if (window.CAFE_PIXEL) {
    document.documentElement.style.setProperty(
      "--paper-tex",
      `url(${CAFE_PIXEL.paperTexture()})`
    );
    CAFE_PIXEL.applyFloor(document.body, null, true);
  }

  /* 초기화 */
  renderTabs();
  renderMenus();
  refreshCartCount();
})();
