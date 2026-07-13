/* ============================================
   고객 - 메인 페이지 로직
   ============================================ */

(function () {
  const { CATEGORIES } = window.CAFE_DATA;
  const { formatPrice, getAllMenus, getCartCount, qs } = window.CAFE_UTILS;

  const categoryGridEl = qs("#category-grid");
  const featuredGridEl = qs("#featured-grid");

  // 헤더 장바구니 카운트
  qs("#cart-count").textContent = getCartCount();

  /* 카테고리 바로가기 렌더 */
  categoryGridEl.innerHTML = CATEGORIES.map(
    (c) => `
      <li>
        <a class="category-card" href="menus/list.html?category=${c.id}">
          <span class="category-emoji">${c.emoji}</span>
          <span class="category-name">${c.name}</span>
        </a>
      </li>`
  ).join("");

  /* 추천 메뉴: 베스트/신메뉴 태그 우선, 품절 제외, 최대 4개 */
  const menus = getAllMenus().filter((m) => !m.soldOut);
  const isFeatured = (m) =>
    (m.tags || []).some((t) => t === "베스트" || t === "신메뉴");

  let featured = menus.filter(isFeatured);
  if (featured.length < 4) {
    // 부족하면 나머지 메뉴로 채움
    featured = featured.concat(menus.filter((m) => !isFeatured(m)));
  }
  featured = featured.slice(0, 4);

  featuredGridEl.innerHTML = featured
    .map((m) => {
      const tag = (m.tags || [])[0]
        ? `<span class="menu-tag">${m.tags[0]}</span>`
        : "";
      return `
        <li class="floaty">
          <a class="menu-card" href="menus/detail.html?id=${m.id}">
            <div class="menu-thumb">
              <img src="${m.image}" alt="${m.name}" loading="lazy" />
              ${tag}
            </div>
            <div class="menu-body">
              <h3 class="menu-name">${m.name}</h3>
              <span class="menu-price">${formatPrice(m.price)}</span>
            </div>
          </a>
        </li>`;
    })
    .join("");

  /* ── 히어로 : 코드로 그린 픽셀아트 벽난로 + 아늑한 불 ── */
  const hearth = qs("#hearth-canvas");
  if (hearth) {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const W = 320; // 논리 좌표계
    const H = 220;
    const SC = 3; // 픽셀 밀도(3배 해상도 → 더 작고 촘촘한 픽셀, 매끈한 곡선)
    const DW = W * SC,
      DH = H * SC;
    hearth.width = DW;
    hearth.height = DH;
    const ctx = hearth.getContext("2d");
    ctx.imageSmoothingEnabled = false;

    // 정적 씬은 오프스크린에 한 번만 그림
    const bg = document.createElement("canvas");
    bg.width = DW;
    bg.height = DH;
    const bx = bg.getContext("2d");
    bx.imageSmoothingEnabled = false;

    // 결정적 난수 (벽돌 색이 프레임마다 흔들리지 않게)
    function rnd(seed) {
      const s = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
      return s - Math.floor(s);
    }
    function px(g, c, x, y, w, h) {
      g.fillStyle = c;
      g.fillRect(
        (x * SC) | 0,
        (y * SC) | 0,
        Math.max(1, ((w || 1) * SC) | 0),
        Math.max(1, ((h || 1) * SC) | 0)
      );
    }

    // 벽난로 아치형 개구부 판정 — 캔버스 중앙
    const cx = 160,
      AR = 50, // 아치 반지름 (벽난로 확대)
      archBase = 132, // 아치가 직선벽으로 바뀌는 높이
      B = 172, // 개구부 바닥
      L = cx - AR,
      Rr = cx + AR;
    function inOpening(x, y) {
      if (y >= archBase) return x >= L && x <= Rr && y <= B;
      const dx = x - cx,
        dy = y - archBase;
      return dx * dx + dy * dy <= AR * AR;
    }

    // 짧은 사각형 헬퍼 (오프스크린에 그림, SC 배율 적용)
    function R(c, x, y, w, h) {
      bx.fillStyle = c;
      bx.fillRect(
        (x * SC) | 0,
        (y * SC) | 0,
        Math.max(1, ((w || 1) * SC) | 0),
        Math.max(1, ((h || 1) * SC) | 0)
      );
    }
    // 액자 헬퍼 (테두리 + 내부 어둡게)
    function frame(x, y, w, h, fc) {
      R("#241812", x - 2, y - 2, w + 4, h + 4);
      R(fc || "#5a3a22", x - 1, y - 1, w + 2, h + 2);
      R("#120b07", x, y, w, h);
    }

    function drawLog(cx, cy, w, h, body, end) {
      px(bx, body, cx - w / 2, cy - h / 2, w, h);
      px(bx, "rgba(0,0,0,0.28)", cx - w / 2, cy + h / 2 - 1, w, 1);
      px(bx, end, cx - w / 2 - 2, cy - h / 2, 3, h); // 단면
      px(bx, "rgba(255,220,170,0.18)", cx - w / 2, cy - h / 2, w, 1); // 윗 하이라이트
    }

    // 장작 단면(원형 + 나이테) — 디바이스 해상도로 매끈하게
    function drawLogEnd(lcx, lcy, r) {
      const dcx = lcx * SC,
        dcy = lcy * SC,
        dr = r * SC;
      for (let dy = -dr; dy <= dr; dy++) {
        for (let dx = -dr; dx <= dr; dx++) {
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > dr) continue;
          let col;
          if (dist > dr - SC * 0.8)
            col = "#241407"; // 껍질(어두운 테)
          else {
            const ring = Math.sin((dist / dr) * 7.5);
            col = ring > 0.25 ? "#8a6238" : "#5f4227"; // 나이테
          }
          bx.fillStyle = col;
          bx.fillRect((dcx + dx) | 0, (dcy + dy) | 0, 1, 1);
        }
      }
      bx.fillStyle = "#9a7346"; // 중심
      bx.fillRect((dcx - SC * 0.5) | 0, (dcy - SC * 0.5) | 0, SC, SC);
    }

    // 디테일한 머그컵 (외곽선 + 다중 톤 + 손잡이 + 커피 + 하이라이트)
    function drawMug(x, y) {
      R("rgba(0,0,0,0.25)", x + 1, y + 11, 12, 1); // 바닥 그림자
      R("#2a1c12", x + 11, y + 3, 5, 6); // 손잡이 외곽
      R("#cdbfa8", x + 12, y + 4, 3, 4);
      R("#2a1c12", x + 13, y + 5, 1, 2); // 손잡이 구멍
      R("#2a1c12", x, y, 12, 11); // 몸통 외곽선
      R("#e8ddc9", x + 1, y + 1, 10, 9); // 몸통
      R("#f3ecd8", x + 1, y + 1, 2, 9); // 좌 하이라이트
      R("#c9baa0", x + 8, y + 1, 3, 9); // 우 그림자
      R("#241a10", x + 2, y + 1, 8, 1); // 컵 안쪽 테
      R("#3f2718", x + 2, y + 2, 8, 1); // 커피
      R("#fff6e4", x + 2, y + 1, 4, 1); // 림 하이라이트
    }

    // 세워둔 책 (책등 하이라이트 + 위 페이지 → 책인 걸 알 수 있게)
    function drawBook(x, y, w, h, col) {
      R("#1c130b", x, y, w, h); // 외곽선
      R(col, x + 1, y + 1, w - 2, h - 2); // 표지
      R("rgba(255,255,255,0.15)", x + 1, y + 1, 1, h - 2); // 책등 하이라이트
      R("rgba(0,0,0,0.28)", x + w - 2, y + 1, 1, h - 2); // 그림자면
      R("#e8dcc0", x + 1, y + 1, w - 2, 1); // 위 종이면(페이지)
      R("rgba(255,255,255,0.25)", x + 2, y + 4, w - 4, 1); // 제목 띠
      R("rgba(255,255,255,0.2)", x + 2, y + 7, w - 4, 1);
    }
    // 비스듬히 기댄 책
    function drawBookLean(x, y, w, h, col, dir) {
      for (let i = 0; i < h; i++) {
        const sx = x + Math.round(((h - 1 - i) / h) * dir * 5); // 아래 고정, 위로 기욺
        R("#1c130b", sx, y + i, w, 1);
        R(col, sx + 1, y + i, w - 2, 1);
        if (i === 0) R("#e8dcc0", sx + 1, y + i, w - 2, 1); // 페이지
      }
      R("rgba(255,255,255,0.22)", x + 1, y + 5, w - 2, 1);
    }

    // 카펫(문양) 그리기
    function drawRug(x, y, w, h) {
      const cxr = x + w / 2;
      R("#7a2f26", x, y, w, h); // 바탕
      R("#5e2019", x, y, w, 2);
      R("#5e2019", x, y + h - 2, w, 2);
      R("#c79a54", x + 4, y + 4, w - 8, 2); // 테두리 라인
      R("#c79a54", x + 4, y + h - 6, w - 8, 2);
      R("#c79a54", x + 4, y + 4, 2, h - 8);
      R("#c79a54", x + w - 6, y + 4, 2, h - 8);
      // 중앙 마름모(스노우플레이크) 문양
      for (let i = -7; i <= 7; i++) {
        const ww = (7 - Math.abs(i)) * 2;
        R("#d9b06a", cxr - ww / 2, y + h / 2 + i, ww, 1);
      }
      R("#efd49a", cxr - 1, y + h / 2 - 1, 2, 2);
      // 좌우 보조 문양
      for (const p of [x + 20, x + w - 24]) {
        for (let i = -3; i <= 3; i++) {
          const ww = (3 - Math.abs(i)) * 2;
          R("#b98a4a", p - ww / 2, y + h / 2 + i, ww, 1);
        }
      }
    }

    function drawScene() {
      // ── 천장 보(beam) ──
      R("#241610", 0, 0, W, 15);
      R("rgba(90,60,36,0.35)", 0, 0, W, 2);
      for (const bxp of [46, 150, 250]) {
        R("#1c110a", bxp, 0, 12, 15);
        R("rgba(255,220,170,0.08)", bxp, 0, 1, 15);
      }

      // ── 벽(크림 벽지 + 세로 줄무늬 문양) ──
      R("#c7b596", 0, 15, W, 158);
      for (let x = 0; x < W; x += 8) R("rgba(120,90,60,0.06)", x, 15, 3, 158);
      for (let y = 15; y < 62; y++)
        R(`rgba(30,18,10,${0.16 * (1 - (y - 15) / 47)})`, 0, y, W, 1);

      // ── 징두리(wainscoting) ──
      R("#43301f", 0, 150, W, 20);
      R("#5f4229", 0, 150, W, 3);
      R("#2a1c11", 0, 168, W, 2);
      for (let x = 6; x < W; x += 16) {
        R("rgba(0,0,0,0.18)", x, 153, 1, 15);
        R("rgba(255,220,170,0.06)", x + 1, 153, 1, 15);
      }

      // ── 나무 바닥 ──
      R("#3a2717", 0, 170, W, H - 170);
      for (let y = 170; y < H; y += 9) R("rgba(0,0,0,0.25)", 0, y, W, 1);
      for (let x = 0; x < W; x += 34) R("rgba(0,0,0,0.16)", x, 170, 1, H - 170);

      // ── 카펫 ──
      drawRug(60, 188, 200, 30);

      // ── 창문(오른쪽) ──
      frame(280, 44, 34, 52, "#4a3120");
      for (let y = 46; y < 94; y++) {
        const t = (y - 46) / 48;
        R(`rgb(${(8 + t * 6) | 0},${(12 + t * 10) | 0},${(30 + t * 18) | 0})`, 282, y, 30, 1);
      }
      R("#fff", 290, 54, 1, 1);
      R("#e8e0c0", 300, 62, 1, 1);
      R("#fff", 296, 74, 1, 1);
      R("#4a3120", 296, 44, 2, 52);
      R("#4a3120", 280, 68, 34, 2);

      // ── 벽 풍경화(벽난로 위) ──
      frame(131, 26, 58, 32, "#5a3a22");
      for (let y = 28; y < 50; y++) {
        const t = (y - 28) / 22;
        R(`rgb(${(120 - t * 50) | 0},${(72 - t * 26) | 0},${(46 - t * 10) | 0})`, 133, y, 54, 1);
      }
      R("#2e2a22", 133, 44, 54, 5); // 산 실루엣
      for (let x = 134; x < 187; x += 4) R("#20321e", x, 42 + ((x * 7) % 4), 3, 8);
      R("#152012", 133, 50, 54, 6); // 앞 숲

      // ── 펜던트 전등 + 불빛 ──
      R("#1a120a", 258, 0, 2, 34);
      R("#20150c", 248, 34, 24, 4);
      R("#2a1c10", 250, 38, 20, 8);
      R("#120c07", 252, 46, 16, 3);
      R("#ffd98a", 258, 45, 4, 4);

      // ── 벽난로 돌 구조 (불규칙 벽돌 + 반점 질감 + 줄눈 외곽선) ──
      const Sx0 = 86,
        Sx1 = 234,
        Sy0 = 68,
        Sy1 = 180,
        sw = 18,
        sh = 12;
      R("#191009", Sx0, Sy0, Sx1 - Sx0, Sy1 - Sy0); // 어두운 줄눈 배경
      {
        let y = Sy0;
        while (y < Sy1) {
          const rowH = sh + ((rnd(y * 3.7) * 5) | 0) - 2; // 10~15 불규칙 높이
          let x = Sx0 - ((rnd(y * 1.9) * (sw - 4)) | 0); // 행마다 다른 시작(엇갈림)
          while (x < Sx1) {
            const bwR = sw + ((rnd(x * 2.1 + y * 1.7) * 10) | 0) - 5; // 13~23 불규칙 폭
            const bxa = Math.max(Sx0, x);
            const bxb = Math.min(Sx1, x + bwR - 2);
            const bw2 = bxb - bxa;
            const bh2 = Math.min(Sy1, y + rowH - 2) - y;
            if (bw2 > 1 && bh2 > 1) {
              const rr = rnd(x * 5.7 + y * 2.3);
              const g = (108 + rr * 52) | 0;
              R(`rgb(${g},${(g * 0.94) | 0},${(g * 0.85) | 0})`, bxa, y, bw2, bh2);
              for (let s = 0; s < 6; s++) {
                const rx = (rnd(x * 1.1 + y * 0.7 + s * 3.3) * bw2) | 0;
                const ry = (rnd(x * 0.9 + y * 1.3 + s * 5.1) * bh2) | 0;
                const dk = rnd(x + y * 2 + s * 7) > 0.5;
                R(dk ? "rgba(0,0,0,0.22)" : "rgba(255,250,235,0.16)", bxa + rx, y + ry, 1, 1);
              }
              R("rgba(255,255,240,0.18)", bxa, y, bw2, 1); // 윗 하이라이트
              R("rgba(255,255,240,0.09)", bxa, y, 1, bh2); // 좌 하이라이트
              R("rgba(0,0,0,0.42)", bxa, y + bh2 - 1, bw2, 1); // 아래 그림자
              R("rgba(0,0,0,0.3)", bxa + bw2 - 1, y, 1, bh2); // 우 그림자
            }
            x += bwR;
          }
          y += rowH;
        }
      }
      // 맨틀 아래 드리운 그림자 — 돌 벽면에 입체감
      for (let k = 0; k < 9; k++)
        R(`rgba(0,0,0,${0.3 * (1 - k / 9)})`, Sx0, 82 + k, Sx1 - Sx0, 1);

      // 개구부 안쪽 — 디바이스 해상도로 매끈한 아치 + 바닥 잉걸빛
      for (let dy = ((archBase - AR) * SC) | 0; dy <= B * SC; dy++) {
        for (let dx = ((L - 3) * SC) | 0; dx <= (Rr + 3) * SC; dx++) {
          const lx = dx / SC,
            ly = dy / SC;
          if (!inOpening(lx, ly)) continue;
          const t = (ly - (archBase - AR)) / (B - (archBase - AR));
          bx.fillStyle = `rgb(${(14 + t * t * 92) | 0},${(9 + t * t * 34) | 0},${
            (7 + t * 5) | 0
          })`;
          bx.fillRect(dx, dy, 1, 1);
        }
      }
      // 아치 안쪽 테두리 음영(부드러운 링)
      for (let a = 0; a <= Math.PI; a += 0.003) {
        for (let r = 0; r < 4; r++) {
          const gx = (cx + Math.cos(a) * (AR - r)) * SC;
          const gy = (archBase - Math.sin(a) * (AR - r)) * SC;
          bx.fillStyle = `rgba(0,0,0,${0.34 - r * 0.08})`;
          bx.fillRect(gx | 0, gy | 0, 1, 1);
        }
      }

      // ── 맨틀(나무 선반) ──
      R("#5a3d28", 76, 66, 168, 13);
      R("#75512f", 76, 66, 168, 2);
      R("#33210f", 76, 77, 168, 2);
      R("#3a2617", 80, 79, 160, 3);
      for (let x = 80; x < 244; x += 9) R("rgba(0,0,0,0.1)", x, 68, 1, 9);

      // ── 벽난로 앞 바닥돌 (3D 단: 윗면 + 앞면) ──
      R("#b7ab97", 84, 172, 152, 10); // 윗면(타일)
      R("#cfc4b0", 84, 172, 152, 2); // 앞모서리 하이라이트
      for (let x = 84; x < 236; x += 17) R("rgba(0,0,0,0.2)", x, 173, 1, 8); // 타일 이음
      R("#7d7263", 84, 182, 152, 6); // 앞면(수직, 어둡게)
      R("#928576", 84, 182, 152, 1); // 앞면 상단 살짝 밝게
      R("#544b3e", 84, 187, 152, 1); // 앞면 하단 그림자
      R("rgba(0,0,0,0.3)", 84, 188, 152, 3); // 바닥에 드리운 그림자

      // ── 하얀 벽난로 바닥(개구부 안) + 그레이트 + 장작 + 잉걸 ──
      R("#b7ab97", L, B - 7, Rr - L, 8); // 개구부 안 하얀 바닥
      R("#cfc4b0", L, B - 7, Rr - L, 1);
      R("rgba(0,0,0,0.22)", L, B - 1, Rr - L, 1);
      // 그레이트(쇠받침) — 하얀 바닥 바로 위
      R("#1a1206", L + 12, B - 10, Rr - L - 24, 3); // 상단 가로바
      for (let x = L + 16; x < Rr - 12; x += 8) R("#1a1206", x, B - 10, 2, 10); // 다리
      // 장작 (그레이트 위)
      drawLog(cx - 12, B - 16, 34, 7, "#4a3220", "#6a4a30");
      drawLog(cx + 14, B - 15, 28, 7, "#412c1c", "#5e4028");
      drawLog(cx, B - 22, 30, 6, "#3e2a1a", "#5a3c24");
      // 잉걸(붉은 숯)
      for (let x = cx - 28; x < cx + 28; x += 2) {
        const g = rnd(x * 9.3);
        if (g > 0.4) R(g > 0.75 ? "#c8501c" : "#7a2c10", x, B - 11, 2, 2);
      }

      // ── 부지깽이 세트(왼쪽, 하얀 바닥 위) ──
      R("#15100a", 118, 148, 2, 24);
      R("#15100a", 123, 146, 2, 26);
      R("#15100a", 128, 149, 2, 23);
      R("#15100a", 115, 170, 20, 2); // 받침
      R("#3a2a1a", 117, 144, 3, 3);
      R("#3a2a1a", 122, 142, 3, 3);

      // ── 장작 더미(오른쪽) — 아래 3 · 중간 2 · 위 1 피라미드 ──
      {
        const rows = [3, 2, 1]; // 아래→위 개수
        const baseX = 202,
          r = 6,
          gap = 12.5;
        let ly = 176;
        for (const count of rows) {
          const sx = baseX + (3 - count) * (gap / 2); // 가운데 정렬
          for (let j = 0; j < count; j++) drawLogEnd(sx + j * gap, ly, r);
          ly -= gap - 1.5;
        }
      }

      // ── 맨틀 소품 ──
      // 화분(왼)
      R("#8a5a3a", 92, 52, 13, 14);
      R("#7a4c2e", 92, 52, 13, 3);
      R("#3f6b32", 90, 42, 5, 12);
      R("#4f7b3e", 96, 40, 5, 14);
      R("#5f8b4a", 102, 44, 5, 10);
      // 'COFFEE & WARMTH' 액자
      frame(120, 50, 26, 16, "#6b4a30");
      R("#d8cdb5", 121, 51, 24, 14);
      R("#3a2a1c", 123, 53, 20, 1);
      R("#3a2a1c", 124, 56, 18, 1);
      R("#3a2a1c", 125, 59, 16, 1);
      R("#3a2a1c", 124, 62, 18, 1);
      // 랜턴(오른)
      R("#15100a", 206, 48, 10, 18);
      R("#15100a", 208, 46, 6, 2);
      R("#ffcf6a", 208, 53, 6, 8);
      R("#fff0c0", 210, 55, 2, 3);
      // 책 3권 — 파랑(램프에서 살짝 띄움) + 빨강(파란 책 옆) + 겨자(기울임)
      drawBook(222, 49, 5, 17, "#365a6b"); // 파랑
      drawBook(228, 51, 5, 15, "#7a3b2a"); // 빨강 (파란 책 옆)
      drawBookLean(235, 52, 5, 14, "#6b5a2a", -1); // 겨자, 기울임
      // 매달린 덩굴
      for (let k = 0; k < 5; k++)
        R(k % 2 ? "#3f6b32" : "#4f7b3e", 232 + (k % 2), 78 + k * 4, 3, 5);

      // ── 왼쪽 벽 선반 + 머그 ──
      R("#3a2717", 6, 70, 44, 10);
      R("#4a3120", 6, 70, 44, 2);
      R("#2a1c11", 6, 79, 44, 1); // 선반 아래 그림자
      drawMug(11, 58);
      drawMug(30, 58);

      // ── 오른쪽 'GOOD COFFEE' 포스터 ──
      frame(286, 104, 26, 30, "#4a3120");
      R("#d8cdb5", 287, 105, 24, 28);
      R("#3a2a1c", 290, 109, 18, 2);
      R("#3a2a1c", 290, 113, 18, 2);
      R("#8a5a3a", 295, 120, 8, 6);

    }

    // 베이크드 라이팅: 불빛/전등빛(따뜻하게) + 비네트 그림자 + 디더링
    function applyLighting() {
      const im = bx.getImageData(0, 0, DW, DH);
      const d = im.data;
      const bayer = [
        [0, 8, 2, 10],
        [12, 4, 14, 6],
        [3, 11, 1, 9],
        [15, 7, 13, 5],
      ];
      const fx = 160 * SC,
        fy = 150 * SC,
        fr = 150 * SC; // 벽난로 불빛
      const px2 = 260 * SC,
        py2 = 50 * SC,
        pr = 80 * SC; // 펜던트 전등빛
      const cvx = DW / 2,
        cvy = DH * 0.46;
      for (let y = 0; y < DH; y++) {
        for (let x = 0; x < DW; x++) {
          let light = 0;
          const a1 = x - fx,
            b1 = y - fy;
          const df = Math.sqrt(a1 * a1 + b1 * b1) / fr;
          if (df < 1) light += (1 - df) * (1 - df) * 1.05;
          const a2 = x - px2,
            b2 = y - py2;
          const dp = Math.sqrt(a2 * a2 + b2 * b2) / pr;
          if (dp < 1) light += (1 - dp) * (1 - dp) * 0.55;
          // 비네트 그림자
          const vx = (x - cvx) / (DW * 0.62),
            vy = (y - cvy) / (DH * 0.62);
          const dv = Math.sqrt(vx * vx + vy * vy);
          const shadow = dv > 1 ? Math.min(0.82, (dv - 1) * 1.0) : 0;
          // 디더링(오더드 4x4)
          const dither = (bayer[y & 3][x & 3] / 16 - 0.5) * 0.05;
          // 픽셀 그레인 텍스처 (오돌토돌한 픽셀아트 질감)
          let hf = (Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;
          hf = hf < 0 ? hf + 1 : hf; // 미세 그레인
          const cxc = (x / SC) | 0,
            cyc = (y / SC) | 0;
          let hc = (Math.sin(cxc * 39.17 + cyc * 11.13) * 24634.6345) % 1;
          hc = hc < 0 ? hc + 1 : hc; // 논리픽셀 단위 굵은 그레인
          const grain = (hf - 0.5) * 0.05 + (hc - 0.5) * 0.11;
          // 기본(앰비언트)을 낮춰 방을 어둡게 → 불빛 받는 곳만 밝게
          let f = 0.62 + light * 1.05 - shadow + dither + grain;
          if (f < 0) f = 0;
          const warm = light * 54;
          const cj = (hc - 0.5) * 9; // 색 지터(더 다양한 색감)
          const i = (y * DW + x) * 4;
          const r = d[i] * f + warm + cj;
          const g = d[i + 1] * f + warm * 0.55 + cj * 0.7;
          const b = d[i + 2] * f + warm * 0.15 + cj * 0.4;
          d[i] = r > 255 ? 255 : r < 0 ? 0 : r | 0;
          d[i + 1] = g > 255 ? 255 : g < 0 ? 0 : g | 0;
          d[i + 2] = b > 255 ? 255 : b < 0 ? 0 : b | 0;
        }
      }
      bx.putImageData(im, 0, 0);
    }

    drawScene();
    applyLighting();

    // ── 아늑한 불 (doom-fire, 짧고 부드럽게) ──
    const FX0 = 132,
      FX1 = 188,
      FY0 = 126,
      FY1 = 158;
    const FW = FX1 - FX0,
      FH = FY1 - FY0;
    const heat = new Uint8Array(FW * FH);
    // 따뜻한 팔레트 (흰색까지 안 감 → 포근함), 0 은 투명
    const pal = [
      [0, 0, 0, 0],
      [60, 18, 8, 110],
      [90, 26, 10, 150],
      [120, 34, 10, 180],
      [150, 44, 12, 200],
      [175, 55, 14, 215],
      [196, 70, 16, 228],
      [212, 88, 18, 238],
      [224, 106, 20, 244],
      [232, 124, 24, 248],
      [238, 142, 30, 250],
      [242, 160, 42, 252],
      [246, 178, 58, 253],
      [248, 194, 80, 254],
      [250, 208, 108, 255],
      [252, 220, 140, 255],
      [253, 232, 176, 255],
    ];
    const FMAX = pal.length - 1;

    function seedFire() {
      for (let x = 0; x < FW; x++) {
        const d = Math.min(x, FW - 1 - x);
        const center = Math.min(1, d / (FW * 0.42)); // 가운데만 뜨겁게
        const flick = 0.7 + 0.3 * rnd(x + Math.random() * 999); // 살짝 흔들
        heat[(FH - 1) * FW + x] = Math.round(FMAX * center * flick);
      }
    }
    function spreadFire() {
      for (let x = 0; x < FW; x++) {
        for (let y = 1; y < FH; y++) {
          const src = y * FW + x;
          const decay = (Math.random() * 3) | 0;
          const nxRaw = x + decay - 1;
          const nx = nxRaw < 0 ? 0 : nxRaw >= FW ? FW - 1 : nxRaw;
          const v = heat[src] - decay; // 강한 감쇠 → 짧은 불꽃
          heat[(y - 1) * FW + nx] = v < 0 ? 0 : v;
        }
      }
    }
    function drawFire() {
      for (let i = 0; i < heat.length; i++) {
        const v = heat[i];
        if (v <= 0) continue;
        const c = pal[v];
        if (!c || c[3] === 0) continue;
        ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${c[3] / 255})`;
        ctx.fillRect((FX0 + (i % FW)) * SC, (FY0 + ((i / FW) | 0)) * SC, SC, SC);
      }
    }

    // 초기 워밍업
    seedFire();
    for (let i = 0; i < FH; i++) spreadFire();

    if (reduceMotion) {
      ctx.drawImage(bg, 0, 0);
      drawFire();
    } else {
      let last = 0;
      const loop = (t) => {
        if (t - last > 33) {
          // ~30fps: 뚝뚝 끊기는 픽셀 감성
          ctx.clearRect(0, 0, DW, DH);
          ctx.drawImage(bg, 0, 0);
          seedFire();
          spreadFire();
          drawFire();
          last = t;
        }
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    }
  }

  /* ── 커서를 따라다니는 불빛 ── */
  const glow = qs("#cursor-glow");
  if (glow) {
    window.addEventListener("mousemove", (e) => {
      glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    });
  }

  /* ── 픽셀 눈 (뷰포트 전체) ── */
  const snow = qs("#snow-canvas");
  const snowReduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (snow && !snowReduce) {
    const sctx = snow.getContext("2d");
    let sw2 = 0,
      sh2 = 0;
    const flakes = [];

    function newFlake(scatter) {
      return {
        x: Math.random() * sw2,
        y: scatter ? Math.random() * sh2 : -4,
        size: [2, 2, 3, 4][(Math.random() * 4) | 0], // 픽셀 크기
        vy: 14 + Math.random() * 26, // px/초 (은은히 천천히)
        phase: Math.random() * Math.PI * 2,
        swaySpeed: 0.5 + Math.random() * 1.1,
        amp: 5 + Math.random() * 16, // 좌우 흔들 폭
        alpha: 0.45 + Math.random() * 0.5,
      };
    }
    function resize() {
      sw2 = snow.width = window.innerWidth;
      sh2 = snow.height = window.innerHeight;
      sctx.imageSmoothingEnabled = false;
      const count = Math.max(40, Math.round((sw2 * sh2) / 11000));
      flakes.length = 0;
      for (let i = 0; i < count; i++) flakes.push(newFlake(true));
    }
    resize();
    window.addEventListener("resize", resize);

    let lastT = 0;
    function loop(t) {
      const dt = Math.min(0.05, (t - lastT) / 1000) || 0;
      lastT = t;
      sctx.clearRect(0, 0, sw2, sh2);
      for (const f of flakes) {
        f.y += f.vy * dt;
        f.phase += f.swaySpeed * dt;
        const x = (f.x + Math.sin(f.phase) * f.amp) | 0;
        sctx.fillStyle = `rgba(255,255,255,${f.alpha})`;
        sctx.fillRect(x, f.y | 0, f.size, f.size);
        if (f.y > sh2 + 4) Object.assign(f, newFlake(false));
      }
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }
})();
