import { useMemo, useRef } from "react";
import type { CreditRecord } from "../types";
import { useCreditScroll } from "../animation";
import CreditItem from "./CreditItem";

type CreditRollProps = {
  records: CreditRecord[];
  /** 첫 바퀴 동안 강조 표시할 최신 기록 id (없으면 null) */
  emphasizeId: string | null;
  /** 강조 대상이 한 바퀴를 완전히 돌고 나면 호출되어 강조를 해제한다 */
  onEmphasizeConsumed: () => void;
  /** 입력/강조 화면이 열려 있는 동안 스크롤을 일시 정지 */
  paused: boolean;
  reducedMotion: boolean;
  showTitle: boolean;
};

const EMPTY_MESSAGE = "당신의 한 문장으로\nFINALE를 시작해주세요.";

export default function CreditRoll({
  records,
  emphasizeId,
  onEmphasizeConsumed,
  paused,
  reducedMotion,
  showTitle,
}: CreditRollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);

  // 기록 배열 참조가 새로 등록될 때만 바뀌도록 메모이제이션 (불필요한 리렌더링 방지)
  const items = useMemo(() => records, [records]);

  useCreditScroll(containerRef, listRef, {
    itemCount: items.length,
    reducedMotion,
    paused,
    onLoopRestart: onEmphasizeConsumed,
    spotlightTargetRef: emphasizeId ? spotlightRef : undefined,
  });

  if (items.length === 0) {
    return (
      <div className="credit-empty" role="status">
        {EMPTY_MESSAGE.split("\n").map((line, i) => (
          <span key={i}>{line}</span>
        ))}
      </div>
    );
  }

  const duplicationCount = items.length <= 2 ? 6 : 3;

  return (
    <div className="credit-roll" ref={containerRef} aria-live="off">
      <div className="credit-roll__track" ref={listRef} style={{ willChange: "transform" }}>
        {Array.from({ length: duplicationCount }, (_, groupIndex) => (
          <div
            key={`credit-group-${groupIndex}`}
            className="credit-roll__group"
            aria-hidden={groupIndex > 0}
          >
            {showTitle && (
              <div className="credit-roll__title" aria-hidden={groupIndex > 0}>
                FINALE; TUNE A
              </div>
            )}
            {items.map((record) => {
              const isEmphasized = record.id === emphasizeId;
              return (
                <CreditItem
                  key={`${groupIndex}-${record.id}`}
                  record={record}
                  isEmphasized={isEmphasized}
                  ref={isEmphasized ? spotlightRef : undefined}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
