import { memo } from "react";

import { IconAdd } from "../libs/icons/Add";
import { IconRefresh } from "../libs/icons/Refresh";
import { IconRemove } from "../libs/icons/Remove";
import { useCustomPoint, useSetCustomPoints } from "./store/customPoints";

type Props = {
  boardIndex: number;
};

export const CustomPointCounter = memo(function CustomPointCounter({ boardIndex }: Props) {
  const point = useCustomPoint(boardIndex);
  const setCustomPoints = useSetCustomPoints();

  return (
    <>
      <div className="join ml-auto" role="group" aria-label="得点" title="得点">
        <button
          type="button"
          className="btn join-item btn-primary btn-xs"
          aria-label="得点を1減らす"
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
          aria-label="得点を1増やす"
          onClick={() => setCustomPoints({ action: "add", boardIndex, delta: 1 })}
        >
          <span className="size-4 fill-current">
            <IconAdd />
          </span>
        </button>
      </div>
      <div>
        <button
          type="button"
          className="btn btn-primary btn-xs"
          aria-label="得点をリセットする"
          onClick={() => setCustomPoints({ action: "reset-board", boardIndex })}
        >
          <span className="size-4 fill-current">
            <IconRefresh />
          </span>
        </button>
      </div>
    </>
  );
});
