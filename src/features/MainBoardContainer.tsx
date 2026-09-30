import { useAtomValue } from "jotai";

import { ColorCounter } from "./ColorCounter";
import { CustomPointCounter } from "./CustomPointCounter";
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
          <div className="grid gap-2 p-6" key={boardIndex}>
            {/* w-0 min-w-full: 得点行の中身が盤面の幅を押し広げないようにする */}
            <div className="flex w-0 min-w-full flex-wrap items-center justify-between gap-2">
              <ColorCounter cells={cells} />
              <CustomPointCounter boardIndex={boardIndex} />
            </div>
            <div
              className="grid gap-2"
              style={{
                gridTemplateColumns: `repeat(${size}, ${cellSize}cqw)`,
                gridAutoRows: `${cellSize}cqw`,
              }}
            >
              <MainBoard cells={cells} boardIndex={boardIndex} />
            </div>
          </div>
        ) : (
          <></>
        ),
      )}
    </div>
  );
};
