export class SplitMix64 {
  #state: bigint;

  public constructor(seed: number) {
    this.#state = BigInt(Math.trunc(seed));
  }

  public next(): number {
    this.#state += 0x9e3779b97f4a7c15n;
    let z = this.#state;
    z = (z ^ (z >> 30n)) * 0xbf58476d1ce4e5b9n;
    z = (z ^ (z >> 27n)) * 0x94d049bb133111ebn;
    z = z ^ (z >> 31n);
    return Number(z & 0xffffffffn) / 0xffffffff;
  }

  public nextInt(min: number, max: number) {
    // const r = Math.abs(this.next());
    // return min + (r % (max + 1 - min));
    return Math.floor(this.next() * (max - min) + min);
  }
}

export const shuffleArrayWith = <T>(array: readonly T[], rand: SplitMix64) => {
  const result = [...array];
  for (let i = array.length - 1; i > 0; i--) {
    const j = rand.nextInt(0, i);
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
};

export const shuffleArray = <T>(array: readonly T[], seed: number) => {
  const rand = new SplitMix64(seed);
  return shuffleArrayWith(array, rand);
};

export const createRandomizedCopyWith = <T>(
  array: readonly T[],
  rand: SplitMix64,
) => array.map(() => array[rand.nextInt(0, array.length - 1)]);

export const createRandomizedCopy = <T>(array: readonly T[], seed: number) => {
  const rand = new SplitMix64(seed);
  return createRandomizedCopyWith(array, rand);
};

export type Weighted<T> = { value: T; weight: number };

// Efraimidis-Spirakis 法による重み付き非復元抽出
export const weightedSampleWithoutReplacementWith = <T>(
  items: readonly Weighted<T>[],
  count: number,
  rand: SplitMix64,
): T[] => {
  const keyed = items
    .filter((item) => item.weight > 0)
    .map((item) => ({
      value: item.value,
      key: Math.pow(rand.next(), 1 / item.weight),
    }));
  keyed.sort((a, b) => b.key - a.key);

  return keyed.slice(0, count).map((item) => item.value);
};

export const weightedSampleWithReplacementWith = <T>(
  items: readonly Weighted<T>[],
  count: number,
  rand: SplitMix64,
): T[] => {
  const positive = items.filter((item) => item.weight > 0);
  const totalWeight = positive.reduce((sum, item) => sum + item.weight, 0);
  if (positive.length === 0 || totalWeight <= 0) {
    return [];
  }

  return Array.from({ length: count }, () => {
    let cursor = rand.next() * totalWeight;
    for (const item of positive) {
      cursor -= item.weight;
      if (cursor <= 0) {
        return item.value;
      }
    }
    return positive[positive.length - 1].value;
  });
};
