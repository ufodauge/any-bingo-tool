// GameStatus をバイナリへ変換する
//
// レイアウト:
//   byte 0   バージョン
//   byte 1   フラグ
//     bit 0     pointsCalculate (0=count, 1=size)
//     bit 1-2   cellSize (0=normal, 1=random-square, 2=random)
//     bit 3     boardCount - 1
//     bit 4     allowSameElementOccurrence
//     bit 5     seedScope (0=shared, 1=per-board)
//     bit 6     keepMarksOnSeedChange
//     bit 7     予約 (書き込みは 0、読み込みは無視。旧 revealNeighbors)
//   byte 2   サイズ
//     bit 0-2   boardSize - 3
//     bit 3-4   hiddenBoardBits
//     bit 5-7   予約 (書き込みは 0、読み込みは無視)
//   varint   seed
//   varint   extraBoardSeeds の個数, 続けて各 seed (varint)
//   varint   colors の個数, 続けて各色 (RGB 3 byte)
import type { GameStatus } from "./schemas.ts";

export const FORMAT_VERSION = 1;

const COUNT_MAX = 255;
const VARINT_BYTES_MAX = 8;
const BOARD_SIZE_MIN = 3;

const POINTS_CALCULATE_MODES: GameStatus["mode"]["pointsCalculate"][] = ["count", "size"];
const CELL_SIZE_MODES: GameStatus["mode"]["cellSize"][] = ["normal", "random-square", "random"];
const SEED_SCOPES: GameStatus["mode"]["seedScope"][] = ["shared", "per-board"];

const indexOfOrThrow = <T>(list: readonly T[], value: T, label: string): number => {
  const index = list.indexOf(value);
  if (index === -1) {
    throw new Error(`Unknown ${label}: ${String(value)}`);
  }
  return index;
};

export const normalizeSeed = (value: number): number => {
  if (!Number.isFinite(value)) return 0;
  return Math.min(Math.abs(Math.trunc(value)), Number.MAX_SAFE_INTEGER);
};

const encodeVarint = (input: number, out: number[]): void => {
  let value = normalizeSeed(input);
  for (;;) {
    const byte = value % 128;
    value = Math.floor(value / 128);
    if (value > 0) {
      out.push(byte | 0x80);
    } else {
      out.push(byte);
      return;
    }
  }
};

type Cursor = { pos: number };

const readByte = (bytes: Uint8Array, cursor: Cursor, label: string): number => {
  const byte = bytes[cursor.pos];
  if (byte === undefined) {
    throw new Error(`Unexpected end of buffer (${label})`);
  }
  cursor.pos += 1;
  return byte;
};

const decodeVarint = (bytes: Uint8Array, cursor: Cursor, label: string): number => {
  let result = 0;
  let multiplier = 1;
  for (let i = 0; i < VARINT_BYTES_MAX; i++) {
    const byte = readByte(bytes, cursor, label);
    result += (byte & 0x7f) * multiplier;
    if ((byte & 0x80) === 0) {
      if (!Number.isSafeInteger(result)) {
        throw new Error(`Varint out of range (${label})`);
      }
      return result;
    }
    multiplier *= 128;
  }
  throw new Error(`Varint too long (${label})`);
};

const decodeCount = (bytes: Uint8Array, cursor: Cursor, label: string): number => {
  const count = decodeVarint(bytes, cursor, label);
  if (count > COUNT_MAX) {
    throw new Error(`Too many items (${label}): ${count}`);
  }
  return count;
};

const HEX3 = /^#([0-9a-f]{3})$/i;
const HEX6 = /^#([0-9a-f]{6})$/i;

const colorToRgb = (color: string): [r: number, g: number, b: number] => {
  const hex3 = HEX3.exec(color)?.[1];
  if (hex3) {
    return [
      parseInt(hex3.charAt(0).repeat(2), 16),
      parseInt(hex3.charAt(1).repeat(2), 16),
      parseInt(hex3.charAt(2).repeat(2), 16),
    ];
  }
  const hex6 = HEX6.exec(color)?.[1];
  if (hex6) {
    return [
      parseInt(hex6.slice(0, 2), 16),
      parseInt(hex6.slice(2, 4), 16),
      parseInt(hex6.slice(4, 6), 16),
    ];
  }
  return [0, 0, 0];
};

const rgbToColor = (r: number, g: number, b: number): string =>
  `#${[r, g, b].map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;

export const normalizeColor = (color: string): string => rgbToColor(...colorToRgb(color));

export const encode = (status: GameStatus): Uint8Array => {
  const { mode, color } = status;
  if (status.extraBoardSeeds.length > COUNT_MAX || color.colors.length > COUNT_MAX) {
    throw new Error("Too many items");
  }

  const flags =
    indexOfOrThrow(POINTS_CALCULATE_MODES, mode.pointsCalculate, "pointsCalculate") |
    (indexOfOrThrow(CELL_SIZE_MODES, mode.cellSize, "cellSize") << 1) |
    (((mode.boardCount - 1) & 0b1) << 3) |
    ((mode.allowSameElementOccurrence ? 1 : 0) << 4) |
    (indexOfOrThrow(SEED_SCOPES, mode.seedScope, "seedScope") << 5) |
    ((mode.keepMarksOnSeedChange ? 1 : 0) << 6);

  const size =
    ((mode.boardSize - BOARD_SIZE_MIN) & 0b111) | ((color.default.hiddenBoardBits & 0b11) << 3);

  const out: number[] = [FORMAT_VERSION, flags, size];
  encodeVarint(status.seed, out);
  encodeVarint(status.extraBoardSeeds.length, out);
  for (const seed of status.extraBoardSeeds) {
    encodeVarint(seed, out);
  }
  encodeVarint(color.colors.length, out);
  for (const c of color.colors) {
    out.push(...colorToRgb(c));
  }
  return Uint8Array.from(out);
};

export const decode = (bytes: Uint8Array): GameStatus => {
  const cursor: Cursor = { pos: 0 };

  const version = readByte(bytes, cursor, "version");
  if (version !== FORMAT_VERSION) {
    throw new Error(`Unsupported format version: ${version}`);
  }
  const flags = readByte(bytes, cursor, "flags");
  const size = readByte(bytes, cursor, "size");

  const cellSize = CELL_SIZE_MODES[(flags >> 1) & 0b11];
  if (cellSize === undefined) {
    throw new Error("Unknown cellSize");
  }

  const seed = decodeVarint(bytes, cursor, "seed");

  const extraBoardSeeds: number[] = [];
  const extraCount = decodeCount(bytes, cursor, "extraBoardSeeds");
  for (let i = 0; i < extraCount; i++) {
    extraBoardSeeds.push(decodeVarint(bytes, cursor, "extraBoardSeed"));
  }

  const colors: string[] = [];
  const colorCount = decodeCount(bytes, cursor, "colors");
  for (let i = 0; i < colorCount; i++) {
    const r = readByte(bytes, cursor, "color");
    const g = readByte(bytes, cursor, "color");
    const b = readByte(bytes, cursor, "color");
    colors.push(rgbToColor(r, g, b));
  }

  return {
    seed,
    extraBoardSeeds,
    mode: {
      pointsCalculate: POINTS_CALCULATE_MODES[flags & 0b1]!,
      cellSize,
      boardSize: (size & 0b111) + BOARD_SIZE_MIN,
      boardCount: (((flags >> 3) & 0b1) + 1) as GameStatus["mode"]["boardCount"],
      allowSameElementOccurrence: ((flags >> 4) & 0b1) === 1,
      seedScope: SEED_SCOPES[(flags >> 5) & 0b1]!,
      keepMarksOnSeedChange: ((flags >> 6) & 0b1) === 1,
    },
    color: {
      default: {
        hiddenBoardBits: (size >> 3) & 0b11,
      },
      colors,
    },
  };
};

export const encodeToBase64Url = (status: GameStatus): string =>
  encode(status).toBase64({ alphabet: "base64url", omitPadding: true });

export const decodeFromBase64Url = (base64url: string): GameStatus =>
  decode(Uint8Array.fromBase64(base64url, { alphabet: "base64url" }));
