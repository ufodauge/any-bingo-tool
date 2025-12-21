import { atom, useAtomValue, useSetAtom } from 'jotai';
import { useAtomCallback } from 'jotai/utils';
import { useCallback } from 'react';
import { queryParamsAtom } from '../queryParams';
import type { GameStatus } from '../schemas';

type MarkerColorsAction =
  | {
      action: 'try-add';
      value: string;
    }
  | {
      action: 'try-update';
      index: number;
      value: string;
    }
  | {
      action: 'try-remove';
      index: number;
    };

const COLORS_MAX = 8;
const COLOR_REGEX = /#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})/i;

const defaultColorOptionAtom = atom(
  (get) => get(queryParamsAtom).color.default,
  (get, set, value: GameStatus['color']['default']) => {
    const status = structuredClone(get(queryParamsAtom));
    status.color.default = value;
    set(queryParamsAtom, status);
  }
);

export const useDefaultMarkerColorOption = () =>
  useAtomValue(defaultColorOptionAtom);
export const useSetDefaultMarkerColorOption = () =>
  useSetAtom(defaultColorOptionAtom);

export const markerColorsAtom = atom(
  (get) => get(queryParamsAtom).color.colors,
  (get, set, value: GameStatus['color']['colors']) => {
    const status = structuredClone(get(queryParamsAtom));
    status.color.colors = value;
    set(queryParamsAtom, status);
  }
);

export const useMarkerColorsValue = () => useAtomValue(markerColorsAtom);
export const useSetMarkerColors = () =>
  useAtomCallback(
    useCallback((get, set, action: MarkerColorsAction) => {
      const current = get(markerColorsAtom);

      if (action.action === 'try-add') {
        if (
          current.length < COLORS_MAX &&
          COLOR_REGEX.exec(action.value.trim())
        ) {
          set(markerColorsAtom, [...current, action.value]);
          return true;
        }
        console.error(current.length < COLORS_MAX);
        return false;
      } else if (action.action === 'try-remove') {
        if (0 <= action.index && action.index < current.length) {
          set(markerColorsAtom, current.toSpliced(action.index, 1));
          return true;
        }
        return false;
      } else if (action.action === 'try-update') {
        if (
          0 <= action.index &&
          action.index < current.length &&
          COLOR_REGEX.exec(action.value)
        ) {
          set(
            markerColorsAtom,
            current.toSpliced(action.index, 1, action.value)
          );
          return true;
        }
        return false;
      }
    }, [])
  );
