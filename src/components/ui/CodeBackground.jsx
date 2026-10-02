import React, { useEffect, useRef } from "react";

const TAU = Math.PI * 2;
const HALF_PI = Math.PI / 2;
const FONT = '"Plus Jakarta Sans", "JetBrains Mono", "Geist Mono", monospace';

/* Mixed glyph set: mostly numbers and tech symbols for the premium tech look */
const matrixChars = "0101010101010110010101010001010101010101010101100000111100010101";
const latinChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const codeChars = "/\\{}[]()=#%&$@;:~^?!_";
const uniqueChars = "λΣΩπ∆∞≈≠±§¤×÷";

const THEME = {
  dotRGB: "212, 175, 55", // Light gold
  hazeStops: [
    [0, 0.12],
    [0.55, 0.06],
    [1, 0],
  ],
  glyphChars: matrixChars + latinChars + codeChars + uniqueChars,
};

const GLYPHS = Array.from(new Set(Array.from(THEME.glyphChars)));
const DOT_FILL = `rgb(${THEME.dotRGB})`;

/* Generate Palette: customized for light golden theme */
const PALETTE = (() => {
  const p = new Array(1440);
  for (let hh = 0; hh < 360; hh++) {
    // Instead of full hue spectrum, lock hue around 40-50 for Gold/Amber
    const hue = 40 + (hh % 15);
    // Darker, richer golds for visibility on light bg
    p[hh] = `hsl(${hue}, 80%, 35%)`; // Normal
    p[360 + hh] = `hsl(${hue}, 92%, 45%)`; // Normal+flash
    p[720 + hh] = `hsl(${hue}, 94%, 25%)`; // Warm spark
    p[1080 + hh] = `hsl(${hue}, 94%, 40%)`; // Warm+flash
  }
  return p;
})();

const sstep = (e0, e1, x) => {
  const k = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return k * k * (3 - 2 * k);
};

const mulberry32 = (a) => () => {
  a |= 0;
  a = (a + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const NB = 16; // alpha buckets for resting dots
const K = 0.6; // globe roundness
const LN = Math.hypot(-0.45, -0.55, 0.7);
const LX = -0.45 / LN;
const LY = -0.55 / LN;
const LZ = 0.7 / LN;

export default function CodeBackground({ label, className }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const GN = GLYPHS.length;

    let raf = 0;
    let drawRaf = 0;
    let resizeRaf = 0;
    let touchTimer = 0;
    let disposed = false;
    let last = performance.now();
    let t = 0;
    let w = 0;
    let h = 0;
    let dpr = 1;

    let N = 0;
    let spacing = 22;
    let dotR = 1.05;
    let baseFont = 15.8;
    let R = 160;
    let bx = new Float32Array(0);
    let by = new Float32Array(0);
    let seed = new Float32Array(0);
    let mix = new Float32Array(0);
    let flash = new Float32Array(0);
    let nextSwap = new Float32Array(0);
    let scrambleUntil = new Float32Array(0);
    let phase = new Float32Array(0);
    let tw = new Float32Array(0);
    let kp = new Float32Array(0);
    let glyph = new Uint8Array(0);
    
    let gx = new Float32Array(0);
    let gy = new Float32Array(0);
    let ga = new Float32Array(0);
    let gf = new Uint8Array(0);
    let gp = new Uint16Array(0);
    let gc = new Uint8Array(0);
    let buckets = [];
    const bCount = new Int32Array(NB);
    let fonts = [];

    const ptr = { tx: 0, ty: 0, x: 0, y: 0, vx: 0, vy: 0, active: false, first: true, lastSeen: 0 };
    let presence = 0;
    let speed = 0;

    const buildLattice = () => {
      const small = Math.min(w, h) < 640;
      spacing = small ? 18 : 22;
      dotR = small ? 0.95 : 1.05;
      let cols = 1;
      let rows = 1;
      for (;;) {
        cols = Math.max(1, Math.floor(w / spacing));
        rows = Math.max(1, Math.floor(h / spacing));
        if (cols * rows <= 12000) break;
        spacing += 1;
      }
      baseFont = small ? Math.max(13, spacing * 0.72) : spacing * 0.72;
      R = Math.min(220, Math.max(140, Math.min(w, h) * 0.19)) * (coarse ? 0.85 : 1);

      const ox = (w % spacing) / 2 + spacing / 2;
      const oy = (h % spacing) / 2 + spacing / 2;
      N = cols * rows;

      bx = new Float32Array(N);
      by = new Float32Array(N);
      seed = new Float32Array(N);
      mix = new Float32Array(N);
      flash = new Float32Array(N);
      nextSwap = new Float32Array(N);
      scrambleUntil = new Float32Array(N);
      phase = new Float32Array(N);
      tw = new Float32Array(N);
      kp = new Float32Array(N);
      glyph = new Uint8Array(N);
      gx = new Float32Array(N);
      gy = new Float32Array(N);
      ga = new Float32Array(N);
      gf = new Uint8Array(N);
      gp = new Uint16Array(N);
      gc = new Uint8Array(N);
      buckets = Array.from({ length: NB }, () => new Uint16Array(N));

      const rng = mulberry32(1337);
      const ccx = w / 2;
      const ccy = h / 2;
      let i = 0;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++, i++) {
          const x = ox + c * spacing;
          const y = oy + r * spacing;
          bx[i] = x;
          by[i] = y;
          seed[i] = rng();
          phase[i] = rng() * TAU;
          glyph[i] = (rng() * GN) | 0;
          nextSwap[i] = rng();
          const tr = rng();
          tw[i] = tr < 0.015 ? 3 + rng() * 4 : 0;
          const e = Math.hypot((x - ccx) / 150, (y - ccy) / 40);
          kp[i] = 1 - 0.85 * (1 - sstep(0.6, 1.0, e));
        }
      }

      fonts = [];
      for (let k = 0; k < 8; k++) {
        const scale = 0.5 + k * (1.3 / 7);
        fonts.push(`${(baseFont * scale).toFixed(1)}px ${FONT}`);
      }
    };

    const ambient = (i, tt) => {
      if (reduce) return 0.2;
      let a = 0.2 + 0.1 * Math.sin(tt * 0.5 + bx[i] * 0.006 + by[i] * 0.004);
      const p = tw[i];
      if (p > 0) {
        const s = Math.sin(tt * (TAU / p) + phase[i]);
        if (s > 0) {
          const e = s * s;
          a += (0.55 - a) * e * e;
        }
      }
      return a;
    };

    const draw = (dt, tt) => {
      const active = ptr.active;
      presence += ((active ? 1 : 0) - presence) * (1 - Math.exp(-dt * (active ? 7 : 4)));
      if (reduce) presence = active ? 1 : 0;

      const ppx = ptr.x;
      const ppy = ptr.y;
      const kPos = 1 - Math.exp(-dt * 22);
      ptr.x += (ptr.tx - ptr.x) * kPos;
      ptr.y += (ptr.ty - ptr.y) * kPos;
      if (!reduce && dt > 0) {
        ptr.vx = (ptr.x - ppx) / dt;
        ptr.vy = (ptr.y - ppy) / dt;
        speed += (Math.hypot(ptr.vx, ptr.vy) - speed) * (1 - Math.exp(-dt * 10));
      }

      const ease = 1 - Math.pow(1 - presence, 3);
      const Re = R * ease * (1 + Math.min(0.08, speed * 0.00008));
      const cx = ptr.x;
      const cy = ptr.y;
      const hasSphere = presence > 0.002;
      const R15 = Re * 1.5;

      if (hasSphere) {
        const rH = Re * 1.55;
        const hA = 45; 
        const hB = 40; 
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rH);
        const hs = THEME.hazeStops;
        g.addColorStop(hs[0][0], `hsla(${hA},80%,62%,${hs[0][1] * presence})`);
        g.addColorStop(hs[1][0], `hsla(${hB},80%,60%,${hs[1][1] * presence})`);
        g.addColorStop(hs[2][0], `hsla(${hB},80%,60%,0)`);
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = 1;
        ctx.fillStyle = g;
        ctx.fillRect(cx - rH, cy - rH, rH * 2, rH * 2);
      }

      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = DOT_FILL;
      bCount.fill(0);
      let gn = 0;

      const kIn = 1 - Math.exp(-dt * 16);
      const kOut = 1 - Math.exp(-dt * 4.5);
      const fd = Math.exp(-dt * 7);
      const sweepY = reduce ? 0 : Math.sin(tt * 0.9) * 0.85;

      for (let i = 0; i < N; i++) {
        const dx = bx[i] - cx;
        const dy = by[i] - cy;
        const inBox = dx < Re && dx > -Re && dy < Re && dy > -Re;
        const d = inBox ? Math.hypot(dx, dy) : 1e9;
        const m0 = mix[i];

        if (d >= Re && m0 < 0.005) {
          if (m0 !== 0) {
            mix[i] = 0;
            flash[i] = 0;
          }
          let a = ambient(i, tt) * kp[i];
          if (hasSphere && dx < R15 && dx > -R15 && dy < R15 && dy > -R15) {
            a += 0.18 * sstep(R15, Re, Math.hypot(dx, dy)) * presence;
          }
          let b = (a * 20) | 0;
          if (b > NB - 1) b = NB - 1;
          if (b < 0) b = 0;
          buckets[b][bCount[b]++] = i;
          continue;
        }

        const inside = d < Re;
        const u = inside ? d / Re : 1;
        const tgt = inside ? sstep(0.98, 0.28, u) * presence : 0;
        const m = m0 + (tgt - m0) * (tgt > m0 ? kIn : kOut);
        mix[i] = m;
        if (!reduce && m0 < 0.06 && m >= 0.06) {
          nextSwap[i] = tt;
          scrambleUntil[i] = tt + 0.22;
        }

        let x = bx[i];
        let y = by[i];
        let z = 0.25;
        let nx = 0;
        let ny = 0;
        let rimK = 1;
        let a = ambient(i, tt) * kp[i];

        if (inside) {
          const th = u * HALF_PI;
          const s = Math.sin(th);
          z = Math.max(0, Math.cos(th));
          const rr = Re * (u * (1 - K) + s * K);
          const ux = d > 0.0001 ? dx / d : 0;
          const uy = d > 0.0001 ? dy / d : 0;
          x = cx + ux * rr;
          y = cy + uy * rr;
          nx = ux * s;
          ny = uy * s;
          rimK = 1 - 0.7 * sstep(0.72, 1, u);
          a += 0.18 * presence;
        } else if (hasSphere) {
          a += 0.18 * sstep(R15, Re, Math.hypot(dx, dy)) * presence;
        }

        const dotA = a * (1 - m) * rimK;
        if (dotA > 0.004) {
          ctx.globalAlpha = Math.min(1, dotA);
          const r = inside ? dotR * (0.55 + 0.6 * z) : dotR;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, TAU);
          ctx.fill();
        }

        let fl = flash[i];
        if (!reduce) {
          if (inside && tt >= nextSwap[i] && m > 0.15) {
            glyph[i] = (Math.random() * GN) | 0;
            fl = 1;
            nextSwap[i] =
              tt < scrambleUntil[i]
                ? tt + 0.045 + Math.random() * 0.025
                : tt + (1.1 + (0.12 - 1.1) * Math.pow(z, 1.2)) * (0.5 + Math.random());
          }
          fl *= fd;
          flash[i] = fl;
        }

        if (m > 0.01) {
          const shade = 0.55 + 0.45 * Math.max(0, nx * LX + ny * LY + z * LZ);
          let scan = 1;
          if (!reduce && inside) {
            const q = dy / Re - sweepY;
            scan = 1 + 0.9 * Math.exp(-(q * q) / 0.012);
          }
          const alpha =
            (m * (0.35 + 0.65 * Math.pow(z, 0.8)) * shade * scan + 0.35 * fl * m) * kp[i];
          if (alpha > 0.01) {
            const sd = seed[i];
            let hue;
            let base;
            if (sd < 0.06) {
              hue = 40 + 8 * Math.sin(tt * 0.8 + sd * 90);
              base = 720;
            } else {
              hue = 165 + 190 * (0.5 + 0.5 * Math.sin(tt * 0.55 + nx * 2.2 + ny * 1.7 + sd * 1.8));
              base = 0;
            }
            const scale = (0.62 + 0.78 * z) * (1 + 0.25 * fl);
            let fi = Math.round((scale - 0.5) / (1.3 / 7));
            if (fi < 0) fi = 0;
            if (fi > 7) fi = 7;
            gx[gn] = x;
            gy[gn] = y;
            ga[gn] = alpha > 1 ? 1 : alpha;
            gf[gn] = fi;
            gp[gn] = base + (fl > 0.5 ? 360 : 0) + (((hue | 0) % 360 + 360) % 360);
            gc[gn] = glyph[i];
            gn++;
          }
        }
      }

      ctx.fillStyle = DOT_FILL;
      for (let b = 0; b < NB; b++) {
        const c = bCount[b];
        if (c === 0) continue;
        const arr = buckets[b];
        ctx.globalAlpha = (b + 0.5) / 20;
        ctx.beginPath();
        for (let k = 0; k < c; k++) {
          const i = arr[k];
          const px = bx[i];
          const py = by[i];
          ctx.moveTo(px + dotR, py);
          ctx.arc(px, py, dotR, 0, TAU);
        }
        ctx.fill();
      }

      if (gn > 0) {
        ctx.globalCompositeOperation = "source-over"; // Works best on light background
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        let lastF = -1;
        for (let g = 0; g < gn; g++) {
          const f = gf[g];
          if (f !== lastF) {
            ctx.font = fonts[f];
            lastF = f;
          }
          ctx.globalAlpha = ga[g];
          ctx.fillStyle = PALETTE[gp[g]];
          ctx.fillText(GLYPHS[gc[g]], gx[g], gy[g]);
        }
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    };

    const requestDraw = () => {
      if (!reduce || drawRaf || disposed) return;
      drawRaf = requestAnimationFrame(() => {
        drawRaf = 0;
        ctx.clearRect(0, 0, w, h);
        draw(1, 0);
      });
    };

    const resize = () => {
      if (!canvasRef.current || !canvasRef.current.parentElement) return;
      const rect = canvasRef.current.parentElement.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildLattice();
      requestDraw();
    };

    const frame = (now) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
      last = now;
      t += dt;
      ctx.clearRect(0, 0, w, h);
      draw(dt, t);
      raf = requestAnimationFrame(frame);
    };

    const onMove = (e) => {
      ptr.tx = e.clientX;
      ptr.ty = e.clientY;
      if (ptr.first || (!ptr.active && presence < 0.02)) {
        ptr.x = ptr.tx;
        ptr.y = ptr.ty;
        ptr.first = false;
      }
      ptr.active = true;
      ptr.lastSeen = performance.now();
      window.clearTimeout(touchTimer);
      requestDraw();
    };

    const leave = () => {
      ptr.active = false;
      requestDraw();
    };

    const onUp = (e) => {
      if (e.pointerType === "touch") {
        window.clearTimeout(touchTimer);
        touchTimer = window.setTimeout(leave, 900);
      }
    };

    const onCancel = () => leave();
    const onDocLeave = (e) => {
      if (e.pointerType === "touch") return; 
      leave();
    };

    const onVis = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      if (document.hidden) {
        ptr.active = false;
        return;
      }
      if (!reduce) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };

    const onResize = () => {
      if (resizeRaf) return;
      resizeRaf = requestAnimationFrame(() => {
        resizeRaf = 0;
        resize();
      });
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onMove, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("pointercancel", onCancel);
    window.addEventListener("blur", leave);
    document.addEventListener("visibilitychange", onVis);
    document.documentElement.addEventListener("pointerleave", onDocLeave);

    let resizeObserver = new ResizeObserver(() => onResize());
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    resize();
    if (!reduce) raf = requestAnimationFrame(frame);

    if (document.fonts) {
      void document.fonts.load(`16px "JetBrains Mono"`).catch(() => undefined);
      void document.fonts.ready.then(() => {
        if (!disposed) requestDraw();
      });
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      cancelAnimationFrame(drawRaf);
      cancelAnimationFrame(resizeRaf);
      window.clearTimeout(touchTimer);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
      window.removeEventListener("blur", leave);
      if (resizeObserver) resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      document.documentElement.removeEventListener("pointerleave", onDocLeave);
    };
  }, []);

  return (
    <div className={className ? `cb-root ${className}` : "cb-root"}>
      <canvas ref={canvasRef} className="cb-canvas" aria-hidden="true" />
      <div className="cb-vignette" />
      <div className="cb-grain" />
      {label && <div className="cb-label">{label}</div>}
    </div>
  );
}
