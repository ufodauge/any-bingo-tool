import { atomWithStorage } from 'jotai/utils';

export const variableCellSizeAtom = atomWithStorage(
  'bingo:variable-cell-size',
  false,
  undefined,
  {
    getOnInit: true,
  }
);
