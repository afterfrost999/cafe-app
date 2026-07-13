/* ============================================
   관리자 - 메뉴 목록
   ============================================ */

(function () {
  if (window.CAFE_PIXEL) {
    document.documentElement.style.setProperty(
      "--paper-tex",
      `url(${window.CAFE_PIXEL.paperTexture()})`
    );
    window.CAFE_PIXEL.applyFloor(document.body, null, true);
  }

  const { CATEGORIES } = window.CAFE_DATA;
  const {
    getMenusByCategory,
    getAllMenus,
    deleteMenu,
    toggleMenuSoldOut,
    formatPrice,
    showToast,
  } = window.CAFE_UTILS;

  const filterTabs = document.getElementById("filterTabs");
  const tableBody = document.getElementById("menuTableBody");
  const emptyState = document.getElementById("emptyState");

  let activeCategory = "all";

  function categoryName(categoryId) {
    const category = CATEGORIES.find((c) => c.id === categoryId);
    return category ? category.name : categoryId;
  }

  function renderTabs() {
    const tabs = [{ id: "all", name: "전체" }, ...CATEGORIES];
    filterTabs.innerHTML = tabs
      .map(
        (tab) => `
        <button
          type="button"
          class="filter-tab ${tab.id === activeCategory ? "is-active" : ""}"
          data-category="${tab.id}"
        >${tab.name}</button>
      `
      )
      .join("");
  }

  function renderTable() {
    const menus = getMenusByCategory(activeCategory);
    emptyState.hidden = menus.length > 0;

    tableBody.innerHTML = menus
      .map(
        (menu) => `
        <tr data-id="${menu.id}">
          <td><img class="menu-row__thumb" src="${window.CAFE_PIXEL ? CAFE_PIXEL.menuArt(menu) : menu.image}" alt="${menu.name}" /></td>
          <td>
            <a class="menu-row__name menu-row__name-link" href="detail.html?id=${menu.id}">${menu.name}</a>
          </td>
          <td>${categoryName(menu.categoryId)}</td>
          <td>${formatPrice(menu.price)}</td>
          <td>
            <label class="status-toggle ${menu.soldOut ? "is-soldout" : "is-onsale"}">
              <input type="checkbox" class="js-soldout-toggle" ${menu.soldOut ? "checked" : ""} />
              ${menu.soldOut ? "품절" : "판매중"}
            </label>
          </td>
          <td>
            <div class="menu-row__actions">
              <a href="edit.html?id=${menu.id}" class="btn btn-outline">수정</a>
              <button type="button" class="btn btn-danger js-delete-btn">삭제</button>
            </div>
          </td>
        </tr>
      `
      )
      .join("");
  }

  filterTabs.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-category]");
    if (!btn) return;
    activeCategory = btn.dataset.category;
    renderTabs();
    renderTable();
  });

  tableBody.addEventListener("click", (e) => {
    const row = e.target.closest("tr[data-id]");
    if (!row) return;
    const id = row.dataset.id;

    if (e.target.closest(".js-delete-btn")) {
      const menu = getAllMenus().find((m) => m.id === Number(id));
      if (menu && confirm(`"${menu.name}" 메뉴를 삭제할까요?`)) {
        deleteMenu(id);
        showToast("메뉴가 삭제되었습니다.");
        renderTable();
      }
    }
  });

  tableBody.addEventListener("change", (e) => {
    if (!e.target.classList.contains("js-soldout-toggle")) return;
    const row = e.target.closest("tr[data-id]");
    toggleMenuSoldOut(row.dataset.id);
    renderTable();
  });

  renderTabs();
  renderTable();
})();
