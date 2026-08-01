import { memo } from "react";

import { BoardCell } from "./BoardCell";
import type { BoardCell as BoardCellType } from "./store/board";
import type { BoardCount } from "./store/schemas";

type Props = {
  cells: BoardCellType[];
  boardIndex: BoardCount;
};

export const MainBoard = memo(function MainBoard({ cells, boardIndex }: Props) {
  if (cells === undefined) {
    return <></>;
  }

  return (
    <>
      {cells.map((cell, i) => (
        <BoardCell
          cell={cell}
          index={i}
          boardIndex={boardIndex}
          key={`cell-${i}`}
          className="place-self-stretch"
        />
      ))}
    </>
  );
});
