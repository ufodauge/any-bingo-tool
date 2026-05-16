import { atom, useAtomValue } from 'jotai';
import { atomWithStorage, useAtomCallback } from 'jotai/utils';
import { useCallback } from 'react';
import { cellsCountAtom } from '../board';
import { markerColorsAtom } from './colors';
import { boardCountAtom } from '../boardCount';
import type { BoardCount } from '../schemas';

const colorIndicesPrimitiveAtom = atomWithStorage<number[][]>(
  'bingo:color-indices',
  [],
  undefined,
  {
    getOnInit: true,
  },
);

export const colorIndicesAtom = atom(
  (get) => {
    const colorIndices = get(colorIndicesPrimitiveAtom);
    const cellsCount = get(cellsCountAtom);
    const boardCount = get(boardCountAtom);

    const result =
      boardCount !== colorIndices.length ||
      cellsCount !== colorIndices[0].length
        ? Array.from({ length: boardCount }, () =>
            Array.from({ length: cellsCount }, () => 0),
          )
        : colorIndices;

    return result;
  },
  (get, set, arr: readonly number[][]) => {
    const cellsCount = get(cellsCountAtom);
    const boardCount = get(boardCountAtom);

    set(colorIndicesPrimitiveAtom, (prev) =>
      boardCount !== arr.length || cellsCount !== arr[0].length
        ? prev
        : arr.slice(0, boardCount).map((row) => row.slice(0, cellsCount)),
    );
  },
);

type ColorIndicesAction =
  | {
      action: 'clear';
    }
  | {
      action: 'set-at';
      index: number;
      boardIndex: BoardCount;
      to: 'next' | 'prev';
    };

export const useColorIndices = () => useAtomValue(colorIndicesAtom);
export const useSetColorIndices = () =>
  useAtomCallback(
    useCallback((get, set, action: ColorIndicesAction) => {
      switch (action.action) {
        case 'clear': {
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
        case 'set-at': {
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
                to === 'next'
                  ? (colorIndex + 1) % maxColors
                  : (maxColors + colorIndex - 1) % maxColors,
              ),
            ),
          );
          break;
        }
      }
    }, []),
  );
