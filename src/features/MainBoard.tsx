import { useAtomValue } from 'jotai';
import { BoardCell } from './BoardCell';
import { cellsAtom } from './store/board';
import { memo } from 'react';

export const MainBoard = memo(function MainBoard() {
  const cells = useAtomValue(cellsAtom);

  if (cells === undefined) {
    return <></>;
  }

  return (
    <>
      {cells.map((cell, i) => (
        <BoardCell
          cell={cell}
          index={i}
          key={`cell-${i}`}
          className="place-self-stretch"
        />
      ))}
    </>
  );
});
