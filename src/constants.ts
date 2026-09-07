/**
 * FINALE 프로젝트 전역 상수
 */

/** localStorage 저장 키 */
export const STORAGE_KEY = "finale-credit-records";

/** 크레딧 스크롤 속도 (px/s). 문장이 많아져도 이 속도는 항상 동일하게 유지된다. */
export const PIXELS_PER_SECOND = 30;

/** 문장 사이 세로 간격 (px) */
export const ITEM_GAP_MIN = 90;
export const ITEM_GAP_MAX = 150;
export const ITEM_GAP_DEFAULT = 120;

/** 한 바퀴가 끝난 뒤 다음 바퀴 시작 전 검은 여백 유지 시간 (ms) */
export const LOOP_PAUSE_MS = 3000;

/** 문장 입력 제약 */
export const SENTENCE_MIN_LENGTH = 2;
export const SENTENCE_MAX_LENGTH = 60;

/** 최신 기록 강조 단계별 타이밍 (ms) */
export const HIGHLIGHT_FADE_IN_MS = 2000; // 검은 화면 → 문장 등장
export const HIGHLIGHT_HOLD_MS = 6500; // 강조 상태 유지 (5~8초 권장 구간의 중간값)
export const HIGHLIGHT_TRANSITION_MS = 1800; // 크레딧 마지막 위치로 이동하는 전환

/** 크레딧 안에서 최신 기록이 화면 중앙 부근을 지날 때 느려지는 구간 지속 시간 (ms) */
export const SPOTLIGHT_SLOWDOWN_MS = 4000;
export const SPOTLIGHT_SLOWDOWN_FACTOR = 0.35; // 1.0 = 정상 속도, 낮을수록 느려짐

/** UI 자동 숨김: 조작 없을 때 흐려지기까지의 시간 (ms) */
export const UI_IDLE_HIDE_MS = 3000;

/** 오디오 */
export const AUDIO_SRC = "/audio/finale-theme.mp3";
export const AUDIO_DEFAULT_VOLUME = 0.25;

/** 배경색 (완전한 검정에 가까운 톤) */
export const BG_COLOR = "#030303";
