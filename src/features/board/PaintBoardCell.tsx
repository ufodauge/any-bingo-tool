import { type ReactNode, useMemo, useCallback } from "react";

import type { BoardCell } from "../store/board";
import { useMarkerColorsValue, useDefaultMarkerColorOption } from "../store/colors/colors";
import { useColorIndices, useSetColorIndices } from "../store/colors/indices";
import type { BoardCount } from "../store/schemas";

type Props = {
  cell: BoardCell;
  index: number;
  className?: string;
  boardIndex: BoardCount;
  revealed: boolean;
  currentColorIndex: number;
};

export const PaintBoardCell = ({
  cell,
  index,
  className,
  boardIndex,
  revealed,
  currentColorIndex,
}: Props): ReactNode => {
  const colorIndices = useColorIndices();
  const colors = useMarkerColorsValue();
  const options = useDefaultMarkerColorOption();
  const setColorIndices = useSetColorIndices();

  const colorIndex = colorIndices.at(boardIndex)?.at(index);
  // 隠すモードで、まだ中身を見せていない状態か
  const concealed =
    (options.hiddenBoardBits & (1 << boardIndex)) !== 0 && colorIndex === 0 && !revealed;

  const activeColor = useMemo(
    () =>
      colorIndex === 0
        ? concealed
          ? "var(--color-base-300)"
          : "var(--color-base-100)"
        : colorIndex
          ? colors.at(colorIndex - 1)
          : "transparent",
    [colorIndex, colors, concealed],
  );

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
      className={`outline-base-300 flex h-full cursor-pointer items-center justify-center rounded-md p-1 outline-2 select-none ${
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
        <span
          className="text-base-content/50 grid text-xl"
          style={{
            anchorName: "--anchor-cell-button",
          }}
        >
          {index}
        </span>
      ) : (
        <div
          className="flex h-full place-content-center"
          style={{
            anchorName: "--anchor-cell-button",
          }}
        >
          <img
            draggable={false}
            src={cell.url}
            alt={`cell-${index}`}
            className="object-scale-down"
          />
        </div>
      )}
    </div>
  );
};
