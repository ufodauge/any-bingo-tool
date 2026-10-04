import { useAtom } from "jotai";

import { THEMES, themeAtom, type ThemeSetting } from "../store/theme";

const ITEM_CLASS =
  "tooltip border-base-content/30 grid h-9 w-14 cursor-pointer place-items-center rounded-lg border-2 p-0";

const Dots = () => (
  <span className="flex gap-0.5">
    <span className="bg-primary size-2.5 rounded-full" />
    <span className="bg-secondary size-2.5 rounded-full" />
    <span className="bg-accent size-2.5 rounded-full" />
  </span>
);

// 各テーマの配色をそのまま見せるスウォッチ (data-theme をスコープして色を引く)
export const ThemePicker = () => {
  const [theme, setTheme] = useAtom(themeAtom);

  const select = (value: ThemeSetting) => (
    <button
      key={value}
      type="button"
      aria-label={value}
      aria-pressed={theme === value}
      data-tip={value}
      className={`${ITEM_CLASS} ${theme === value ? "ring-primary ring-2 ring-offset-1" : ""}`}
      onClick={() => setTheme(value)}
    >
      {value === "system" ? (
        // 既定のライト/ダークを半分ずつ見せる
        <span className="grid size-full grid-cols-2 overflow-hidden rounded-md">
          <span data-theme="pastel" className="bg-base-100 grid place-items-center">
            <span className="bg-primary size-2.5 rounded-full" />
          </span>
          <span data-theme="dracula" className="bg-base-100 grid place-items-center">
            <span className="bg-primary size-2.5 rounded-full" />
          </span>
        </span>
      ) : (
        <span
          data-theme={value}
          className="bg-base-100 grid size-full place-items-center rounded-md"
        >
          <Dots />
        </span>
      )}
    </button>
  );

  return <div className="flex flex-wrap gap-2">{(["system", ...THEMES] as const).map(select)}</div>;
};
