import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

import { iconResourceItemsAtom } from "./iconResource";

export type IconConfig = {
  pathImage: string;
  enabled: boolean;
  required: boolean;
  weight: number;
};

export type IconConfigWithResource = IconConfig & {
  url: string;
  label: string;
};

const DEFAULT_WEIGHT = 1;

const createDefaultIconConfig = (pathImage: string): IconConfig => ({
  pathImage,
  enabled: true,
  required: false,
  weight: DEFAULT_WEIGHT,
});

const storedIconConfigsAtom = atomWithStorage<IconConfig[]>("icons:config", [], undefined, {
  getOnInit: true,
});

// アイコンリソース側の要素が増減しても保存済み設定と齟齬が出ないようにマージする
export const iconConfigsAtom = atom(
  (get) => {
    const stored = new Map(get(storedIconConfigsAtom).map((config) => [config.pathImage, config]));
    return get(iconResourceItemsAtom).map(
      (item) => stored.get(item.id) ?? createDefaultIconConfig(item.id),
    );
  },
  (get, set, update: (prev: IconConfig[]) => IconConfig[]) => {
    set(storedIconConfigsAtom, update(get(iconConfigsAtom)));
  },
);

// すべての要素を初期状態（候補ON・必須OFF・出現率1）に戻す
export const resetIconConfigsAtom = atom(null, (get, set) => {
  set(
    storedIconConfigsAtom,
    get(iconResourceItemsAtom).map((item) => createDefaultIconConfig(item.id)),
  );
});

// 設定画面表示用: 候補/必須/出現率にリソース側の表示情報（画像URL・ラベル）を合成する
export const iconConfigsWithResourceAtom = atom((get) => {
  const items = new Map(get(iconResourceItemsAtom).map((item) => [item.id, item]));
  return get(iconConfigsAtom).flatMap((config) => {
    const item = items.get(config.pathImage);
    if (!item) {
      return [];
    }
    return [{ ...config, url: item.url, label: item.label ?? item.id }];
  });
});
