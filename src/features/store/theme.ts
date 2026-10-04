import { atom, useAtomValue } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { useEffect } from "react";

// src/index.css の daisyUI の themes と揃える (system は OS の配色設定に従う = data-theme を付けない)
export const THEMES = [
  "pastel",
  "light",
  "cupcake",
  "retro",
  "nord",
  "dracula",
  "dark",
  "night",
  "synthwave",
  "forest",
] as const;

export type ThemeName = (typeof THEMES)[number];
export type ThemeSetting = ThemeName | "system";

// NOTE: index.html の先頭のインラインスクリプトが同じキーを読んで初回描画前に適用している
export const THEME_STORAGE_KEY = "theme";

// テーマは閲覧者ごとの好みなので URL の状態ではなく localStorage にだけ保存する
const rawThemeAtom = atomWithStorage<string>(THEME_STORAGE_KEY, "system", undefined, {
  getOnInit: true,
});

const isThemeName = (value: unknown): value is ThemeName =>
  (THEMES as readonly string[]).includes(value as string);

export const themeAtom = atom(
  (get): ThemeSetting => {
    const value = get(rawThemeAtom);
    return isThemeName(value) ? value : "system";
  },
  (_get, set, value: ThemeSetting) => {
    set(rawThemeAtom, value);
  },
);

// 選択中のテーマを <html data-theme> に反映する (system のときは属性を外して OS の配色に任せる)
export const useApplyTheme = () => {
  const theme = useAtomValue(themeAtom);
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") {
      delete root.dataset.theme;
    } else {
      root.dataset.theme = theme;
    }
  }, [theme]);
};
