import { useAtomValue } from "jotai";
import { memo } from "react";

import { type BoardCell } from "./store/board";
import { useMarkerColorsValue } from "./store/colors/colors";
import { pointsCalculateModeAtom } from "./store/points";

type Props = {
  cells: BoardCell[];
};

export const ColorCounter = memo(function ColorCounter({ cells }: Props) {
  const colors = useMarkerColorsValue();

  const pointsCalculateMode = useAtomValue(pointsCalculateModeAtom);

  if (cells === undefined) {
    return;
  }

  const pointMap = cells.reduce(
    (acc, { indexColor, rect }) => {
      const at = acc.at(indexColor);
      if (at === undefined) {
        return acc;
      }

      at.value += pointsCalculateMode === "count" ? 1 : rect.height * rect.width;
      return acc;
    },
    [undefined, ...colors].reduce<{ color?: string; value: number }[]>((acc, v, i) => {
      acc[i] = { color: v, value: 0 };
      return acc;
    }, []),
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      {pointMap.map(({ color, value }, i) => (
        <div className={`grid w-6 justify-stretch`} key={`point-${i}`}>
          <span className="text-base-content text-center font-bold">{value}</span>
          <span
            className={`h-1 rounded-full outline-1 outline-neutral-300 ${
              color === undefined ? "bg-base-100" : ""
            }`}
            style={{
              backgroundColor: color,
            }}
          ></span>
        </div>
      ))}
    </div>
  );
});
