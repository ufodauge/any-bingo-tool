export class XorShift {
  #x: number;
  #y: number;
  #z: number;
  #w: number;

  constructor(seed = 88675123) {
    this.#x = 123456789;
    this.#y = 362436069;
    this.#z = 521288629;
    this.#w = seed;
  }

  next() {
    const t = this.#x ^ (this.#x << 11);
    this.#x = this.#y;
    this.#y = this.#z;
    this.#z = this.#w;
    return (this.#w = this.#w ^ (this.#w >>> 19) ^ (t ^ (t >>> 8)));
  }

  nextInt(min: number, max: number) {
    const r = Math.abs(this.next());
    return min + (r % (max + 1 - min));
  }
}

export const shuffleArray = <T>(array: readonly T[], seed: number) => {
  const rand = new XorShift(seed);

  const result = [...array];
  for (let i = array.length - 1; i > 0; i--) {
    const j = rand.nextInt(0, i);
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
};

