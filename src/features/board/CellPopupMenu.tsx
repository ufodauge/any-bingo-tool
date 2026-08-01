import { useCallback, type ReactNode, type RefObject } from "react";

import { useMarkerColorsValue } from "../store/colors/colors";
import { useColorIndices, useSetColorIndices } from "../store/colors/indices";
import type { BoardCount } from "../store/schemas";

type Props = {
  index: number;
  boardIndex: BoardCount;
  popoverRef: RefObject<HTMLDivElement | null>;
  anchorName: string;
};

export const CellPopupMenu = ({ index, boardIndex, popoverRef, anchorName }: Props): ReactNode => {
  const setColorIndices = useSetColorIndices();
  const colorIndices = useColorIndices();
  const colors = useMarkerColorsValue();

  const colorIndex = colorIndices.at(boardIndex)?.at(index);

  const selectColor = useCallback(
    (value: number) => {
      setColorIndices({
        action: "set-value",
        index,
        boardIndex,
        value,
      });
    },
    [boardIndex, index, setColorIndices],
  );

  return (
    <div
      ref={popoverRef}
      popover="auto"
      className="rounded-box bg-base-100 outline-base-300 absolute bottom-2 cursor-auto p-2 shadow-lg outline-1"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.stopPropagation()}
      style={{
        positionAnchor: anchorName,
        positionArea: "top",
      }}
    >
      <div className="grid grid-cols-4 gap-1">
        <button
          type="button"
          className={`bg-base-100 size-8 shrink-0 cursor-pointer rounded-full border-2 border-neutral-300 ${colorIndex === 0 ? "ring-primary ring-2 ring-offset-1" : ""}`}
          onClick={() => selectColor(0)}
        />
        {colors.map((color, i) => (
          <button
            type="button"
            key={`color-${i}`}
            className={`size-8 shrink-0 cursor-pointer rounded-full border-2 border-neutral-300 ${
              colorIndex === i + 1 ? "ring-primary ring-2 ring-offset-1" : ""
            }`}
            style={{ backgroundColor: color }}
            onClick={() => selectColor(i + 1)}
          />
        ))}
      </div>
    </div>
  );
};
