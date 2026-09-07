import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { CreditRecord, ScreenState } from "./types";
import { appendRecord, loadRecords } from "./storage";
import { usePrefersReducedMotion } from "./hooks";
import CreditScreen from "./components/CreditScreen";
import SentenceInputScreen from "./components/SentenceInputScreen";
import LatestRecordHighlight from "./components/LatestRecordHighlight";

export default function App() {
  const [records, setRecords] = useState<CreditRecord[]>(() => loadRecords());
  const [screenState, setScreenState] = useState<ScreenState>("credits");
  const [pendingRecord, setPendingRecord] = useState<CreditRecord | null>(null);
  const [emphasizeId, setEmphasizeId] = useState<string | null>(null);
  const reducedMotion = usePrefersReducedMotion();

  const overlayOpen = screenState !== "credits";
  const fadeDuration = reducedMotion ? 0.15 : 1.1; // 800~1500ms 권장 구간

  const openInput = useCallback(() => setScreenState("input"), []);
  const cancelInput = useCallback(() => setScreenState("credits"), []);

  const submitSentence = useCallback(
    (sentence: string) => {
      // 1. 현재 크레딧 애니메이션 상태는 CreditScreen이 계속 마운트된 채 유지된다 (pause만 됨)
      // 2~3. 입력 화면에서 문장 등록
      const { records: next, newRecord } = appendRecord(records, sentence);
      setRecords(next); // 5. 기록 목록 마지막에 새 기록 추가
      setPendingRecord(newRecord);
      setScreenState("highlight"); // 4. 최신 기록 중앙 강조
    },
    [records]
  );

  const handleHighlightComplete = useCallback(() => {
    if (pendingRecord) setEmphasizeId(pendingRecord.id); // 6. 강조 위치에서 크레딧 재생
    setPendingRecord(null);
    setScreenState("credits");
  }, [pendingRecord]);

  const clearEmphasize = useCallback(() => setEmphasizeId(null), []); // 7. 다음 반복부터 정상 포함

  return (
    <div className="finale-app">
      <CreditScreen
        records={records}
        emphasizeId={emphasizeId}
        onEmphasizeConsumed={clearEmphasize}
        onOpenInput={openInput}
        paused={overlayOpen}
        reducedMotion={reducedMotion}
      />

      <AnimatePresence mode="wait">
        {screenState === "input" && (
          <motion.div
            key="input"
            className="overlay-layer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: fadeDuration, ease: "easeInOut" }}
          >
            <SentenceInputScreen onSubmit={submitSentence} onCancel={cancelInput} />
          </motion.div>
        )}

        {screenState === "highlight" && pendingRecord && (
          <motion.div
            key="highlight"
            className="overlay-layer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: fadeDuration, ease: "easeInOut" }}
          >
            <LatestRecordHighlight
              record={pendingRecord}
              reducedMotion={reducedMotion}
              onComplete={handleHighlightComplete}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
