import type { CreditRecord } from "./types";
import { STORAGE_KEY } from "./constants";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const RECORD_CHANNEL_NAME = "finale-credit-records";

const SAMPLE_SENTENCES = [
  "Artist - Title - Description",
  "조용한 시간 속에서도 충분히 빛날 수 있다는 걸 알았다.",
  "The ending is quiet, but it stays with me.",
  "한 걸음씩 나아갈 때마다 세상이 조금씩 바뀐다.",
  "I found a new beginning inside this final scene.",
  "내일을 향해 걸어가고 있다는 사실만으로도 위로가 된다.",
  "Some memories keep moving after the image fades.",
  "어제의 흔적이 오늘의 나를 부드럽게 안아 주었다.",
  "Tonight, I leave one small light behind.",
  "내 안의 작은 불빛이 지금도 꺼지지 않았다는 걸 안다.",
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

    return ensureMinimumSampleRecords(records).sort(sortNewestFirst);
  } catch (error) {
    // localStorage 파싱 오류: 콘솔에만 남기고 빈 목록으로 안전하게 폴백
    console.warn("[FINALE] 기록을 불러오는 중 오류가 발생했습니다.", error);
    return seedSampleRecords();
  }
}

function seedSampleRecords(): CreditRecord[] {
  const records = SAMPLE_SENTENCES.map((sentence, index) => ({
    id: `seed_${index + 1}`,
    nickname: "FINALE",
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
      nickname: "FINALE",
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
  nickname: string,
  sentence: string
): { records: CreditRecord[]; newRecord: CreditRecord } {
  const newRecord: CreditRecord = {
    id: createId(),
    nickname: nickname.trim(),
    sentence: sentence.trim(),
    createdAt: Date.now(),
  };
  const next = [...records, newRecord];
  saveRecords(next);
  broadcastRecord(newRecord);
  void saveRecordRemotely(newRecord);
  return { records: next, newRecord };
}

export async function loadRecordsRemotely(): Promise<CreditRecord[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  const { data, error } = await client
    .from("messages")
    .select("id, nickname, sentence, created_at")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("[FINALE] 외부 기록을 불러오지 못했습니다.", error);
    return null;
  }

  return data.map(toCreditRecord).filter(isValidRecord).sort(sortNewestFirst);
}

/**
 * 같은 브라우저의 다른 탭에 새 기록을 전달한다.
 * BroadcastChannel을 지원하지 않는 브라우저에서는 localStorage 이벤트를 사용한다.
 */
export function subscribeToRecordUpdates(onRecord: (record: CreditRecord) => void): () => void {
  const channel = createRecordChannel();
  const supabase = getSupabaseClient();
  const remoteChannel = supabase
    ?.channel("finale-messages")
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
      const record = toCreditRecord(payload.new as RemoteMessage);
      if (isValidRecord(record)) onRecord(record);
    })
    .subscribe();
  const handleChannelMessage = (event: MessageEvent<unknown>) => {
    if (isValidRecord(event.data)) onRecord(event.data);
  };
  const handleStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY || !event.newValue) return;

    try {
      const parsed: unknown = JSON.parse(event.newValue);
      if (Array.isArray(parsed)) {
        parsed.filter(isValidRecord).forEach(onRecord);
      }
    } catch {
      // 다른 탭의 잘못된 저장값은 현재 화면을 중단시키지 않는다.
    }
  };

  channel?.addEventListener("message", handleChannelMessage);
  window.addEventListener("storage", handleStorage);

  return () => {
    channel?.removeEventListener("message", handleChannelMessage);
    channel?.close();
    if (remoteChannel) void supabase?.removeChannel(remoteChannel);
    window.removeEventListener("storage", handleStorage);
  };
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
    typeof v.nickname === "string" &&
    typeof v.sentence === "string" &&
    v.sentence.trim().length > 0 &&
    typeof v.createdAt === "number"
  );
}

function sortNewestFirst(left: CreditRecord, right: CreditRecord): number {
  return right.createdAt - left.createdAt;
}

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `rec_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function broadcastRecord(record: CreditRecord): void {
  const channel = createRecordChannel();
  if (!channel) return;
  channel.postMessage(record);
  channel.close();
}

function createRecordChannel(): BroadcastChannel | null {
  if (typeof BroadcastChannel === "undefined") return null;
  return new BroadcastChannel(RECORD_CHANNEL_NAME);
}

type RemoteMessage = {
  id: string;
  nickname: string;
  sentence: string;
  created_at: string;
};

function toCreditRecord(message: RemoteMessage): CreditRecord {
  return {
    id: message.id,
    nickname: message.nickname,
    sentence: message.sentence,
    createdAt: new Date(message.created_at).getTime(),
  };
}

async function saveRecordRemotely(record: CreditRecord): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  const { error } = await client.from("messages").insert({
    id: record.id,
    nickname: record.nickname,
    sentence: record.sentence,
    status: "approved",
  });

  if (error) console.warn("[FINALE] 외부 기록 저장에 실패했습니다.", error);
}

function getSupabaseClient(): SupabaseClient | null {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}
