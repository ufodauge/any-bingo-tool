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

export const revealNeighborsModeSchema = vb.fallback(
  vb.union([vb.literal("none"), vb.literal("cross")]),
  "none",
);

export type RevealNeighborsMode = vb.InferOutput<typeof revealNeighborsModeSchema>;

export const boardSizeSchema = vb.fallback(vb.pipe(vb.number(), vb.minValue(3), vb.maxValue(9)), 7);

export const allowSameElementOccurrenceSchema = vb.fallback(vb.boolean(), false);

export const boardCountSchema = vb.fallback(
  vb.pipe(vb.number(), vb.minValue(1), vb.maxValue(2)),
  1,
);
export const isBoardCount = (value: unknown): value is BoardCount =>
  vb.safeParse(boardCountSchema, value).success;

export type BoardCount = 1 | 2;

export const boardSizes = [3, 4, 5, 6, 7, 8, 9];

// static check
for (const size of boardSizes) {
  vb.parse(boardSizeSchema, size);
}

export type BoardSize = vb.InferOutput<typeof boardSizeSchema>;

export const gameStatusSchema = vb.object({
  seed: vb.fallback(vb.number(), () => Math.trunc(Math.random() * 1000000)),
  mode: vb.object({
    pointsCalculate: pointsCalculateModeSchema,
    cellSize: cellSizeModeSchema,
    boardSize: boardSizeSchema,
    boardCount: boardCountSchema,
    allowSameElementOccurrence: allowSameElementOccurrenceSchema,
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
      // ボードを隠しているとき、めくったセルに追従して開く範囲
      // - `none`: 追従しない
      // - `cross`: 上下左右に接するセルを開く (連鎖はしない)
      revealNeighbors: revealNeighborsModeSchema,
    }),
    colors: vb.array(vb.fallback(vb.string(), () => `#${Math.floor(Math.random() * 0x1000000)}`)),
  }),
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
