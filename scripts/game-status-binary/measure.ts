import assert from "node:assert";
import { deflateRawSync } from "node:zlib";

import {
  FORMAT_VERSION,
  decode,
  decodeFromBase64Url,
  encode,
  encodeToBase64Url,
  normalizeColor,
} from "../../src/features/store/gameStatusCodec.ts";
import type { GameStatus } from "../../src/features/store/schemas.ts";

const textEncoder = new TextEncoder();

const currentJsonStdBase64 = (status: GameStatus): string =>
  textEncoder.encode(JSON.stringify(status)).toBase64();

const jsonBase64Url = (status: GameStatus): string =>
  textEncoder.encode(JSON.stringify(status)).toBase64({ alphabet: "base64url", omitPadding: true });

const QUICK_DEFAULTS = {
  pointsCalculate: "count",
  cellSize: "normal",
  boardSize: 7,
  boardCount: 1,
  allowSameElementOccurrence: false,
  seedScope: "shared",
  keepMarksOnSeedChange: false,
  hiddenBoardBits: 0,
  revealNeighbors: "none",
  colors: ["#fc5f5f", "#5661fb", "#befeee"],
} as const;

const toQuickJson = (status: GameStatus): string => {
  const out: Record<string, unknown> = { s: status.seed };
  if (status.extraBoardSeeds.length > 0) out.e = status.extraBoardSeeds;

  const m: Record<string, unknown> = {};
  if (status.mode.pointsCalculate !== QUICK_DEFAULTS.pointsCalculate)
    m.p = status.mode.pointsCalculate;
  if (status.mode.cellSize !== QUICK_DEFAULTS.cellSize) m.c = status.mode.cellSize;
  if (status.mode.boardSize !== QUICK_DEFAULTS.boardSize) m.b = status.mode.boardSize;
  if (status.mode.boardCount !== QUICK_DEFAULTS.boardCount) m.n = status.mode.boardCount;
  if (status.mode.allowSameElementOccurrence !== QUICK_DEFAULTS.allowSameElementOccurrence) {
    m.a = status.mode.allowSameElementOccurrence;
  }
  if (status.mode.seedScope !== QUICK_DEFAULTS.seedScope) m.ss = status.mode.seedScope;
  if (status.mode.keepMarksOnSeedChange !== QUICK_DEFAULTS.keepMarksOnSeedChange) {
    m.k = status.mode.keepMarksOnSeedChange;
  }
  if (Object.keys(m).length > 0) out.m = m;

  const c: Record<string, unknown> = {};
  if (status.color.default.hiddenBoardBits !== QUICK_DEFAULTS.hiddenBoardBits) {
    c.h = status.color.default.hiddenBoardBits;
  }
  if (status.color.default.revealNeighbors !== QUICK_DEFAULTS.revealNeighbors) {
    c.r = status.color.default.revealNeighbors;
  }
  if (JSON.stringify(status.color.colors) !== JSON.stringify(QUICK_DEFAULTS.colors)) {
    c.c = status.color.colors;
  }
  if (Object.keys(c).length > 0) out.c = c;

  return JSON.stringify(out);
};

const quickJsonBase64Url = (status: GameStatus): string =>
  textEncoder.encode(toQuickJson(status)).toBase64({ alphabet: "base64url", omitPadding: true });

const deflateJsonBase64Url = (status: GameStatus): string => {
  const compressed = deflateRawSync(textEncoder.encode(JSON.stringify(status)));
  return compressed.toBase64({ alphabet: "base64url", omitPadding: true });
};

const assertRoundTrip = (label: string, status: GameStatus): void => {
  const bytes = encode(status);
  const decoded = decode(bytes);
  assert.deepStrictEqual(decoded, status, `[${label}] decode(encode(x)) !== x`);

  const base64url = encodeToBase64Url(status);
  const decodedFromBase64Url = decodeFromBase64Url(base64url);
  assert.deepStrictEqual(decodedFromBase64Url, status, `[${label}] base64url round-trip failed`);
};

const oneBoardDefaults: GameStatus = {
  seed: 123456,
  extraBoardSeeds: [],
  mode: {
    pointsCalculate: "count",
    cellSize: "normal",
    boardSize: 7,
    boardCount: 1,
    allowSameElementOccurrence: false,
    seedScope: "shared",
    keepMarksOnSeedChange: false,
  },
  color: {
    default: { hiddenBoardBits: 0, revealNeighbors: "none" },
    colors: ["#fc5f5f", "#5661fb", "#befeee"],
  },
};

const twoBoardsSharedSeed: GameStatus = {
  seed: 42,
  extraBoardSeeds: [],
  mode: {
    pointsCalculate: "size",
    cellSize: "random-square",
    boardSize: 5,
    boardCount: 2,
    allowSameElementOccurrence: true,
    seedScope: "shared",
    keepMarksOnSeedChange: true,
  },
  color: {
    default: { hiddenBoardBits: 0b10, revealNeighbors: "cross" },
    colors: ["#fc5f5f", "#5661fb", "#befeee"],
  },
};

const twoBoardsPerBoardSeed: GameStatus = {
  seed: 987654,
  extraBoardSeeds: [321098],
  mode: {
    pointsCalculate: "count",
    cellSize: "random",
    boardSize: 9,
    boardCount: 2,
    allowSameElementOccurrence: false,
    seedScope: "per-board",
    keepMarksOnSeedChange: false,
  },
  color: {
    default: { hiddenBoardBits: 0b11, revealNeighbors: "cross" },
    colors: ["#fc5f5f", "#5661fb", "#befeee", "#000000", "#ffffff", "#123abc"],
  },
};

const manyColors: GameStatus = {
  seed: 7,
  extraBoardSeeds: [8],
  mode: {
    pointsCalculate: "size",
    cellSize: "normal",
    boardSize: 3,
    boardCount: 2,
    allowSameElementOccurrence: false,
    seedScope: "shared",
    keepMarksOnSeedChange: false,
  },
  color: {
    default: { hiddenBoardBits: 0, revealNeighbors: "none" },
    colors: [
      "#ff0000",
      "#00ff00",
      "#0000ff",
      "#ffff00",
      "#ff00ff",
      "#00ffff",
      "#abcdef",
      "#112233",
    ],
  },
};

const largeSeed: GameStatus = {
  seed: Number.MAX_SAFE_INTEGER,
  extraBoardSeeds: [Number.MAX_SAFE_INTEGER - 1, 0],
  mode: {
    pointsCalculate: "count",
    cellSize: "normal",
    boardSize: 3,
    boardCount: 2,
    allowSameElementOccurrence: false,
    seedScope: "per-board",
    keepMarksOnSeedChange: false,
  },
  color: {
    default: { hiddenBoardBits: 0, revealNeighbors: "none" },
    colors: ["#fc5f5f"],
  },
};

const samples: Array<{ label: string; status: GameStatus }> = [
  { label: "1 board, 0 extra seeds (typical)", status: oneBoardDefaults },
  { label: "2 boards, shared seed", status: twoBoardsSharedSeed },
  { label: "2 boards, per-board seed, 6 colors", status: twoBoardsPerBoardSeed },
  { label: "2 boards, 8 colors (5+)", status: manyColors },
  { label: "large seed (MAX_SAFE_INTEGER)", status: largeSeed },
];

console.log("Running round-trip correctness assertions...\n");
for (const { label, status } of samples) {
  assertRoundTrip(label, status);
  console.log(`  OK  ${label}`);
}

assertRoundTrip("seed = 0", { ...oneBoardDefaults, seed: 0, extraBoardSeeds: [] });
console.log("  OK  seed = 0");

{
  const shortHex: GameStatus = {
    ...oneBoardDefaults,
    color: {
      ...oneBoardDefaults.color,
      colors: ["#f00", "#0F0", "#00f", "#ABCDEF", "red", "#12345678"],
    },
  };
  const decoded = decode(encode(shortHex));
  assert.deepStrictEqual(decoded.color.colors, [
    "#ff0000",
    "#00ff00",
    "#0000ff",
    "#abcdef",
    "#000000",
    "#000000",
  ]);
  assert.strictEqual(normalizeColor("#fC5"), "#ffcc55");
  console.log("  OK  color normalization (#rgb, uppercase, invalid, alpha)");
}

{
  const bytes = encode(oneBoardDefaults);
  assert.strictEqual(bytes[2]! & 0b11100000, 0);
  const dirty = Uint8Array.from(bytes);
  dirty[2]! |= 0b11100000;
  assert.deepStrictEqual(decode(dirty), oneBoardDefaults);
  console.log("  OK  reserved bits ignored");
}

{
  const bytes = encode(twoBoardsSharedSeed);
  assert.strictEqual(bytes[1]! & 0b10000000, 0);
  const dirty = Uint8Array.from(bytes);
  dirty[1]! |= 0b10000000;
  assert.deepStrictEqual(decode(dirty), twoBoardsSharedSeed);
  console.log("  OK  flags bit 7 set is ignored");
}

{
  const valid = encode(twoBoardsPerBoardSeed);
  const bad: Array<[string, Uint8Array]> = [
    ["empty", new Uint8Array()],
    ["unknown version", Uint8Array.from([FORMAT_VERSION + 1, ...valid.slice(1)])],
    ["version 0", Uint8Array.from([0, ...valid.slice(1)])],
    ["cellSize index 3", Uint8Array.from([FORMAT_VERSION, 0b110, 0, 0, 0, 0])],
    ["overlong varint (seed)", Uint8Array.from([FORMAT_VERSION, 0, 0, ...Array(20).fill(0x80), 0])],
    [
      "varint over MAX_SAFE_INTEGER",
      Uint8Array.from([FORMAT_VERSION, 0, 0, ...Array(7).fill(0xff), 0x7f, 0, 0]),
    ],
    ["extraBoardSeeds count 256", Uint8Array.from([FORMAT_VERSION, 0, 0, 0, 0x80, 0x02, 0])],
    ["colors count 256", Uint8Array.from([FORMAT_VERSION, 0, 0, 0, 0, 0x80, 0x02])],
    ["huge colors count", Uint8Array.from([FORMAT_VERSION, 0, 0, 0, 0, 0xff, 0xff, 0xff, 0x7f])],
  ];

  for (let length = 0; length < valid.length; length++) {
    bad.push([`truncated to ${length} bytes`, valid.slice(0, length)]);
  }
  for (const [label, bytes] of bad) {
    assert.throws(() => decode(bytes), Error, `[${label}] should throw`);
  }
  console.log(`  OK  ${bad.length} malformed inputs rejected`);

  let seedState = 12345;
  const rand = () => (seedState = (seedState * 1103515245 + 12345) & 0x7fffffff) & 0xff;
  for (let i = 0; i < 2000; i++) {
    const garbage = Uint8Array.from({ length: rand() % 40 }, rand);
    try {
      decode(garbage);
    } catch {}
  }
  for (const text of ["", "!!!", "AAAA=", "not base64 at all", "A"]) {
    assert.throws(() => decodeFromBase64Url(text), Error, `[${text}] should throw`);
  }
  console.log("  OK  garbage input does not hang or crash");
}

console.log("\nAll assertions passed.\n");

type Row = {
  label: string;
  jsonStdBase64: number;
  jsonBase64Url: number;
  quickJsonBase64Url: number;
  deflateBase64Url: number;
  binaryBase64Url: number;
};

const rows: Row[] = samples.map(({ label, status }) => ({
  label,
  jsonStdBase64: currentJsonStdBase64(status).length,
  jsonBase64Url: jsonBase64Url(status).length,
  quickJsonBase64Url: quickJsonBase64Url(status).length,
  deflateBase64Url: deflateJsonBase64Url(status).length,
  binaryBase64Url: encodeToBase64Url(status).length,
}));

const header = [
  "state",
  "JSON+std-b64 (current)",
  "JSON+b64url (fix only)",
  "quick-JSON+b64url",
  "deflate(JSON)+b64url",
  "binary+b64url",
];
const colWidths = header.map((h, i) =>
  Math.max(
    h.length,
    ...rows.map((r) => String(Object.values(r)[i === 0 ? 0 : i] as string | number).length),
  ),
);
const pad = (s: string, w: number) => s.padEnd(w, " ");
const printRow = (cells: string[]) =>
  console.log(cells.map((c, i) => pad(c, colWidths[i]!)).join(" | "));

console.log("Query-string length comparison (characters, after base64url encoding):\n");
printRow(header);
printRow(colWidths.map((w) => "-".repeat(w)));
for (const r of rows) {
  printRow([
    r.label,
    String(r.jsonStdBase64),
    String(r.jsonBase64Url),
    String(r.quickJsonBase64Url),
    String(r.deflateBase64Url),
    String(r.binaryBase64Url),
  ]);
}

console.log("\nBinary format raw byte lengths and example query strings:\n");
for (const { label, status } of samples) {
  const bytes = encode(status);
  const base64url = encodeToBase64Url(status);
  console.log(`  ${label}`);
  console.log(`    bytes: ${bytes.length}`);
  console.log(`    ?s=${base64url}`);
}
