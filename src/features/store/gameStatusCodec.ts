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
//   --- ここから version 2 (version 1 はここで終わり。読み込むと marks は空) ---
//   varint   marks のボード数, 続けてボードごとに
//     byte      モード (0=全て未塗り, 1=密, 2=疎)
//     varint    マス数
//     モード 1  各マスを ceil(log2(colors の個数 + 1)) bit で下位 bit から詰めた値
//               (ceil(マス数 * bit / 8) byte。余りの bit は 0)
//     モード 2  varint 塗ったマスの数, 続けて (マス番号 varint, 色 1 byte) を番号の昇順で
//               色は 1..colors の個数。0 は含めない
//     書き込みは密と疎の短い方を選ぶ (同じなら疎)
//     色が colors の個数を超える値は書き込み時に 0 へ丸める
//     マス数は MARK_CELLS_MAX (9x9 = 81)、ボード数は BOARD_COUNT_MAX までで、
//     それを超える入力は不正として読み込みを失敗させる
//   --- ここから version 3 (version 1, 2 はここで終わり。読み込むと customPoints は空) ---
//   varint   customPoints の個数, 続けて各値を zigzag (0,-1,1,-2.. -> 0,1,2,3..) した varint
//     末尾の 0 は省いて書く (全て 0 なら個数 0 の 1 byte だけ)
//     個数は BOARD_COUNT_MAX、値は ±CUSTOM_POINT_MAX までで、
//     それを超える入力は不正として読み込みを失敗させる
import { BOARD_COUNT_MAX, CUSTOM_POINT_MAX, MARK_CELLS_MAX, type GameStatus } from "./schemas.ts";

export const FORMAT_VERSION = 3;

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

const MARKS_MODE_EMPTY = 0;
const MARKS_MODE_DENSE = 1;
const MARKS_MODE_SPARSE = 2;

const bitsPerMark = (colorCount: number): number =>
  colorCount <= 0 ? 0 : 32 - Math.clz32(colorCount);

const encodeBoardMarks = (row: readonly number[], colorCount: number, out: number[]): void => {
  if (row.length > MARK_CELLS_MAX) {
    throw new Error("Too many cells");
  }
  const values = row.map((v) => (Number.isInteger(v) && v > 0 && v <= colorCount ? v : 0));
  const painted: Array<[index: number, value: number]> = [];
  values.forEach((v, i) => {
    if (v !== 0) painted.push([i, v]);
  });

  const cellsHead: number[] = [];
  encodeVarint(values.length, cellsHead);

  if (painted.length === 0) {
    out.push(MARKS_MODE_EMPTY, ...cellsHead);
    return;
  }

  const sparse: number[] = [];
  encodeVarint(painted.length, sparse);
  for (const [index, value] of painted) {
    encodeVarint(index, sparse);
    sparse.push(value);
  }

  const bits = bitsPerMark(colorCount);
  const denseLength = Math.ceil((values.length * bits) / 8);

  if (denseLength < sparse.length) {
    out.push(MARKS_MODE_DENSE, ...cellsHead);
    const dense = new Array<number>(denseLength).fill(0);
    values.forEach((v, i) => {
      for (let b = 0; b < bits; b++) {
        if ((v >> b) & 1) {
          const pos = i * bits + b;
          dense[pos >> 3]! |= 1 << (pos & 7);
        }
      }
    });
    out.push(...dense);
  } else {
    out.push(MARKS_MODE_SPARSE, ...cellsHead, ...sparse);
  }
};

const decodeBoardMarks = (bytes: Uint8Array, cursor: Cursor, colorCount: number): number[] => {
  const mode = readByte(bytes, cursor, "marks mode");
  const cells = decodeVarint(bytes, cursor, "marks cells");
  if (cells > MARK_CELLS_MAX) {
    throw new Error(`Too many cells: ${cells}`);
  }
  const row = new Array<number>(cells).fill(0);

  if (mode === MARKS_MODE_EMPTY) {
    return row;
  }
  if (mode === MARKS_MODE_DENSE) {
    const bits = bitsPerMark(colorCount);
    for (let i = 0; i < cells; i++) {
      let v = 0;
      for (let b = 0; b < bits; b++) {
        const pos = i * bits + b;
        const byte = bytes[cursor.pos + (pos >> 3)];
        if (byte === undefined) {
          throw new Error("Unexpected end of buffer (marks)");
        }
        v |= ((byte >> (pos & 7)) & 1) << b;
      }
      if (v > colorCount) {
        throw new Error(`Mark color out of range: ${v}`);
      }
      row[i] = v;
    }
    cursor.pos += Math.ceil((cells * bits) / 8);
    return row;
  }
  if (mode === MARKS_MODE_SPARSE) {
    const count = decodeVarint(bytes, cursor, "marks count");
    if (count > cells) {
      throw new Error(`Too many painted cells: ${count}`);
    }
    let previous = -1;
    for (let i = 0; i < count; i++) {
      const index = decodeVarint(bytes, cursor, "marks index");
      const value = readByte(bytes, cursor, "marks color");
      if (index >= cells || index <= previous) {
        throw new Error(`Invalid mark index: ${index}`);
      }
      if (value < 1 || value > colorCount) {
        throw new Error(`Mark color out of range: ${value}`);
      }
      row[index] = value;
      previous = index;
    }
    return row;
  }
  throw new Error(`Unknown marks mode: ${mode}`);
};

const zigzag = (value: number): number => (value >= 0 ? value * 2 : -value * 2 - 1);
const unzigzag = (value: number): number => (value % 2 === 0 ? value / 2 : -(value + 1) / 2);

const encodeCustomPoints = (points: readonly number[], out: number[]): void => {
  if (points.length > BOARD_COUNT_MAX) {
    throw new Error("Too many boards");
  }
  for (const v of points) {
    if (!Number.isInteger(v) || Math.abs(v) > CUSTOM_POINT_MAX) {
      throw new Error(`Custom point out of range: ${v}`);
    }
  }
  let length = points.length;
  while (length > 0 && points[length - 1] === 0) length--;
  encodeVarint(length, out);
  for (let i = 0; i < length; i++) {
    encodeVarint(zigzag(points[i]!), out);
  }
};

const decodeCustomPoints = (bytes: Uint8Array, cursor: Cursor): number[] => {
  const count = decodeVarint(bytes, cursor, "customPoints count");
  if (count > BOARD_COUNT_MAX) {
    throw new Error(`Too many boards: ${count}`);
  }
  const points: number[] = [];
  for (let i = 0; i < count; i++) {
    const value = unzigzag(decodeVarint(bytes, cursor, "customPoint"));
    if (Math.abs(value) > CUSTOM_POINT_MAX) {
      throw new Error(`Custom point out of range: ${value}`);
    }
    points.push(value);
  }
  return points;
};

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
  if (status.marks.length > BOARD_COUNT_MAX) {
    throw new Error("Too many boards");
  }
  encodeVarint(status.marks.length, out);
  for (const row of status.marks) {
    encodeBoardMarks(row, color.colors.length, out);
  }
  encodeCustomPoints(status.customPoints, out);
  return Uint8Array.from(out);
};

export const decode = (bytes: Uint8Array): GameStatus => {
  const cursor: Cursor = { pos: 0 };

  const version = readByte(bytes, cursor, "version");
  if (version < 1 || version > FORMAT_VERSION) {
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

  const marks: number[][] = [];
  if (version >= 2) {
    const boardCount = decodeVarint(bytes, cursor, "marks boards");
    if (boardCount > BOARD_COUNT_MAX) {
      throw new Error(`Too many boards: ${boardCount}`);
    }
    for (let i = 0; i < boardCount; i++) {
      marks.push(decodeBoardMarks(bytes, cursor, colors.length));
    }
  }

  const customPoints = version >= 3 ? decodeCustomPoints(bytes, cursor) : [];

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
    marks,
    customPoints,
  };
};

export const encodeToBase64Url = (status: GameStatus): string =>
  encode(status).toBase64({ alphabet: "base64url", omitPadding: true });

export const decodeFromBase64Url = (base64url: string): GameStatus =>
  decode(Uint8Array.fromBase64(base64url, { alphabet: "base64url" }));
