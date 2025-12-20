import { useAtomValue } from 'jotai';
import { boardSizeAtom } from './store/board';
import { boardContainerSizeAtom } from './store/boardSize';
import { MainBoard } from './MainBoard';

export const MainBoardContainer = () => {
  const size = useAtomValue(boardSizeAtom);
  const containerSize = useAtomValue(boardContainerSizeAtom);
  const cellSize = containerSize / size;

  return (
    <div className="grid items-center justify-center">
      <div
        className={`grid gap-2 scale-[${containerSize}%] p-6 grid-flow-dense`}
        style={{
          gridTemplateColumns: `repeat(${size}, ${cellSize}cqw)`,
          gridAutoRows: `${cellSize}cqw`,
        }}
      >
        <MainBoard />
      </div>
    </div>
  );
};
