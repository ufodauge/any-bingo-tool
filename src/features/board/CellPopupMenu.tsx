import { atom, useAtom, useAtomValue } from "jotai";
import { useId, useState, type ReactNode } from "react";

import { boardSizeAtom, type BoardCell } from "../store/board";
import { computeTargets, targetCandidates, type CellTarget } from "../store/cellActions";
import { usePaletteValue } from "../store/colors/colors";
import { useColorIndices, useSetColorIndices } from "../store/colors/indices";
import { buildNeighborIndices } from "../store/neighbors";
import type { BoardCount } from "../store/schemas";

type Props = {
  cells: readonly BoardCell[];
  index: number;
  boardIndex: BoardCount;
};

const ANCHOR_NAME = "--cell-menu-button";

type MenuPrefs = { target: CellTarget; overwrite: boolean; color: number; count: number };

// NOTE: ページを開いている間だけ、最後に使った選択を覚える (全セル共通)
const menuPrefsAtom = atom<MenuPrefs>({ target: "self", overwrite: false, color: 1, count: 1 });

const TARGETS: { value: CellTarget; label: string; tip?: string }[] = [
  { value: "self", label: "このマスのみ" },
  { value: "neighbors", label: "上下左右のマス" },
  { value: "random", label: "ランダムに選んだマス" },
];

const PROPERTIES: { value: boolean; label: string; tip?: string }[] = [
  { value: false, label: "未変更マスのみ塗る" },
  { value: true, label: "変更済みのマスも塗り替える" },
];

const swatchClass = (selected: boolean) =>
  `size-8 shrink-0 cursor-pointer rounded-full border-2 border-base-content/20 ${
    selected ? "ring-primary ring-2 ring-offset-1" : ""
  }`;

export const CellPopupMenu = ({ cells, index, boardIndex }: Props): ReactNode => {
  const popoverId = useId();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        popoverTarget={popoverId}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        onPointerEnter={(e) => e.stopPropagation()}
        className="bg-base-100 border-base-300 text-base-content absolute top-0.5 right-0.5 z-10 grid size-5 cursor-pointer place-items-center rounded-full border text-xs leading-none opacity-0 group-focus-within:opacity-60 group-hover:opacity-60 group-has-[:popover-open]:opacity-100 hover:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-40"
        style={{ anchorName: ANCHOR_NAME }}
      >
        ⋯
      </button>
      <div
        id={popoverId}
        popover="auto"
        className="rounded-box bg-base-100 outline-base-300 absolute m-0 w-max max-w-[min(18rem,calc(100vw-1rem))] cursor-auto p-3 shadow-lg outline-1"
        onToggle={(e) => setOpen(e.newState === "open")}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        style={{
          positionAnchor: ANCHOR_NAME,
          positionArea: "bottom span-left",
          positionTryFallbacks: "flip-block, flip-inline",
        }}
      >
        {open && (
          <MenuBody
            cells={cells}
            index={index}
            boardIndex={boardIndex}
            close={() => document.getElementById(popoverId)?.hidePopover()}
          />
        )}
      </div>
    </>
  );
};

type BodyProps = Props & { close: () => void };

type ChoiceProps<T> = {
  name: string;
  options: { value: T; label: string; tip?: string }[];
  value: T;
  onChange: (value: T) => void;
};

const Choice = <T,>({ name, options, value, onChange }: ChoiceProps<T>): ReactNode =>
  options.length === 2 ? (
    <>
      <label className="label">
        <input
          type="checkbox"
          className="toggle"
          defaultChecked={value === options[1].value}
          onChange={(e) => onChange(options[e.currentTarget.checked ? 1 : 0].value)}
        />
        {options[1].label}
      </label>
    </>
  ) : (
    <div className="grid gap-1">
      {options.map((o) => (
        <label
          key={o.label}
          className="tooltip has-checked:btn-primary grid cursor-pointer grid-cols-[auto_1fr] gap-2"
          data-tip={o.tip}
        >
          <input
            type="radio"
            name={name}
            className="radio"
            checked={o.value === value}
            onChange={() => onChange(o.value)}
          />
          {o.label}
        </label>
      ))}
    </div>
  );

const MenuBody = ({ cells, index, boardIndex, close }: BodyProps): ReactNode => {
  const popoverId = useId();
  const setColorIndices = useSetColorIndices();
  const colorIndices = useColorIndices();
  const palette = usePaletteValue();
  const size = useAtomValue(boardSizeAtom);
  const [prefs, setPrefs] = useAtom(menuPrefsAtom);
  const update = (patch: Partial<MenuPrefs>) => setPrefs({ ...prefs, ...patch });

  const row = colorIndices.at(boardIndex) ?? [];
  const color = Math.min(prefs.color, palette.length - 1);
  const params = {
    target: prefs.target,
    overwrite: prefs.overwrite,
    index,
    row,
    neighbors: buildNeighborIndices(cells, size)[index] ?? [],
    color,
  };
  const candidateCount = targetCandidates(params).length;
  const count = Math.min(Math.max(prefs.count, 1), Math.max(candidateCount, 1));

  const run = () => {
    setColorIndices({
      action: "set-values",
      indices: computeTargets({ ...params, count }),
      boardIndex,
      value: color,
    });
    close();
  };

  return (
    <div className="flex min-w-60 flex-col gap-2">
      <div className="grid grid-flow-col-dense gap-1">
        {palette.map((c, i) => (
          <button
            type="button"
            key={`color-${i}`}
            className={swatchClass(color === i)}
            style={{ backgroundColor: c }}
            onClick={() => update({ color: i })}
          />
        ))}
      </div>
      <div className="divider my-0" />
      <div className="grid gap-2">
        <h3 className="text-sm font-bold">塗るマス</h3>
        <Choice
          name={`${popoverId}-target`}
          options={TARGETS}
          value={prefs.target}
          onChange={(target) => update({ target })}
        />
      </div>
      <div className="divider my-0" />
      <div className="grid gap-2">
        <h3 className="text-sm font-bold"></h3>
        <Choice
          name={`${popoverId}-property`}
          options={PROPERTIES}
          value={prefs.overwrite}
          onChange={(overwrite) => update({ overwrite })}
        />
      </div>
      <div className="flex items-center gap-2">
        {prefs.target === "random" && (
          <input
            type="number"
            inputMode="numeric"
            className="input input-sm w-16 text-center"
            min={1}
            max={Math.max(candidateCount, 1)}
            value={count}
            onChange={(e) => {
              const n = e.currentTarget.valueAsNumber;
              update({ count: Number.isNaN(n) ? 1 : Math.trunc(n) });
            }}
          />
        )}
        <button
          type="button"
          className="btn btn-sm btn-primary flex-1"
          disabled={candidateCount === 0}
          onClick={run}
        >
          塗る
        </button>
      </div>
    </div>
  );
};
