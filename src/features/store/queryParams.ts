import { atom } from 'jotai';
import { getCurrentQueryParams } from '../../libs/getCurrentQueryParams';
import * as vb from 'valibot';
import {
  defaultGameStatus,
  gameStatusSchema,
  type GameStatus,
} from './schemas';

const encoder = new TextEncoder();
const toGameStatusString = (status: GameStatus): string | undefined => {
  try {
    const str = JSON.stringify(status);
    return encoder.encode(str).toBase64();
  } catch (error) {
    console.error(error);
    return undefined;
  }
};

const decoder = new TextDecoder();
const fromGameStatusBase64 = (base64: string): GameStatus => {
  try {
    const decoded = decoder.decode(Uint8Array.fromBase64(base64));
    const parsed = vb.parse(gameStatusSchema, JSON.parse(decoded));
    return parsed;
  } catch (error) {
    console.error(error);
    return defaultGameStatus;
  }
};

const queryParamsPrimitiveAtom = atom<GameStatus>();
export const queryParamsAtom = atom(
  (get) => {
    const primitive = get(queryParamsPrimitiveAtom);
    const queryParams = getCurrentQueryParams();
    const raw = queryParams.get('game-status');

    if (raw === null) {
      return primitive ?? defaultGameStatus;
    }

    return fromGameStatusBase64(raw);
  },
  (_get, set, value: GameStatus) => {
    const queryParams = getCurrentQueryParams();
    const status = toGameStatusString(value);
    if (status) {
      queryParams.set('game-status', status);
    }
    const paramsStr = [...queryParams.entries()]
      .map((v) => v.join('='))
      .join('&');

    history.replaceState(
      history.state,
      '',
      `${document.location.pathname}?${paramsStr}`
    );
    set(queryParamsPrimitiveAtom, value);
  }
);
