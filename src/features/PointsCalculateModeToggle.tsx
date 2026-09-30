import { useAtom, useAtomValue } from "jotai";

import { IconExposurePlus } from "../libs/icons/ExposurePlus";
import { IconWeight } from "../libs/icons/Weight";
import { cellSizeModeAtom } from "./store/boardOptions";
import { pointsCalculateModeAtom } from "./store/points";

export const PointsCalculateModeToggle = () => {
  const [pointsCalculateMode, setPointsCalculateMode] = useAtom(pointsCalculateModeAtom);
  const cellSizeMode = useAtomValue(cellSizeModeAtom);

  if (cellSizeMode === "normal") {
    return <></>;
  }

  return (
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
  );
};
