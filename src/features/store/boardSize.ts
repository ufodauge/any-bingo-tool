import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export const MIN_BOARD_SCALE = 30;
export const MAX_BOARD_SCALE = 100;

const rawBoardScaleAtom = atomWithStorage<number>("board:scale", MAX_BOARD_SCALE, undefined, {
  getOnInit: true,
});

const clampScale = (value: number) => Math.min(MAX_BOARD_SCALE, Math.max(MIN_BOARD_SCALE, value));

export const boardScaleAtom = atom(
  (get) => clampScale(get(rawBoardScaleAtom)),
  (_get, set, value: number) => {
    set(rawBoardScaleAtom, clampScale(value));
  },
);
