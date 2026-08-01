import { atom, useAtomValue } from "jotai";
import { useMemo } from "react";

import type { Rect } from "../../libs/forms";
import {
  shuffleArrayWith,
  SplitMix64,
  weightedSampleWithoutReplacementWith,
  weightedSampleWithReplacementWith,
  type Weighted,
} from "../../libs/random";
import { generateRandomRects } from "../../libs/squarePacking";
import { useBoardCount } from "./boardCount";
import { cellSizeModeAtom } from "./boardOptions";
import { colorIndicesAtom } from "./colors/indices";
import { iconResourceItemsAtom } from "./iconResource";
import { iconConfigsAtom, type IconConfig } from "./icons";
import { queryParamsAtom } from "./queryParams";
import type { BoardSize } from "./schemas";
import { seedNumberAtom } from "./seed";

export const allowSameElementOccurrenceAtom = atom(
  (get) => get(queryParamsAtom).mode.allowSameElementOccurrence,
  (get, set, allow: boolean) => {
    const status = structuredClone(get(queryParamsAtom));
    status.mode.allowSameElementOccurrence = allow;
    set(queryParamsAtom, status);
  },
);

export const boardSizeAtom = atom(
  (get) => get(queryParamsAtom).mode.boardSize,
  (get, set, size: BoardSize) => {
    const status = structuredClone(get(queryParamsAtom));
    status.mode.boardSize = size;
    set(queryParamsAtom, status);
  },
);

export const cellsCountAtom = atom((get) => {
  const size = get(boardSizeAtom);
  return size * size;
});

export type BoardCell = {
  pathImage: string;
  url: string;
  indexColor: number;
  rect: Rect;
};

const RECT_MIN_SIZE = {
  width: 1,
  height: 1,
} as const;

const toWeighted = (configs: readonly IconConfig[]): Weighted<string>[] =>
  configs.map((config) => ({ value: config.pathImage, weight: config.weight }));

const useCells = () => {
  const iconConfigs = useAtomValue(iconConfigsAtom);
  const iconResourceItems = useAtomValue(iconResourceItemsAtom);
  const cellsCount = useAtomValue(cellsCountAtom);
  const boardCount = useBoardCount();
  const seed = useAtomValue(seedNumberAtom);
  const colorIndices = useAtomValue(colorIndicesAtom);
  const size = useAtomValue(boardSizeAtom);
  const cellSizeMode = useAtomValue(cellSizeModeAtom);
  const allowSameElementOccurrence = useAtomValue(allowSameElementOccurrenceAtom);

  const shuffled = useMemo(() => {
    const rng = new SplitMix64(seed);
    const enabledConfigs = iconConfigs.filter((config) => config.enabled);
    const requiredConfigs = enabledConfigs.filter((config) => config.required);
    const optionalConfigs = enabledConfigs.filter((config) => !config.required);

    return Array.from({ length: boardCount }, () => {
      const requiredPicks = allowSameElementOccurrence
        ? requiredConfigs.map((config) => config.pathImage).slice(0, cellsCount)
        : weightedSampleWithoutReplacementWith(
            toWeighted(requiredConfigs),
            Math.min(requiredConfigs.length, cellsCount),
            rng,
          );

      const remainingCount = Math.max(cellsCount - requiredPicks.length, 0);

      const optionalPicks = allowSameElementOccurrence
        ? weightedSampleWithReplacementWith(toWeighted(optionalConfigs), remainingCount, rng)
        : weightedSampleWithoutReplacementWith(toWeighted(optionalConfigs), remainingCount, rng);

      // 有効な要素だけでは埋めきれない場合は重複を許可して穴埋めする
      const shortfall = remainingCount - optionalPicks.length;
      const fillerPicks =
        shortfall > 0
          ? weightedSampleWithReplacementWith(toWeighted(enabledConfigs), shortfall, rng)
          : [];

      return shuffleArrayWith([...requiredPicks, ...optionalPicks, ...fillerPicks], rng);
    });
  }, [allowSameElementOccurrence, boardCount, iconConfigs, cellsCount, seed]);

  const iconUrls = useMemo(
    () => new Map(iconResourceItems.map((item) => [item.id, item.url])),
    [iconResourceItems],
  );

  const cellsForNormalMode: BoardCell[][] | undefined = useMemo(() => {
    if (cellSizeMode !== "normal") {
      return undefined;
    }

    return shuffled.map((icons, boardIndex) =>
      icons.slice(0, cellsCount).map((path, i) => ({
        pathImage: path,
        url: iconUrls.get(path) ?? "",
        indexColor: colorIndices[boardIndex][i],
        rect: RECT_MIN_SIZE,
      })),
    );
  }, [cellSizeMode, shuffled, cellsCount, colorIndices, iconUrls]);

  const rectsSet = useMemo(() => {
    const rng = new SplitMix64(seed);
    const maxSize = Math.min(Math.floor(size / 2), 3);

    return Array.from({ length: boardCount }, () =>
      generateRandomRects(
        size,
        cellSizeMode === "random-square" ? maxSize : size,
        () => rng.nextInt(0, 100000) / 100000,
        {
          generateRect: cellSizeMode === "random",
        },
      ),
    );
  }, [boardCount, cellSizeMode, seed, size]);

  const cellsForRandomCellSizeMode: BoardCell[][] | undefined = useMemo(() => {
    if (cellSizeMode === "normal") {
      return undefined;
    }

    return rectsSet.map((rects, boardIndex) =>
      rects.map((rect, i): BoardCell => {
        const path = shuffled[boardIndex][i];
        return {
          pathImage: path,
          url: iconUrls.get(path) ?? "",
          indexColor: colorIndices[boardIndex]?.[i],
          rect,
        };
      }),
    );
  }, [cellSizeMode, rectsSet, shuffled, colorIndices, iconUrls]);

  if (boardCount !== colorIndices.length || cellsCount !== colorIndices[0]?.length) {
    console.debug(
      `Color indices length does not match cells count or board count. \
This may be caused by changing the board size or board count. Resetting color indices.\
(boardCount: ${boardCount}, colorIndices.length: ${colorIndices.length}, cellsCount: ${cellsCount}, colorIndices[0]?.length: ${colorIndices[0]?.length})`,
    );
    return undefined;
  }

  return cellSizeMode === "normal" ? cellsForNormalMode : cellsForRandomCellSizeMode;
};

export const useCellsSet = () => {
  const cells = useCells();
  return useMemo(() => cells, [cells]);
};
