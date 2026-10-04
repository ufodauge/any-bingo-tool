import * as vb from "valibot";

export const pointsCalculateModeSchema = vb.fallback(
  vb.union([vb.literal("count"), vb.literal("size")]),
  "count",
);

export type PointsCalculateMode = vb.InferOutput<typeof pointsCalculateModeSchema>;

export const cellSizeModeSchema = vb.fallback(
  vb.union([vb.literal("normal"), vb.literal("random-square"), vb.literal("random")]),
  "normal",
);

export type CellSizeMode = vb.InferOutput<typeof cellSizeModeSchema>;

export const boardSizeSchema = vb.fallback(vb.pipe(vb.number(), vb.minValue(3), vb.maxValue(9)), 7);

export const allowSameElementOccurrenceSchema = vb.fallback(vb.boolean(), false);

export const BOARD_COUNT_MAX = 2;

export const boardCountSchema = vb.fallback(
  vb.pipe(vb.number(), vb.minValue(1), vb.maxValue(BOARD_COUNT_MAX)),
  1,
);
export const isBoardCount = (value: unknown): value is BoardCount =>
  vb.safeParse(boardCountSchema, value).success;

export type BoardCount = 1 | 2;

export const seedScopeSchema = vb.fallback(
  vb.union([vb.literal("shared"), vb.literal("per-board")]),
  "shared",
);

export type SeedScope = vb.InferOutput<typeof seedScopeSchema>;

export const boardSizes = [3, 4, 5, 6, 7, 8, 9];

// static check
for (const size of boardSizes) {
  vb.parse(boardSizeSchema, size);
}

export type BoardSize = vb.InferOutput<typeof boardSizeSchema>;

const randomHexColor = () => {
  const hex = Math.floor(Math.random() * 0x1000000).toString(16);
  return `#${hex.padStart(6, "0")}`;
};

export const COLORS_MAX = 8;
export const MARK_CELLS_MAX = 81;
// 得点の絶対値の上限。zigzag varint で 3 byte (199998 < 2^21) に収まり、
// 手でカウントする値としては十分に大きい
export const CUSTOM_POINT_MAX = 99999;

export const gameStatusSchema = vb.object({
  seed: vb.fallback(vb.number(), () => Math.trunc(Math.random() * 1000000)),
  // ボードごとのシードのとき 2 枚目以降が使うシード (1 枚目は seed)
  extraBoardSeeds: vb.fallback(vb.array(vb.number()), () => []),
  mode: vb.object({
    pointsCalculate: pointsCalculateModeSchema,
    cellSize: cellSizeModeSchema,
    boardSize: boardSizeSchema,
    boardCount: boardCountSchema,
    allowSameElementOccurrence: allowSameElementOccurrenceSchema,
    seedScope: seedScopeSchema,
    keepMarksOnSeedChange: vb.fallback(vb.boolean(), false),
  }),
  color: vb.object({
    default: vb.object({
      // 隠すボードのビットフラグ
      // - `0b01`: 1 つ目のボードを隠す
      // - `0b10`: 2 つ目のボードを隠す
      hiddenBoardBits: vb.fallback(
        vb.pipe(vb.number(), vb.safeInteger(), vb.minValue(0), vb.maxValue(3)),
        0,
      ),
    }),
    colors: vb.array(vb.fallback(vb.string(), randomHexColor)),
  }),
  // マスごとの塗り色 (ボード × マス。0 = 未塗り, 1.. = colors の添字 + 1)。空配列は全て未塗り
  marks: vb.fallback(
    vb.pipe(
      vb.array(
        vb.pipe(
          vb.array(vb.pipe(vb.number(), vb.safeInteger(), vb.minValue(0), vb.maxValue(COLORS_MAX))),
          vb.maxLength(MARK_CELLS_MAX),
        ),
      ),
      vb.maxLength(BOARD_COUNT_MAX),
    ),
    () => [],
  ),
  // ボードごとの手動得点 (整数、負も可)。足りない分は 0。空配列は全て 0
  customPoints: vb.fallback(
    vb.pipe(
      vb.array(
        vb.pipe(
          vb.number(),
          vb.safeInteger(),
          vb.minValue(-CUSTOM_POINT_MAX),
          vb.maxValue(CUSTOM_POINT_MAX),
        ),
      ),
      vb.maxLength(BOARD_COUNT_MAX),
    ),
    () => [],
  ),
});

// vb.array に対する fallback が壊れてそうなので
const defaultGameStatusSource = vb.getFallbacks(gameStatusSchema);
export const defaultGameStatus: GameStatus = {
  ...defaultGameStatusSource,
  color: {
    ...defaultGameStatusSource.color,
    colors: ["#fc5f5f", "#5661fb", "#befeee"],
  },
};

export type GameStatus = vb.InferOutput<typeof gameStatusSchema>;
