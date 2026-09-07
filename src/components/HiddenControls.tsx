import { useIdleVisibility } from "../hooks";

type HiddenControlsProps = {
  onOpenInput: () => void;
};

export default function HiddenControls({ onOpenInput }: HiddenControlsProps) {
  const active = useIdleVisibility();

  return (
    <button
      className={`leave-sentence-btn${active ? " leave-sentence-btn--active" : ""}`}
      onClick={onOpenInput}
    >
      문장 남기기
    </button>
  );
}
