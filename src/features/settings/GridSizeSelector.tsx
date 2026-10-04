import { useAtomValue } from "jotai";
import { useAtomCallback } from "jotai/utils";
import { useCallback } from "react";
import * as vb from "valibot";

import { boardSizeAtom } from "../store/board";
import { useSetColorIndices } from "../store/colors/indices";
import { useSetCustomPoints } from "../store/customPoints";
import { runInTransaction } from "../store/queryParams";
import { boardSizes, boardSizeSchema } from "../store/schemas";

export const GridSizeSelector = () => {
  const gridSize = useAtomValue(boardSizeAtom);
  const setColorIndices = useSetColorIndices();
  const setCustomPoints = useSetCustomPoints();

  const tryUpdateGridSize = useAtomCallback(
    useCallback((_get, set, value: number) => {
      if (vb.safeParse(boardSizeSchema, value).success) {
        set(boardSizeAtom, value);
        return true;
      }
      return false;
    }, []),
  );

  return (
    <select
      className="select"
      value={gridSize}
      onChange={(e) => {
        const value = parseInt(e.currentTarget.value);
        runInTransaction(() => {
          if (tryUpdateGridSize(value) === false) {
            console.error("Failed to update grid size");
            return;
          }

          setColorIndices({ action: "clear" });
          setCustomPoints({ action: "reset" });
        });
      }}
    >
      {boardSizes.map((v) => (
        <option key={v} value={v}>{`${v} x ${v}`}</option>
      ))}
    </select>
  );
};
