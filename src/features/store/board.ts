import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import imageData from '../../libs/images.json';
import { seedNumberAtom } from './seed';
import { colorIndicesAtom } from './colors/indicies';
import { shuffleArray, XorShift } from '../../libs/random';
import { variableCellSizeAtom } from './boardOptions';
import { generateRandomSquares } from '../../libs/squarePacking';

export const boardSizes = [3, 4, 5, 6, 7, 8, 9];
type BoardSize = (typeof boardSizes)[number];
export const isBoardSize = (value: number): value is BoardSize =>
  boardSizes.includes(value);

export const boardSizeAtom = atomWithStorage<BoardSize>(
  'bingo:grid-size',
  7,
  undefined,
  {
    getOnInit: true,
  }
);

export const cellsCountAtom = atom((get) => {
  const size = get(boardSizeAtom);
  return size * size;
});

type Cell = {
  pathImage: string;
  indexColor: number;
  size: number;
};

export const cellsAtom = atom<Cell[] | undefined>((get) => {
  const { icons } = imageData;
  const cellsCount = get(cellsCountAtom);
  const seed = get(seedNumberAtom);
  const colorIndices = get(colorIndicesAtom);
  const size = get(boardSizeAtom);
  const variableCellSize = get(variableCellSizeAtom);

  if (cellsCount !== colorIndices.length) {
    console.debug(
      `cellsCount (${cellsCount}) !== colorIndices.length (${colorIndices.length})`
    );
    return undefined;
  }

  const shuffled = shuffleArray(icons, seed);
  if (variableCellSize === false) {
    return shuffled.slice(0, cellsCount).map((v, i) => ({
      pathImage: v,
      indexColor: colorIndices[i],
      size: 1,
    }));
  }

  const rng = new XorShift(seed);
  const maxSize = Math.min(Math.floor(size / 2), 3);

  return generateRandomSquares(
    size,
    maxSize,
    () => rng.nextInt(0, 100000) / 100000
  ).map(
    (v, i): Cell => ({
      pathImage: shuffled[i],
      indexColor: colorIndices[i],
      size: v.size,
    })
  );
});
