/* ============================================
   관리자 - 이벤트 수정
   ============================================ */

(function () {
  const { getEventById, updateEvent, getQueryParam, showToast } =
    window.CAFE_UTILS;

  const form = document.getElementById("eventForm");
  const emptyState = document.getElementById("emptyState");

  const id = getQueryParam("id");
  const event = id ? getEventById(id) : null;

  if (!event) {
    emptyState.hidden = false;
    return;
  }

  form.hidden = false;
  // form.title 등 내장 속성 충돌을 피해 elements 로 접근
  form.elements.title.value = event.title;
  form.elements.kind.value = event.kind || "fire";
  form.elements.badge.value = event.badge || "";
  form.elements.period.value = event.period || "";
  form.elements.description.value = event.description || "";

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(form);

    updateEvent(event.id, {
      title: fd.get("title").trim(),
      kind: fd.get("kind"),
      badge: fd.get("badge").trim(),
      period: fd.get("period").trim(),
      description: fd.get("description").trim(),
    });

    showToast("이벤트가 수정되었습니다.");
    window.location.href = "list.html";
  });
})();
