import { useAtomValue } from "jotai";

import { BoardScaleSlider } from "./BoardScaleSlider";
import { ColorCounter } from "./ColorCounter";
import { CustomPointCounter } from "./CustomPointCounter";
import { MainBoard } from "./MainBoard";
import { PointsCalculateModeToggle } from "./PointsCalculateModeToggle";
import { boardSizeAtom, useCellsSet } from "./store/board";
import { boardScaleAtom } from "./store/boardSize";
import { isBoardCount } from "./store/schemas";

const GAP_PX = 8;

export const MainBoardContainer = () => {
  const cellsSet = useCellsSet();
  const size = useAtomValue(boardSizeAtom);
  const scale = useAtomValue(boardScaleAtom);

  const maxCellSize = `min((100cqw - ${GAP_PX}px * ${size - 1}) / ${size}, (100cqh - ${GAP_PX}px * ${size - 1}) / ${size})`;
  const cellSize = `calc(${maxCellSize} * ${scale / 100})`;

  return (
    <div className="relative h-full min-h-0">
      <div
        className="grid h-full min-h-0 grid-flow-col-dense items-stretch"
        style={{ gridAutoColumns: "minmax(0, 1fr)" }}
      >
        {cellsSet?.map((cells, boardIndex) =>
          isBoardCount(boardIndex) ? (
            <div className="grid h-full min-h-0 grid-rows-[auto_1fr] gap-2 p-6" key={boardIndex}>
              <div className="flex w-0 min-w-full flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <PointsCalculateModeToggle />
                  <ColorCounter cells={cells} />
                </div>
                <CustomPointCounter boardIndex={boardIndex} />
              </div>
              <div
                className="grid h-full min-h-0 w-full min-w-0 place-items-center"
                style={{ containerType: "size" }}
              >
                <div
                  className="grid gap-2"
                  style={{
                    gridTemplateColumns: `repeat(${size}, ${cellSize})`,
                    gridAutoRows: cellSize,
                  }}
                >
                  <MainBoard cells={cells} boardIndex={boardIndex} />
                </div>
              </div>
            </div>
          ) : (
            <></>
          ),
        )}
      </div>
      <BoardScaleSlider />
    </div>
  );
};
