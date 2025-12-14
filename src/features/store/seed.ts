import { atom, useAtomValue } from 'jotai';
import { useAtomCallback } from 'jotai/utils';
import { useCallback } from 'react';

const getCurrentQueryParams = () =>
  new URL(decodeURIComponent(document.location.href)).searchParams;

const boundSeedNumber = (value: number) => Math.max(value, 0);
const getRandomSeedNumber = () =>
  boundSeedNumber(Math.trunc(Math.random() * 1000000));

const seedNumberPrimitiveAtom = atom<number>();
export const seedNumberAtom = atom(
  (get) => {
    const primitive = get(seedNumberPrimitiveAtom);
    const queryParams = getCurrentQueryParams();
    const seedRaw = queryParams.get('seed');

    if (seedRaw) {
      return Number.parseInt(seedRaw, 10);
    }

    return primitive ?? getRandomSeedNumber();
  },
  (_get, set, seed: number) => {
    const queryParams = getCurrentQueryParams();
    queryParams.set('seed', seed.toString());
    const paramsStr = [...queryParams.entries()]
      .map((v) => v.join('='))
      .join('&');

    history.replaceState(
      history.state,
      '',
      `${document.location.pathname}?${paramsStr}`
    );

    set(seedNumberPrimitiveAtom, seed);
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
