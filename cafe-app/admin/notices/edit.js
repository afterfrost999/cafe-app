/* ============================================
   관리자 - 공지 수정
   ============================================ */

(function () {
  const { getNoticeById, updateNotice, getQueryParam, showToast } =
    window.CAFE_UTILS;

  const form = document.getElementById("noticeForm");
  const emptyState = document.getElementById("emptyState");

  const id = getQueryParam("id");
  const notice = id ? getNoticeById(id) : null;

  if (!notice) {
    emptyState.hidden = false;
    return;
  }

  form.hidden = false;
  form.elements.title.value = notice.title;
  form.elements.content.value = notice.content || "";

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(form);

    updateNotice(notice.id, {
      title: fd.get("title").trim(),
      content: fd.get("content").trim(),
    });

    showToast("공지사항이 수정되었습니다.");
    window.location.href = "list.html";
  });
})();
