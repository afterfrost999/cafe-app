/* ============================================
   관리자 - 공지사항 목록
   ============================================ */

(function () {
  if (window.CAFE_PIXEL) {
    document.documentElement.style.setProperty(
      "--paper-tex",
      `url(${window.CAFE_PIXEL.paperTexture()})`
    );
    window.CAFE_PIXEL.applyFloor(document.body, null, true);
  }

  const { getAllNotices, getNoticeById, deleteNotice, formatDate, showToast, escapeHTML } =
    window.CAFE_UTILS;

  const tableBody = document.getElementById("noticeTableBody");
  const emptyState = document.getElementById("emptyState");

  function summary(text) {
    const t = text || "";
    return t.length > 40 ? `${t.slice(0, 40)}…` : t;
  }

  function render() {
    const notices = getAllNotices()
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    emptyState.hidden = notices.length > 0;

    tableBody.innerHTML = notices
      .map(
        (n) => `
        <tr data-id="${n.id}">
          <td>
            <a class="menu-row__name menu-row__name-link" href="edit.html?id=${
              n.id
            }">${escapeHTML(n.title)}</a>
          </td>
          <td>${escapeHTML(summary(n.content))}</td>
          <td>${formatDate(n.createdAt)}</td>
          <td>
            <div class="menu-row__actions">
              <a href="edit.html?id=${n.id}" class="btn btn-outline">수정</a>
              <button type="button" class="btn btn-danger js-delete-btn">삭제</button>
            </div>
          </td>
        </tr>`
      )
      .join("");
  }

  tableBody.addEventListener("click", (e) => {
    const row = e.target.closest("tr[data-id]");
    if (!row) return;
    if (e.target.closest(".js-delete-btn")) {
      const notice = getNoticeById(row.dataset.id);
      if (notice && confirm(`"${notice.title}" 공지를 삭제할까요?`)) {
        deleteNotice(notice.id);
        showToast("공지사항이 삭제되었습니다.");
        render();
      }
    }
  });

  render();
})();
