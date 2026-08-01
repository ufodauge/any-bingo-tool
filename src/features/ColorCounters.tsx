import { useAtom, useAtomValue } from "jotai";

import { IconExposurePlus } from "../libs/icons/ExposurePlus";
import { IconWeight } from "../libs/icons/Weight";
import { ColorCounter } from "./ColorCounter";
import { useCellsSet } from "./store/board";
import { cellSizeModeAtom } from "./store/boardOptions";
import { pointsCalculateModeAtom } from "./store/points";

export const ColorCounters = () => {
  const cellsSet = useCellsSet();
  const [pointsCalculateMode, setPointsCalculateMode] = useAtom(pointsCalculateModeAtom);
  const cellSizeMode = useAtomValue(cellSizeModeAtom);

  if (cellsSet === undefined) {
    return <></>;
  }

  return (
    <>
      {cellsSet.map((cells, i) => (
        <ColorCounter cells={cells} key={`color-counter-${i}`} />
      ))}
      {cellSizeMode !== "normal" && (
        <label className="btn btn-circle swap swap-rotate">
          <input
            type="checkbox"
            checked={pointsCalculateMode === "size"}
            onChange={(e) => setPointsCalculateMode(e.currentTarget.checked ? "size" : "count")}
          />
          <div className="swap-off fill-current">
            <IconExposurePlus />
          </div>
          <div className="swap-on fill-current">
            <IconWeight />
          </div>
        </label>
      )}
    </>
  );
};
