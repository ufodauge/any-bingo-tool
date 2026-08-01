import { useAtom } from "jotai";
import { useCallback } from "react";

import { useBoardCount, useSetBoardCount } from "./store/boardCount";
import {
  updateOperationMode,
  updatePaintColor,
  useBoardOperationModeValue,
} from "./store/boardOperationMode";
import { boardContainerSizeAtom } from "./store/boardSize";
import { useMarkerColorsValue } from "./store/colors/colors";
import { isBoardCount } from "./store/schemas";

export const SubHeader = () => {
  const [containerSize, setContainerSize] = useAtom(boardContainerSizeAtom);
  const boardCount = useBoardCount();
  const setBoardCount = useSetBoardCount();
  const boardOperationMode = useBoardOperationModeValue();
  const colors = useMarkerColorsValue();

  const setOperationMode = useCallback((mode: "default" | "paint") => {
    if (mode === "default") {
      updateOperationMode({
        mode: "default",
      });
    } else if (mode === "paint") {
      updateOperationMode({
        mode: "paint",
        currentColorIndex: 0,
      });
    } else {
      mode satisfies never;
    }
  }, []);

  return (
    <div className="grid grid-flow-col-dense place-items-end items-center justify-end gap-2">
      {boardOperationMode.mode === "paint" && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={`bg-base-100 size-8 shrink-0 cursor-pointer rounded-full border-2 border-neutral-300 ${boardOperationMode.currentColorIndex === 0 ? "ring-primary ring-2 ring-offset-1" : ""}`}
            onClick={() => updatePaintColor(0)}
          />
          {colors.map((color, i) => (
            <button
              type="button"
              key={`color-${i}`}
              className={`size-8 shrink-0 cursor-pointer rounded-full border-2 border-neutral-300 ${
                boardOperationMode.currentColorIndex === i + 1
                  ? "ring-primary ring-2 ring-offset-1"
                  : ""
              }`}
              style={{ backgroundColor: color }}
              onClick={() => updatePaintColor(i + 1)}
            />
          ))}
        </div>
      )}
      <label className="label select-none">
        <input
          type="checkbox"
          className="checkbox"
          value={boardOperationMode.mode === "paint" ? "paint" : "default"}
          onChange={(e) => setOperationMode(e.currentTarget.checked ? "paint" : "default")}
        />
        ペイントモード
      </label>
      <select
        className="select min-w-30"
        name="boardCount"
        id="boardCount"
        value={boardCount}
        onChange={(e) => {
          const value = Number(e.currentTarget.value);
          if (isBoardCount(value)) {
            setBoardCount(value);
          }
        }}
      >
        <option value={1}>1</option>
        <option value={2}>2</option>
      </select>
      <label>
        <input
          type="range"
          className="range range-sm"
          value={containerSize}
          min={20}
          max={80}
          onChange={(e) => setContainerSize(e.currentTarget.valueAsNumber)}
        />
      </label>
    </div>
  );
};
