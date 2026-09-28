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
  /** 隠すモードでも中身が見えている状態か (マーク済み、またはそれに追従して開いた) */
  revealed: boolean;
};

export const BoardCell = ({ cell, index, className, boardIndex, revealed }: Props): ReactNode => {
  const mode = useBoardOperationModeValue();

  return mode.mode === "paint" ? (
    <PaintBoardCell
      cell={cell}
      index={index}
      className={className}
      boardIndex={boardIndex}
      revealed={revealed}
      currentColorIndex={mode.currentColorIndex}
    />
  ) : (
    <DefaultBoardCell
      cell={cell}
      index={index}
      className={className}
      boardIndex={boardIndex}
      revealed={revealed}
    />
  );
};
