import { useAtomValue } from "jotai";

import { MainBoard } from "./MainBoard";
import { boardSizeAtom, useCellsSet } from "./store/board";
import { useBoardCount } from "./store/boardCount";
import { boardContainerSizeAtom } from "./store/boardSize";
import { isBoardCount } from "./store/schemas";

export const MainBoardContainer = () => {
  const cellsSet = useCellsSet();
  const size = useAtomValue(boardSizeAtom);
  const containerSize = useAtomValue(boardContainerSizeAtom);
  const boardCount = useBoardCount();
  const cellSize = containerSize / size / boardCount;

  return (
    <div className="@container grid grid-flow-col-dense items-center justify-center">
      {cellsSet?.map((cells, boardIndex) =>
        isBoardCount(boardIndex) ? (
          <div
            className="grid grid-flow-dense gap-2 p-6"
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
