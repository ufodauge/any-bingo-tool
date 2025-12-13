import { useAtomValue } from 'jotai';
import { BoardCell } from './BoardCell';
import { cellsAtom } from './store/board';

export function MainBoard() {
  const cells = useAtomValue(cellsAtom);

  if (cells === undefined) {
    return <></>;
  }

  return (
    <div className="grid items-center justify-center">
      <div className="@container-normal">
        <div
          className="grid gap-2 max-w-[80cqh] p-6"
          style={{
            gridTemplateColumns: `repeat(${Math.sqrt(cells.length)}, 1fr)`,
          }}
        >
          {cells.map((cell, i) => (
            <div
              className="outline-2 outline-base-300 rounded-md aspect-square"
              key={`cell-${i}`}
            >
              <BoardCell cell={cell} index={i} key={i} />
            </div>
          ))}
          {/* <a className='col-span-full btn-primary btn'>別ウィンドウで開く</a> */}
        </div>
      </div>
    </div>
  );
}
