import { useAtom, useAtomValue } from 'jotai';
import { cellsAtom } from './store/board';
import {
  useDefaultMarkerColorOption,
  useMarkerColorsValue,
} from './store/colors/colors';
import { pointsCalculateModeAtom } from './store/points';
import { IconExposurePlus } from '../libs/icons/ExposurePlus';
import { IconWeight } from '../libs/icons/Weight';

export const ColorCounter = () => {
  const colors = useMarkerColorsValue();
  const cells = useAtomValue(cellsAtom);
  const defaultMarkerColorOption = useDefaultMarkerColorOption();
  const [pointsCalculateMode, setPointsCalculateMode] = useAtom(
    pointsCalculateModeAtom
  );

  if (cells === undefined) {
    return;
  }

  const pointMap = cells.reduce(
    (acc, { indexColor, rect }) => {
      const at = acc.at(indexColor);
      if (at === undefined) {
        return acc;
      }

      at.value +=
        pointsCalculateMode === 'count' ? 1 : rect.height * rect.width;
      return acc;
    },
    [undefined, ...colors].reduce<{ color?: string; value: number }[]>(
      (acc, v, i) => {
        acc[i] = { color: v, value: 0 };
        return acc;
      },
      []
    )
  );

  return (
    <div className="flex gap-2 items-center">
      {pointMap.map(({ color, value }, i) => (
        <div className={`grid w-6 justify-stretch`} key={`point-${i}`}>
          <span className="text-center text-base-content font-bold">
            {value}
          </span>
          <span
            className={`h-1 rounded-full outline-1 outline-neutral-300 ${
              color === undefined
                ? defaultMarkerColorOption.hidden
                  ? 'bg-base-300'
                  : 'bg-base-100'
                : ''
            }`}
            style={{
              backgroundColor: color,
            }}
          ></span>
        </div>
      ))}
      <label className="btn btn-circle swap swap-rotate">
        <input
          type="checkbox"
          checked={pointsCalculateMode === 'size'}
          onChange={(e) =>
            setPointsCalculateMode(e.currentTarget.checked ? 'size' : 'count')
          }
        />
        <div className="swap-off fill-current">
          <IconExposurePlus />
        </div>
        <div className="swap-on fill-current">
          <IconWeight />
        </div>
      </label>
    </div>
  );
};
