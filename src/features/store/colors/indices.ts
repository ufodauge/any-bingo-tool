import { atom, useAtomValue } from "jotai";
import { useAtomCallback } from "jotai/utils";
import { useCallback } from "react";

import { cellsCountAtom } from "../board";
import { boardCountAtom } from "../boardCount";
import { queryParamsAtom } from "../queryParams";
import type { BoardCount } from "../schemas";
import { markerColorsAtom } from "./colors";

const emptyMarks = (boardCount: number, cellsCount: number): number[][] =>
  Array.from({ length: boardCount }, () => Array.from({ length: cellsCount }, () => 0));

// 盤面の数・マス数と合わない marks は全て未塗りとして扱う
export const colorIndicesAtom = atom(
  (get) => {
    const marks = get(queryParamsAtom).marks;
    const cellsCount = get(cellsCountAtom);
    const boardCount = get(boardCountAtom);

    return marks.length !== boardCount || marks.some((row) => row.length !== cellsCount)
      ? emptyMarks(boardCount, cellsCount)
      : marks;
  },
  (get, set, arr: readonly number[][]) => {
    const cellsCount = get(cellsCountAtom);
    const boardCount = get(boardCountAtom);
    if (arr.length !== boardCount || arr.some((row) => row.length !== cellsCount)) {
      return;
    }

    const status = structuredClone(get(queryParamsAtom));
    status.marks = arr.map((row) => [...row]);
    set(queryParamsAtom, status);
  },
);

type ColorIndicesAction =
  | {
      action: "clear";
    }
  | {
      action: "clear-board";
      boardIndex: number;
    }
  | {
      action: "set-at";
      index: number;
      boardIndex: BoardCount;
      to: "next" | "prev";
    }
  | {
      action: "set-value";
      index: number;
      boardIndex: BoardCount;
      value: number;
    }
  | {
      // 複数マスを 1 回の更新でまとめて塗る
      action: "set-values";
      indices: readonly number[];
      boardIndex: BoardCount;
      value: number;
    };

export const useColorIndices = () => useAtomValue(colorIndicesAtom);
export const useSetColorIndices = () =>
  useAtomCallback(
    useCallback((get, set, action: ColorIndicesAction) => {
      switch (action.action) {
        case "clear": {
          const cellsCount = get(cellsCountAtom);
          const boardCount = get(boardCountAtom);
          set(
            colorIndicesAtom,
            Array(boardCount)
              .fill(0)
              .map(() => Array(cellsCount).fill(0)),
          );
          break;
        }
        case "clear-board": {
          const colorIndices = get(colorIndicesAtom);
          const target = colorIndices[action.boardIndex];
          if (target === undefined) {
            break;
          }
          set(
            colorIndicesAtom,
            colorIndices.with(
              action.boardIndex,
              target.map(() => 0),
            ),
          );
          break;
        }
        case "set-at": {
          const { index, boardIndex, to } = action;
          const colorIndices = get(colorIndicesAtom);
          const colorIndex = colorIndices[boardIndex]?.[index];
          const maxColors = get(markerColorsAtom).length + 1;

          set(
            colorIndicesAtom,
            colorIndices.with(
              boardIndex,
              colorIndices[boardIndex].with(
                index,
                to === "next"
                  ? (colorIndex + 1) % maxColors
                  : (maxColors + colorIndex - 1) % maxColors,
              ),
            ),
          );
          break;
        }
        case "set-value": {
          const { index, boardIndex, value } = action;
          const colorIndices = get(colorIndicesAtom);
          const maxColors = get(markerColorsAtom).length + 1;
          const clamped = Math.max(0, Math.min(maxColors - 1, value));

          set(
            colorIndicesAtom,
            colorIndices.with(boardIndex, colorIndices[boardIndex].with(index, clamped)),
          );
          break;
        }
        case "set-values": {
          const { indices, boardIndex, value } = action;
          const colorIndices = get(colorIndicesAtom);
          const target = colorIndices[boardIndex];
          if (target === undefined) {
            break;
          }
          const maxColors = get(markerColorsAtom).length + 1;
          const clamped = Math.max(0, Math.min(maxColors - 1, value));
          const targets = new Set(indices);

          set(
            colorIndicesAtom,
            colorIndices.with(
              boardIndex,
              target.map((v, i) => (targets.has(i) ? clamped : v)),
            ),
          );
          break;
        }
      }
    }, []),
  );
