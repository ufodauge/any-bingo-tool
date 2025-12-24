import { atom } from 'jotai';
import imageData from '../../libs/images.json';
import { seedNumberAtom } from './seed';
import { colorIndicesAtom } from './colors/indicies';
import {
  createRandomizedCopy,
  shuffleArray,
  SplitMix64,
} from '../../libs/random';
import { cellSizeModeAtom } from './boardOptions';
import { generateRandomRects } from '../../libs/squarePacking';
import type { Rect } from '../../libs/forms';
import { queryParamsAtom } from './queryParams';
import type { BoardSize } from './schemas';

export const allowSameElementOccurenceAtom = atom(
  (get) => get(queryParamsAtom).mode.allowSameElementOccurence,
  (get, set, allow: boolean) => {
    const status = structuredClone(get(queryParamsAtom));
    status.mode.allowSameElementOccurence = allow;
    set(queryParamsAtom, status);
  }
);

export const boardSizeAtom = atom(
  (get) => get(queryParamsAtom).mode.boardSize,
  (get, set, size: BoardSize) => {
    const status = structuredClone(get(queryParamsAtom));
    status.mode.boardSize = size;
    set(queryParamsAtom, status);
  }
);

export const cellsCountAtom = atom((get) => {
  const size = get(boardSizeAtom);
  return size * size;
});

type Cell = {
  pathImage: string;
  indexColor: number;
  rect: Rect;
};

export const cellsAtom = atom<Cell[] | undefined>((get) => {
  const { icons } = imageData;
  const cellsCount = get(cellsCountAtom);
  const seed = get(seedNumberAtom);
  const colorIndices = get(colorIndicesAtom);
  const size = get(boardSizeAtom);
  const cellSizeMode = get(cellSizeModeAtom);
  const allowSameElementOccurence = get(allowSameElementOccurenceAtom);

  if (cellsCount !== colorIndices.length) {
    console.debug(
      `cellsCount (${cellsCount}) !== colorIndices.length (${colorIndices.length})`
    );
    return undefined;
  }

  const shuffled = allowSameElementOccurence
    ? createRandomizedCopy(icons, seed)
    : shuffleArray(icons, seed);

  if (cellSizeMode === 'normal') {
    return shuffled.slice(0, cellsCount).map((v, i) => ({
      pathImage: v,
      indexColor: colorIndices[i],
      rect: {
        width: 1,
        height: 1,
      },
    }));
  }

  const rng = new SplitMix64(seed);
  const maxSize = Math.min(Math.floor(size / 2), 3);

  return generateRandomRects(
    size,
    cellSizeMode === 'random-square' ? maxSize : size,
    () => rng.nextInt(0, 100000) / 100000,
    {
      generateRect: cellSizeMode === 'random',
    }
  ).map(
    (rect, i): Cell => ({
      pathImage: shuffled[i],
      indexColor: colorIndices[i],
      rect,
    })
  );
});
