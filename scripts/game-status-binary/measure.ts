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
    default: { hiddenBoardBits: 0 },
    colors: ["#fc5f5f", "#5661fb", "#befeee"],
  },
  marks: [],
  customPoints: [],
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
    default: { hiddenBoardBits: 0b10 },
    colors: ["#fc5f5f", "#5661fb", "#befeee"],
  },
  marks: [],
  customPoints: [],
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
    default: { hiddenBoardBits: 0b11 },
    colors: ["#fc5f5f", "#5661fb", "#befeee", "#000000", "#ffffff", "#123abc"],
  },
  marks: [],
  customPoints: [],
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
    default: { hiddenBoardBits: 0 },
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
  marks: [],
  customPoints: [],
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
    default: { hiddenBoardBits: 0 },
    colors: ["#fc5f5f"],
  },
  marks: [],
  customPoints: [],
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

// --- marks ---
{
  const withMarks = (base: GameStatus, marks: number[][]): GameStatus => ({ ...base, marks });
  const zeros = (n: number) => Array.from({ length: n }, () => 0);
  const rng = (seedInit: number) => {
    let state = seedInit;
    return () => (state = (state * 1103515245 + 12345) & 0x7fffffff) >> 8;
  };
  const filled = (boards: number, cells: number, colors: number, rate: number, seedInit = 1) => {
    const r = rng(seedInit);
    return Array.from({ length: boards }, () =>
      Array.from({ length: cells }, () => (r() % 1000 < rate * 1000 ? (r() % colors) + 1 : 0)),
    );
  };
  const eightColors: GameStatus = {
    ...manyColors,
    mode: { ...manyColors.mode, boardSize: 9, boardCount: 2 },
  };

  assertRoundTrip("marks: empty array", withMarks(oneBoardDefaults, []));
  assertRoundTrip("marks: all zero", withMarks(oneBoardDefaults, [zeros(49)]));
  assertRoundTrip("marks: sparse", withMarks(oneBoardDefaults, [[...zeros(10), 2, ...zeros(38)]]));
  assertRoundTrip("marks: dense", withMarks(oneBoardDefaults, [filled(1, 49, 3, 1)[0]!]));
  assertRoundTrip("marks: 1 color (1 bit)", withMarks(largeSeed, [[1, 0, 1, 1, 0, 0, 1, 0, 1]]));
  assertRoundTrip("marks: 0 colors", {
    ...oneBoardDefaults,
    color: { ...oneBoardDefaults.color, colors: [] },
    marks: [zeros(49)],
  });
  assertRoundTrip("marks: 2 boards x 81 x 8 colors", withMarks(eightColors, filled(2, 81, 8, 1)));
  assertRoundTrip(
    "marks: boards with different modes",
    withMarks(eightColors, [zeros(81), filled(1, 81, 8, 0.1)[0]!]),
  );
  for (const rate of [0.05, 0.3, 0.7, 1]) {
    for (let k = 0; k < 20; k++) {
      assertRoundTrip(
        `marks: random rate ${rate} #${k}`,
        withMarks(eightColors, filled(2, 81, 8, rate, k + 1)),
      );
    }
  }
  console.log("  OK  marks round-trips (empty, sparse, dense, 2 x 81 x 8 colors, random)");

  // 範囲外の色は 0 へ丸めて書き込む
  {
    const bad = withMarks(oneBoardDefaults, [[...zeros(5), 9, -1, 1.5, ...zeros(41)]]);
    assert.deepStrictEqual(decode(encode(bad)).marks, [zeros(49)]);
    console.log("  OK  out-of-range marks are written as 0");
  }

  // version 1 の URL は marks が空として読める
  {
    const v3 = encode(oneBoardDefaults);
    assert.deepStrictEqual([...v3.slice(-2)], [0, 0]);
    const v1 = Uint8Array.from([1, ...v3.slice(1, -2)]);
    assert.deepStrictEqual(decode(v1), oneBoardDefaults);
    console.log("  OK  version 1 input decodes with empty marks");
  }

  // 不正な marks
  {
    const base = encode(oneBoardDefaults).slice(0, -2);
    const colorsCount = oneBoardDefaults.color.colors.length;
    const cases: Array<[string, number[]]> = [
      ["too many boards", [3]],
      ["unknown mode", [1, 3, 49]],
      ["too many cells (82)", [1, 0, 82]],
      ["huge cell count", [1, 0, 0xff, 0xff, 0x7f]],
      ["sparse: count > cells", [1, 2, 4, 5]],
      ["sparse: index >= cells", [1, 2, 4, 1, 4, 1]],
      ["sparse: indices not ascending", [1, 2, 4, 2, 2, 1, 1, 1]],
      ["sparse: duplicate index", [1, 2, 4, 2, 1, 1, 1, 1]],
      ["sparse: color 0", [1, 2, 4, 1, 0, 0]],
      ["sparse: color out of range", [1, 2, 4, 1, 0, colorsCount + 1]],
      ["sparse: truncated pair", [1, 2, 4, 1, 0]],
      ["dense: truncated", [1, 1, 49, 0b01]],
    ];
    {
      // 5 色は 3 bit。6 と 7 は色の個数を超える
      const five: GameStatus = {
        ...oneBoardDefaults,
        color: { ...oneBoardDefaults.color, colors: Array(5).fill("#000000") },
      };
      const head = encode(five).slice(0, -2);
      assert.throws(() => decode(Uint8Array.from([...head, 1, 1, 4, 6, 0, 0])), Error);
      assert.throws(() => decode(Uint8Array.from([...head, 1, 1, 4, 7, 0, 0])), Error);
      assert.deepStrictEqual(decode(Uint8Array.from([...head, 1, 1, 4, 5, 0, 0])).marks, [
        [5, 0, 0, 0],
      ]);
    }
    for (const [label, tail] of cases) {
      assert.throws(
        () => decode(Uint8Array.from([...base, ...tail, 0])),
        Error,
        `[${label}] should throw`,
      );
    }
    for (const marks of [[[...zeros(10), 2, ...zeros(38)]], [filled(1, 49, 3, 1)[0]!]]) {
      const valid = encode(withMarks(oneBoardDefaults, marks));
      for (let length = base.length; length < valid.length - 1; length++) {
        assert.throws(() => decode(valid.slice(0, length)), Error, `[marks truncated ${length}]`);
      }
    }
    assert.throws(() => encode(withMarks(oneBoardDefaults, [zeros(82)])), Error);
    assert.throws(() => encode(withMarks(oneBoardDefaults, [zeros(9), zeros(9), zeros(9)])), Error);
    console.log(`  OK  ${cases.length} malformed marks inputs rejected`);
  }
}

// --- customPoints ---
{
  const withPoints = (base: GameStatus, customPoints: number[]): GameStatus => ({
    ...base,
    customPoints,
  });
  const lengthOf = (points: number[]) => encode(withPoints(oneBoardDefaults, points)).length;
  const emptyLength = lengthOf([]);
  const zerosN = (n: number) => Array.from({ length: n }, () => 0);

  assertRoundTrip("points: empty", withPoints(oneBoardDefaults, []));
  assertRoundTrip("points: positive", withPoints(oneBoardDefaults, [5]));
  assertRoundTrip("points: negative", withPoints(oneBoardDefaults, [-1, -64, 63].slice(0, 2)));
  assertRoundTrip("points: two boards", withPoints(twoBoardsSharedSeed, [12, -3]));
  assertRoundTrip("points: leading zero", withPoints(twoBoardsSharedSeed, [0, 7]));
  assertRoundTrip("points: limits", withPoints(twoBoardsSharedSeed, [99999, -99999]));
  assertRoundTrip(
    "points: with marks",
    withPoints({ ...oneBoardDefaults, marks: [[1, 0, 2, ...zerosN(46)]] }, [-8]),
  );

  // 全て 0 は個数 0 の 1 byte、末尾の 0 は省く
  assert.strictEqual(lengthOf([0, 0]), emptyLength);
  assert.deepStrictEqual(decode(encode(withPoints(oneBoardDefaults, [0, 0]))).customPoints, []);
  assert.deepStrictEqual(decode(encode(withPoints(oneBoardDefaults, [3, 0]))).customPoints, [3]);
  assert.strictEqual(lengthOf([3, 0]), lengthOf([3]));
  assert.strictEqual(lengthOf([63]) - emptyLength, 1); // 値 1 byte (個数は 0 の 1 byte が 1 byte のまま)
  assert.strictEqual(lengthOf([99999, -99999]) - emptyLength, 3 + 3);

  // version 2 の URL は customPoints が空として読める
  {
    const marked = withPoints({ ...oneBoardDefaults, marks: [[1, ...zerosN(48)]] }, []);
    const v3 = encode(marked);
    assert.strictEqual(v3.at(-1), 0);
    assert.deepStrictEqual(decode(Uint8Array.from([2, ...v3.slice(1, -1)])), marked);
  }

  // 不正な customPoints
  {
    const base = encode(oneBoardDefaults).slice(0, -1);
    const cases: Array<[string, number[]]> = [
      ["too many boards", [3, 0, 0, 0]],
      ["huge count", [0xff, 0xff, 0x7f]],
      ["value 100000 (zigzag 200000)", [1, 0xc0, 0x9a, 0x0c]],
      ["value -100000 (zigzag 199999)", [1, 0xbf, 0x9a, 0x0c]],
      ["huge value", [1, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x7f]],
      ["missing value", [1]],
      ["truncated varint", [1, 0x80]],
      ["missing second value", [2, 2]],
      ["missing section", []],
    ];
    for (const [label, tail] of cases) {
      assert.throws(
        () => decode(Uint8Array.from([...base, ...tail])),
        Error,
        `[${label}] should throw`,
      );
    }
    assert.deepStrictEqual(
      decode(Uint8Array.from([...base, 1, 0xbd, 0x9a, 0x0c])).customPoints,
      [-99999],
    );
    assert.throws(() => encode(withPoints(oneBoardDefaults, [100000])), Error);
    assert.throws(() => encode(withPoints(oneBoardDefaults, [1.5])), Error);
    assert.throws(() => encode(withPoints(oneBoardDefaults, [1, 2, 3])), Error);
    console.log(
      `  OK  customPoints round-trips, v2 compatibility, ${cases.length} malformed inputs`,
    );
  }
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

console.log("\nSize with marks (2 boards x 81 cells, 8 colors; query string chars):\n");
{
  const r = (() => {
    let state = 7;
    return () => (state = (state * 1103515245 + 12345) & 0x7fffffff) >> 8;
  })();
  const base: GameStatus = {
    ...manyColors,
    mode: { ...manyColors.mode, boardSize: 9, boardCount: 2 },
  };
  for (const rate of [0, 0.05, 0.1, 0.25, 0.5, 0.75, 1]) {
    const marks = Array.from({ length: 2 }, () =>
      Array.from({ length: 81 }, () => (r() % 1000 < rate * 1000 ? (r() % 8) + 1 : 0)),
    );
    const status = { ...base, marks };
    const bytes = encode(status).length;
    console.log(
      `  fill ${String(Math.round(rate * 100)).padStart(3)}%  bytes ${String(bytes).padStart(3)}  base64url ${String(encodeToBase64Url(status).length).padStart(3)}  (JSON+b64url ${jsonBase64Url(status).length})`,
    );
  }
}
