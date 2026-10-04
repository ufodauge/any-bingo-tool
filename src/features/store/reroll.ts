import { useAtomCallback } from "jotai/utils";
import { useCallback } from "react";

import { boardCountAtom } from "./boardCount";
import { useSetColorIndices } from "./colors/indices";
import { useSetCustomPoints } from "./customPoints";
import { runInTransaction } from "./queryParams";
import type { SeedScope } from "./schemas";
import {
  getRandomSeedNumber,
  keepMarksOnSeedChangeAtom,
  seedScopeAtom,
  setBoardSeedAtom,
} from "./seed";

const useResetBoard = () => {
  const setColorIndices = useSetColorIndices();
  const setCustomPoints = useSetCustomPoints();
  return useCallback(
    (boardIndex: number) => {
      setColorIndices({ action: "clear-board", boardIndex });
      setCustomPoints({ action: "reset-board", boardIndex });
    },
    [setColorIndices, setCustomPoints],
  );
};

/** boardIndex を省くと共通シードを変え、全ボードが対象になる */
export const useRerollSeed = () => {
  const setColorIndices = useSetColorIndices();
  const setCustomPoints = useSetCustomPoints();
  const resetBoard = useResetBoard();

  return useAtomCallback(
    useCallback(
      (get, set, boardIndex?: number) =>
        runInTransaction(() => {
          set(setBoardSeedAtom, { boardIndex: boardIndex ?? 0, seed: getRandomSeedNumber() });
          if (get(keepMarksOnSeedChangeAtom)) {
            return;
          }
          if (boardIndex === undefined) {
            setColorIndices({ action: "clear" });
            setCustomPoints({ action: "reset" });
          } else {
            resetBoard(boardIndex);
          }
        }),
      [resetBoard, setColorIndices, setCustomPoints],
    ),
  );
};

// 切り替えると 2 枚目以降の中身が変わるので、シード変更と同じ扱いでリセットする
export const useSetSeedScope = () => {
  const resetBoard = useResetBoard();

  return useAtomCallback(
    useCallback(
      (get, set, scope: SeedScope) =>
        runInTransaction(() => {
          set(seedScopeAtom, scope);
          if (get(keepMarksOnSeedChangeAtom)) {
            return;
          }
          for (let i = 1; i < get(boardCountAtom); i++) {
            resetBoard(i);
          }
        }),
      [resetBoard],
    ),
  );
};
