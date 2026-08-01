import {
  useRef,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useMemo,
  useCallback,
} from "react";

import type { Rect } from "../../libs/forms";
import { CellPopupMenu } from "./CellPopupMenu";
import { useMarkerColorsValue, useDefaultMarkerColorOption } from "../store/colors/colors";
import { useColorIndices, useSetColorIndices } from "../store/colors/indices";
import type { BoardCount } from "../store/schemas";

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

export const DefaultBoardCell = ({ cell, index, className, boardIndex }: Props): ReactNode => {
  const colorIndices = useColorIndices();
  const colors = useMarkerColorsValue();
  const options = useDefaultMarkerColorOption();
  const setColorIndices = useSetColorIndices();

  const pressTimerRef = useRef<number | undefined>(undefined);
  const longPressFiredRef = useRef(false);
  const pressStartRef = useRef({ x: 0, y: 0 });
  const popoverRef = useRef<HTMLDivElement>(null);

  const colorIndex = colorIndices.at(boardIndex)?.at(index);
  const activeColor = useMemo(
    () =>
      colorIndex === 0
        ? options.hidden
          ? "var(--color-base-300)"
          : "var(--color-base-100)"
        : colorIndex
          ? colors.at(colorIndex - 1)
          : "transparent",
    [colorIndex, colors, options.hidden],
  );

  const clearPressTimer = useCallback(() => {
    if (pressTimerRef.current !== undefined) {
      window.clearTimeout(pressTimerRef.current);
      pressTimerRef.current = undefined;
    }
  }, []);

  const handlePointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!(e.button === 0 || e.button === 2)) {
        return;
      }
      pressStartRef.current = {
        x: e.clientX,
        y: e.clientY,
      };
      clearPressTimer();
      pressTimerRef.current = window.setTimeout(() => {
        longPressFiredRef.current = true;
        popoverRef.current?.showPopover();
      }, LONG_PRESS_DURATION_MS);
    },
    [clearPressTimer],
  );

  const handlePointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (pressTimerRef.current === undefined) {
        return;
      }
      const dx = e.clientX - pressStartRef.current.x;
      const dy = e.clientY - pressStartRef.current.y;
      if (Math.hypot(dx, dy) > LONG_PRESS_MOVE_THRESHOLD_PX) {
        clearPressTimer();
      }
    },
    [clearPressTimer],
  );

  const handleClick = useCallback(() => {
    if (longPressFiredRef.current) {
      longPressFiredRef.current = false;
      return;
    }
    setColorIndices({
      action: "set-at",
      index,
      boardIndex,
      to: "next",
    });
  }, [boardIndex, index, setColorIndices]);

  const onPointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (longPressFiredRef.current) {
        // NOTE: pointer-up の時点で popover が閉じるため
        popoverRef.current?.showPopover();
      }
      clearPressTimer();
    },
    [clearPressTimer],
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>): void => {
      if (longPressFiredRef.current) {
        longPressFiredRef.current = false;
        return;
      }
      e.preventDefault();
      clearPressTimer();
      setColorIndices({
        action: "set-at",
        index,
        boardIndex,
        to: "prev",
      });
    },
    [boardIndex, clearPressTimer, index, setColorIndices],
  );

  return (
    <div
      className={`outline-base-300 flex h-full cursor-pointer items-center justify-center rounded-md p-1 outline-2 select-none ${
        className ?? ""
      }`}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onContextMenuCapture={(e) => e.preventDefault()}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={clearPressTimer}
      onPointerCancel={clearPressTimer}
      style={{
        anchorScope: "all",
        backgroundColor: activeColor,
        gridColumn: `span ${cell.rect.width} / span ${cell.rect.width}`,
        gridRow: `span ${cell.rect.height} / span ${cell.rect.height}`,
      }}
    >
      {options.hidden && colorIndex === 0 ? (
        <span
          className="text-base-content/50 grid text-xl"
          style={{
            anchorName: "--anchor-cell-button",
          }}
        >
          {index}
        </span>
      ) : (
        <div
          className="flex h-full place-content-center"
          style={{
            anchorName: "--anchor-cell-button",
          }}
        >
          <img
            draggable={false}
            src={cell.url}
            alt={`cell-${index}`}
            className={`object-scale-down ${options.hidden && colorIndex === 0 ? "opacity-0" : ""}`}
          />
        </div>
      )}
      <CellPopupMenu
        popoverRef={popoverRef}
        boardIndex={boardIndex}
        index={index}
        anchorName="--anchor-cell-button"
      />
    </div>
  );
};
