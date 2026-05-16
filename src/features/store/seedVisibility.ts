import { atomWithStorage } from 'jotai/utils';

export const seedVisibleAtom = atomWithStorage(
  'seed:visible',
  false,
  undefined,
  {
    getOnInit: true,
  }
);
