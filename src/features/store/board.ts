import { atom } from 'jotai';
import imageData from '../../libs/images.json';
import { seedNumberAtom } from './seed';
import { colorIndicesAtom } from './colors/indicies';
import { shuffleArray, XorShift } from '../../libs/random';
import { cellSizeModeAtom } from './boardOptions';
import { generateRandomRects } from '../../libs/squarePacking';
import { getCurrentQueryParams } from '../../libs/getCurrentQueryParams';
import type { Rect } from '../../libs/forms';

export const boardSizes = [3, 4, 5, 6, 7, 8, 9];
type BoardSize = (typeof boardSizes)[number];
export const isBoardSize = (value: number): value is BoardSize =>
  boardSizes.includes(value);

const boardSizePrimitiveAtom = atom<BoardSize>();
export const boardSizeAtom = atom(
  (get) => {
    const primitive = get(boardSizePrimitiveAtom);
    const queryParams = getCurrentQueryParams();
    const raw = queryParams.get('board-size');

    if (raw) {
      const parsed = Number.parseInt(raw, 10);
      return isBoardSize(parsed) ? parsed : 7;
    }

    return primitive ?? 7;
  },
  (_get, set, value: number) => {
    const queryParams = getCurrentQueryParams();
    queryParams.set('board-size', value.toString());
    const paramsStr = [...queryParams.entries()]
      .map((v) => v.join('='))
      .join('&');

    history.replaceState(
      history.state,
      '',
      `${document.location.pathname}?${paramsStr}`
    );

    set(boardSizePrimitiveAtom, value);
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

  if (cellsCount !== colorIndices.length) {
    console.debug(
      `cellsCount (${cellsCount}) !== colorIndices.length (${colorIndices.length})`
    );
    return undefined;
  }

  const shuffled = shuffleArray(icons, seed);
  
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

  const rng = new XorShift(seed);
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
