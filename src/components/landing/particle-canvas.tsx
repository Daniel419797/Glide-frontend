"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { ParticleEngine, type Theme } from "./particle-engine";

export function ParticleCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<ParticleEngine | null>(null);
  const { resolvedTheme } = useTheme();
  const initialTheme = useRef<Theme>((resolvedTheme as Theme) ?? "dark");

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const enabled = localStorage.getItem("glide:landing-animation") !== "off";
    if (!enabled) {
      canvas.style.display = "none";
      return;
    }

    const engine = new ParticleEngine();
    engineRef.current = engine;
    engine.init(canvas, initialTheme.current);

    const onMouseMove = (e: MouseEvent) => {
      engine.setMouse(e.clientX, e.clientY + window.scrollY);
    };
    const onMouseLeave = () => engine.clearMouse();
    const onClick = (e: MouseEvent) => {
      engine.handleClick(e.clientX, e.clientY + window.scrollY);
    };
    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) engine.handleClick(t.clientX, t.clientY + window.scrollY);
    };

    const syncSize = () => {
      const docH = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        window.innerHeight,
      );
      engine.resize(window.innerWidth, docH);
    };
    syncSize();

    const ro = new ResizeObserver(() => syncSize());
    ro.observe(document.body);

    const onScroll = () => {};
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("click", onClick);
    canvas.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("resize", syncSize);

    return () => {
      engine.destroy();
      engineRef.current = null;
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("click", onClick);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", syncSize);
      canvas.removeEventListener("touchstart", onTouchStart);
      ro.disconnect();
    };
  }, []);

  useEffect(() => {
    engineRef.current?.setTheme((resolvedTheme as Theme) ?? "dark");
  }, [resolvedTheme]);

  return (
    <canvas
      ref={ref}
      className="pointer-events-none absolute inset-0 z-0"
      aria-hidden="true"
    />
  );
}
