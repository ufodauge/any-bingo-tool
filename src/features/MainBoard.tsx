import { useAtomValue } from 'jotai';
import { BoardCell } from './BoardCell';
import { boardSizeAtom, cellsAtom } from './store/board';

export function MainBoard() {
  const cells = useAtomValue(cellsAtom);
  const size = useAtomValue(boardSizeAtom);

  if (cells === undefined) {
    return <></>;
  }

  const containerSize = 60;
  const cellSize = containerSize / size;

  return (
    <div className="grid items-center justify-center">
      <div className="@container-normal">
        <div
          className={`grid gap-2 max-h-[${containerSize}cqw] p-6 grid-flow-dense`}
          style={{
            gridTemplateColumns: `repeat(${size}, ${cellSize}cqw)`,
            gridAutoRows: `${cellSize}cqw`,
          }}
        >
          {cells.map((cell, i) => (
            <BoardCell
              cell={cell}
              index={i}
              key={`cell-${i}`}
              className="place-self-stretch"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
