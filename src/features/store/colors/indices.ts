import { atom, useAtomValue } from 'jotai';
import { atomWithStorage, useAtomCallback } from 'jotai/utils';
import { useCallback } from 'react';
import { cellsCountAtom } from '../board';
import { markerColorsAtom } from './colors';

const colorIndicesPrimitiveAtom = atomWithStorage<number[]>(
  'bingo:color-indices',
  [],
  undefined,
  {
    getOnInit: true,
  }
);

export const colorIndicesAtom = atom(
  (get) => {
    const colorIndices = get(colorIndicesPrimitiveAtom);
    const cellsCount = get(cellsCountAtom);

    return cellsCount !== colorIndices.length
      ? Array<number>(cellsCount).fill(0)
      : colorIndices.map((v) => v + 1);
  },
  (get, set, arr: readonly number[]) => {
    const cellsCount = get(cellsCountAtom);
    set(colorIndicesPrimitiveAtom, (prev) =>
      cellsCount !== arr.length ? prev : [...arr.map((v) => v - 1)]
    );
  }
);

type ColorIndicesAction =
  | {
      action: 'clear';
    }
  | {
      action: 'set-at';
      index: number;
      to: 'next' | 'prev';
    };

export const useColorIndices = () => useAtomValue(colorIndicesAtom);
export const useSetColorIndices = () =>
  useAtomCallback(
    useCallback((get, set, action: ColorIndicesAction) => {
      switch (action.action) {
        case 'clear': {
          const cellsCount = get(cellsCountAtom);
          set(colorIndicesAtom, Array(cellsCount).fill(0));
          break;
        }
        case 'set-at': {
          const { index, to } = action;
          const colorIndices = get(colorIndicesAtom);
          const colorIndex = colorIndices[index];
          const maxColors = get(markerColorsAtom).length + 1;

          set(
            colorIndicesAtom,
            colorIndices.with(
              index,
              to === 'next'
                ? (colorIndex + 1) % maxColors
                : (maxColors + colorIndex - 1) % maxColors
            )
          );
          break;
        }
      }
    }, [])
  );
