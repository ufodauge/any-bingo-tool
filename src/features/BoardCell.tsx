import { type ReactNode } from "react";

import { DefaultBoardCell } from "./board/DefaultBoardCell";
import { PaintBoardCell } from "./board/PaintBoardCell";
import type { BoardCell as BoardCellType } from "./store/board";
import { useBoardOperationModeValue } from "./store/boardOperationMode";
import type { BoardCount } from "./store/schemas";

type Props = {
  cell: BoardCellType;
  index: number;
  className?: string;
  boardIndex: BoardCount;
  /** 同じ盤面の全セル (メニューの隣接計算用) */
  cells: readonly BoardCellType[];
};

export const BoardCell = ({ cell, index, className, boardIndex, cells }: Props): ReactNode => {
  const mode = useBoardOperationModeValue();

  return mode.mode === "paint" ? (
    <PaintBoardCell
      cell={cell}
      index={index}
      className={className}
      boardIndex={boardIndex}
      cells={cells}
      currentColorIndex={mode.currentColorIndex}
    />
  ) : (
    <DefaultBoardCell
      cell={cell}
      index={index}
      className={className}
      boardIndex={boardIndex}
      cells={cells}
    />
  );
};
