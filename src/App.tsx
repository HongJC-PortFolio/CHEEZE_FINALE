import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { CreditRecord, ScreenState } from "./types";
import {
  appendRecord,
  loadRecords,
  loadRecordsRemotely,
  subscribeToRecordUpdates,
} from "./storage";
import { usePrefersReducedMotion } from "./hooks";
import CreditScreen from "./components/CreditScreen";
import SentenceInputScreen from "./components/SentenceInputScreen";

export default function App() {
  const inputMode = window.location.pathname === "/input";
  const displayMode = window.location.pathname === "/" || window.location.pathname === "/display";
  const [records, setRecords] = useState<CreditRecord[]>(() => loadRecords());
  const [screenState, setScreenState] = useState<ScreenState>("credits");
  const [inputResetKey, setInputResetKey] = useState(0);
  const [showTitle, setShowTitle] = useState(true);
  const recordsRef = useRef(records);
  const pendingRecordsRef = useRef<CreditRecord[]>([]);
  const reducedMotion = usePrefersReducedMotion();

  const overlayOpen = screenState !== "credits";
  const fadeDuration = reducedMotion ? 0.15 : 1.1; // 800~1500ms 권장 구간

  const openInput = useCallback(() => setScreenState("input"), []);
  const cancelInput = useCallback(() => setScreenState("credits"), []);

  const flushPendingRecords = useCallback(() => {
    if (pendingRecordsRef.current.length === 0) return;

    const pendingRecords = pendingRecordsRef.current;
    pendingRecordsRef.current = [];
    setRecords((current) => {
      const existingIds = new Set(current.map((record) => record.id));
      const newRecords = pendingRecords.filter((record) => !existingIds.has(record.id));
      if (newRecords.length === 0) return current;
      const next = [...newRecords].reverse().concat(current);
      recordsRef.current = next;
      return next;
    });
  }, []);

  const handleLoopRestart = useCallback(() => {
    setShowTitle(true);
    flushPendingRecords();
  }, [flushPendingRecords]);

  useEffect(() => {
    recordsRef.current = records;
  }, [records]);

  useEffect(() => {
    void loadRecordsRemotely().then((remoteRecords) => {
      if (!remoteRecords) return;
      recordsRef.current = remoteRecords;
      setRecords(remoteRecords);
    });
  }, []);

  useEffect(() => {
    return subscribeToRecordUpdates((newRecord) => {
      if (
        !displayMode ||
        recordsRef.current.some((record) => record.id === newRecord.id) ||
        pendingRecordsRef.current.some((record) => record.id === newRecord.id)
      ) {
        return;
      }

      pendingRecordsRef.current.push(newRecord);
    });
  }, [displayMode]);

  const submitSentence = useCallback(
    (nickname: string, sentence: string) => {
      // 1. 현재 크레딧 애니메이션 상태는 CreditScreen이 계속 마운트된 채 유지된다 (pause만 됨)
      // 2~3. 입력 화면에서 문장 등록
      const { records: next } = appendRecord(records, nickname, sentence);
      recordsRef.current = next;
      setRecords(next); // 5. 기록 목록 마지막에 새 기록 추가
      if (inputMode) {
        setInputResetKey((current) => current + 1);
        return;
      }
    },
    [inputMode, records]
  );

  return (
    <div className="finale-app">
      {inputMode ? (
        <SentenceInputScreen key={inputResetKey} onSubmit={submitSentence} onCancel={() => {}} />
      ) : (
        <CreditScreen
          records={records}
          emphasizeId={null}
          onEmphasizeConsumed={handleLoopRestart}
          onOpenInput={openInput}
          paused={overlayOpen}
          reducedMotion={reducedMotion}
          showInputControl={false}
          showTitle={showTitle}
        />
      )}

      <AnimatePresence mode="wait">
        {!inputMode && screenState === "input" && (
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

      </AnimatePresence>
    </div>
  );
}
