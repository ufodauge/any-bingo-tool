import { useAtomValue } from 'jotai';
import { boardSizeAtom, useCellsSet } from './store/board';
import { boardContainerSizeAtom } from './store/boardSize';
import { MainBoard } from './MainBoard';
import { isBoardCount } from './store/schemas';
import { useBoardCount } from './store/boardCount';

export const MainBoardContainer = () => {
  const cellsSet = useCellsSet();
  const size = useAtomValue(boardSizeAtom);
  const containerSize = useAtomValue(boardContainerSizeAtom);
  const boardCount = useBoardCount();
  const cellSize = containerSize / size / boardCount;

  return (
    <div className="grid items-center justify-center grid-flow-col-dense @container">
      {cellsSet?.map((cells, boardIndex) =>
        isBoardCount(boardIndex) ? (
          <div
            className="grid gap-2 p-6 grid-flow-dense"
            key={boardIndex}
            style={{
              gridTemplateColumns: `repeat(${size}, ${cellSize}cqw)`,
              gridAutoRows: `${cellSize}cqw`,
            }}
          >
            <MainBoard cells={cells} boardIndex={boardIndex} />
          </div>
        ) : (
          <></>
        ),
      )}
    </div>
  );
};
