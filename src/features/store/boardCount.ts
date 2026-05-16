import { atom, useAtomValue, useSetAtom } from 'jotai';
import { queryParamsAtom } from './queryParams';
import type { BoardCount } from './schemas';

export const boardCountAtom = atom(
  (get) => get(queryParamsAtom).mode.boardCount as BoardCount,
  (get, set, count: BoardCount) => {
    const status = structuredClone(get(queryParamsAtom));
    status.mode.boardCount = count;
    set(queryParamsAtom, status);
  }
);

export const useBoardCount = () => useAtomValue(boardCountAtom);
export const useSetBoardCount = () => useSetAtom(boardCountAtom);
