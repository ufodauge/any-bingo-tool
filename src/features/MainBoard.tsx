import { useAtomValue } from "jotai";
import { memo, useMemo } from "react";

import { BoardCell } from "./BoardCell";
import { boardSizeAtom, type BoardCell as BoardCellType } from "./store/board";
import { useDefaultMarkerColorOption } from "./store/colors/colors";
import { computeRevealedFlags } from "./store/neighbors";
import type { BoardCount } from "./store/schemas";

type Props = {
  cells: BoardCellType[];
  boardIndex: BoardCount;
};

export const MainBoard = memo(function MainBoard({ cells, boardIndex }: Props) {
  const size = useAtomValue(boardSizeAtom);
  const { hiddenBoardBits, revealNeighbors } = useDefaultMarkerColorOption();
  const isHiddenBoard = (hiddenBoardBits & (1 << boardIndex)) !== 0;

  const revealedFlags = useMemo(
    () =>
      cells !== undefined && isHiddenBoard
        ? computeRevealedFlags(cells, size, revealNeighbors)
        : undefined,
    [cells, isHiddenBoard, revealNeighbors, size],
  );

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
          revealed={revealedFlags?.[i] ?? false}
          key={`cell-${i}`}
          className="place-self-stretch"
        />
      ))}
    </>
  );
});
