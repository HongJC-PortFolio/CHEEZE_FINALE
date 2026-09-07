import { useEffect, useState } from "react";
import type { CreditRecord } from "../types";
import {
  HIGHLIGHT_FADE_IN_MS,
  HIGHLIGHT_HOLD_MS,
  HIGHLIGHT_TRANSITION_MS,
} from "../constants";

type Phase = "enter" | "hold" | "exit";

type LatestRecordHighlightProps = {
  record: CreditRecord;
  reducedMotion: boolean;
  /** 강조 연출이 모두 끝나면 호출 (크레딧 화면으로 복귀 트리거) */
  onComplete: () => void;
};

/**
 * 등록 직후 재생되는 포토존 강조 화면.
 * 1) 검은 화면에서 문장이 천천히 페이드인
 * 2) 5~8초간 유지 (촬영 시간)
 * 3) 문장이 크레딧 목록 쪽으로 흘러가듯 아래로 이동하며 페이드아웃
 */
export default function LatestRecordHighlight({
  record,
  reducedMotion,
  onComplete,
}: LatestRecordHighlightProps) {
  const [phase, setPhase] = useState<Phase>("enter");

  const fadeInMs = reducedMotion ? Math.min(HIGHLIGHT_FADE_IN_MS, 600) : HIGHLIGHT_FADE_IN_MS;
  const holdMs = HIGHLIGHT_HOLD_MS;
  const transitionMs = reducedMotion
    ? Math.min(HIGHLIGHT_TRANSITION_MS, 600)
    : HIGHLIGHT_TRANSITION_MS;

  useEffect(() => {
    // 다음 프레임에 'hold'로 전환해 CSS transition이 실제로 재생되도록 한다.
    const raf = requestAnimationFrame(() => setPhase("hold"));

    const toExit = window.setTimeout(() => setPhase("exit"), fadeInMs + holdMs);
    const complete = window.setTimeout(
      () => onComplete(),
      fadeInMs + holdMs + transitionMs
    );

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(toExit);
      window.clearTimeout(complete);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="highlight-screen">
      <div
        className={`highlight-sentence highlight-sentence--${phase}`}
        style={
          {
            "--fade-in-ms": `${fadeInMs}ms`,
            "--transition-ms": `${transitionMs}ms`,
          } as React.CSSProperties
        }
      >
        {record.sentence}
      </div>
    </div>
  );
}
