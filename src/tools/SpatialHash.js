export default class SpatialHash {
  constructor(cellSize = 128, width = 1024, height = 1024) {
    this.width = width;
    this.height = height;
    this.cellSize = cellSize;
    this.cells = new Map();
  }

  clear() {
    this.cells.clear();
  }

  insert(obj) {
    const cx = Math.floor(obj.px / this.cellSize);
    const cy = Math.floor(obj.py / this.cellSize);
    const key = this._key(cx, cy);

    let cell = this.cells.get(key);
    if (!cell) {
      cell = [];
      this.cells.set(key, cell);
    }
    obj._cellIndex = cell.length;
    cell.push(obj);

    obj._cx = cx;
    obj._cy = cy;
  }

  insertSegment(x1, y1, x2, y2, id) {
    const minX = Math.min(x1, x2);
    const minY = Math.min(y1, y2);
    const maxX = Math.max(x1, x2);
    const maxY = Math.max(y1, y2);

    const startCx = Math.floor(minX / this.cellSize);
    const startCy = Math.floor(minY / this.cellSize);
    const endCx = Math.floor(maxX / this.cellSize);
    const endCy = Math.floor(maxY / this.cellSize);

    for (let cx = startCx; cx <= endCx; cx++) {
      for (let cy = startCy; cy <= endCy; cy++) {
        const key = this._key(cx, cy);
        let cell = this.cells.get(key);
        if (!cell) {
          cell = new Set();
          this.cells.set(key, cell);
        }
        cell.add(id);
      }
    }
  }

  remove(obj) {
    const cx = obj._cx;
    const cy = obj._cy;
    if (cx === undefined || cy === undefined) return;

    const key = this._key(cx, cy);
    const cell = this.cells.get(key);
    if (!cell) return;

    const idx = obj._cellIndex;
    if (idx === -1) return;

    const lastIdx = cell.length - 1;
    const lastObj = cell[lastIdx];

    if (idx !== lastIdx) {
      cell[idx] = lastObj;
      lastObj._cellIndex = idx;
    }

    cell.pop();

    if (cell.length === 0) {
      this.cells.delete(key);
    }

    obj._cellIndex = -1;
    obj._cx = undefined;
    obj._cy = undefined;
  }

  update(obj) {
    const newCx = Math.floor(obj.px / this.cellSize);
    const newCy = Math.floor(obj.py / this.cellSize);

    if (obj._cx === newCx && obj._cy === newCy) return;

    this.remove(obj);
    this.insert(obj);
  }

  query(x, y, radius = 128) {
    const results = [];
    const cx = Math.floor(x / this.cellSize);
    const cy = Math.floor(y / this.cellSize);
    const range = Math.ceil(radius / this.cellSize);
    for (let i = -range; i <= range; i++) {
      for (let j = -range; j <= range; j++) {
        const key = this._key(cx + i, cy + j);
        if (this.cells.has(key)) {
          results.push(...this.cells.get(key));
        }
      }
    }
    return results;
  }

  querySegments(x, y, radius = 128) {
    const results = new Set();
    const cx = Math.floor(x / this.cellSize);
    const cy = Math.floor(y / this.cellSize);
    const range = Math.ceil(radius / this.cellSize);
    for (let i = -range; i <= range; i++) {
      for (let j = -range; j <= range; j++) {
        const key = this._key(cx + i, cy + j);
        if (this.cells.has(key)) {
          const cell = this.cells.get(key);
          cell.forEach((id) => results.add(id));
        }
      }
    }
    return Array.from(results);
  }

  _key(x, y) {
    return y * this.width + x;
  }
}
