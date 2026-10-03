import { atom } from "jotai";
import * as vb from "valibot";

import { getCurrentQueryParams } from "../../libs/getCurrentQueryParams";
import { decodeFromBase64Url, encodeToBase64Url } from "./gameStatusCodec";
import { defaultGameStatus, gameStatusSchema, type GameStatus } from "./schemas";

const PARAM_NAME = "s";
const LEGACY_PARAM_NAME = "game-status";

const toGameStatusString = (status: GameStatus): string | undefined => {
  try {
    // base64url なら `+` が無いので URLSearchParams にスペースへ壊されない
    return encodeToBase64Url(status);
  } catch (error) {
    console.error(error);
    return undefined;
  }
};

const decoder = new TextDecoder();

const decodeGameStatusBytes = (raw: string): Uint8Array => {
  const candidates = raw.includes(" ") ? [raw.replaceAll(" ", "+")] : [raw];

  const attempts: Array<() => Uint8Array> = candidates.flatMap((candidate) => [
    () => Uint8Array.fromBase64(candidate, { alphabet: "base64url" }),
    () => Uint8Array.fromBase64(candidate, { alphabet: "base64" }),
  ]);

  for (const attempt of attempts) {
    try {
      return attempt();
    } catch {
      // 次の方式を試す
    }
  }

  throw new Error(`Failed to decode game-status base64: ${raw}`);
};

const fromLegacyGameStatusBase64 = (base64: string): GameStatus => {
  try {
    const decoded = decoder.decode(decodeGameStatusBytes(base64));
    const parsed = vb.parse(gameStatusSchema, JSON.parse(decoded));
    return parsed;
  } catch (error) {
    console.error(error);
    return defaultGameStatus;
  }
};

const fromGameStatusString = (raw: string): GameStatus => {
  try {
    return vb.parse(gameStatusSchema, decodeFromBase64Url(raw));
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
    const raw = queryParams.get(PARAM_NAME);
    if (raw !== null) {
      return fromGameStatusString(raw);
    }

    const legacyRaw = queryParams.get(LEGACY_PARAM_NAME);
    if (legacyRaw !== null) {
      return fromLegacyGameStatusBase64(legacyRaw);
    }

    return primitive ?? defaultGameStatus;
  },
  (_get, set, value: GameStatus) => {
    const queryParams = getCurrentQueryParams();
    const status = toGameStatusString(value);
    if (status) {
      queryParams.set(PARAM_NAME, status);
      queryParams.delete(LEGACY_PARAM_NAME);
    }
    const paramsStr = queryParams.toString();

    history.replaceState(
      history.state,
      "",
      paramsStr ? `${document.location.pathname}?${paramsStr}` : document.location.pathname,
    );
    set(queryParamsPrimitiveAtom, value);
  },
);
