import { atom, useAtomValue } from 'jotai';
import imageData from '../../libs/images.json';
import { seedNumberAtom } from './seed';
import { colorIndicesAtom } from './colors/indices';
import {
  createRandomizedCopyWith,
  shuffleArrayWith,
  SplitMix64,
} from '../../libs/random';
import { cellSizeModeAtom } from './boardOptions';
import { generateRandomRects } from '../../libs/squarePacking';
import type { Rect } from '../../libs/forms';
import { queryParamsAtom } from './queryParams';
import type { BoardSize } from './schemas';
import { useMemo } from 'react';
import { useBoardCount } from './boardCount';

export const allowSameElementOccurrenceAtom = atom(
  (get) => get(queryParamsAtom).mode.allowSameElementOccurrence,
  (get, set, allow: boolean) => {
    const status = structuredClone(get(queryParamsAtom));
    status.mode.allowSameElementOccurrence = allow;
    set(queryParamsAtom, status);
  },
);

export const boardSizeAtom = atom(
  (get) => get(queryParamsAtom).mode.boardSize,
  (get, set, size: BoardSize) => {
    const status = structuredClone(get(queryParamsAtom));
    status.mode.boardSize = size;
    set(queryParamsAtom, status);
  },
);

export const cellsCountAtom = atom((get) => {
  const size = get(boardSizeAtom);
  return size * size;
});

export type BoardCell = {
  pathImage: string;
  indexColor: number;
  rect: Rect;
};

const RECT_MIN_SIZE = {
  width: 1,
  height: 1,
} as const;

const useCells = () => {
  const { icons } = imageData;
  const cellsCount = useAtomValue(cellsCountAtom);
  const boardCount = useBoardCount();
  const seed = useAtomValue(seedNumberAtom);
  const colorIndices = useAtomValue(colorIndicesAtom);
  const size = useAtomValue(boardSizeAtom);
  const cellSizeMode = useAtomValue(cellSizeModeAtom);
  const allowSameElementOccurrence = useAtomValue(
    allowSameElementOccurrenceAtom,
  );

  const shuffled = useMemo(() => {
    const rng = new SplitMix64(seed);
    return Array.from({ length: boardCount }, () =>
      allowSameElementOccurrence
        ? createRandomizedCopyWith(icons, rng)
        : shuffleArrayWith(icons, rng),
    );
  }, [allowSameElementOccurrence, boardCount, icons, seed]);

  const cellsForNormalMode: BoardCell[][] | undefined = useMemo(() => {
    if (cellSizeMode !== 'normal') {
      return undefined;
    }

    return shuffled.map((icons, boardIndex) =>
      icons.slice(0, cellsCount).map((path, i) => ({
        pathImage: path,
        indexColor: colorIndices[boardIndex][i],
        rect: RECT_MIN_SIZE,
      })),
    );
  }, [cellSizeMode, shuffled, cellsCount, colorIndices]);

  const rectsSet = useMemo(() => {
    const rng = new SplitMix64(seed);
    const maxSize = Math.min(Math.floor(size / 2), 3);

    return Array.from({ length: boardCount }, () =>
      generateRandomRects(
        size,
        cellSizeMode === 'random-square' ? maxSize : size,
        () => rng.nextInt(0, 100000) / 100000,
        {
          generateRect: cellSizeMode === 'random',
        },
      ),
    );
  }, [boardCount, cellSizeMode, seed, size]);

  const cellsForRandomCellSizeMode: BoardCell[][] | undefined = useMemo(() => {
    if (cellSizeMode === 'normal') {
      return undefined;
    }

    return rectsSet.map((rects, boardIndex) =>
      rects.map(
        (rect, i): BoardCell => ({
          pathImage: shuffled[boardIndex][i],
          indexColor: colorIndices[boardIndex]?.[i],
          rect,
        }),
      ),
    );
  }, [cellSizeMode, rectsSet, shuffled, colorIndices]);

  if (
    boardCount !== colorIndices.length ||
    cellsCount !== colorIndices[0]?.length
  ) {
    console.debug(
      `Color indices length does not match cells count or board count. \
This may be caused by changing the board size or board count. Resetting color indices.\
(boardCount: ${boardCount}, colorIndices.length: ${colorIndices.length}, cellsCount: ${cellsCount}, colorIndices[0]?.length: ${colorIndices[0]?.length})`,
    );
    return undefined;
  }

  return cellSizeMode === 'normal'
    ? cellsForNormalMode
    : cellsForRandomCellSizeMode;
};

export const useCellsSet = () => {
  const cells = useCells();
  return useMemo(() => cells, [cells]);
};
