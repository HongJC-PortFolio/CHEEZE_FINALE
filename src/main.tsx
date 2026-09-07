import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { devResetRecords } from "./storage";

// 개발/테스트 전용: 브라우저 콘솔에서 window.__finaleDevReset() 호출 시 모든 기록 삭제.
// 앱 실행 시 자동으로 호출되지 않는다.
declare global {
  interface Window {
    __finaleDevReset?: () => void;
  }
}
window.__finaleDevReset = devResetRecords;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
