import { forwardRef } from "react";
import type { CreditRecord } from "../types";

type CreditItemProps = {
  record: CreditRecord;
  /** 방금 등록되어 아직 첫 바퀴를 돌지 않은 최신 기록인지 여부 */
  isEmphasized: boolean;
};

/**
 * 크레딧 목록의 한 줄. 박스/카드/테두리 없이 텍스트만 표시한다.
 * isEmphasized일 때만 살짝 더 밝고 크게, "방금 남긴 문장" 라벨을 함께 보여준다.
 */
const CreditItem = forwardRef<HTMLDivElement, CreditItemProps>(
  ({ record, isEmphasized }, ref) => {
    return (
      <div
        ref={ref}
        className={`credit-item${isEmphasized ? " credit-item--emphasized" : ""}`}
      >
        {isEmphasized && <span className="credit-item__label">방금 남긴 문장</span>}
        <p className="credit-item__sentence">{record.sentence}</p>
      </div>
    );
  }
);

CreditItem.displayName = "CreditItem";

export default CreditItem;
