import { useAtomValue } from "jotai";
import { Fragment, memo, useCallback } from "react";

import { OpenSettingsButton } from "./OpenSettingsButton";
import { SeedInput } from "./settings/SeedInput";
import { useBoardCount, useSetBoardCount } from "./store/boardCount";
import {
  updateOperationMode,
  updatePaintColor,
  useBoardOperationModeValue,
} from "./store/boardOperationMode";
import { usePaletteValue } from "./store/colors/colors";
import { isBoardCount } from "./store/schemas";
import { seedScopeAtom } from "./store/seed";

const BOARD_LABELS = ["左", "右"];

export const Header = memo(function Header() {
  const seedScope = useAtomValue(seedScopeAtom);
  const boardCount = useBoardCount();
  const setBoardCount = useSetBoardCount();
  const boardOperationMode = useBoardOperationModeValue();
  const palette = usePaletteValue();

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
    <div className="bg-base-200/50 grid grid-flow-col-dense items-center justify-end gap-x-4 gap-y-1 rounded-3xl px-4 py-1 shadow-md backdrop-blur-md">
      <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
        {boardOperationMode.mode === "paint" && (
          <div className="flex flex-wrap items-center gap-1.5">
            {palette.map((color, i) => (
              <button
                type="button"
                key={`color-${i}`}
                className={`border-base-content/20 size-6 shrink-0 cursor-pointer rounded-full border-2 ${
                  boardOperationMode.currentColorIndex === i
                    ? "ring-primary ring-2 ring-offset-1"
                    : ""
                }`}
                style={{ backgroundColor: color }}
                onClick={() => updatePaintColor(i)}
              />
            ))}
          </div>
        )}
        <label className="label gap-1 select-none">
          <input
            type="checkbox"
            className="checkbox checkbox-sm"
            checked={boardOperationMode.mode === "paint"}
            onChange={(e) => setOperationMode(e.currentTarget.checked ? "paint" : "default")}
          />
          ペイント
        </label>
        <select
          className="select select-sm w-auto"
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
      </div>
      <div className="bg-base-100/60 flex min-w-0 flex-wrap items-center gap-2 rounded-3xl p-1.5 shadow">
        {seedScope === "per-board" ? (
          Array.from({ length: boardCount }, (_, i) => {
            const label = boardCount > 1 ? BOARD_LABELS[i] : undefined;
            return (
              <Fragment key={i}>
                {label && <span className="pl-2 text-sm">{label}</span>}
                <SeedInput boardIndex={i} label={label} />
              </Fragment>
            );
          })
        ) : (
          <SeedInput />
        )}
        <OpenSettingsButton />
      </div>
    </div>
  );
});
