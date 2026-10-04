import { useAtomValue } from "jotai";
import type { CSSProperties } from "react";

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

  const ratio = scale / 100;
  const gaps = `${GAP_PX}px * ${size - 1}`;
  const cellSize = `max(0px, min((100cqw * ${ratio} - ${gaps}) / ${size}, (100cqh * ${ratio} - ${gaps}) / ${size}))`;

  return (
    <div className="relative h-full min-h-0">
      <div
        className="grid h-full min-h-0 grid-flow-col-dense items-stretch"
        style={{ gridAutoColumns: "minmax(0, 1fr)" }}
      >
        {cellsSet?.map((cells, boardIndex) =>
          isBoardCount(boardIndex) ? (
            <div
              className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-2 p-6"
              key={boardIndex}
            >
              <div className="flex w-0 min-w-full flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <PointsCalculateModeToggle />
                  <ColorCounter cells={cells} />
                </div>
                <CustomPointCounter boardIndex={boardIndex} />
              </div>
              <div
                className="board-area grid h-full min-h-0 w-full min-w-0 place-items-center"
                style={{ containerType: "size", "--board-scale": scale } as CSSProperties}
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
