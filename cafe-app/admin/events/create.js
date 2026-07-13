/* ============================================
   관리자 - 이벤트 추가
   ============================================ */

(function () {
  const { createEvent, showToast } = window.CAFE_UTILS;

  const form = document.getElementById("eventForm");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(form);

    const event = createEvent({
      title: fd.get("title").trim(),
      kind: fd.get("kind"),
      badge: fd.get("badge").trim(),
      period: fd.get("period").trim(),
      description: fd.get("description").trim(),
    });

    showToast(`"${event.title}" 이벤트가 추가되었습니다.`);
    window.location.href = "list.html";
  });
})();
