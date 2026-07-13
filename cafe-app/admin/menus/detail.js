/* ============================================
   관리자 - 메뉴 상세
   ============================================ */

(function () {
  const { CATEGORIES } = window.CAFE_DATA;
  const { getMenuById, deleteMenu, formatPrice, getQueryParam, showToast } = window.CAFE_UTILS;

  const detailEl = document.getElementById("menuDetail");
  const emptyState = document.getElementById("emptyState");

  const id = getQueryParam("id");
  const menu = id ? getMenuById(id) : null;

  if (!menu) {
    detailEl.hidden = true;
    emptyState.hidden = false;
    return;
  }

  function categoryName(categoryId) {
    const category = CATEGORIES.find((c) => c.id === categoryId);
    return category ? category.name : categoryId;
  }

  detailEl.innerHTML = `
    <img class="menu-detail__image" src="${window.CAFE_PIXEL ? CAFE_PIXEL.menuArt(menu) : menu.image}" alt="${menu.name}" />
    <div class="menu-detail__body">
      <span class="menu-detail__category">${categoryName(menu.categoryId)}</span>
      <h2 class="menu-detail__name">${menu.name}</h2>
      <p class="menu-detail__price">${formatPrice(menu.price)}</p>
      <p class="menu-detail__description">${menu.description || ""}</p>
      <div class="menu-detail__tags">
        ${(menu.tags || []).map((tag) => `<span class="badge">${tag}</span>`).join("")}
      </div>
      <p class="menu-detail__status ${menu.soldOut ? "is-soldout" : "is-onsale"}">
        ${menu.soldOut ? "품절" : "판매중"}
      </p>
      <div class="menu-detail__actions">
        <a href="edit.html?id=${menu.id}" class="btn btn-primary">수정</a>
        <button type="button" class="btn btn-danger" id="deleteBtn">삭제</button>
      </div>
    </div>
  `;

  document.getElementById("deleteBtn").addEventListener("click", () => {
    if (confirm(`"${menu.name}" 메뉴를 삭제할까요?`)) {
      deleteMenu(menu.id);
      showToast("메뉴가 삭제되었습니다.");
      window.location.href = "list.html";
    }
  });
})();
