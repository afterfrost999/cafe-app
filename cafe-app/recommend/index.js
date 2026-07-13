/* ============================================
   고객 - 랜덤 메뉴 추천 (음료 / 디저트 선택)
   ============================================ */

(function () {
  const { qsa } = window.CAFE_UTILS;

  if (!window.CAFE_PIXEL) return;

  // 랜딩 두 번째 섹션과 동일한 나무 바닥 + 카펫 질감
  document.documentElement.style.setProperty(
    "--paper-tex",
    `url(${CAFE_PIXEL.paperTexture()})`
  );
  CAFE_PIXEL.applyFloor(document.querySelector(".recommend-page"), null, true);

  // 카드 썸네일을 메뉴 리스트와 같은 픽셀아트로
  qsa(".rec-art").forEach((img) => {
    img.src = CAFE_PIXEL.categoryArt(img.dataset.kind);
  });
})();
