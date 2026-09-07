import { useEffect, useRef, useState } from "react";
import { AUDIO_DEFAULT_VOLUME, AUDIO_SRC } from "../constants";
import { useIdleVisibility } from "../hooks";

/**
 * 배경음악 컨트롤러.
 * - public/audio/finale-theme.mp3 파일이 존재하면 조용히 재생 구조를 활성화한다.
 * - 파일이 없어도 오류 없이 동작하며, 이 경우 버튼 자체를 렌더링하지 않는다.
 * - 브라우저 자동재생 제한을 고려해 최초 사용자 상호작용 이후에만 재생을 시도한다.
 */
export default function AudioController() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [muted, setMuted] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const active = useIdleVisibility();

  useEffect(() => {
    const audio = new Audio(AUDIO_SRC);
    audio.loop = true;
    audio.volume = AUDIO_DEFAULT_VOLUME;
    audio.preload = "auto";
    audioRef.current = audio;

    const handleError = () => setAvailable(false);
    const handleCanPlay = () => setAvailable(true);

    audio.addEventListener("error", handleError);
    audio.addEventListener("canplaythrough", handleCanPlay);

    return () => {
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("canplaythrough", handleCanPlay);
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!available || hasStarted) return;

    const tryStart = () => {
      const audio = audioRef.current;
      if (!audio) return;
      audio
        .play()
        .then(() => setHasStarted(true))
        .catch(() => {
          // 자동재생 정책으로 거부될 수 있음 — 다음 상호작용에서 다시 시도
        });
    };

    window.addEventListener("click", tryStart, { once: true });
    window.addEventListener("touchstart", tryStart, { once: true });

    return () => {
      window.removeEventListener("click", tryStart);
      window.removeEventListener("touchstart", tryStart);
    };
  }, [available, hasStarted]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = muted;
  }, [muted]);

  if (!available) return null; // 오디오 파일이 없으면 컨트롤 자체를 표시하지 않는다

  return (
    <button
      className={`audio-btn${active ? " audio-btn--active" : ""}`}
      onClick={() => setMuted((m) => !m)}
      aria-label={muted ? "음악 켜기" : "음소거"}
    >
      {muted ? "🔇" : "🔊"}
    </button>
  );
}
