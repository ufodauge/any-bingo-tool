import type { BoardCell } from "./board";

const NO_CELL = -1;

/** 格子マスごとに、そこを占有しているセルの index を引けるテーブルを作る */
const buildOccupancy = (cells: readonly BoardCell[], size: number): Int32Array => {
  const occupancy = new Int32Array(size * size).fill(NO_CELL);

  cells.forEach((cell, i) => {
    for (let y = 0; y < cell.rect.height; y++) {
      for (let x = 0; x < cell.rect.width; x++) {
        const gx = cell.position.x + x;
        const gy = cell.position.y + y;
        if (gx < size && gy < size) {
          occupancy[gx + gy * size] = i;
        }
      }
    }
  });

  return occupancy;
};

/**
 * 各セルについて、辺で接しているセルの index を返す。
 * 斜めは含めない。セルが複数マスを占有する場合は辺に接するセルすべてが対象になる。
 */
export const buildNeighborIndices = (cells: readonly BoardCell[], size: number): number[][] => {
  const occupancy = buildOccupancy(cells, size);

  return cells.map((cell, i) => {
    const neighbors = new Set<number>();
    const { x, y } = cell.position;
    const { width, height } = cell.rect;

    const collect = (gx: number, gy: number) => {
      if (gx < 0 || gy < 0 || gx >= size || gy >= size) {
        return;
      }
      const at = occupancy[gx + gy * size];
      if (at !== NO_CELL && at !== i) {
        neighbors.add(at);
      }
    };

    for (let dx = 0; dx < width; dx++) {
      collect(x + dx, y - 1);
      collect(x + dx, y + height);
    }
    for (let dy = 0; dy < height; dy++) {
      collect(x - 1, y + dy);
      collect(x + width, y + dy);
    }

    return [...neighbors];
  });
};
