/* ============================================
   관리자 - 메뉴 수정
   ============================================ */

(function () {
  const { CATEGORIES } = window.CAFE_DATA;
  const { getMenuById, updateMenu, getQueryParam, showToast } = window.CAFE_UTILS;

  const form = document.getElementById("menuForm");
  const emptyState = document.getElementById("emptyState");
  const categorySelect = document.getElementById("categoryId");

  const id = getQueryParam("id");
  const menu = id ? getMenuById(id) : null;

  if (!menu) {
    emptyState.hidden = false;
    return;
  }

  categorySelect.innerHTML = CATEGORIES.map(
    (c) => `<option value="${c.id}">${c.name}</option>`
  ).join("");

  form.hidden = false;
  form.name.value = menu.name;
  form.categoryId.value = menu.categoryId;
  form.price.value = menu.price;
  form.image.value = menu.image;
  form.description.value = menu.description || "";
  form.tags.value = (menu.tags || []).join(", ");
  form.soldOut.checked = !!menu.soldOut;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(form);

    updateMenu(menu.id, {
      name: formData.get("name").trim(),
      categoryId: formData.get("categoryId"),
      price: Number(formData.get("price")),
      image: formData.get("image").trim(),
      description: formData.get("description").trim(),
      tags: formData
        .get("tags")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      soldOut: formData.get("soldOut") === "on",
    });

    showToast("메뉴가 수정되었습니다.");
    window.location.href = `detail.html?id=${menu.id}`;
  });
})();
