import { useAtom } from "jotai";

import { boardScaleAtom, MAX_BOARD_SCALE, MIN_BOARD_SCALE } from "./store/boardSize";

// 盤面の倍率スライダー (盤面領域の下端の余白に重ねる小さなコントロール)
export const BoardScaleSlider = () => {
  const [boardScale, setBoardScale] = useAtom(boardScaleAtom);

  return (
    <label
      className="absolute right-2 bottom-0 flex h-6 items-center gap-1 opacity-60 transition-opacity focus-within:opacity-100 hover:opacity-100"
      title="盤面の自動フィットサイズに対する倍率"
    >
      <input
        type="range"
        className="range range-xs w-20"
        value={boardScale}
        min={MIN_BOARD_SCALE}
        max={MAX_BOARD_SCALE}
        onChange={(e) => setBoardScale(e.currentTarget.valueAsNumber)}
      />
      <span className="w-9 text-right text-xs">{boardScale}%</span>
    </label>
  );
};
