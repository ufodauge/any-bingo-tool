import { type ReactNode } from 'react';
import {
  useMarkerColorsValue,
  useDefaultMarkerColorOption,
} from './store/colors/colors';
import { useColorIndices, useSetColorIndices } from './store/colors/indicies';
import type { Rect } from '../libs/forms';

type Props = {
  cell: {
    pathImage: string;
    indexColor: number;
    rect: Rect;
  };
  index: number;
  className?: string;
};

export const BoardCell = ({ cell, index, className }: Props): ReactNode => {
  const colorIndices = useColorIndices();
  const colors = useMarkerColorsValue();
  const options = useDefaultMarkerColorOption();

  const setColorIndices = useSetColorIndices();

  const colorIndex = colorIndices.at(index);
  const activeColor =
    colorIndex === 0
      ? options.hidden
        ? 'var(--color-base-300)'
        : 'var(--color-base-100)'
      : colorIndex
      ? colors.at(colorIndex - 1)
      : 'transparent';

  const imagePath = import.meta.env.DEV
    ? cell.pathImage
    : `/any-bingo-tool/${cell.pathImage}`;

  return (
    <div
      className={`p-1 outline-2 flex items-center justify-center h-full rounded-md outline-base-300 cursor-pointer select-none ${
        className ?? ''
      }`}
      onClick={() => setColorIndices({ action: 'set-at', index, to: 'next' })}
      onContextMenu={(e) => {
        e.preventDefault();
        setColorIndices({ action: 'set-at', index, to: 'prev' });
      }}
      style={{
        backgroundColor: activeColor,
        gridColumn: `span ${cell.rect.width} / span ${cell.rect.width}`,
        gridRow: `span ${cell.rect.height} / span ${cell.rect.height}`,
      }}
    >
      {options.hidden && colorIndex === 0 ? (
        <span className="grid text-xl text-base-content/50">{index}</span>
      ) : (
        <div className="h-full flex place-content-center">
          <img
            draggable={false}
            src={imagePath}
            alt={`cell-${index}`}
            className={`object-scale-down ${
              options.hidden && colorIndex === 0 ? 'opacity-0' : ''
            }`}
          />
        </div>
      )}
    </div>
  );
};
