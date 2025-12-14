import { type ReactNode } from 'react';
import {
  useMarkerColorsValue,
  useDefaultMarkerColorOption,
} from './store/colors/colors';
import { useColorIndices, useSetColorIndices } from './store/colors/indicies';

type Props = {
  cell: {
    pathImage: string;
    indexColor: number;
    size: number;
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

  return (
    <div
      className={`p-1 outline-2 rounded-md aspect-square outline-base-300 grid cursor-pointer select-none ${
        className ?? ''
      }`}
      onClick={() => setColorIndices({ action: 'set-at', index, to: 'next' })}
      onContextMenu={(e) => {
        e.preventDefault();
        setColorIndices({ action: 'set-at', index, to: 'prev' });
      }}
      style={{
        backgroundColor: activeColor,
        gridColumn: `span ${cell.size} / span ${cell.size}`,
        gridRow: `span ${cell.size} / span ${cell.size}`,
      }}
    >
      <div className="place-items-center grid">
        <img
          draggable={false}
          src={
            import.meta.env.DEV
              ? cell.pathImage
              : `/any-bingo-tool/${cell.pathImage}`
          }
          alt={`cell-${index}`}
          className={`${options.hidden && colorIndex === 0 ? 'opacity-0' : ''}`}
        />
      </div>
    </div>
  );
};
