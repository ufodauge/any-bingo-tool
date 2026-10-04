import { atom, type Getter, type Setter } from "jotai";
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

const readStatus = (primitive: GameStatus | undefined): GameStatus => {
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
};

// 履歴に積まずに URL とメモリ上の状態を更新する
const writeStatus = (set: Setter, value: GameStatus): void => {
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
};

// --- undo / redo ---
//
// 履歴はエンコード済みの状態文字列 (?s= の値) をメモリにだけ持つ。
//
// まとめ方 (1 回の undo で戻る単位):
// - トランザクション: beginTransaction から endTransaction までの書き込みは 1 件。
//   ペイントのドラッグ (pointerdown から pointerup) や、シード変更に伴うマスのリセットなど
//   複数の書き込みで 1 操作になるものに使う
// - 連続入力: シード・色の文字列のように 1 文字ごとに書き込まれる項目は、
//   同じ項目だけを変える書き込みが COALESCE_MS 以内に続く間は 1 件にまとめる
//   (マスの塗りは項目が marks、得点は customPoints なので、まとめず素早い連打も 1 クリック 1 件)
// - 変化のない書き込み (エンコード結果が同じ) は積まない
const HISTORY_MAX = 200;
const COALESCE_MS = 500;

type History = { past: string[]; future: string[] };
const historyAtom = atom<History>({ past: [], future: [] });

export const canUndoAtom = atom((get) => get(historyAtom).past.length > 0);
export const canRedoAtom = atom((get) => get(historyAtom).future.length > 0);

let transactionDepth = 0;
let transactionRecorded = false;
let lastWrite: { time: number; kind: string } | undefined;

export const beginTransaction = (): void => {
  transactionDepth += 1;
};

export const endTransaction = (): void => {
  transactionDepth = Math.max(0, transactionDepth - 1);
  if (transactionDepth === 0) {
    transactionRecorded = false;
    lastWrite = undefined;
  }
};

export const runInTransaction = <T>(fn: () => T): T => {
  beginTransaction();
  try {
    return fn();
  } finally {
    endTransaction();
  }
};

let pointerTransactionActive = false;

/** 次の pointerup / pointercancel (取りこぼし対策で blur も) まで 1 つのトランザクションにする (ペイントのドラッグ用) */
export const beginPointerTransaction = (): void => {
  if (pointerTransactionActive) return;
  pointerTransactionActive = true;
  beginTransaction();
  const end = () => {
    window.removeEventListener("pointerup", end);
    window.removeEventListener("pointercancel", end);
    window.removeEventListener("blur", end);
    pointerTransactionActive = false;
    endTransaction();
  };
  window.addEventListener("pointerup", end);
  window.addEventListener("pointercancel", end);
  window.addEventListener("blur", end);
};

const COALESCING_KEYS = new Set(["seed", "extraBoardSeeds", "colors"]);

const changeKind = (prev: GameStatus, next: GameStatus): string => {
  const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
  const keys: string[] = [];
  if (prev.seed !== next.seed) keys.push("seed");
  if (!same(prev.extraBoardSeeds, next.extraBoardSeeds)) keys.push("extraBoardSeeds");
  if (!same(prev.color.colors, next.color.colors)) keys.push("colors");
  if (!same(prev.color.default, next.color.default)) keys.push("default");
  if (!same(prev.mode, next.mode)) keys.push("mode");
  if (!same(prev.marks, next.marks)) keys.push("marks");
  if (!same(prev.customPoints, next.customPoints)) keys.push("customPoints");
  return keys.join("+");
};

export const queryParamsAtom = atom(
  (get) => readStatus(get(queryParamsPrimitiveAtom)),
  (get, set, value: GameStatus) => {
    const prev = readStatus(get(queryParamsPrimitiveAtom));
    const prevEncoded = toGameStatusString(prev);
    const nextEncoded = toGameStatusString(value);

    if (prevEncoded !== undefined && nextEncoded !== undefined && prevEncoded !== nextEncoded) {
      const now = Date.now();
      const kind = changeKind(prev, value);
      const inTransaction = transactionDepth > 0;
      const coalesce = inTransaction
        ? transactionRecorded
        : lastWrite !== undefined &&
          lastWrite.kind === kind &&
          now - lastWrite.time < COALESCE_MS &&
          kind.split("+").every((key) => COALESCING_KEYS.has(key));

      if (!coalesce) {
        set(historyAtom, ({ past }) => ({
          past: [...past, prevEncoded].slice(-HISTORY_MAX),
          future: [],
        }));
      } else {
        set(historyAtom, ({ past }) => ({ past, future: [] }));
      }
      if (inTransaction) {
        transactionRecorded = true;
      } else {
        lastWrite = { time: now, kind };
      }
    }
    writeStatus(set, value);
  },
);

const moveHistory = (get: Getter, set: Setter, from: "past" | "future"): void => {
  const history = get(historyAtom);
  const source = history[from];
  const target = source.at(-1);
  if (target === undefined) return;

  const currentEncoded = toGameStatusString(readStatus(get(queryParamsPrimitiveAtom)));
  const to = from === "past" ? "future" : "past";
  set(historyAtom, {
    ...history,
    [from]: source.slice(0, -1),
    [to]: currentEncoded === undefined ? history[to] : [...history[to], currentEncoded],
  });
  lastWrite = undefined;
  writeStatus(set, fromGameStatusString(target));
};

export const undoAtom = atom(null, (get, set) => moveHistory(get, set, "past"));
export const redoAtom = atom(null, (get, set) => moveHistory(get, set, "future"));
