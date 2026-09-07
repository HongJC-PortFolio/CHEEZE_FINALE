import type { CreditRecord } from "./types";
import { STORAGE_KEY } from "./constants";

const SAMPLE_SENTENCES = [
  "작가 - 제목 - 설명",
  "오늘의 끝에서 새로운 시작이 열리는 순간을 느껴보았다.",
  "작은 다짐 하나가 어둠을 밝히는 법을 알게 되었다.",
  "우리는 서로의 이름을 기억하며 조금씩 더 선명해진다.",
  "한 번의 침묵이 오래된 마음을 다시 깨우는 밤이었다.",
  "어느새 우리의 하루가 별빛처럼 조용히 쌓여 있었다.",
  "기다림은 때로 가장 따뜻한 답이 될 수 있다는 걸 배웠다.",
  "길고 긴 겨울 끝에서 봄의 냄새가 먼저 피어났다.",
  "사소한 미소 하나가 하루의 무게를 덜어주었다.",
  "눈을 감으면 마음속에 남아 있던 오래된 노래가 들렸다.",
  "우연히 마주친 순간이 평생의 기억이 될 수 있음을 믿는다.",
  "모든 끝은 또 다른 문을 열어둔다는 사실을 기억하고 싶다.",
  "오늘의 나는 어제보다 조금 더 단단해진 기분이었다.",
  "한 줄의 메모가 내일의 나를 구해줄지도 모른다.",
  "가끔은 멈춰 서 있는 것이 가장 깊은 이동일 수 있다.",
  "손끝에서 느껴진 온기가 마음을 천천히 풀어주었다.",
  "사라진 것처럼 보였던 희망이 여전히 내 안에 있었다.",
  "이제는 두려움보다 감사가 먼저 마음에 올라온다.",
  "누군가의 말 한마디가 마음의 풍경을 바꾸었다.",
  "아무것도 하지 않아도 하루는 분명히 나를 품어주었다.",
  "우리의 삶은 생각보다 훨씬 더 많은 사랑으로 채워져 있다.",
  "조용한 시간 속에서도 충분히 빛날 수 있다는 걸 알았다.",
  "한 걸음씩 나아갈 때마다 세상이 조금씩 바뀐다.",
  "내일을 향해 걸어가고 있다는 사실만으로도 위로가 된다.",
  "어제의 흔적이 오늘의 나를 부드럽게 안아 주었다.",
  "내 안의 작은 불빛이 지금도 꺼지지 않았다는 걸 안다.",
  "모든 순간은 지나가지만 그 안의 의미는 남는다.",
  "누구도 모르게 우리 삶은 매일 조금씩 아름다워진다.",
  "한 번쯤은 자신을 믿어주는 시간도 필요하다고 느꼈다.",
  "아무 말 없이 함께 있어 주는 것만으로 충분했다.",
  "삶은 늘 예고 없이 가장 필요한 것을 건네준다.",
];

/**
 * localStorage에서 전체 기록을 불러온다.
 * - 저장된 값이 없으면 더미 기록을 생성해 저장한다.
 * - JSON 파싱에 실패하거나 형식이 배열이 아니면 더미 기록을 생성해 저장한다.
 * - 배열 내부 항목 중 형식이 올바르지 않은 항목은 걸러낸다.
 */
export function loadRecords(): CreditRecord[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedSampleRecords();

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return seedSampleRecords();

    const records = parsed.filter(isValidRecord);
    if (records.length === 0) return seedSampleRecords();

    return ensureMinimumSampleRecords(records);
  } catch (error) {
    // localStorage 파싱 오류: 콘솔에만 남기고 빈 목록으로 안전하게 폴백
    console.warn("[FINALE] 기록을 불러오는 중 오류가 발생했습니다.", error);
    return seedSampleRecords();
  }
}

function seedSampleRecords(): CreditRecord[] {
  const records = SAMPLE_SENTENCES.map((sentence, index) => ({
    id: `seed_${index + 1}`,
    sentence,
    createdAt: Date.now() - (SAMPLE_SENTENCES.length - index) * 1000,
  }));

  saveRecords(records);
  return records;
}

function ensureMinimumSampleRecords(records: CreditRecord[]): CreditRecord[] {
  if (records.length >= SAMPLE_SENTENCES.length) {
    return records;
  }

  const missingCount = SAMPLE_SENTENCES.length - records.length;
  const appended = SAMPLE_SENTENCES.slice(records.length, records.length + missingCount).map(
    (sentence, index) => ({
      id: `seed_${records.length + index + 1}`,
      sentence,
      createdAt: Date.now() - (missingCount - index) * 1000,
    })
  );

  const next = [...records, ...appended];
  saveRecords(next);
  return next;
}

/**
 * 전체 기록 배열을 localStorage에 저장한다.
 * 저장 공간 초과 등 예외 상황에서도 앱이 죽지 않도록 방어한다.
 */
export function saveRecords(records: CreditRecord[]): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    return true;
  } catch (error) {
    console.warn("[FINALE] 기록을 저장하는 중 오류가 발생했습니다.", error);
    return false;
  }
}

/**
 * 새 기록을 기존 목록 마지막에 추가하고 저장한다.
 * 기존 기록은 절대 삭제하지 않는다.
 */
export function appendRecord(
  records: CreditRecord[],
  sentence: string
): { records: CreditRecord[]; newRecord: CreditRecord } {
  const newRecord: CreditRecord = {
    id: createId(),
    sentence: sentence.trim(),
    createdAt: Date.now(),
  };
  const next = [...records, newRecord];
  saveRecords(next);
  return { records: next, newRecord };
}

/**
 * 개발/테스트 전용 초기화 함수.
 * 앱 실행 시 자동으로 호출되지 않는다. 필요할 때 브라우저 콘솔에서
 * `window.__finaleDevReset()` 형태로 직접 호출해서 사용한다. (main.tsx에서 등록)
 */
export function devResetRecords(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    console.info("[FINALE] 개발용 초기화 완료: 모든 기록이 삭제되었습니다.");
  } catch (error) {
    console.warn("[FINALE] 초기화 중 오류가 발생했습니다.", error);
  }
}

function isValidRecord(value: unknown): value is CreditRecord {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    typeof v.sentence === "string" &&
    v.sentence.trim().length > 0 &&
    typeof v.createdAt === "number"
  );
}

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `rec_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
