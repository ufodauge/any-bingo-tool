import * as vb from 'valibot';

export const pointsCalculateModeSchema = vb.fallback(
  vb.union([vb.literal('count'), vb.literal('size')]),
  'count'
);

export type PointsCalculateMode = vb.InferOutput<
  typeof pointsCalculateModeSchema
>;

export const cellSizeModeSchema = vb.fallback(
  vb.union([
    vb.literal('normal'),
    vb.literal('random-square'),
    vb.literal('random'),
  ]),
  'normal'
);

export type CellSizeMode = vb.InferOutput<typeof cellSizeModeSchema>;

export const boardSizeSchema = vb.fallback(
  vb.pipe(vb.number(), vb.minValue(3), vb.maxValue(9)),
  7
);

export const allowSameElementOccurenceSchema = vb.fallback(vb.boolean(), false);

export const boardSizes = [3, 4, 5, 6, 7, 8, 9];

for (const size of boardSizes) {
  vb.parse(boardSizeSchema, size);
}

export type BoardSize = vb.InferOutput<typeof boardSizeSchema>;

export const gameStatusSchema = vb.looseObject({
  seed: vb.fallback(vb.number(), () => Math.trunc(Math.random() * 1000000)),
  mode: vb.looseObject({
    pointsCalculate: pointsCalculateModeSchema,
    cellSize: cellSizeModeSchema,
    boardSize: boardSizeSchema,
    allowSameElementOccurence: allowSameElementOccurenceSchema,
  }),
  color: vb.looseObject({
    default: vb.looseObject({
      hidden: vb.fallback(vb.boolean(), false),
    }),
    colors: vb.array(
      vb.fallback(
        vb.string(),
        () => `#${Math.floor(Math.random() * 0x1000000)}`
      )
    ),
  }),
});

// vb.array に対する fallback が壊れてそうなので
const defaultGameStatusSource = vb.getFallbacks(gameStatusSchema);
export const defaultGameStatus: GameStatus = {
  ...defaultGameStatusSource,
  color: {
    ...defaultGameStatusSource.color,
    colors: ['#fc5f5f', '#5661fb', '#befeee'],
  },
};

export type GameStatus = vb.InferOutput<typeof gameStatusSchema>;
