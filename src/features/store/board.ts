import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import imageData from '../../libs/images.json';
import { seedNumberAtom } from './seed';
import { colorIndicesAtom } from './colors/indicies';
import { shuffleArray } from '../../libs/random';

export const boardSizes = [5, 7, 9];
type BoardSize = (typeof boardSizes)[number];
export const isBoardSize = (value: number): value is BoardSize =>
  value === 5 || value === 7 || value === 9;

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
};

export const cellsAtom = atom<Cell[] | undefined>((get) => {
  const { icons } = imageData;
  const cellsCount = get(cellsCountAtom);
  const seed = get(seedNumberAtom);
  const colorIndices = get(colorIndicesAtom);

  // TODO: 方針
  if (cellsCount !== colorIndices.length) {
    console.debug(
      `cellsCount (${cellsCount}) !== colorIndices.length (${colorIndices.length})`
    );
    return undefined;
  }

  return shuffleArray(icons, seed)
    .slice(0, cellsCount)
    .map((v, i) => ({
      pathImage: v,
      indexColor: colorIndices[i],
    }));
});
