import type { CreditRecord } from "../types";
import CreditRoll from "./CreditRoll";
import HiddenControls from "./HiddenControls";
import AudioController from "./AudioController";

type CreditScreenProps = {
  records: CreditRecord[];
  emphasizeId: string | null;
  onEmphasizeConsumed: () => void;
  onOpenInput: () => void;
  paused: boolean;
  reducedMotion: boolean;
};

export default function CreditScreen({
  records,
  emphasizeId,
  onEmphasizeConsumed,
  onOpenInput,
  paused,
  reducedMotion,
}: CreditScreenProps) {
  return (
    <div className="credit-screen">
      <CreditRoll
        records={records}
        emphasizeId={emphasizeId}
        onEmphasizeConsumed={onEmphasizeConsumed}
        paused={paused}
        reducedMotion={reducedMotion}
      />
      <HiddenControls onOpenInput={onOpenInput} />
      <AudioController />
    </div>
  );
}
