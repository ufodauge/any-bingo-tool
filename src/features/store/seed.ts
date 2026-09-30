import { atom, useAtomValue, useSetAtom } from "jotai";
import { selectAtom } from "jotai/utils";

import { queryParamsAtom } from "./queryParams";
import { BOARD_COUNT_MAX, type SeedScope } from "./schemas";

const boundSeedNumber = (value: number) => Math.max(value, 0);

export const getRandomSeedNumber = () => boundSeedNumber(Math.trunc(Math.random() * 1000000));

export const seedNumberAtom = atom((get) => get(queryParamsAtom).seed);

export const seedScopeAtom = atom(
  (get) => get(queryParamsAtom).mode.seedScope,
  (get, set, scope: SeedScope) => {
    const status = structuredClone(get(queryParamsAtom));
    status.mode.seedScope = scope;
    status.extraBoardSeeds = Array.from(
      { length: BOARD_COUNT_MAX - 1 },
      (_, i) => status.extraBoardSeeds[i] ?? getRandomSeedNumber(),
    );
    set(queryParamsAtom, status);
  },
);

export const keepMarksOnSeedChangeAtom = atom(
  (get) => get(queryParamsAtom).mode.keepMarksOnSeedChange,
  (get, set, keep: boolean) => {
    const status = structuredClone(get(queryParamsAtom));
    status.mode.keepMarksOnSeedChange = keep;
    set(queryParamsAtom, status);
  },
);

// 共通シードのときは undefined: 1 本の乱数列を全ボードで順に使う (既存の盤面を変えないため)
const boardSeedsSourceAtom = atom((get) => {
  const { seed, extraBoardSeeds, mode } = get(queryParamsAtom);
  if (mode.seedScope === "shared") {
    return undefined;
  }
  return Array.from({ length: mode.boardCount }, (_, i) =>
    i === 0 ? seed : (extraBoardSeeds[i - 1] ?? seed + i),
  );
});

export const boardSeedsAtom = selectAtom(
  boardSeedsSourceAtom,
  (seeds) => seeds,
  (a, b) => a === b || (!!a && !!b && a.length === b.length && a.every((v, i) => v === b[i])),
);

export const setBoardSeedAtom = atom(
  null,
  (get, set, { boardIndex, seed }: { boardIndex: number; seed: number }) => {
    const status = structuredClone(get(queryParamsAtom));
    const bounded = boundSeedNumber(seed);
    if (boardIndex === 0) {
      status.seed = bounded;
    } else {
      status.extraBoardSeeds = Array.from(
        { length: Math.max(status.extraBoardSeeds.length, boardIndex) },
        (_, i) =>
          i === boardIndex - 1 ? bounded : (status.extraBoardSeeds[i] ?? getRandomSeedNumber()),
      );
    }
    set(queryParamsAtom, status);
  },
);

export const useSeedValue = (boardIndex: number) => {
  const seed = useAtomValue(seedNumberAtom);
  const boardSeeds = useAtomValue(boardSeedsAtom);
  return boardSeeds?.[boardIndex] ?? seed;
};

export const useSetSeed = () => useSetAtom(setBoardSeedAtom);
