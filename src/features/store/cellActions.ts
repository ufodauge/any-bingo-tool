/** colorIndex が 0 (未塗り) のマスの index 一覧 */
export const unpaintedIndices = (row: readonly number[]): number[] =>
  row.flatMap((v, i) => (v === 0 ? [i] : []));

/** `candidates` のうち未塗りのものだけを返す */
export const filterUnpainted = (row: readonly number[], candidates: readonly number[]): number[] =>
  candidates.filter((i) => row[i] === 0);

/**
 * `candidates` から重複なしでランダムに最大 `count` 個選ぶ (部分 Fisher-Yates)。
 * 候補が足りなければ全件を返す。
 */
export const pickRandom = (
  candidates: readonly number[],
  count: number,
  random: () => number = Math.random,
): number[] => {
  const pool = [...candidates];
  const n = Math.max(0, Math.min(Math.floor(count), pool.length));
  for (let i = 0; i < n; i++) {
    const j = i + Math.floor(random() * (pool.length - i));
    [pool[i], pool[j]] = [pool[j]!, pool[i]!];
  }
  return pool.slice(0, n);
};
