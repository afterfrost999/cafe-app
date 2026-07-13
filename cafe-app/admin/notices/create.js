/* ============================================
   관리자 - 공지 추가
   ============================================ */

(function () {
  const { createNotice, showToast } = window.CAFE_UTILS;

  const form = document.getElementById("noticeForm");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(form);

    const notice = createNotice({
      title: fd.get("title").trim(),
      content: fd.get("content").trim(),
    });

    showToast(`"${notice.title}" 공지가 등록되었습니다.`);
    window.location.href = "list.html";
  });
})();
