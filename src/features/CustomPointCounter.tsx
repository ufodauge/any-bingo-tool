import { memo } from "react";

import { IconAdd } from "../libs/icons/Add";
import { IconRemove } from "../libs/icons/Remove";
import { useCustomPoint, useSetCustomPoints } from "./store/customPoints";

type Props = {
  boardIndex: number;
};

export const CustomPointCounter = memo(function CustomPointCounter({ boardIndex }: Props) {
  const point = useCustomPoint(boardIndex);
  const setCustomPoints = useSetCustomPoints();

  return (
    <div className="join ml-auto" role="group" aria-label="独自得点" title="独自得点">
      <button
        type="button"
        className="btn join-item btn-primary btn-xs"
        aria-label="独自得点を1減らす"
        onClick={() => setCustomPoints({ action: "add", boardIndex, delta: -1 })}
      >
        <span className="size-4 fill-current">
          <IconRemove />
        </span>
      </button>
      <output className="join-item border-base-300 bg-base-100 grid min-w-10 place-items-center px-2 text-sm font-bold tabular-nums">
        {point}
      </output>
      <button
        type="button"
        className="btn join-item btn-primary btn-xs"
        aria-label="独自得点を1増やす"
        onClick={() => setCustomPoints({ action: "add", boardIndex, delta: 1 })}
      >
        <span className="size-4 fill-current">
          <IconAdd />
        </span>
      </button>
    </div>
  );
});
