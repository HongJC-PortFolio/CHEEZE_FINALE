# FINALE — 사진전 엔딩 크레딧 웹 서비스

검은 배경 위에서 관람객이 남긴 문장이 영화 엔딩 크레딧처럼 무한 반복 재생되는
참여형 미디어아트 웹 서비스입니다. 백엔드 없이 React + TypeScript + Vite +
localStorage로 동작합니다.

## 실행 방법

```bash
npm install
npm run dev       # 개발 서버 (http://localhost:5173)
```

## 빌드 및 배포용 미리보기

```bash
npm run build      # dist/ 생성, 타입 오류 검사 포함 (tsc -b && vite build)
npm run preview     # 빌드 결과 로컬 확인
```

빔프로젝터에 연결한 노트북의 Chrome에서 `npm run preview` 또는 정적 호스팅한
`dist/` 결과물을 전체 화면(F11)으로 열어 사용합니다.

## 배경음악 (선택)

`public/audio/finale-theme.mp3` 경로에 저작권이 확인된 음원 파일을 넣으면
자동으로 재생 컨트롤이 나타납니다. 파일이 없으면 오류 없이 조용히 비활성화됩니다.

## 개발용 기록 초기화

앱은 실행할 때마다 자동으로 기록을 지우지 않습니다. 테스트 중 데이터를 지우고
싶다면 브라우저 콘솔에서 아래 명령을 직접 실행하세요.

```js
window.__finaleDevReset()
```
