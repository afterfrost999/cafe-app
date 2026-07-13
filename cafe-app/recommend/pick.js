/* ============================================
   고객 - 음료/디저트 추천 (트럼프 카드 → 불에 타며 추천 메뉴 공개)
   ============================================ */

(function () {
  const {
    qs,
    getAllMenus,
    formatPrice,
    addToCart,
    getCurrentUser,
    requireLogin,
    setPendingCartAdd,
    showToast,
  } = window.CAFE_UTILS;

  if (!window.CAFE_PIXEL) return;

  // 랜딩 두 번째 섹션과 동일한 나무 바닥 + 카펫 질감
  document.documentElement.style.setProperty(
    "--paper-tex",
    `url(${CAFE_PIXEL.paperTexture()})`
  );
  CAFE_PIXEL.applyFloor(document.querySelector(".pick-page"), null, true);

  const wrap = qs("#pick-cards");
  if (!wrap) return;

  /* ── 추천 메뉴 풀 (음료 = 디저트 아닌 것, 디저트 = 디저트) ── */
  const kind = document.body.dataset.pick === "dessert" ? "dessert" : "drink";
  let pool = getAllMenus().filter((m) => {
    if (m.soldOut) return false;
    return kind === "dessert"
      ? m.categoryId === "dessert"
      : m.categoryId !== "dessert";
  });
  if (pool.length === 0) pool = getAllMenus().filter((m) => !m.soldOut);
  if (pool.length === 0) return;

  // 카드 3장에 배치할 메뉴를 랜덤으로 (가능하면 중복 없이)
  function pickThree(items) {
    const bag = [...items];
    const out = [];
    for (let i = 0; i < 3; i++) {
      if (bag.length === 0) bag.push(...items);
      const idx = (Math.random() * bag.length) | 0;
      out.push(bag.splice(idx, 1)[0]);
    }
    return out;
  }
  const picks = pickThree(pool);

  /* ── 카드 뒷면 원본 픽셀 (44×62) ── */
  const backCanvas = CAFE_PIXEL.cardBackCanvas();
  const CW = backCanvas.width;
  const CH = backCanvas.height;
  const baseData = backCanvas.getContext("2d").getImageData(0, 0, CW, CH);

  // 정적 노이즈 (불탄 경계를 울퉁불퉁하게)
  function noise(x, y) {
    let n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return n - Math.floor(n);
  }

  const maxDist = Math.sqrt(CW * CW + CH * CH);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── 한 장의 카드를 클릭 지점부터 태우는 애니메이션 ── */
  function burn(canvas, clickX, clickY, onDone) {
    const ctx = canvas.getContext("2d");
    const out = ctx.createImageData(CW, CH);
    const bd = baseData.data;
    const od = out.data;
    const speed = 0.85; // px/frame (살짝 느리게)
    const amp = 3.6; // 경계 요동
    let front = 0;

    function frame() {
      front += speed;
      for (let y = 0; y < CH; y++) {
        for (let x = 0; x < CW; x++) {
          const i = (y * CW + x) * 4;
          if (bd[i + 3] === 0) {
            od[i + 3] = 0;
            continue;
          }
          const dx = x - clickX,
            dy = y - clickY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const thr = dist + (noise(x, y) - 0.5) * 2 * amp;
          const d = front - thr; // 발화 후 경과 거리
          if (d < 0) {
            od[i] = bd[i];
            od[i + 1] = bd[i + 1];
            od[i + 2] = bd[i + 2];
            od[i + 3] = 255;
          } else if (d < 5) {
            // 불꽃 → 숯 그라디언트 (약간의 깜빡임)
            const fl = 0.75 + noise(x + (front | 0), y) * 0.4;
            if (d < 1) {
              od[i] = Math.min(255, 255 * fl);
              od[i + 1] = Math.min(255, 226 * fl);
              od[i + 2] = 140 * fl;
            } else if (d < 2.2) {
              od[i] = 239;
              od[i + 1] = 122;
              od[i + 2] = 30;
            } else if (d < 3.4) {
              od[i] = 125;
              od[i + 1] = 42;
              od[i + 2] = 18;
            } else {
              od[i] = 26;
              od[i + 1] = 17;
              od[i + 2] = 8;
            }
            od[i + 3] = 255;
          } else {
            od[i + 3] = 0; // 다 타서 사라짐 → 뒤 메뉴 공개
          }
        }
      }
      ctx.putImageData(out, 0, 0);
      if (front < maxDist + 6) {
        requestAnimationFrame(frame);
      } else {
        ctx.clearRect(0, 0, CW, CH);
        if (onDone) onDone();
      }
    }
    requestAnimationFrame(frame);
  }

  /* ── 슬롯(뒤 추천메뉴 + 위 카드) 3개 생성 ── */
  let pickedAny = false; // 한 장을 고르면 나머지는 뒤에 아무것도 없음
  picks.forEach((menu) => {
    const slot = document.createElement("div");
    slot.className = "floaty pick-slot";

    // 뒤에 숨겨진 추천 메뉴 카드
    const reveal = document.createElement("div");
    reveal.className = "pick-reveal";
    reveal.innerHTML = `
      <div class="reveal-thumb">
        <img src="${CAFE_PIXEL.menuArt(menu)}" alt="${menu.name}" />
      </div>
      <div class="reveal-body">
        <p class="reveal-name">${menu.name}</p>
        <p class="reveal-price">${formatPrice(menu.price)}</p>
        <button type="button" class="reveal-add">장바구니에 담기</button>
      </div>`;

    // 공개된 메뉴를 장바구니에 담기
    reveal.querySelector(".reveal-add").addEventListener("click", () => {
      // 비로그인: 담으려던 메뉴를 저장해두고 로그인 후 자동으로 담기
      if (!getCurrentUser()) {
        setPendingCartAdd(menu.id, 1);
        requireLogin();
        return;
      }
      addToCart(menu.id, 1);
      showToast(`${menu.name} 담았어요 🛒`);
    });

    // 위에 덮인 카드 (캔버스)
    const canvas = document.createElement("canvas");
    canvas.width = CW;
    canvas.height = CH;
    canvas.className = "pick-card-canvas";
    canvas.getContext("2d").putImageData(baseData, 0, 0);

    let burned = false;
    const start = (clientX, clientY) => {
      if (burned) return;
      burned = true;
      // 이미 다른 카드를 골랐다면 이 카드 뒤에는 아무것도 없음
      if (pickedAny) {
        reveal.remove();
      } else {
        pickedAny = true;
      }
      slot.classList.add("is-burning");
      const rect = canvas.getBoundingClientRect();
      const cx = ((clientX - rect.left) / rect.width) * CW;
      const cy = ((clientY - rect.top) / rect.height) * CH;
      const finish = () => {
        canvas.remove(); // 캔버스 제거 → 뒤 메뉴(담기 버튼) 조작 가능
        slot.classList.add("is-revealed");
      };
      if (reduceMotion) {
        finish();
        return;
      }
      burn(canvas, cx, cy, finish);
    };

    canvas.addEventListener("click", (e) => start(e.clientX, e.clientY));

    slot.appendChild(reveal);
    slot.appendChild(canvas);
    wrap.appendChild(slot);
  });
})();
