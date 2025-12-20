import { atomWithStorage } from 'jotai/utils';

type PointsCalculateMode = 'count' | 'size';

export const pointsCalculateModeAtom = atomWithStorage<PointsCalculateMode>(
  'bingo:points-calculate-mode',
  'size',
  undefined,
  { getOnInit: true }
);
