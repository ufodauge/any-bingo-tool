import { useAtom } from "jotai";

import { cellSizeModeAtom } from "../store/boardOptions";

export const VariableCellSizeToggle = () => {
  const [cellSizeMode, setCellSizeMode] = useAtom(cellSizeModeAtom);
  return (
    <label className="label select-none">
      <input
        type="checkbox"
        className="toggle"
        checked={cellSizeMode !== "normal"}
        onChange={(e) => setCellSizeMode(e.currentTarget.checked ? "random-square" : "normal")}
      ></input>
      セルのサイズをランダム化
    </label>
  );
};
