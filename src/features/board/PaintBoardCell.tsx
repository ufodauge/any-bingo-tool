import { type ReactNode, useCallback } from "react";

import type { BoardCell as BoardCellType } from "../store/board";
import {
  CONCEALED_COLOR,
  useDefaultMarkerColorOption,
  usePaletteValue,
} from "../store/colors/colors";
import { useColorIndices, useSetColorIndices } from "../store/colors/indices";
import type { BoardCount } from "../store/schemas";
import { CellPopupMenu } from "./CellPopupMenu";

type Props = {
  cell: BoardCellType;
  index: number;
  className?: string;
  boardIndex: BoardCount;
  cells: readonly BoardCellType[];
  currentColorIndex: number;
};

export const PaintBoardCell = ({
  cell,
  index,
  className,
  boardIndex,
  cells,
  currentColorIndex,
}: Props): ReactNode => {
  const colorIndices = useColorIndices();
  const palette = usePaletteValue();
  const options = useDefaultMarkerColorOption();
  const setColorIndices = useSetColorIndices();

  const colorIndex = colorIndices.at(boardIndex)?.at(index);
  // 隠すモードで、まだ中身を見せていない状態か
  const concealed = (options.hiddenBoardBits & (1 << boardIndex)) !== 0 && colorIndex === 0;

  const activeColor = concealed ? CONCEALED_COLOR : (palette[colorIndex ?? -1] ?? "transparent");

  const handleClick = useCallback(() => {
    setColorIndices({
      action: "set-value",
      index,
      boardIndex,
      value: currentColorIndex,
    });
  }, [boardIndex, currentColorIndex, index, setColorIndices]);

  return (
    <div
      className={`group outline-base-300 relative flex h-full cursor-pointer items-center justify-center rounded-md p-1 outline-2 select-none ${
        className ?? ""
      }`}
      onClick={handleClick}
      onPointerEnter={(e) => {
        if (e.buttons === 1) {
          handleClick();
        }
      }}
      style={{
        anchorScope: "all",
        backgroundColor: activeColor,
        gridColumn: `${cell.position.x + 1} / span ${cell.rect.width}`,
        gridRow: `${cell.position.y + 1} / span ${cell.rect.height}`,
      }}
    >
      {concealed ? (
        <span className="text-base-content/50 grid text-xl">{index}</span>
      ) : (
        <div className="flex h-full place-content-center">
          <img
            draggable={false}
            src={cell.url}
            alt={`cell-${index}`}
            className="object-scale-down"
          />
        </div>
      )}
      <CellPopupMenu cells={cells} boardIndex={boardIndex} index={index} />
    </div>
  );
};
