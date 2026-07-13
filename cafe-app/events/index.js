/* ============================================
   고객 - 이벤트 페이지 (저장된 이벤트 데이터로 렌더)
   ============================================ */

(function () {
  const { getAllEvents, escapeHTML } = window.CAFE_UTILS;

  // 랜딩 두 번째 섹션과 동일한 나무 바닥 + 카펫
  if (window.CAFE_PIXEL) {
    document.documentElement.style.setProperty(
      "--paper-tex",
      `url(${CAFE_PIXEL.paperTexture()})`
    );
    CAFE_PIXEL.applyFloor(document.querySelector(".event-page"), null, true);
  }

  const grid = document.getElementById("event-grid");
  if (!grid) return;

  const KIND_CLASS = {
    fire: "event-thumb--fire",
    coffee: "event-thumb--coffee",
    dessert: "event-thumb--dessert",
  };

  const events = getAllEvents();

  if (events.length === 0) {
    grid.innerHTML = `<p class="event-empty">진행 중인 이벤트가 없어요.</p>`;
    return;
  }

  grid.innerHTML = events
    .map((ev) => {
      const kindClass = KIND_CLASS[ev.kind] || KIND_CLASS.fire;
      const art = window.CAFE_PIXEL
        ? `<img class="event-pixel" src="${CAFE_PIXEL.eventArt(
            ev.kind
          )}" alt="" aria-hidden="true" />`
        : "";
      return `
        <div class="event-float floaty">
          <article class="event-card">
            <div class="event-thumb ${kindClass}">
              <span class="event-badge">${escapeHTML(ev.badge || "")}</span>
              ${art}
            </div>
            <div class="event-body">
              <h2>${escapeHTML(ev.title || "")}</h2>
              <p>${escapeHTML(ev.description || "")}</p>
              <span class="event-period">${escapeHTML(ev.period || "")}</span>
            </div>
          </article>
        </div>`;
    })
    .join("");
})();
