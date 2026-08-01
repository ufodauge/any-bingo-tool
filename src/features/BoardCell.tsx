import { type ReactNode } from "react";

import type { Rect } from "../libs/forms";
import { DefaultBoardCell } from "./board/DefaultBoardCell";
import { PaintBoardCell } from "./board/PaintBoardCell";
import { useBoardOperationModeValue } from "./store/boardOperationMode";
import type { BoardCount } from "./store/schemas";

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
};

export const BoardCell = ({ cell, index, className, boardIndex }: Props): ReactNode => {
  const mode = useBoardOperationModeValue();

  return mode.mode === "paint" ? (
    <PaintBoardCell
      cell={cell}
      index={index}
      className={className}
      boardIndex={boardIndex}
      currentColorIndex={mode.currentColorIndex}
    />
  ) : (
    <DefaultBoardCell cell={cell} index={index} className={className} boardIndex={boardIndex} />
  );
};
