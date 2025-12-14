import { useAtomValue } from "jotai";
import { atomWithStorage, useAtomCallback } from "jotai/utils";
import { useCallback } from "react";

const boundSeedNumber = (value: number) => Math.max(value, 0);
const getRandomSeedNumber = () =>
  boundSeedNumber(Math.trunc(Math.random() * 100000));

export const seedNumberAtom = atomWithStorage(
  'bingo:seed',
  getRandomSeedNumber(),
  undefined,
  {
    getOnInit: true,
  }
);

export const useSeedNumberValue = () => useAtomValue(seedNumberAtom);
type SeedNumberAction =
  | {
      action: 'randomise';
    }
  | {
      action: 'set';
      value: number;
    };

export const useSeedNumberReducer = () =>
  useAtomCallback(
    useCallback((_, set, action: SeedNumberAction) => {
      if (action.action === 'randomise') {
        set(seedNumberAtom, getRandomSeedNumber());
      } else if (action.action === 'set') {
        set(seedNumberAtom, boundSeedNumber(action.value));
      }
    }, [])
  );