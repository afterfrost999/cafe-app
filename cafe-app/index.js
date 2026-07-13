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

  /* 카테고리 바로가기 렌더 (아이콘은 메뉴와 같은 픽셀아트) */
  categoryGridEl.innerHTML = CATEGORIES.map((c) => {
    const icon = window.CAFE_PIXEL
      ? `<img class="category-icon" src="${CAFE_PIXEL.categoryArt(c.id)}" alt="" />`
      : `<span class="category-emoji">${c.emoji}</span>`;
    return `
      <li>
        <a class="category-card" href="menus/list.html?category=${c.id}">
          ${icon}
          <span class="category-name">${c.name}</span>
        </a>
      </li>`;
  }).join("");

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
              <img src="${window.CAFE_PIXEL ? CAFE_PIXEL.menuArt(m) : m.image}" alt="${m.name}" loading="lazy" />
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

    // 장작 나뭇결 톤 (통마다 다른 색감)
    const woodTones = [
      { bark: [38, 21, 8], dark: [95, 66, 39], light: [140, 100, 58], pith: [156, 116, 71] },
      { bark: [30, 17, 8], dark: [84, 57, 33], light: [126, 88, 50], pith: [150, 110, 66] },
      { bark: [45, 28, 13], dark: [106, 76, 46], light: [152, 110, 66], pith: [170, 128, 80] },
      { bark: [26, 15, 7], dark: [76, 51, 29], light: [116, 81, 45], pith: [138, 100, 58] },
    ];
    const cl = (v) => (v < 0 ? 0 : v > 255 ? 255 : v | 0);

    // 쪼갠 장작 단면(반원/돔) — 평평한 면이 아래, 둥근 껍질이 위. 통마다 제각각 + 살짝 기울임.
    // lcy 는 평평한 바닥면의 y 좌표, rot 은 기울기(라디안).
    function drawLogEnd(lcx, lcy, r, seed, rot) {
      const s = rnd(seed * 2.13 + 4.7);
      const s2 = rnd(seed * 7.31 + 1.9);
      const s3 = rnd(seed * 3.77 + 9.1);
      const tone = woodTones[seed % woodTones.length];
      const ax = r * (0.95 + s * 0.26); // 가로 반경(폭) → 제각각
      const ay = r * (0.82 + s2 * 0.24); // 세로 반경(돔 높이)
      const freq = 6 + s3 * 4; // 나이테 간격
      const phase = s * 6.28; // 나이테 위상
      const barkT = 0.8 + s2 * 0.08; // 껍질 두께
      const pcx = (s - 0.5) * r * 0.35 * SC; // 나이테 중심을 평평면 위에서 살짝 좌우로
      rot = rot || 0;
      const cr = Math.cos(rot),
        sr = Math.sin(rot);
      // 광원(왼쪽 위)을 통의 로컬 좌표계로
      const llx = -0.62 * cr + -0.78 * sr,
        lly = 0.62 * sr + -0.78 * cr;
      const dcx = lcx * SC,
        dcy = lcy * SC, // 평평한 바닥면 중심(회전 축)
        bax = ax * SC,
        bay = ay * SC;
      const RR = Math.max(bax, bay) + 2;
      // 로컬 좌표 → 디바이스 오프셋
      const l2dx = (lxp, lyp) => lxp * cr - lyp * sr;
      const l2dy = (lxp, lyp) => lxp * sr + lyp * cr;

      // 접지 그림자 — 아래 통 위에 얹힌 듯 바닥면 아래를 살짝 어둡게
      bx.fillStyle = "rgba(0,0,0,0.3)";
      for (let dx = -bax; dx <= bax * 0.9; dx++)
        bx.fillRect((dcx + dx + SC) | 0, (dcy + bax * 0.06 + 1) | 0, 1, Math.max(1, (SC * 0.7) | 0));

      // 회전된 돔(위쪽 반원)만 그림
      for (let oy = -RR; oy <= RR; oy++) {
        for (let ox = -RR; ox <= RR; ox++) {
          const lxp = ox * cr + oy * sr, // 디바이스 오프셋 → 로컬
            lyp = -ox * sr + oy * cr;
          if (lyp > SC * 0.5 || lyp < -bay) continue; // 위쪽 반원만
          const nx = lxp / bax,
            ny = lyp / bay,
            e = nx * nx + ny * ny;
          if (e > 1) continue;
          const dist = Math.sqrt(e);
          let col;
          if (lyp > -SC * 0.8)
            col = [30, 17, 8]; // 쪼갠 바닥 모서리(어두운 split 면)
          else if (dist > barkT) col = tone.bark; // 둥근 껍질 면
          else {
            const rdx = (lxp - pcx) / bax,
              rdy = lyp / bay; // 나이테 중심은 바닥면
            const ring = Math.sin(Math.sqrt(rdx * rdx + rdy * rdy) * freq + phase);
            col = ring > 0.2 ? tone.light : tone.dark; // 나이테(반원 아치)
          }
          // 입체 음영: 왼쪽 위 밝게, 오른쪽·가장자리 어둡게
          let sh = 1 + (nx * llx + ny * lly) * 0.44 - dist * 0.12;
          if (sh < 0.55) sh = 0.55;
          else if (sh > 1.38) sh = 1.38;
          bx.fillStyle = `rgb(${cl(col[0] * sh)},${cl(col[1] * sh)},${cl(col[2] * sh)})`;
          bx.fillRect((dcx + ox) | 0, (dcy + oy) | 0, 1, 1);
        }
      }

      // 중심(pith) — 바닥면 위
      const pyy = -SC * 0.6;
      bx.fillStyle = `rgb(${tone.pith[0]},${tone.pith[1]},${tone.pith[2]})`;
      bx.fillRect(
        (dcx + l2dx(pcx, pyy) - SC * 0.5) | 0,
        (dcy + l2dy(pcx, pyy) - SC * 0.5) | 0,
        SC,
        SC
      );

      // 일부 통엔 위로 뻗는 방사형 균열
      if (s3 > 0.5) {
        const a = -Math.PI / 2 + (s - 0.5) * 1.4; // 대체로 위쪽 방향
        const ca = Math.cos(a),
          sa = Math.sin(a);
        bx.fillStyle = "rgba(20,11,5,0.7)";
        for (let t = 1; t < bay * barkT; t++)
          bx.fillRect(
            (dcx + l2dx(pcx + ca * t, pyy + sa * t)) | 0,
            (dcy + l2dy(pcx + ca * t, pyy + sa * t)) | 0,
            1,
            1
          );
      }
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

      // ── 나무 바닥 (불규칙 널판: 엇갈린 이음새 · 판마다 색편차 · 나뭇결) ──
      R("#3a2717", 0, 170, W, H - 170);
      {
        const ph = 9;
        for (let y = 170; y < H; y += ph) {
          const hh = Math.min(ph, H - y);
          let x = -((rnd(y * 2.3) * 44) | 0); // 행마다 엇갈린 시작
          while (x < W) {
            const pw = 26 + ((rnd(x * 1.7 + y * 3.1) * 40) | 0); // 26~66 널판 길이
            const x0 = Math.max(0, x);
            const w2 = Math.min(W, x + pw) - x0;
            if (w2 > 0) {
              const t = rnd(x * 5.3 + y * 1.9);
              const g = (52 + t * 22) | 0; // 판마다 다른 갈색
              R(`rgb(${g},${(g * 0.66) | 0},${(g * 0.42) | 0})`, x0, y, w2, hh);
              const gx = x0 + 1 + ((rnd(x + y) * Math.max(1, w2 - 2)) | 0);
              R("rgba(0,0,0,0.1)", gx, y, 1, hh); // 나뭇결 세로 줄
              R("rgba(255,220,170,0.05)", x0, y, w2, 1); // 윗 하이라이트
            }
            if (x + pw <= W) R("rgba(0,0,0,0.34)", x + pw - 1, y, 1, hh); // 널판 끝 이음새
            x += pw;
          }
          R("rgba(0,0,0,0.2)", 0, y + hh - 1, W, 1); // 행 사이 가로 이음새
        }
      }

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

      // ── 벽난로 테두리(스톤 트림): 돌 구조 바깥 양옆 + 아치 안쪽 (색 맞게) ──
      // 바깥 양옆 세로 트림
      R("#3f2e1c", Sx0 - 1, Sy0, 4, Sy1 - Sy0 - 6);
      R("#9a805e", Sx0 - 1, Sy0, 1, Sy1 - Sy0 - 6); // 왼쪽 하이라이트
      R("#6b5238", Sx0 + 2, Sy0, 1, Sy1 - Sy0 - 6);
      R("#3f2e1c", Sx1 - 3, Sy0, 4, Sy1 - Sy0 - 6);
      R("#9a805e", Sx1 - 3, Sy0, 1, Sy1 - Sy0 - 6); // 오른쪽 안쪽 밝게
      R("#241a10", Sx1, Sy0, 1, Sy1 - Sy0 - 6); // 오른쪽 끝 그림자
      // 아치 안쪽 트림 (곡선)
      for (let a = 0; a <= Math.PI; a += 0.003) {
        const lit = Math.cos(a) < 0; // 왼쪽 반원은 밝게
        for (let r = 1; r <= 3; r++) {
          const gx = (cx + Math.cos(a) * (AR + r)) * SC;
          const gy = (archBase - Math.sin(a) * (AR + r)) * SC;
          bx.fillStyle =
            r === 1 ? (lit ? "#9a805e" : "#7a6244") : lit ? "#6b5238" : "#4a3826";
          bx.fillRect(gx | 0, gy | 0, SC, SC);
        }
      }
      // 아치 안쪽 트림 (직선 양옆)
      for (let y = archBase - 1; y <= B; y++) {
        R("#9a805e", L - 3, y, 1, 1);
        R("#6b5238", L - 2, y, 2, 1);
        R("#6b5238", Rr, y, 2, 1);
        R("#4a3826", Rr + 2, y, 1, 1);
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
        // 반원 통나무를 골에 얹어 자연스럽게 쌓음 (아래→위 순서로 그려 겹침 표현)
        // x: 중심, y: 바닥면, r: 반경, rot: 기울기 — 아래는 넓게, 위는 골 사이에 얹힘
        const stack = [
          { x: 198, y: 179, r: 7.5, rot: -0.1 }, // 바닥 왼
          { x: 212, y: 180, r: 7.1, rot: 0.05 }, // 바닥 가운데
          { x: 226, y: 178, r: 7.6, rot: 0.12 }, // 바닥 오른
          { x: 205, y: 173, r: 6.7, rot: -0.16 }, // 둘째줄 왼(골에 얹힘)
          { x: 219, y: 173, r: 6.5, rot: 0.14 }, // 둘째줄 오른(골에 얹힘)
          { x: 212, y: 167, r: 6.8, rot: -0.06 }, // 꼭대기
        ];
        stack.forEach((L, seed) => {
          // 통마다 위치 살짝 흔들어 손그림처럼 자연스럽게
          const jx = (rnd(seed * 4.1 + 2) - 0.5) * 1.4;
          const jy = (rnd(seed * 6.7 + 5) - 0.5) * 0.9;
          drawLogEnd(L.x + jx, L.y + jy, L.r, seed, L.rot);
        });
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

    // 장작을 던져 넣으면 잠시 불이 확 타오름
    let fireBoostUntil = 0;

    function seedFire() {
      const boost = performance.now() < fireBoostUntil ? 1.4 : 1;
      for (let x = 0; x < FW; x++) {
        const d = Math.min(x, FW - 1 - x);
        const center = Math.min(1, d / (FW * 0.42)); // 가운데만 뜨겁게
        const flick = 0.7 + 0.3 * rnd(x + Math.random() * 999); // 살짝 흔들
        let v = Math.round(FMAX * center * flick * boost);
        if (v > FMAX) v = FMAX;
        heat[(FH - 1) * FW + x] = v;
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

    // ── 장작 더미 클릭 → 불 속으로 장작 던지기 ──
    // 장작 더미(오른쪽)의 논리 좌표 히트박스
    const PILE = { x0: 188, y0: 158, x1: 236, y1: 182 };
    const flyingLogs = [];
    const sparks = [];

    // 램프/전등(클릭 시 깜빡 + 호버 확대), 액자(호버 확대) 상태
    const hit = (b, p) =>
      p.x >= b.x0 && p.x <= b.x1 && p.y >= b.y0 && p.y <= b.y1;
    const PENDANT_BOX = { x0: 246, y0: 30, x1: 274, y1: 54 };
    const LANTERN_BOX = { x0: 204, y0: 44, x1: 218, y1: 68 };
    const lights = {
      pendant: {
        cx: 260, cy: 47, r: 26, hover: 0, blinkStart: -1e9,
        bulb: { x: 256, y: 43, w: 8, h: 7 }, off: "#120c07", warm: [255, 217, 138],
      },
      lantern: {
        cx: 211, cy: 57, r: 17, hover: 0, blinkStart: -1e9,
        bulb: { x: 207, y: 52, w: 8, h: 10 }, off: "#15100a", warm: [255, 207, 106],
      },
    };
    const BLINK_T = 430; // 한 단계 길이(느리게)
    const BLINK_N = 2; // 깜빡 횟수
    let overPendant = false,
      overLantern = false,
      overFrame = false,
      frameHoverT = 0;

    // 화면 좌표 → 캔버스 논리 좌표 (object-fit: contain 보정)
    function toLogical(clientX, clientY) {
      const rect = hearth.getBoundingClientRect();
      const scale = Math.min(rect.width / DW, rect.height / DH);
      const offX = (rect.width - DW * scale) / 2;
      const offY = (rect.height - DH * scale) / 2;
      return {
        x: (clientX - rect.left - offX) / scale / SC,
        y: (clientY - rect.top - offY) / scale / SC,
      };
    }
    function inPile(p) {
      return p.x >= PILE.x0 && p.x <= PILE.x1 && p.y >= PILE.y0 && p.y <= PILE.y1;
    }

    // ── 차지(누르는 세기) → 궤적 ──
    const MAX_HOLD = 850; // ms, 이 시간에 최대 힘
    const THROW_ORIGIN = { x: 212, y: 162 }; // 더미 꼭대기에서 출발
    let charging = false;
    let chargeStart = 0;

    const powerFromHold = (ms) => (ms > MAX_HOLD ? 1 : ms < 0 ? 0 : ms / MAX_HOLD);
    // 힘 0: 불 오른쪽·낮게 → 힘 1: 불 왼쪽·높게
    const aimForPower = (p) => ({
      tx: 174 - p * 30, // 174(오른쪽) → 144(왼쪽)
      ty: 150,
      arc: 16 + p * 58, // 낮게 → 높게
    });

    function throwLog(p) {
      const a = aimForPower(p);
      flyingLogs.push({
        x0: THROW_ORIGIN.x + (Math.random() * 6 - 3),
        y0: THROW_ORIGIN.y,
        tx: a.tx + (Math.random() * 4 - 2),
        ty: a.ty,
        arc: a.arc, // 포물선 높이(힘에 비례)
        start: performance.now(),
        dur: 460 + p * 300, // 세게 던질수록 더 오래 낢
        rot0: -0.35 + Math.random() * 0.2,
        spin: -(3 + p * 3 + Math.random() * 1.5), // 세게 던질수록 더 빠르게 회전
      });
    }

    function burstSparks(x, y) {
      for (let i = 0; i < 16; i++) {
        sparks.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 46,
          vy: -34 - Math.random() * 58,
          life: 0,
          ttl: 0.45 + Math.random() * 0.55,
          size: Math.random() < 0.5 ? 1 : 2,
          c: Math.random() < 0.5 ? "#ffd27a" : "#ff8a2a",
        });
      }
    }

    // 날아가는 장작 한 개 그리기 (device 좌표, 회전 적용)
    function drawFlyingLog(lx, ly, rot) {
      const w = 22 * SC,
        h = 8 * SC;
      ctx.save();
      ctx.translate(lx * SC, ly * SC);
      ctx.rotate(rot);
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.fillRect(-w / 2, h / 2 - SC, w, SC); // 아래 그림자
      ctx.fillStyle = "#4a3220"; // 몸통
      ctx.fillRect(-w / 2, -h / 2, w, h - SC);
      ctx.fillStyle = "rgba(255,220,170,0.22)"; // 윗 하이라이트
      ctx.fillRect(-w / 2, -h / 2, w, SC);
      ctx.fillStyle = "#6a4a30"; // 단면
      ctx.fillRect(-w / 2, -h / 2, 3 * SC, h - SC);
      ctx.fillStyle = "#8a6238";
      ctx.fillRect(-w / 2, -h / 2 + 2 * SC, 3 * SC, 2 * SC); // 나이테
      ctx.restore();
    }

    // 날아가는 장작 + 불티 갱신/렌더 (loop 안에서 호출)
    function updateEffects(now, dt) {
      for (let i = flyingLogs.length - 1; i >= 0; i--) {
        const f = flyingLogs[i];
        const p = (now - f.start) / f.dur;
        if (p >= 1) {
          // 착지 → 불 확 타오르고 불티 튐
          fireBoostUntil = now + 650;
          burstSparks(f.tx, f.ty);
          flyingLogs.splice(i, 1);
          continue;
        }
        const x = f.x0 + (f.tx - f.x0) * p;
        const y = f.y0 + (f.ty - f.y0) * p - Math.sin(Math.PI * p) * f.arc;
        drawFlyingLog(x, y, f.rot0 + f.spin * p);
      }
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.life += dt;
        if (s.life >= s.ttl) {
          sparks.splice(i, 1);
          continue;
        }
        s.vy += 30 * dt; // 살짝 가라앉음
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        ctx.globalAlpha = Math.max(0, 1 - s.life / s.ttl);
        ctx.fillStyle = s.c;
        ctx.fillRect((s.x * SC) | 0, (s.y * SC) | 0, s.size * SC, s.size * SC);
      }
      ctx.globalAlpha = 1;

      // 차지 중: 힘이 차오르는 글로우 + 조준 궤적 미리보기
      if (charging) {
        const p = powerFromHold(now - chargeStart);
        const a = aimForPower(p);
        const gx = THROW_ORIGIN.x * SC,
          gy = THROW_ORIGIN.y * SC;
        const rad = (5 + p * 12) * SC;
        const grad = ctx.createRadialGradient(gx, gy, 0, gx, gy, rad);
        const pulse = 0.45 + 0.3 * Math.sin(now / 70);
        grad.addColorStop(0, `rgba(255,200,110,${pulse * (0.5 + p * 0.5)})`);
        grad.addColorStop(1, "rgba(255,120,40,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(gx, gy, rad, 0, Math.PI * 2);
        ctx.fill();
        // 점선 조준 궤적
        for (let t = 0.06; t < 1; t += 0.075) {
          const x = THROW_ORIGIN.x + (a.tx - THROW_ORIGIN.x) * t;
          const y =
            THROW_ORIGIN.y + (a.ty - THROW_ORIGIN.y) * t - Math.sin(Math.PI * t) * a.arc;
          ctx.globalAlpha = 0.75 * (1 - t * 0.4);
          ctx.fillStyle = "#ffcf8a";
          ctx.fillRect((x * SC) | 0, (y * SC) | 0, SC, SC);
        }
        ctx.globalAlpha = 1;
      }

      // 램프/전등: 호버 시 커지는 빛무리 + 클릭 시 깜빡
      lights.pendant.hover += ((overPendant ? 1 : 0) - lights.pendant.hover) * 0.2;
      lights.lantern.hover += ((overLantern ? 1 : 0) - lights.lantern.hover) * 0.2;
      drawLight(lights.pendant, now);
      drawLight(lights.lantern, now);

      // 액자: 호버 시 살짝 커짐
      frameHoverT += ((overFrame ? 1 : 0) - frameHoverT) * 0.2;
      if (frameHoverT > 0.01) drawFrameHover();
    }

    function drawLight(l, now) {
      const scale = 1 + l.hover * 0.12; // 호버 시 아주 살짝만
      let strength = 0.42 + l.hover * 0.25;
      let on = true;
      const el = now - l.blinkStart;
      const blinking = el >= 0 && el < BLINK_T * BLINK_N * 2;
      if (blinking) on = Math.floor(el / BLINK_T) % 2 === 1; // 꺼짐→켜짐 순으로 느리게 2번
      if (!on) {
        // 꺼짐: 전구를 주변색으로 덮음
        ctx.fillStyle = l.off;
        ctx.fillRect(l.bulb.x * SC, l.bulb.y * SC, l.bulb.w * SC, l.bulb.h * SC);
        strength = 0;
      } else if (blinking) {
        strength += 0.6; // 켜질 때 더 밝게
      }
      if (strength <= 0) return;
      const R2 = l.r * scale * SC;
      const grad = ctx.createRadialGradient(l.cx * SC, l.cy * SC, 0, l.cx * SC, l.cy * SC, R2);
      grad.addColorStop(0, `rgba(${l.warm[0]},${l.warm[1]},${l.warm[2]},${0.5 * strength})`);
      grad.addColorStop(1, `rgba(${l.warm[0]},${l.warm[1]},${l.warm[2]},0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(l.cx * SC, l.cy * SC, R2, 0, Math.PI * 2);
      ctx.fill();
    }

    // 호버 시 액자를 중심 기준으로 확대해 덮어 그림 → 커지는 효과
    function drawFrameHover() {
      const s = 1 + 0.06 * frameHoverT; // 아주 살짝만
      const fcx = 133,
        fcy = 58;
      const T = (x, y, w, h, c) => {
        ctx.fillStyle = c;
        ctx.fillRect(
          ((fcx + (x - fcx) * s) * SC) | 0,
          ((fcy + (y - fcy) * s) * SC) | 0,
          Math.max(1, (w * s * SC) | 0),
          Math.max(1, (h * s * SC) | 0)
        );
      };
      T(118, 48, 30, 20, "#241812");
      T(119, 49, 28, 18, "#7a5334");
      T(121, 51, 24, 14, "#e9dec6");
      T(123, 53, 20, 1, "#3a2a1c");
      T(124, 56, 18, 1, "#3a2a1c");
      T(125, 59, 16, 1, "#3a2a1c");
      T(124, 62, 18, 1, "#3a2a1c");
    }

    // ── 이스터에그: 벽난로 위 'COFFEE & WARMTH' 액자를 누르면 메뉴로 ──
    const FRAME = { x0: 117, y0: 47, x1: 147, y1: 67 };
    const inFrame = (p) =>
      p.x >= FRAME.x0 && p.x <= FRAME.x1 && p.y >= FRAME.y0 && p.y <= FRAME.y1;

    // 커서 affordance + 호버 대상 추적 (액자 · 램프 · 전등 · 장작더미)
    hearth.addEventListener("pointermove", (e) => {
      const p = toLogical(e.clientX, e.clientY);
      overFrame = inFrame(p);
      overPendant = hit(PENDANT_BOX, p);
      overLantern = hit(LANTERN_BOX, p);
      if (charging) return; // 차지 중엔 커서 유지
      hearth.style.cursor =
        overFrame || overPendant || overLantern || (!reduceMotion && inPile(p))
          ? "pointer"
          : "";
    });
    hearth.addEventListener("pointerleave", () => {
      overFrame = overPendant = overLantern = false;
    });

    // 클릭: 액자 → 메뉴 이동, 램프/전등 → 불 깜빡
    hearth.addEventListener("click", (e) => {
      const p = toLogical(e.clientX, e.clientY);
      if (inFrame(p)) {
        window.location.href = "menus/list.html";
        return;
      }
      const now = performance.now();
      if (hit(PENDANT_BOX, p)) lights.pendant.blinkStart = now;
      if (hit(LANTERN_BOX, p)) lights.lantern.blinkStart = now;
    });

    if (!reduceMotion) {
      // 누르는 순간 힘 차오르기 시작
      hearth.addEventListener("pointerdown", (e) => {
        if (!inPile(toLogical(e.clientX, e.clientY))) return;
        charging = true;
        chargeStart = performance.now();
        hearth.style.cursor = "grabbing";
        if (hearth.setPointerCapture) hearth.setPointerCapture(e.pointerId);
      });
      // 떼는 순간 힘에 따라 던지기
      const release = () => {
        if (!charging) return;
        charging = false;
        hearth.style.cursor = "pointer";
        throwLog(powerFromHold(performance.now() - chargeStart));
      };
      hearth.addEventListener("pointerup", release);
      hearth.addEventListener("pointercancel", () => (charging = false));
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
          const dt = Math.min(0.05, (t - last) / 1000);
          ctx.clearRect(0, 0, DW, DH);
          ctx.drawImage(bg, 0, 0);
          seedFire();
          spreadFire();
          drawFire();
          updateEffects(performance.now(), dt);
          last = t;
        }
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    }
  }

  /* ── 하단 섹션: 벽난로 마루가 이어지는 나무 바닥 + 카펫 러너
        (질감 생성은 js/pixelart.js 공유 모듈) ── */
  if (window.CAFE_PIXEL) {
    document.documentElement.style.setProperty(
      "--paper-tex",
      `url(${CAFE_PIXEL.paperTexture()})`
    );
    CAFE_PIXEL.applyFloor(qs(".lower-panel"), qs(".site-footer"), true);
    const lp = qs(".lower-panel");
    if (lp) lp.style.boxShadow = "0 -24px 60px rgba(0,0,0,0.5)";
  }

  /* ── 커서를 따라다니는 불빛 ── */
  const glow = qs("#cursor-glow");
  if (glow) {
    window.addEventListener(
      "pointermove",
      (e) => {
        glow.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      },
      { passive: true }
    );
  }

  /* ── 첫 섹션을 절반가량 지나면 하단 패널로 부드럽게 이동 ── */
  const hero = qs(".hero");
  const lowerPanel = qs(".lower-panel");
  const siteHeader = qs(".site-header");
  if (hero && lowerPanel) {
    const reduceScrollMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    let lastScrollY = window.scrollY;
    let hasSnapped = false;
    let snapInProgress = false;
    let snapTimer;

    window.addEventListener(
      "scroll",
      () => {
        const currentY = window.scrollY;
        const movingDown = currentY > lastScrollY;
        const heroStart = hero.offsetTop;
        const triggerY = heroStart + hero.offsetHeight * 0.06; // 살짝만 내려도 스냅
        const headerHeight = siteHeader ? siteHeader.offsetHeight : 0;
        const targetY = Math.max(0, lowerPanel.offsetTop - headerHeight);

        if (currentY < heroStart + hero.offsetHeight * 0.04) {
          hasSnapped = false;
        }

        if (
          movingDown &&
          !hasSnapped &&
          !snapInProgress &&
          currentY >= triggerY &&
          currentY < targetY
        ) {
          hasSnapped = true;
          snapInProgress = true;
          window.scrollTo({
            top: targetY,
            behavior: reduceScrollMotion ? "auto" : "smooth",
          });

          window.clearTimeout(snapTimer);
          snapTimer = window.setTimeout(() => {
            snapInProgress = false;
            lastScrollY = window.scrollY;
          }, reduceScrollMotion ? 0 : 700);
        }

        lastScrollY = currentY;
      },
      { passive: true }
    );
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

  /* ── 좌측 세로 바로가기: 미구현 페이지는 안내 토스트 (나중에 href만 교체) ── */
  document.querySelectorAll(".hero-nav-item[data-soon]").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      if (window.CAFE_UTILS && CAFE_UTILS.showToast)
        CAFE_UTILS.showToast(`${a.dataset.soon} 페이지는 준비 중이에요`);
    });
  });

  /* ── 좌측 바로가기의 오른쪽 변을 실제 벽지 시작선에 정확히 맞춤 ── */
  const heroNav = qs(".hero-nav");
  if (heroNav && hearth) {
    const alignHeroNavToScene = () => {
      const canvasBox = hearth.getBoundingClientRect();
      const sceneRatio = hearth.width / hearth.height;
      const renderedSceneWidth = Math.min(
        canvasBox.width,
        canvasBox.height * sceneRatio
      );
      const leftSceneEdge = Math.max(
        0,
        (canvasBox.width - renderedSceneWidth) / 2
      );

      heroNav.style.setProperty(
        "--hero-scene-gutter",
        `${leftSceneEdge.toFixed(2)}px`
      );
    };

    alignHeroNavToScene();
    window.addEventListener("resize", alignHeroNavToScene, { passive: true });
  }

  /* ── 우측 세로 슬라이더: 빈 메뉴카드 4장 자동 순환 ── */
  const sideCards = document.querySelectorAll("#hero-side-slider .side-card");
  if (sideCards.length) {
    let si = 0;
    sideCards[0].classList.add("active");
    const reduceSlide = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduceSlide) {
      setInterval(() => {
        sideCards[si].classList.remove("active");
        si = (si + 1) % sideCards.length;
        sideCards[si].classList.add("active");
      }, 3200);
    }
  }
})();
