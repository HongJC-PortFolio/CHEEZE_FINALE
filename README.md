# FINALE — Input / Display

사진 동아리 전시회의 마지막 공간에서 관람객의 문장을 영화 엔딩 크레딧처럼
흘려보내는 참여형 미디어아트 프로젝트입니다.

이 브랜치는 입력용 노트북과 출력용 iMac을 분리하고, 입력된 메시지를 출력 화면에
실시간으로 전달하는 기능을 실험하기 위한 작업 브랜치입니다.

## 브랜치 의도

```text
입력 노트북
	→ 메시지 저장소 / 실시간 이벤트
	→ 출력용 iMac
	→ 엔딩 크레딧에 새 문장 합류
```

입력 화면과 출력 화면은 별도 애플리케이션으로 분리하지 않고, 하나의 프로젝트 안에서
역할별 화면으로 나누는 것을 기본 방향으로 합니다.

예상 화면:

- `/input`: 이름 또는 닉네임과 문장을 입력하는 화면
- `/display`: 크레딧만 표시하는 전시장 출력 화면

## 현재 상태

- 기준 코드: Version 8
- 현재 구현: 엔딩 크레딧, 닉네임 입력, `localStorage` 저장
- 구현 완료: 같은 노트북의 `/input`과 `/display` 탭 사이 실시간 통신
- 외부 저장소: Supabase Realtime 연동 코드와 테이블 정의 추가
- 실제 iPad 검증에 필요: Supabase 프로젝트 URL과 anon key
- 오디오: 저작권이 확인된 음원 파일을 추가하기 전까지 비활성 상태

Supabase 환경변수가 없으면 기존처럼 `BroadcastChannel`과 `localStorage`로 동작합니다.
환경변수를 설정하면 iPad 입력과 노트북 출력이 Supabase를 통해 연결됩니다.

## 작업 체크포인트

### Checkpoint 1 — 화면 역할 분리: `/input`은 노트북 입력 전용, `/display`는 iPad 출력 전용으로 구성했습니다.
### Checkpoint 2 — 닉네임 데이터: 닉네임과 메시지를 함께 입력하고 저장하도록 확장했습니다.
### Checkpoint 3 — 실시간 연결: Supabase Realtime과 로컬 탭 fallback으로 입력과 출력을 연결했습니다.
### Checkpoint 4 — 작품 연출: 새 메시지를 대기열에 두고 사이클 종료 후 다음 크레딧에 합류시켰습니다.
### Checkpoint 5 — 중앙 2열 배치: 닉네임은 왼쪽, 메시지는 오른쪽에 고정 열로 배치했습니다.
### Checkpoint 6 — 루프 안정화: 화면 크기와 그룹 높이를 기준으로 끊김 없는 반복 이동을 보강했습니다.
### Checkpoint 7 — 샘플 데이터: 폰트 확인용 한국어/영어 더미 데이터 10개를 유지합니다.
### Checkpoint 8 — 전시장 검증: 네트워크, 장시간 실행, 전체 화면 검증은 후순위로 남겨두었습니다.

## Supabase 설정

1. Supabase 프로젝트를 만든다.
2. [supabase/messages.sql](supabase/messages.sql)을 SQL Editor에서 실행한다.
3. `.env.example`을 `.env.local`로 복사한다.
4. `VITE_SUPABASE_URL`과 `VITE_SUPABASE_ANON_KEY`를 입력한다.
5. 개발 서버를 재시작한다.

```bash
cp .env.example .env.local
```

키가 없으면 외부 연동은 비활성화되고 로컬 탭 연동만 사용됩니다.

## 실행

```bash
npm install
npm run dev
```

빌드 검증:

```bash
npm run build
```

## 기본 원칙

- `main`은 Version 8 기준의 안정적인 전시 기준점으로 유지합니다.
- 이 브랜치에서는 실시간 입력/출력 연결에 집중합니다.
- 연출 변경은 데이터 연결이 안정된 뒤 별도 체크포인트로 실험합니다.
- 전시용 출력 화면은 네트워크 장애가 있어도 기존 메시지를 계속 보여줘야 합니다.

## 다음 작업

1. Supabase URL과 anon key를 설정한다.
2. iPad에서 `/input`, 노트북에서 `/display`를 열어 메시지를 주고받는다.
3. 루프 경계에서 속도와 위치가 튀지 않는지 수시로 확인한다.
4. 전시장 검증은 나중에 진행한다.
