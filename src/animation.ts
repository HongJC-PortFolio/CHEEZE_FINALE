import { useEffect, useRef } from "react";
import {
  PIXELS_PER_SECOND,
  SPOTLIGHT_SLOWDOWN_FACTOR,
  SPOTLIGHT_SLOWDOWN_MS,
} from "./constants";

type UseCreditScrollOptions = {
  /** 리스트 항목 개수가 바뀌면(새 기록 추가) 다시 측정한다 */
  itemCount: number;
  /** 사용자가 prefers-reduced-motion을 설정했다면 속도를 낮춘다 */
  reducedMotion: boolean;
  /** 스크롤을 잠시 멈출지 여부 (입력/강조 화면이 떠 있을 때) */
  paused: boolean;
  /** 한 바퀴가 완전히 끝나고 처음 위치로 복귀할 때마다 호출된다 */
  onLoopRestart?: () => void;
  /** 이 노드가 화면 중앙 근처를 지날 때 아주 약하게 속도를 늦춘다 (최신 기록 스포트라이트) */
  spotlightTargetRef?: React.RefObject<HTMLElement | null>;
};

/**
 * 영화 엔딩 크레딧처럼 리스트를 위→아래로 무한 반복 이동시키는 훅.
 *
 * 동일한 목록을 여러 세트로 복제한 무한 트랙을 사용한다. 트랙은
 * transform: translate3d()로 이동하고, 한 세트의 높이만큼 진행한 뒤
 * 즉시 한 세트 높이만큼 되돌려 반복 경계에서 화면이 점프하지 않도록 한다.
 */
export function useCreditScroll(
  containerRef: React.RefObject<HTMLDivElement | null>,
  listRef: React.RefObject<HTMLDivElement | null>,
  options: UseCreditScrollOptions
) {
  const { itemCount, reducedMotion, paused, onLoopRestart, spotlightTargetRef } = options;

  const positionRef = useRef(0);
  const speedFactorRef = useRef(1);
  const rafIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const contentHeightRef = useRef(0);
  const initializedRef = useRef(false);

  const onLoopRestartRef = useRef(onLoopRestart);
  onLoopRestartRef.current = onLoopRestart;

  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  useEffect(() => {
    const container = containerRef.current;
    const list = listRef.current;
    if (!container || !list) return;

    const measure = () => {
      const prevContentHeight = contentHeightRef.current;
      const firstGroup = list.firstElementChild as HTMLElement | null;
      const nextContentHeight = firstGroup?.getBoundingClientRect().height ?? list.getBoundingClientRect().height;

      contentHeightRef.current = nextContentHeight;

      if (!initializedRef.current && nextContentHeight > 0) {
        positionRef.current = 0;
        initializedRef.current = true;
      } else if (prevContentHeight > 0 && nextContentHeight > 0 && prevContentHeight !== nextContentHeight) {
        const ratio = prevContentHeight > 0 ? positionRef.current / prevContentHeight : 0;
        positionRef.current = ratio * nextContentHeight;
      }

      if (positionRef.current < 0) positionRef.current = 0;
      if (positionRef.current > nextContentHeight) positionRef.current = nextContentHeight;
    };

    measure();

    const resizeObserver = new ResizeObserver(measure);
    if (list.firstElementChild) resizeObserver.observe(list.firstElementChild as Element);
    resizeObserver.observe(container);
    window.addEventListener("resize", measure);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [containerRef, listRef, itemCount]);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const baseSpeed = reducedMotion ? PIXELS_PER_SECOND * 0.6 : PIXELS_PER_SECOND;

    const tick = (time: number) => {
      rafIdRef.current = requestAnimationFrame(tick);

      if (lastTimeRef.current === null) {
        lastTimeRef.current = time;
        return;
      }

      const dt = Math.min((time - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = time;

      if (pausedRef.current) return;

      let targetFactor = 1;
      const spotlightEl = spotlightTargetRef?.current;
      if (spotlightEl && !reducedMotion) {
        const rect = spotlightEl.getBoundingClientRect();
        const elCenter = rect.top + rect.height / 2;
        const viewportCenter = window.innerHeight / 2;
        const distance = Math.abs(elCenter - viewportCenter);
        const threshold = window.innerHeight * 0.28;
        if (distance < threshold) {
          targetFactor = SPOTLIGHT_SLOWDOWN_FACTOR;
        }
      }

      speedFactorRef.current += (targetFactor - speedFactorRef.current) * 0.08;

      const nextPosition = positionRef.current + baseSpeed * speedFactorRef.current * dt;
      const listHeight = contentHeightRef.current;

      if (listHeight > 0) {
        if (nextPosition >= listHeight) {
          positionRef.current = nextPosition - listHeight;
          onLoopRestartRef.current?.();
        } else {
          positionRef.current = nextPosition;
        }
      } else {
        positionRef.current = 0;
      }

      list.style.transform = `translate3d(0, ${-positionRef.current}px, 0)`;
    };

    rafIdRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
      lastTimeRef.current = null;
    };
  }, [containerRef, listRef, reducedMotion, spotlightTargetRef]);
}

/** SPOTLIGHT_SLOWDOWN_MS는 문서화/향후 튜닝용으로 export만 유지 (현재는 거리 기반으로 동작) */
export const SPOTLIGHT_DURATION_HINT_MS = SPOTLIGHT_SLOWDOWN_MS;
