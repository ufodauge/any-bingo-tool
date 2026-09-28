import type { Placement, Rect } from "./forms";

export function generateRandomRects(
  n: number,
  maxSize: number,
  rng: () => number,
  options?: Partial<{
    generateRect: boolean;
  }>,
): Placement[] {
  if (!Number.isInteger(n) || !Number.isInteger(maxSize)) {
    throw new Error("Inputs must be integers.");
  }

  const results: Placement[] = [];

  const MIN_SIZE = 1;
  if (maxSize < MIN_SIZE) {
    throw new Error(`maxSize (${maxSize}) should be upper than or equal to 1.`);
  }

  // baseIndex を左上とする width x height の領域がすべて空いているか
  const isAreaFree = (
    baseIndex: number,
    width: number,
    height: number,
    map: readonly boolean[],
  ) => {
    if (width > n - (baseIndex % n) || height > n - Math.floor(baseIndex / n)) {
      return false;
    }

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (map[baseIndex + x + y * n] !== false) {
          return false;
        }
      }
    }

    return true;
  };

  const generateSize = (baseIndex: number, map: readonly boolean[]) => {
    const max = Math.min(maxSize, n - (baseIndex % n), n - Math.floor(baseIndex / n));

    let capableSize = 0;
    while (capableSize < max && isAreaFree(baseIndex, capableSize + 1, capableSize + 1, map)) {
      capableSize += 1;
    }

    return Math.floor(rng() * capableSize + 1);
  };

  const generateWidth = (baseIndex: number, map: readonly boolean[]) => {
    let capableWidth = 0;
    const maxWidth = Math.min(maxSize, n - (baseIndex % n));

    for (let x = 0; x < maxWidth; x++) {
      if (map[baseIndex + x] === false) {
        capableWidth += 1;
      } else {
        break;
      }
    }

    return Math.floor(rng() * capableWidth + 1);
  };

  // NOTE: 幅方向にはみ出したセルと衝突しないよう、確定済みの width で空き判定する
  const generateHeight = (baseIndex: number, width: number, map: readonly boolean[]) => {
    const maxHeight = Math.min(maxSize, n - Math.floor(baseIndex / n));

    let capableHeight = 0;
    while (capableHeight < maxHeight && isAreaFree(baseIndex, width, capableHeight + 1, map)) {
      capableHeight += 1;
    }

    return Math.floor(rng() * capableHeight + 1);
  };

  const state: boolean[] = Array(n * n).fill(false);

  for (let i = 0; i < state.length; i++) {
    const nextIndex = state.findIndex((v) => v === false);
    if (nextIndex === -1) {
      break;
    }

    const newRectSize: Rect = options?.generateRect
      ? (() => {
          const width = generateWidth(nextIndex, state);
          return {
            width,
            height: generateHeight(nextIndex, width, state),
          };
        })()
      : (() => {
          const size = generateSize(nextIndex, state);
          return {
            width: size,
            height: size,
          };
        })();

    results.push({
      x: nextIndex % n,
      y: Math.floor(nextIndex / n),
      ...newRectSize,
    });

    for (let y = 0; y < newRectSize.height; y++) {
      for (let x = 0; x < newRectSize.width; x++) {
        state[nextIndex + x + y * n] = true;
      }
    }

    // #region debug
    if (import.meta.env.DEV) {
      console.log(`i: ${nextIndex}, w: ${newRectSize.width}, h: ${newRectSize.height}`);
      let str = "";
      for (let y = 0; y < n; y++) {
        for (let x = 0; x < n; x++) {
          str += state[x + y * n] ? "[]" : "__";
        }
        str += "\n";
      }
      console.log(str);
    }
    // #endregion
  }

  return results;
}
