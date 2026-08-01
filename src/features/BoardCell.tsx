import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import {
  useMarkerColorsValue,
  useDefaultMarkerColorOption,
} from './store/colors/colors';
import { useColorIndices, useSetColorIndices } from './store/colors/indices';
import type { Rect } from '../libs/forms';
import type { BoardCount } from './store/schemas';

type Props = {
  cell: {
    pathImage: string;
    url: string;
    indexColor: number;
    rect: Rect;
  };
  index: number;
  className?: string;
  boardIndex: BoardCount;
};

const LONG_PRESS_DURATION_MS = 350;
const LONG_PRESS_MOVE_THRESHOLD_PX = 10;

export const BoardCell = ({
  cell,
  index,
  className,
  boardIndex,
}: Props): ReactNode => {
  const colorIndices = useColorIndices();
  const colors = useMarkerColorsValue();
  const options = useDefaultMarkerColorOption();

  const setColorIndices = useSetColorIndices();

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const pressTimerRef = useRef<number | undefined>(undefined);
  const longPressFiredRef = useRef(false);
  const pressStartRef = useRef({ x: 0, y: 0 });
  const popoverRef = useRef<HTMLDivElement>(null);

  const colorIndex = colorIndices.at(boardIndex)?.at(index);
  const activeColor =
    colorIndex === 0
      ? options.hidden
        ? 'var(--color-base-300)'
        : 'var(--color-base-100)'
      : colorIndex
        ? colors.at(colorIndex - 1)
        : 'transparent';

  const clearPressTimer = () => {
    if (pressTimerRef.current !== undefined) {
      window.clearTimeout(pressTimerRef.current);
      pressTimerRef.current = undefined;
    }
  };

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button === 2) {
      return;
    }
    pressStartRef.current = { x: e.clientX, y: e.clientY };
    clearPressTimer();
    pressTimerRef.current = window.setTimeout(() => {
      longPressFiredRef.current = true;
      setIsPickerOpen(true);
    }, LONG_PRESS_DURATION_MS);
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (pressTimerRef.current === undefined) {
      return;
    }
    const dx = e.clientX - pressStartRef.current.x;
    const dy = e.clientY - pressStartRef.current.y;
    if (Math.hypot(dx, dy) > LONG_PRESS_MOVE_THRESHOLD_PX) {
      clearPressTimer();
    }
  };

  const handleClick = () => {
    if (longPressFiredRef.current) {
      longPressFiredRef.current = false;
      return;
    }
    setColorIndices({ action: 'set-at', index, boardIndex, to: 'next' });
  };

  const selectColor = (value: number) => {
    setColorIndices({ action: 'set-value', index, boardIndex, value });
    setIsPickerOpen(false);
  };

  useEffect(() => {
    if (!isPickerOpen) {
      return;
    }

    const handleOutsidePointerDown = (e: PointerEvent) => {
      if (popoverRef.current?.contains(e.target as Node)) {
        return;
      }
      setIsPickerOpen(false);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsPickerOpen(false);
      }
    };

    document.addEventListener('pointerdown', handleOutsidePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handleOutsidePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPickerOpen]);

  return (
    <div
      className={`relative p-1 outline-2 flex items-center justify-center h-full rounded-md outline-base-300 cursor-pointer select-none ${
        className ?? ''
      }`}
      onClick={handleClick}
      onContextMenu={(e) => {
        e.preventDefault();
        clearPressTimer();
        setColorIndices({ action: 'set-at', index, boardIndex, to: 'prev' });
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={clearPressTimer}
      onPointerLeave={clearPressTimer}
      onPointerCancel={clearPressTimer}
      style={{
        backgroundColor: activeColor,
        gridColumn: `span ${cell.rect.width} / span ${cell.rect.width}`,
        gridRow: `span ${cell.rect.height} / span ${cell.rect.height}`,
        WebkitTouchCallout: 'none',
      }}
    >
      {options.hidden && colorIndex === 0 ? (
        <span className="grid text-xl text-base-content/50">{index}</span>
      ) : (
        <div className="h-full flex place-content-center">
          <img
            draggable={false}
            src={cell.url}
            alt={`cell-${index}`}
            className={`object-scale-down ${
              options.hidden && colorIndex === 0 ? 'opacity-0' : ''
            }`}
          />
        </div>
      )}
      {isPickerOpen && (
        <div
          ref={popoverRef}
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 flex gap-1 p-2 rounded-box bg-base-100 shadow-lg outline-1 outline-base-300 cursor-auto"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onContextMenu={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className={`size-8 shrink-0 rounded-full border-2 border-neutral-300 cursor-pointer ${
              options.hidden ? 'bg-base-300' : 'bg-base-100'
            } ${colorIndex === 0 ? 'ring-2 ring-primary ring-offset-1' : ''}`}
            onClick={() => selectColor(0)}
          />
          {colors.map((color, i) => (
            <button
              type="button"
              key={`color-${i}`}
              className={`size-8 shrink-0 rounded-full border-2 border-neutral-300 cursor-pointer ${
                colorIndex === i + 1 ? 'ring-2 ring-primary ring-offset-1' : ''
              }`}
              style={{ backgroundColor: color }}
              onClick={() => selectColor(i + 1)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
