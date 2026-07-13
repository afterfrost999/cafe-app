/* ============================================
   고객 - 공지사항 목록
   ============================================ */

(function () {
  const { getAllNotices, formatDate, escapeHTML, qs } = window.CAFE_UTILS;

  // 랜딩 두 번째 섹션과 동일한 나무 바닥 + 카펫
  if (window.CAFE_PIXEL) {
    document.documentElement.style.setProperty(
      "--paper-tex",
      `url(${CAFE_PIXEL.paperTexture()})`
    );
    CAFE_PIXEL.applyFloor(document.body, null, true);
  }

  const listEl = qs("#notice-list");
  const emptyEl = qs("#empty");

  // 최신 등록순 정렬
  const notices = getAllNotices()
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  emptyEl.hidden = notices.length > 0;
  listEl.hidden = notices.length === 0;

  listEl.innerHTML = notices
    .map(
      (n) => `
        <li>
          <article class="notice-card">
            <div class="notice-head">
              <h2 class="notice-title">${escapeHTML(n.title)}</h2>
              <span class="notice-date">${formatDate(n.createdAt)}</span>
            </div>
            <p class="notice-content">${escapeHTML(n.content)}</p>
          </article>
        </li>`
    )
    .join("");
})();
