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
    };

export const useSetCustomPoints = () =>
  useAtomCallback(
    useCallback((get, set, action: CustomPointsAction) => {
      switch (action.action) {
        case "add": {
          const { boardIndex, delta } = action;
          const current = get(customPointsAtom);
          const length = Math.max(Array.isArray(current) ? current.length : 0, boardIndex + 1);
          set(
            customPointsAtom,
            Array.from({ length }, (_, i) => pointAt(current, i) + (i === boardIndex ? delta : 0)),
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
