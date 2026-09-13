import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { SENTENCE_MAX_LENGTH, SENTENCE_MIN_LENGTH } from "../constants";

type SentenceInputScreenProps = {
  onSubmit: (nickname: string, sentence: string) => void;
  onCancel: () => void;
};

export default function SentenceInputScreen({ onSubmit, onCancel }: SentenceInputScreenProps) {
  const [nickname, setNickname] = useState("");
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const isSubmittingRef = useRef(false);

  const trimmedLength = value.trim().length;
  const trimmedNickname = nickname.trim();
  const isValid = trimmedLength >= SENTENCE_MIN_LENGTH && trimmedLength <= SENTENCE_MAX_LENGTH;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isSubmittingRef.current) return; // 중복 클릭 방지

    const trimmed = value.trim();
    if (trimmedNickname.length === 0) {
      setError("닉네임을 남겨주세요.");
      return;
    }
    if (trimmed.length === 0) {
      setError("공백만으로는 남길 수 없어요.");
      return;
    }
    if (trimmed.length < SENTENCE_MIN_LENGTH) {
      setError(`최소 ${SENTENCE_MIN_LENGTH}자 이상 적어주세요.`);
      return;
    }
    if (trimmed.length > SENTENCE_MAX_LENGTH) {
      setError(`최대 ${SENTENCE_MAX_LENGTH}자까지 남길 수 있어요.`);
      return;
    }

    isSubmittingRef.current = true;
    onSubmit(trimmedNickname, trimmed);
  };

  return (
    <div className="input-screen">
      <button className="input-screen__back" onClick={onCancel} aria-label="뒤로가기">
        ← 뒤로가기
      </button>

      <div className="input-screen__body">
        <p className="input-screen__question">지금의 당신을 위한 한 문장을 남겨주세요.</p>

        <form className="input-screen__form" onSubmit={handleSubmit}>
          <input
            autoFocus
            className="input-screen__field"
            type="text"
            value={nickname}
            maxLength={30}
            placeholder="닉네임을 남겨주세요."
            onChange={(e) => {
              setNickname(e.target.value);
              if (error) setError(null);
            }}
          />

          <input
            className="input-screen__field"
            type="text"
            value={value}
            maxLength={SENTENCE_MAX_LENGTH + 20}
            placeholder="예) 천천히 가도 괜찮아."
            onChange={(e) => {
              setValue(e.target.value);
              if (error) setError(null);
            }}
          />

          <div className="input-screen__meta">
            <span className={trimmedLength > SENTENCE_MAX_LENGTH ? "input-screen__count--over" : ""}>
              {trimmedLength} / {SENTENCE_MAX_LENGTH}
            </span>
          </div>

          {error && <p className="input-screen__error">{error}</p>}

          <button type="submit" className="input-screen__submit" disabled={!isValid}>
            기록 남기기
          </button>
        </form>
      </div>
    </div>
  );
}
