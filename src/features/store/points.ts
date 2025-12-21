import { atom } from 'jotai';
import { queryParamsAtom } from './queryParams';
import type { PointsCalculateMode } from './schemas';

export const pointsCalculateModeAtom = atom(
  (get) => get(queryParamsAtom).mode.pointsCalculate,
  (get, set, mode: PointsCalculateMode) => {
    const status = structuredClone(get(queryParamsAtom));
    status.mode.pointsCalculate = mode;
    set(queryParamsAtom, status);
  }
);
