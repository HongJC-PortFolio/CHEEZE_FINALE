/**
 * FINALE 프로젝트 공용 타입 정의
 */

/** 관람객이 남긴 한 줄 기록 */
export type CreditRecord = {
  id: string;
  nickname: string;
  sentence: string;
  createdAt: number;
};

/** 전체 화면 상태 흐름 */
export type ScreenState =
  | "credits" // 1. 일반 크레딧 재생 화면 (기본 상태)
  | "input" // 2. 기록 입력 화면
  | "highlight"; // 3~4. 등록 완료 후 강조 재생 (5.는 credits로 복귀)

/** 입력 화면에서 등록 시 발생하는 콜백 payload */
export type SubmitPayload = {
  nickname: string;
  sentence: string;
};
