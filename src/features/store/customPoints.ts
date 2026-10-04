import { atom, useAtomValue } from "jotai";
import { useAtomCallback } from "jotai/utils";
import { useCallback } from "react";

import { queryParamsAtom } from "./queryParams";
import { BOARD_COUNT_MAX, CUSTOM_POINT_MAX } from "./schemas";

const clampPoint = (value: number): number =>
  Math.max(-CUSTOM_POINT_MAX, Math.min(CUSTOM_POINT_MAX, value));

const pointAt = (points: readonly number[], boardIndex: number): number => points[boardIndex] ?? 0;

const updatePointAt = (
  points: readonly number[],
  boardIndex: number,
  update: (value: number) => number,
): number[] =>
  Array.from({ length: Math.max(points.length, boardIndex + 1) }, (_, i) =>
    i === boardIndex ? clampPoint(update(pointAt(points, i))) : pointAt(points, i),
  );

const customPointsAtom = atom(
  (get) => get(queryParamsAtom).customPoints,
  (get, set, customPoints: number[]) => {
    set(queryParamsAtom, { ...structuredClone(get(queryParamsAtom)), customPoints });
  },
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
          if (boardIndex < 0 || boardIndex >= BOARD_COUNT_MAX) break;
          set(
            customPointsAtom,
            updatePointAt(get(customPointsAtom), boardIndex, (v) => v + delta),
          );
          break;
        }
        case "reset-board": {
          const { boardIndex } = action;
          if (boardIndex < 0 || boardIndex >= BOARD_COUNT_MAX) break;
          set(
            customPointsAtom,
            updatePointAt(get(customPointsAtom), boardIndex, () => 0),
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
