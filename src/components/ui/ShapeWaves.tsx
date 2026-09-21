"use client";

import React, { useEffect, useRef, useState } from "react";
import "./ShapeWaves.css";

export interface ShapeWavesProps {
  text?: string;
  fontFamily?: string;
  fontWeight?: number | string;
  textSize?: number;
  shapes?: "mixed" | "squares" | "circles" | "triangles";
  cellSize?: number;
  dotSize?: number;
  color?: string;
  hoverColor?: string;
  backgroundColor?: string;
  speed?: number;
  scale?: number;
  contrast?: number;
  brightness?: number;
  flow?: number;
  direction?: number;
  fade?: number;
  interactive?: boolean;
  splashRadius?: number;
  splashStrength?: number;
  glow?: number;
  intro?: boolean;
  introDuration?: number;
  introKey?: number;
  paused?: boolean;
  onError?: (err: Error) => void;
  className?: string;
}

interface Ripple {
  x: number;
  y: number;
  startTime: number;
  strength: number;
  maxRadius: number;
}

const parseHexColor = (hexStr: string, fallback: [number, number, number]): [number, number, number] => {
  if (!hexStr) return fallback;
  let clean = hexStr.replace("#", "").trim();
  if (clean.length === 3) {
    clean = clean.split("").map((c) => c + c).join("");
  }
  if (clean.length !== 6) return fallback;
  const num = parseInt(clean, 16);
  if (isNaN(num)) return fallback;
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
};

const lerpColor = (
  c1: [number, number, number],
  c2: [number, number, number],
  factor: number
): string => {
  const f = Math.max(0, Math.min(1, factor));
  const r = Math.round(c1[0] + (c2[0] - c1[0]) * f);
  const g = Math.round(c1[1] + (c2[1] - c1[1]) * f);
  const b = Math.round(c1[2] + (c2[2] - c1[2]) * f);
  return `rgb(${r}, ${g}, ${b})`;
};

export default function ShapeWaves({
  text = "",
  fontFamily = 'Geist, "Geist Sans", system-ui, sans-serif',
  fontWeight = 600,
  textSize = 0.5,
  shapes = "mixed",
  cellSize = 24,
  dotSize = 0.65,
  color = "#27272a",
  hoverColor = "#38bdf8",
  backgroundColor = "transparent",
  speed = 1,
  scale = 1,
  contrast = 1,
  brightness = 0.5,
  flow = 0.2,
  direction = 45,
  fade = 0.35,
  interactive = true,
  splashRadius = 140,
  splashStrength = 0.8,
  glow = 0.4,
  intro = true,
  introDuration = 1.4,
  introKey = 0,
  paused = false,
  className = "",
}: ShapeWavesProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  // Keep latest props in ref for animation frame loop
  const propsRef = useRef({
    text,
    fontFamily,
    fontWeight,
    textSize,
    shapes,
    cellSize: Math.max(8, cellSize),
    dotSize,
    color,
    hoverColor,
    backgroundColor,
    speed,
    scale,
    contrast,
    brightness,
    flow,
    direction,
    fade,
    interactive,
    splashRadius,
    splashStrength,
    glow,
    intro,
    introDuration,
    paused,
  });

  propsRef.current = {
    text,
    fontFamily,
    fontWeight,
    textSize,
    shapes,
    cellSize: Math.max(8, cellSize),
    dotSize,
    color,
    hoverColor,
    backgroundColor,
    speed,
    scale,
    contrast,
    brightness,
    flow,
    direction,
    fade,
    interactive,
    splashRadius,
    splashStrength,
    glow,
    intro,
    introDuration,
    paused,
  };

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animId = 0;
    let startTime = performance.now();
    let introStartTime = performance.now();
    let isVisible = true;
    const ripples: Ripple[] = [];

    // Text mask canvas
    const maskCanvas = document.createElement("canvas");
    const maskCtx = maskCanvas.getContext("2d");

    let width = 0;
    let height = 0;
    let dpr = 1;

    const updateMask = () => {
      const p = propsRef.current;
      const content = p.text.trim();
      if (!content || !maskCtx) return;

      maskCanvas.width = width;
      maskCanvas.height = height;
      maskCtx.clearRect(0, 0, width, height);

      const fontPx = Math.max(14, Math.round(height * p.textSize));
      maskCtx.font = `${p.fontWeight} ${fontPx}px ${p.fontFamily}`;
      maskCtx.textAlign = "center";
      maskCtx.textBaseline = "middle";
      maskCtx.fillStyle = "#ffffff";
      maskCtx.fillText(content, width / 2, height / 2);
    };

    const handleResize = () => {
      if (!root || !canvas) return;
      const rect = root.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(10, Math.floor(rect.width));
      height = Math.max(10, Math.floor(rect.height));

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      updateMask();
      setReady(true);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(root);
    handleResize();

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    intersectionObserver.observe(root);

    // Pointer events for interactive ripples
    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const p = propsRef.current;
      if (!p.interactive || !root) return;

      const rect = root.getBoundingClientRect();
      let clientX = 0;
      let clientY = 0;

      if ("touches" in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ("clientX" in e) {
        clientX = (e as MouseEvent).clientX;
        clientY = (e as MouseEvent).clientY;
      }

      const x = clientX - rect.left;
      const y = clientY - rect.top;

      if (x < 0 || y < 0 || x > width || y > height) return;

      const now = performance.now();
      // Rate limit ripples
      const lastRipple = ripples[ripples.length - 1];
      if (
        !lastRipple ||
        now - lastRipple.startTime > 50 ||
        Math.hypot(lastRipple.x - x, lastRipple.y - y) > 30
      ) {
        ripples.push({
          x,
          y,
          startTime: now,
          strength: p.splashStrength,
          maxRadius: p.splashRadius,
        });
        if (ripples.length > 8) ripples.shift();
      }
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("touchmove", handlePointerMove, { passive: true });

    // Intro retrigger
    introStartTime = performance.now();

    // Render loop
    const render = (now: number) => {
      animId = requestAnimationFrame(render);
      if (!isVisible || propsRef.current.paused) return;

      const p = propsRef.current;
      const elapsed = (now - startTime) * 0.001 * p.speed;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Clean old ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const age = (now - ripples[i].startTime) * 0.001;
        if (age > 1.5) {
          ripples.splice(i, 1);
        }
      }

      const cell = p.cellSize;
      const cols = Math.ceil(width / cell) + 1;
      const rows = Math.ceil(height / cell) + 1;
      const offsetX = (width - cols * cell) / 2;
      const offsetY = (height - rows * cell) / 2;

      const baseRgb = parseHexColor(p.color, [39, 39, 42]);
      const hoverRgb = parseHexColor(p.hoverColor, [56, 189, 248]);

      const dirRad = (p.direction * Math.PI) / 180;
      const dirX = Math.cos(dirRad);
      const dirY = Math.sin(dirRad);

      const introProgress = p.intro
        ? Math.min(1, (now - introStartTime) * 0.001 / p.introDuration)
        : 1;

      // Mask image data if text provided
      let maskData: ImageData | null = null;
      if (p.text.trim() && maskCtx) {
        try {
          maskData = maskCtx.getImageData(0, 0, width, height);
        } catch {
          // ignore cross-origin/taint
        }
      }

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const cx = offsetX + (c + 0.5) * cell;
          const cy = offsetY + (r + 0.5) * cell;

          // Check text mask
          if (maskData) {
            const px = Math.floor(cx);
            const py = Math.floor(cy);
            if (px >= 0 && px < width && py >= 0 && py < height) {
              const idx = (py * width + px) * 4;
              if (maskData.data[idx + 3] > 128) {
                continue; // Skip shape if covered by text
              }
            }
          }

          // Compute traveling harmonic waves
          const proj = (cx * dirX + cy * dirY) / (120 * p.scale);
          const perp = (-cx * dirY + cy * dirX) / (180 * p.scale);

          const wave1 = Math.sin(proj - elapsed * 1.8);
          const wave2 = Math.cos(perp + elapsed * 1.1) * 0.5;
          const wave3 = Math.sin((cx + cy) / (240 * p.scale) - elapsed * 0.6) * 0.35;

          const rawIntensity = (wave1 + wave2 + wave3 + 1.85) / 3.7;
          let intensity = Math.max(0, Math.min(1, (rawIntensity - 0.5) * p.contrast + 0.5));
          intensity = intensity * (0.6 + p.brightness * 0.8);

          // Apply ripple influence
          let rippleBoost = 0;
          for (let i = 0; i < ripples.length; i++) {
            const rip = ripples[i];
            const dist = Math.hypot(cx - rip.x, cy - rip.y);
            const age = (now - rip.startTime) * 0.001;
            const ripSpeed = 260; // px/sec
            const currentFront = age * ripSpeed;
            const waveWidth = 45;

            if (dist <= rip.maxRadius && Math.abs(dist - currentFront) < waveWidth) {
              const decay = Math.max(0, 1 - dist / rip.maxRadius) * Math.max(0, 1 - age / 1.5);
              const factor = (1 - Math.abs(dist - currentFront) / waveWidth) * decay;
              rippleBoost += factor * rip.strength;
            }
          }

          const combinedIntensity = Math.min(1.2, intensity + rippleBoost);

          // Edge vignette fade
          if (p.fade > 0) {
            const normX = (cx / width - 0.5) * 2;
            const normY = (cy / height - 0.5) * 2;
            const distFromCenter = Math.hypot(normX, normY) / 1.414;
            const vignette = Math.max(0, 1 - Math.pow(distFromCenter, 1.8) * p.fade);
            intensity *= vignette;
          }

          // Intro scale
          const finalScale =
            (cell * 0.5 * p.dotSize) *
            (0.35 + combinedIntensity * 0.85) *
            introProgress;

          if (finalScale <= 0.5) continue;

          // Determine shape: 0 = triangle, 1 = circle, 2 = square
          let shapeType: "circle" | "square" | "triangle" = "circle";
          if (p.shapes === "squares") {
            shapeType = "square";
          } else if (p.shapes === "circles") {
            shapeType = "circle";
          } else if (p.shapes === "triangles") {
            shapeType = "triangle";
          } else {
            // Mixed: morphs along wave intensity
            const step = Math.floor((combinedIntensity * 3) % 3);
            if (step === 0) shapeType = "triangle";
            else if (step === 1) shapeType = "circle";
            else shapeType = "square";
          }

          // Color interpolation
          const colorFactor = Math.min(1, combinedIntensity * 0.7 + rippleBoost * 1.2);
          const shapeColor = lerpColor(baseRgb, hoverRgb, colorFactor);

          ctx.fillStyle = shapeColor;

          // Glow on high crest or ripple
          if (p.glow > 0 && combinedIntensity > 0.65) {
            ctx.shadowColor = p.hoverColor;
            ctx.shadowBlur = Math.round(8 * p.glow * (combinedIntensity - 0.5));
          } else {
            ctx.shadowColor = "transparent";
            ctx.shadowBlur = 0;
          }

          // Draw shape
          ctx.beginPath();
          if (shapeType === "circle") {
            ctx.arc(cx, cy, Math.max(1, finalScale / 2), 0, Math.PI * 2);
          } else if (shapeType === "square") {
            const size = finalScale;
            const half = size / 2;
            ctx.roundRect
              ? ctx.roundRect(cx - half, cy - half, size, size, 2)
              : ctx.rect(cx - half, cy - half, size, size);
          } else {
            // Triangle
            const size = finalScale;
            ctx.moveTo(cx, cy - size / 2);
            ctx.lineTo(cx + size / 2, cy + size / 2);
            ctx.lineTo(cx - size / 2, cy + size / 2);
            ctx.closePath();
          }
          ctx.fill();
        }
      }
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("touchmove", handlePointerMove);
    };
  }, [introKey]);

  return (
    <div
      ref={rootRef}
      className={`shape-waves ${className}`}
      data-ready={ready}
      style={{ backgroundColor }}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="shape-waves__canvas" />
    </div>
  );
}

export { ShapeWaves };
