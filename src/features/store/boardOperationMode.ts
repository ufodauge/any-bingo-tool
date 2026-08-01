import { getDefaultStore, useAtomValue } from "jotai";
import { atomWithStorage } from "jotai/utils";
import * as vb from "valibot";

const BOARD_OPERATION_MODE_KEY = "board:board-operation-mode";

const boardOperationModes = vb.union([
  vb.object({
    mode: vb.literal("default"),
  }),
  vb.object({
    mode: vb.literal("paint"),
    currentColorIndex: vb.number(),
  }),
]);

export const isBoardOperationMode = (value: unknown): value is BoardOperationMode =>
  vb.safeParse(boardOperationModes, value).success;

export type BoardOperationMode = vb.InferOutput<typeof boardOperationModes>;

const boardOperationModeAtom = atomWithStorage<BoardOperationMode>(
  BOARD_OPERATION_MODE_KEY,
  { mode: "default" },
  undefined,
  { getOnInit: true },
);

export const useBoardOperationModeValue = () => useAtomValue(boardOperationModeAtom);

export const updateOperationMode = (mode: BoardOperationMode) => {
  getDefaultStore().set(boardOperationModeAtom, mode);
};

export const updatePaintColor = (currentColorIndex: number) => {
  const store = getDefaultStore();
  const currentMode = store.get(boardOperationModeAtom);
  if (currentMode.mode === "paint") {
    store.set(boardOperationModeAtom, { ...currentMode, currentColorIndex });
  }
};
