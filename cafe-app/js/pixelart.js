/* ============================================
   픽셀아트 공유 모듈 (window.CAFE_PIXEL)
   - 나무 바닥 / 카펫 러너 / 종이 텍스처
   - 메뉴별 픽셀아트 장난감 그림
   1섹션 벽난로와 같은 그레인/디더링 질감으로 구움
   ============================================ */
(function () {
  const PSC = 3; // 1섹션과 같은 픽셀 밀도
  const WOOD_BASE = "#3a2717";

  const rr = (s) => {
    const v = Math.sin(s * 127.1 + 311.7) * 43758.5453;
    return v - Math.floor(v);
  };
  const cl = (v) => (v < 0 ? 0 : v > 255 ? 255 : v | 0);
  const R = (g, x, y, w, h, c) => {
    g.fillStyle = c;
    g.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h)));
  };
  const OL = "#241a12";
  const box = (g, x, y, w, h, fill, ol) => {
    R(g, x - 1, y - 1, w + 2, h + 2, ol || OL);
    R(g, x, y, w, h, fill);
  };

  // 1섹션 applyLighting 과 동일한 그레인 + 디더링 + 색 지터
  function grain(g, w, h, amp) {
    amp = amp == null ? 1 : amp;
    const im = g.getImageData(0, 0, w, h);
    const d = im.data;
    const bayer = [
      [0, 8, 2, 10],
      [12, 4, 14, 6],
      [3, 11, 1, 9],
      [15, 7, 13, 5],
    ];
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (d[(y * w + x) * 4 + 3] === 0) continue; // 투명 픽셀은 건너뜀
        const dither = (bayer[y & 3][x & 3] / 16 - 0.5) * 0.05 * amp;
        let hf = (Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;
        if (hf < 0) hf += 1;
        let hc = (Math.sin(x * 39.17 + y * 11.13) * 24634.6345) % 1;
        if (hc < 0) hc += 1;
        const gr = ((hf - 0.5) * 0.05 + (hc - 0.5) * 0.11) * amp;
        const f = 1 + dither + gr;
        const cj = (hc - 0.5) * 9 * amp;
        const i = (y * w + x) * 4;
        d[i] = cl(d[i] * f + cj);
        d[i + 1] = cl(d[i + 1] * f + cj * 0.7);
        d[i + 2] = cl(d[i + 2] * f + cj * 0.4);
      }
    }
    g.putImageData(im, 0, 0);
  }

  // 논리 해상도로 그린 뒤 그레인 → PSC배 확대(픽셀 유지)해 굽기 (타일용)
  function bake(draw, w, h) {
    const s = document.createElement("canvas");
    s.width = w;
    s.height = h;
    const sg = s.getContext("2d");
    draw(sg, w, h);
    grain(sg, w, h, 1);
    const big = document.createElement("canvas");
    big.width = w * PSC;
    big.height = h * PSC;
    const bg = big.getContext("2d");
    bg.imageSmoothingEnabled = false;
    bg.drawImage(s, 0, 0, big.width, big.height);
    return big.toDataURL();
  }

  // 작은 픽셀아트 (CSS image-rendering:pixelated 로 확대)
  function small(draw, w, h, amp) {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const g = c.getContext("2d");
    draw(g, w, h);
    grain(g, w, h, amp == null ? 0.5 : amp);
    return c.toDataURL();
  }

  /* ── 불규칙 나무 널판 (상하좌우 seamless) ── */
  function drawWood(g, W, H) {
    R(g, 0, 0, W, H, WOOD_BASE);
    const ph = 9;
    const plank = (s0, y, w, color) => {
      const body = (xx, ww) => {
        R(g, xx, y, ww, ph - 1, color);
        R(g, (xx + ww * 0.45) | 0, y, 1, ph - 1, "rgba(0,0,0,0.1)"); // 나뭇결
      };
      if (s0 + w <= W) body(s0, w);
      else {
        body(s0, W - s0);
        body(0, s0 + w - W);
      }
      const end = ((s0 + w) % W + W) % W;
      R(g, (end - 1 + W) % W, y, 1, ph - 1, "rgba(0,0,0,0.34)"); // 끝 이음새
      R(g, s0 % W, y, 1, ph - 1, "rgba(255,225,180,0.06)"); // 시작 하이라이트
    };
    for (let y = 0; y < H; y += ph) {
      const ws = [];
      let total = 0,
        i = (y / ph) * 3 + 1;
      while (total < W) {
        const w = 30 + ((rr(i * 1.7) * 40) | 0);
        ws.push(w);
        total += w;
        i++;
      }
      const k = W / total;
      let acc = rr((y / ph) * 2.3 + 5) * W;
      for (const w0 of ws) {
        const w = w0 * k;
        const t = rr(acc * 0.13 + y * 1.9);
        const b = 50 + t * 24;
        plank(((acc % W) + W) % W, y, w, `rgb(${b | 0},${(b * 0.66) | 0},${(b * 0.42) | 0})`);
        acc += w;
      }
      R(g, 0, y + ph - 1, W, 1, "rgba(0,0,0,0.22)"); // 행 사이 가로 이음새
    }
  }

  /* ── 카펫 러너 (세로 seamless) ── */
  function drawRugRunner(g, W, H) {
    const cxr = W / 2;
    R(g, 0, 0, W, H, "#7a2f26");
    R(g, 0, 0, 3, H, "#5e2019");
    R(g, W - 3, 0, 3, H, "#5e2019");
    R(g, 5, 0, 2, H, "#c79a54");
    R(g, W - 7, 0, 2, H, "#c79a54");
    for (let cy = -20; cy < H + 20; cy += 20) {
      for (let iy = -7; iy <= 7; iy++) {
        const ww = (7 - Math.abs(iy)) * 2;
        R(g, cxr - ww / 2, cy + iy, ww, 1, "#d9b06a");
      }
      R(g, cxr - 1, cy - 1, 2, 2, "#efd49a");
      for (const p of [cxr - 25, cxr + 25]) {
        for (let iy = -3; iy <= 3; iy++) {
          const ww = (3 - Math.abs(iy)) * 2;
          R(g, p - ww / 2, cy + iy, ww, 1, "#b98a4a");
        }
      }
    }
  }

  /* ── 양피지(두루마리) 텍스처 ── */
  function drawPaper(g, W, H) {
    R(g, 0, 0, W, H, "#e9ad46"); // 황금빛 양피지
    for (let y = 2; y < H; y += 6) R(g, 0, y, W, 1, "rgba(120,70,20,0.06)"); // 가로 섬유결
    for (let k = 0; k < 55; k++) {
      const x = (rr(k * 1.7) * W) | 0,
        y = (rr(k * 3.1 + 4) * H) | 0;
      const dk = rr(k * 5.3) > 0.5;
      R(g, x, y, 1, 1, dk ? "rgba(110,60,15,0.13)" : "rgba(255,240,200,0.16)"); // 얼룩
    }
  }

  let _floor = null;
  function buildFloor() {
    if (_floor) return _floor;
    _floor = {
      wood: bake(drawWood, 300, 198),
      rug: bake(drawRugRunner, 90, 40),
    };
    return _floor;
  }

  function applyFloor(el, footerEl, withRug) {
    const { wood, rug } = buildFloor();
    el.style.backgroundColor = WOOD_BASE;
    if (withRug) {
      el.style.backgroundImage = `url(${rug}), url(${wood})`;
      el.style.backgroundRepeat = "repeat-y, repeat";
      el.style.backgroundPosition = "top center, top left";
      el.style.backgroundSize = `${90 * PSC}px auto, auto`;
    } else {
      el.style.backgroundImage = `url(${wood})`;
      el.style.backgroundRepeat = "repeat";
    }
    if (footerEl) {
      footerEl.style.backgroundColor = WOOD_BASE;
      footerEl.style.backgroundImage = `url(${wood})`;
      footerEl.style.backgroundRepeat = "repeat";
    }
  }

  let _paper = null;
  function paperTexture() {
    if (!_paper) _paper = bake(drawPaper, 60, 60);
    return _paper;
  }

  /* ============================================
     메뉴 픽셀아트 장난감 그림
     ============================================ */
  const TINT = {
    coffee: ["#efe3cf", "#d8c6a6"],
    tea: ["#eaf0d6", "#cdd6ac"],
    ade: ["#dcefec", "#b6d6cf"],
    dessert: ["#f3e6d4", "#dcc3a0"],
  };

  function scene(g, W, H, catId, drawObj) {
    const t = TINT[catId] || TINT.coffee;
    R(g, 0, 0, W, H, t[0]); // 배경
    R(g, 0, H - 11, W, 11, t[1]); // 바닥 띠
    R(g, 0, H - 11, W, 1, "rgba(0,0,0,0.12)");
    R(g, W / 2 - 15, H - 10, 30, 4, "rgba(0,0,0,0.14)"); // 접지 그림자
    drawObj(g, W, H);
  }

  const cx = 40;

  // 손잡이 달린 머그컵
  function mug(g, W, H, o) {
    const bw = 26,
      bh = 22,
      bx = cx - bw / 2,
      by = 17;
    // 손잡이
    R(g, bx + bw, by + 6, 6, 3, OL);
    R(g, bx + bw + 3, by + 8, 3, 8, OL);
    R(g, bx + bw, by + 15, 6, 3, OL);
    R(g, bx + bw + 1, by + 9, 2, 6, "#f4efe3");
    box(g, bx, by, bw, bh, "#f4efe3"); // 컵 몸통
    R(g, bx, by, 4, bh, "#ffffff"); // 좌 하이라이트
    R(g, bx + bw - 4, by, 4, bh, "#ded4c1"); // 우 음영
    R(g, bx + 2, by + 2, bw - 4, 4, o.coffee); // 커피 표면
    if (o.foam) R(g, bx + 2, by + 2, bw - 4, 3, "#efe1c6"); // 거품
    if (o.foam === "big") R(g, bx + 2, by + 1, bw - 4, 3, "#f6ead2");
    if (o.latte) {
      R(g, cx - 2, by + 3, 4, 2, "#c49a5e"); // 라떼아트 하트
      R(g, cx - 3, by + 4, 2, 1, "#c49a5e");
      R(g, cx + 1, by + 4, 2, 1, "#c49a5e");
      R(g, cx - 1, by + 5, 2, 1, "#c49a5e");
    }
    if (o.drizzle) {
      R(g, bx + 5, by + 2, 1, 3, "#c98a3a"); // 바닐라 드리즐
      R(g, bx + 12, by + 2, 1, 3, "#c98a3a");
      R(g, bx + 19, by + 2, 1, 3, "#c98a3a");
    }
    // 김
    R(g, cx - 6, by - 9, 2, 6, "rgba(255,255,255,0.5)");
    R(g, cx + 4, by - 10, 2, 7, "rgba(255,255,255,0.5)");
  }

  // 테이크아웃 아이스 컵 (뚜껑 + 빨대)
  function coldCup(g, W, H, o) {
    const bx = cx - 11,
      by = 20,
      bw = 22,
      bh = 26;
    R(g, cx + 4, 6, 3, 16, OL); // 빨대
    R(g, cx + 4, 6, 3, 16, "#e0736a");
    box(g, bx - 1, by - 5, bw + 2, 5, "#cfc4b0"); // 뚜껑
    box(g, bx, by, bw, bh, "#e9f1f4"); // 투명컵
    R(g, bx + 2, by + 4, bw - 4, bh - 7, o.coffee); // 음료
    for (let k = 0; k < 4; k++)
      R(g, bx + 4 + (k % 2) * 9, by + 7 + ((k / 2) | 0) * 8, 5, 5, "rgba(255,255,255,0.22)"); // 얼음
    R(g, bx + 2, by, 3, bh, "rgba(255,255,255,0.4)"); // 하이라이트
  }

  // 티컵 + 받침 + 티백 태그
  function teaCup(g, W, H, o) {
    R(g, cx - 16, 40, 32, 4, OL); // 받침
    R(g, cx - 15, 40, 30, 2, "#e7dcc6");
    const bx = cx - 11,
      by = 24,
      bw = 22,
      bh = 15;
    R(g, bx + bw, by + 3, 5, 3, OL); // 손잡이
    R(g, bx + bw + 2, by + 5, 3, 5, OL);
    R(g, bx + bw, by + 9, 5, 3, OL);
    box(g, bx, by, bw, bh, "#f4efe3");
    R(g, bx + 2, by + 2, bw - 4, 4, o.tea); // 차
    R(g, bx, by, 3, bh, "#ffffff");
    // 티백 실 + 태그
    R(g, bx + bw - 6, by - 6, 1, 8, "#b7a486");
    box(g, bx + bw - 9, by - 10, 6, 5, "#e4d6b4");
  }

  // 톨 글라스 에이드 (얼음 + 빨대 + 과일)
  function adeGlass(g, W, H, o) {
    const bx = cx - 10,
      by = 15,
      bw = 20,
      bh = 33;
    R(g, cx + 3, 4, 2, 16, "#eae2cf"); // 빨대
    R(g, cx + 3, 4, 2, 16, o.straw || "#e0736a");
    box(g, bx, by, bw, bh, "#eef4f4"); // 유리잔
    R(g, bx + 2, by + 6, bw - 4, bh - 9, o.liquid); // 음료
    for (let k = 0; k < 5; k++)
      R(g, bx + 3 + (k % 2) * 8, by + 9 + ((k / 3) | 0) * 9 + (k % 3) * 5, 5, 5, "rgba(255,255,255,0.28)"); // 얼음
    R(g, bx, by, 3, bh, "rgba(255,255,255,0.45)");
    R(g, bx + 2, by + 5, bw - 4, 1, "rgba(255,255,255,0.5)"); // 표면
    if (o.fruit) box(g, cx + 8, by + 2, 6, 6, o.fruit); // 과일 조각
  }

  // 치즈 케이크 조각
  function cakeSlice(g, W, H) {
    R(g, cx - 18, 42, 36, 4, OL); // 접시
    R(g, cx - 17, 42, 34, 2, "#d9cdb6");
    // 삼각 조각 (오른쪽이 넓은 쐐기)
    const topY = 22,
      botY = 42,
      leftX = cx - 15,
      rightX = cx + 15;
    for (let y = topY; y < botY; y++) {
      const t = (y - topY) / (botY - topY);
      const x0 = leftX + (1 - t) * 10;
      const w = (rightX - x0) | 0;
      const crust = y > botY - 6;
      R(g, x0, y, w, 1, crust ? "#a9702f" : "#f2d98a"); // 크러스트/치즈
    }
    R(g, leftX + 2, topY, rightX - leftX - 4, 3, "#f8ecc4"); // 윗면 밝게
    R(g, cx + 6, topY + 4, 4, 4, "#e57a52"); // 딸기 토핑
  }

  // 티라미수 (코코아 더스트)
  function tiramisu(g, W, H) {
    R(g, cx - 17, 42, 34, 4, OL);
    const bx = cx - 14,
      by = 24,
      bw = 28,
      bh = 18;
    box(g, bx, by, bw, bh, "#e8c98a"); // 스펀지
    R(g, bx, by, bw, 5, "#6b4426"); // 코코아 윗면
    R(g, bx, by + 8, bw, 3, "#f1e2bd"); // 크림 층
    R(g, bx + 4, by + 1, 3, 2, "#4a2c17"); // 코코아 반점
    R(g, bx + 14, by + 2, 3, 2, "#4a2c17");
    R(g, bx + 20, by + 1, 3, 2, "#4a2c17");
    R(g, cx - 2, by - 3, 6, 4, "#f6efdf"); // 크림 돌로
  }

  // 크로플 (와플 격자 + 시럽)
  function croffle(g, W, H) {
    R(g, cx - 17, 42, 34, 4, OL);
    const bx = cx - 14,
      by = 22,
      bw = 28,
      bh = 20;
    box(g, bx, by, bw, bh, "#d99a3f"); // 몸통
    for (let x = bx + 4; x < bx + bw; x += 6) R(g, x, by, 1, bh, "#a86a24"); // 격자 세로
    for (let y = by + 4; y < by + bh; y += 6) R(g, bx, y, bw, 1, "#a86a24"); // 격자 가로
    R(g, bx, by, bw, 3, "#eab763"); // 윗 하이라이트
    R(g, bx + 6, by - 3, 3, 6, "#7a4a1e"); // 시럽
    R(g, bx + 6, by - 3, 16, 2, "#7a4a1e");
    R(g, bx + 20, by - 3, 3, 8, "#7a4a1e");
  }

  function menuArt(menu) {
    const cat = menu.categoryId;
    const draw = (g, W, H) => {
      scene(g, W, H, cat, (gg, ww, hh) => {
        switch (menu.id) {
          case 1:
            return mug(gg, ww, hh, { coffee: "#2a1509" }); // 아메리카노
          case 2:
            return mug(gg, ww, hh, { coffee: "#b98a58", foam: true, latte: true }); // 카페라떼
          case 3:
            return mug(gg, ww, hh, { coffee: "#b98a58", foam: "big" }); // 카푸치노
          case 4:
            return mug(gg, ww, hh, { coffee: "#b98a58", foam: true, drizzle: true }); // 바닐라라떼
          case 12:
            return coldCup(gg, ww, hh, { coffee: "#3a2213" }); // 콜드브루
          case 5:
            return teaCup(gg, ww, hh, { tea: "#b5661f" }); // 얼그레이
          case 6:
            return teaCup(gg, ww, hh, { tea: "#e0a83a" }); // 캐모마일
          case 7:
            return adeGlass(gg, ww, hh, { liquid: "#f0785a", fruit: "#f2a24a", straw: "#e0736a" }); // 자몽
          case 8:
            return adeGlass(gg, ww, hh, { liquid: "#a7c34a", fruit: "#7fae3a", straw: "#9bd05a" }); // 청포도
          case 9:
            return cakeSlice(gg, ww, hh); // 치즈케이크
          case 10:
            return tiramisu(gg, ww, hh); // 티라미수
          case 11:
            return croffle(gg, ww, hh); // 크로플
          default:
            // 카테고리 기본값
            if (cat === "tea") return teaCup(gg, ww, hh, { tea: "#c07a2a" });
            if (cat === "ade") return adeGlass(gg, ww, hh, { liquid: "#f0785a" });
            if (cat === "dessert") return cakeSlice(gg, ww, hh);
            return mug(gg, ww, hh, { coffee: "#3a2213" });
        }
      });
    };
    return small(draw, 80, 60, 0.45);
  }

  // 카테고리 대표 아이콘 (메뉴와 같은 픽셀아트 스타일)
  function categoryArt(catId) {
    const draw = (g, W, H) =>
      scene(g, W, H, catId, (gg, ww, hh) => {
        if (catId === "tea") return teaCup(gg, ww, hh, { tea: "#c07a2a" });
        if (catId === "ade")
          return adeGlass(gg, ww, hh, { liquid: "#f0785a", fruit: "#f2a24a" });
        if (catId === "dessert") return cakeSlice(gg, ww, hh);
        return mug(gg, ww, hh, { coffee: "#3a2213", foam: true, latte: true });
      });
    return small(draw, 80, 60, 0.45);
  }

  window.CAFE_PIXEL = { buildFloor, applyFloor, paperTexture, menuArt, categoryArt };
})();
