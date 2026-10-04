import { useAtomValue } from "jotai";
import { useId, useState, type ReactNode } from "react";

import { boardSizeAtom, type BoardCell } from "../store/board";
import { filterUnpainted, pickRandom, unpaintedIndices } from "../store/cellActions";
import { useMarkerColorsValue } from "../store/colors/colors";
import { useColorIndices, useSetColorIndices } from "../store/colors/indices";
import { buildNeighborIndices } from "../store/neighbors";
import type { BoardCount } from "../store/schemas";

type Props = {
  cells: readonly BoardCell[];
  index: number;
  boardIndex: BoardCount;
};

const ANCHOR_NAME = "--cell-menu-button";

const swatchClass = (selected: boolean) =>
  `size-8 shrink-0 cursor-pointer rounded-full border-2 border-neutral-300 ${
    selected ? "ring-primary ring-2 ring-offset-1" : ""
  }`;

/** セル右上の「⋯」ボタンと、それが開くメニュー (ホバー / フォーカス / タッチ端末で表示) */
export const CellPopupMenu = ({ cells, index, boardIndex }: Props): ReactNode => {
  const popoverId = useId();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label="セルのメニュー"
        popoverTarget={popoverId}
        // NOTE: セル本体の click (色変更・塗り) を発火させない
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        onPointerEnter={(e) => e.stopPropagation()}
        className="bg-base-100 border-base-300 text-base-content absolute top-0.5 right-0.5 z-10 grid size-5 cursor-pointer place-items-center rounded-full border text-xs leading-none opacity-0 group-focus-within:opacity-60 group-hover:opacity-60 group-has-[:popover-open]:opacity-100 hover:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-40"
        // NOTE: anchorScope はセル側で指定している
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

const MenuBody = ({ cells, index, boardIndex, close }: BodyProps): ReactNode => {
  const setColorIndices = useSetColorIndices();
  const colorIndices = useColorIndices();
  const colors = useMarkerColorsValue();
  const size = useAtomValue(boardSizeAtom);

  // (b), (c) 共通の塗る色 (1 始まりの colorIndex)
  const [actionColor, setActionColor] = useState(1);
  const [count, setCount] = useState(1);

  const row = colorIndices.at(boardIndex) ?? [];
  const colorIndex = row.at(index);

  const neighborTargets = filterUnpainted(row, buildNeighborIndices(cells, size)[index] ?? []);
  const unpainted = unpaintedIndices(row);
  const maxCount = Math.max(unpainted.length, 1);
  const clampedCount = Math.min(Math.max(count, 1), maxCount);
  const dotColor = colors.at(actionColor - 1);

  const paintIndices = (indices: readonly number[]) => {
    setColorIndices({ action: "set-values", indices, boardIndex, value: actionColor });
    close();
  };

  return (
    <div className="flex flex-col gap-3">
      <section className="flex flex-col gap-1">
        <h3 className="text-xs font-bold">このマスの色</h3>
        <div className="grid grid-cols-4 gap-1">
          <button
            type="button"
            aria-label="未塗り"
            className={`bg-base-100 ${swatchClass(colorIndex === 0)}`}
            onClick={() => {
              setColorIndices({ action: "set-value", index, boardIndex, value: 0 });
              close();
            }}
          />
          {colors.map((color, i) => (
            <button
              type="button"
              key={`color-${i}`}
              aria-label={`色 ${i + 1}`}
              className={swatchClass(colorIndex === i + 1)}
              style={{ backgroundColor: color }}
              onClick={() => {
                setColorIndices({ action: "set-value", index, boardIndex, value: i + 1 });
                close();
              }}
            />
          ))}
        </div>
      </section>

      <section className="border-base-300 flex flex-col gap-2 border-t pt-2">
        <h3 className="text-xs font-bold">まとめて塗る色</h3>
        <div className="grid grid-cols-4 gap-1">
          {colors.map((color, i) => (
            <button
              type="button"
              key={`action-color-${i}`}
              aria-label={`色 ${i + 1}`}
              aria-pressed={actionColor === i + 1}
              className={swatchClass(actionColor === i + 1)}
              style={{ backgroundColor: color }}
              onClick={() => setActionColor(i + 1)}
            />
          ))}
        </div>

        <button
          type="button"
          className="btn btn-sm justify-start"
          disabled={neighborTargets.length === 0}
          onClick={() => paintIndices(neighborTargets)}
        >
          上下左右を
          <span
            className="inline-block size-4 rounded-full border border-neutral-300"
            style={{ backgroundColor: dotColor }}
          />
          で開く
        </button>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1 text-sm">
            <span>塗られていないマスからランダムに</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="btn btn-sm btn-square"
              aria-label="減らす"
              disabled={clampedCount <= 1}
              onClick={() => setCount(clampedCount - 1)}
            >
              −
            </button>
            <input
              type="number"
              inputMode="numeric"
              className="input input-sm w-16 text-center"
              min={1}
              max={maxCount}
              value={clampedCount}
              disabled={unpainted.length === 0}
              onChange={(e) => {
                const n = e.currentTarget.valueAsNumber;
                setCount(Number.isNaN(n) ? 1 : Math.trunc(n));
              }}
            />
            <button
              type="button"
              className="btn btn-sm btn-square"
              aria-label="増やす"
              disabled={clampedCount >= maxCount}
              onClick={() => setCount(clampedCount + 1)}
            >
              +
            </button>
            <span className="text-sm">個を</span>
            <span
              className="inline-block size-4 rounded-full border border-neutral-300"
              style={{ backgroundColor: dotColor }}
            />
          </div>
          <button
            type="button"
            className="btn btn-sm btn-primary"
            disabled={unpainted.length === 0}
            onClick={() => paintIndices(pickRandom(unpainted, clampedCount))}
          >
            で塗る
          </button>
        </div>
      </section>
    </div>
  );
};
