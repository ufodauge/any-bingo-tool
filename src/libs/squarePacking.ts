type Square = {
  size: number;
};

export function generateRandomSquares2(
  n: number,
  maxSize: number,
  rng: () => number
): Square[] {
  if (!Number.isInteger(n) || !Number.isInteger(maxSize)) {
    throw new Error('Inputs must be integers.');
  }

  const results: Square[] = [];

  const MIN_SIZE = 1;
  if (maxSize < MIN_SIZE) {
    throw new Error(`maxSize (${maxSize}) should be upper than or equal to 1.`);
  }

  const state: boolean[] = Array(n * n).fill(false);

  for (let i = 0; i < state.length; i++) {
    const nextIndex = state.findIndex((v) => !v);
    if (nextIndex === -1) {
      break;
    }

    let capableSize = 0;
    const m = Math.min(
      maxSize,
      n - (nextIndex % n),
      n - Math.floor(nextIndex / n)
    );
    for (let j = 0; j < m; j++) {
      if (state[j + nextIndex] === false) {
        capableSize += 1;
      } else {
        break;
      }
    }

    const newRectSize = Math.floor(rng() * capableSize + 1);
    results.push({ size: newRectSize });
    for (let y = 0; y < newRectSize; y++) {
      for (let x = 0; x < newRectSize; x++) {
        state[nextIndex + x + y * n] = true;
      }
    }
  }

  return results;
}
