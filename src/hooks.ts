import { useEffect, useRef, useState } from "react";
import { UI_IDLE_HIDE_MS } from "./constants";

/**
 * 사용자가 마우스를 움직이거나 화면을 터치했을 때만 true(활성)를 반환하고,
 * 일정 시간(timeoutMs) 조작이 없으면 다시 false(흐려짐)로 전환한다.
 * 촬영을 방해하지 않도록 기본 크레딧/강조 화면의 컨트롤 UI에 사용한다.
 */
export function useIdleVisibility(timeoutMs: number = UI_IDLE_HIDE_MS) {
  const [active, setActive] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const reveal = () => {
      setActive(true);
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
      timerRef.current = window.setTimeout(() => setActive(false), timeoutMs);
    };

    window.addEventListener("mousemove", reveal, { passive: true });
    window.addEventListener("touchstart", reveal, { passive: true });
    window.addEventListener("keydown", reveal);

    return () => {
      window.removeEventListener("mousemove", reveal);
      window.removeEventListener("touchstart", reveal);
      window.removeEventListener("keydown", reveal);
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, [timeoutMs]);

  return active;
}

/** 사용자의 prefers-reduced-motion 설정을 감지한다. */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);

    const handler = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener("change", handler);
    return () => query.removeEventListener("change", handler);
  }, []);

  return reduced;
}
