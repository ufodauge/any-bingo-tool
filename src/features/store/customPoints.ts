import { useAtomValue } from "jotai";
import { atomWithStorage, useAtomCallback } from "jotai/utils";
import { useCallback } from "react";

const customPointsAtom = atomWithStorage<number[]>("bingo:custom-points", [], undefined, {
  getOnInit: true,
});

// localStorage の値は信用できないので、配列でない・数値でない場合も 0 として読む
const pointAt = (points: unknown, boardIndex: number): number => {
  const value: unknown = Array.isArray(points) ? points[boardIndex] : undefined;
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
};

const updatePointAt = (points: unknown, boardIndex: number, update: (value: number) => number) =>
  Array.from(
    { length: Math.max(Array.isArray(points) ? points.length : 0, boardIndex + 1) },
    (_, i) => (i === boardIndex ? update(pointAt(points, i)) : pointAt(points, i)),
  );

export const useCustomPoint = (boardIndex: number) => {
  const points = useAtomValue(customPointsAtom);
  return pointAt(points, boardIndex);
};

type CustomPointsAction =
  | {
      action: "add";
      boardIndex: number;
      delta: number;
    }
  | {
      action: "reset";
    }
  | {
      action: "reset-board";
      boardIndex: number;
    };

export const useSetCustomPoints = () =>
  useAtomCallback(
    useCallback((get, set, action: CustomPointsAction) => {
      switch (action.action) {
        case "add": {
          const { boardIndex, delta } = action;
          set(
            customPointsAtom,
            updatePointAt(get(customPointsAtom), boardIndex, (v) => v + delta),
          );
          break;
        }
        case "reset-board": {
          set(
            customPointsAtom,
            updatePointAt(get(customPointsAtom), action.boardIndex, () => 0),
          );
          break;
        }
        case "reset": {
          set(customPointsAtom, []);
          break;
        }
      }
    }, []),
  );
