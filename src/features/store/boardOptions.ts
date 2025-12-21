import { atom } from 'jotai';
import { queryParamsAtom } from './queryParams';
import type { CellSizeMode } from './schemas';

export const cellSizeModeAtom = atom(
  (get) => get(queryParamsAtom).mode.cellSize,
  (get, set, mode: CellSizeMode) => {
    const status = structuredClone(get(queryParamsAtom));
    status.mode.cellSize = mode;
    set(queryParamsAtom, status);
  }
);
