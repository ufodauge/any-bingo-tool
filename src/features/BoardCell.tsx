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
      className={`p-1 outline-2 place-items-center rounded-md aspect-square outline-base-300 grid cursor-pointer select-none ${
        className ?? ''
      } @container`}
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
      <img
        draggable={false}
        src={imagePath}
        alt={`cell-${index}`}
        className={`object-center object-contain ${
          options.hidden && colorIndex === 0 ? 'opacity-0' : ''
        }`}
      />
    </div>
  );
};
