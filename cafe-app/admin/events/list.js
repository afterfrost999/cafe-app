/* ============================================
   관리자 - 이벤트 목록
   ============================================ */

(function () {
  if (window.CAFE_PIXEL) {
    document.documentElement.style.setProperty(
      "--paper-tex",
      `url(${window.CAFE_PIXEL.paperTexture()})`
    );
    window.CAFE_PIXEL.applyFloor(document.body, null, true);
  }

  const { getAllEvents, getEventById, deleteEvent, showToast, escapeHTML } =
    window.CAFE_UTILS;

  const tableBody = document.getElementById("eventTableBody");
  const emptyState = document.getElementById("emptyState");

  function render() {
    const events = getAllEvents();
    emptyState.hidden = events.length > 0;

    tableBody.innerHTML = events
      .map((ev) => {
        const art = window.CAFE_PIXEL ? window.CAFE_PIXEL.eventArt(ev.kind) : "";
        return `
        <tr data-id="${ev.id}">
          <td><img class="menu-row__thumb" src="${art}" alt="${escapeHTML(
          ev.title
        )}" /></td>
          <td>
            <a class="menu-row__name menu-row__name-link" href="edit.html?id=${
              ev.id
            }">${escapeHTML(ev.title)}</a>
          </td>
          <td>${escapeHTML(ev.badge || "")}</td>
          <td>${escapeHTML(ev.period || "")}</td>
          <td>
            <div class="menu-row__actions">
              <a href="edit.html?id=${ev.id}" class="btn btn-outline">수정</a>
              <button type="button" class="btn btn-danger js-delete-btn">삭제</button>
            </div>
          </td>
        </tr>`;
      })
      .join("");
  }

  tableBody.addEventListener("click", (e) => {
    const row = e.target.closest("tr[data-id]");
    if (!row) return;
    if (e.target.closest(".js-delete-btn")) {
      const ev = getEventById(row.dataset.id);
      if (ev && confirm(`"${ev.title}" 이벤트를 삭제할까요?`)) {
        deleteEvent(ev.id);
        showToast("이벤트가 삭제되었습니다.");
        render();
      }
    }
  });

  render();
})();
