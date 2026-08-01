import { type ReactNode, useMemo, useCallback } from "react";

import type { Rect } from "../../libs/forms";
import { useMarkerColorsValue, useDefaultMarkerColorOption } from "../store/colors/colors";
import { useColorIndices, useSetColorIndices } from "../store/colors/indices";
import type { BoardCount } from "../store/schemas";

type Props = {
  cell: {
    pathImage: string;
    url: string;
    indexColor: number;
    rect: Rect;
  };
  index: number;
  className?: string;
  boardIndex: BoardCount;
  currentColorIndex: number;
};

export const PaintBoardCell = ({
  cell,
  index,
  className,
  boardIndex,
  currentColorIndex,
}: Props): ReactNode => {
  const colorIndices = useColorIndices();
  const colors = useMarkerColorsValue();
  const options = useDefaultMarkerColorOption();
  const setColorIndices = useSetColorIndices();

  const colorIndex = colorIndices.at(boardIndex)?.at(index);
  const activeColor = useMemo(
    () =>
      colorIndex === 0
        ? options.hidden
          ? "var(--color-base-300)"
          : "var(--color-base-100)"
        : colorIndex
          ? colors.at(colorIndex - 1)
          : "transparent",
    [colorIndex, colors, options.hidden],
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
        gridColumn: `span ${cell.rect.width} / span ${cell.rect.width}`,
        gridRow: `span ${cell.rect.height} / span ${cell.rect.height}`,
      }}
    >
      {options.hidden && colorIndex === 0 ? (
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
            className={`object-scale-down ${options.hidden && colorIndex === 0 ? "opacity-0" : ""}`}
          />
        </div>
      )}
    </div>
  );
};
