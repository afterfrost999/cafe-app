/* ============================================
   관리자 - 메뉴 추가
   ============================================ */

(function () {
  const { CATEGORIES } = window.CAFE_DATA;
  const { createMenu, showToast } = window.CAFE_UTILS;

  const form = document.getElementById("menuForm");
  const categorySelect = document.getElementById("categoryId");

  categorySelect.innerHTML = CATEGORIES.map(
    (c) => `<option value="${c.id}">${c.name}</option>`
  ).join("");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(form);

    const menu = createMenu({
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

    showToast(`"${menu.name}" 메뉴가 추가되었습니다.`);
    window.location.href = "list.html";
  });
})();
