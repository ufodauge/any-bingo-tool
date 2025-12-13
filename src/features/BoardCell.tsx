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
  };
  index: number;
};

export const BoardCell = ({ cell, index }: Props): ReactNode => {
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
      className="p-1 cursor-pointer select-none"
      onClick={() => setColorIndices({ action: 'set-at', index, to: 'next' })}
      onContextMenu={(e) => {
        e.preventDefault();
        setColorIndices({ action: 'set-at', index, to: 'prev' });
      }}
      style={{
        backgroundColor: activeColor,
      }}
    >
      <img
        draggable={false}
        src={import.meta.env.DEV ? cell.pathImage : `/any-bingo-tool/${cell.pathImage}`}
        alt={`cell-${index}`}
        className={`${options.hidden && colorIndex === 0 ? 'opacity-0' : ''}`}
      />
    </div>
  );
};
