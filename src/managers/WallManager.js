import { walls } from "../other/walls.js";

export default class WallManager {
  constructor(width, height, tileSize = 32) {
    this.width = width;
    this.height = height;
    this.tileSize = tileSize;

    this.tiles = new Set();
    this.playerTiles = new Set();
    this.allTiles = new Set();

    for (let i = 0; i < walls.length; i += 2) {
      this.addMapWall(walls[i], walls[i + 1]);
    }
  }

  hash(x, y) {
    return y * this.width + x;
  }

  unhash(h) {
    const x = h % this.width;
    const y = Math.floor(h / this.width);
    return [x, y];
  }

  getStaticWalls() {
    return this.tiles;
  }

  getWalls() {
    return [...this.tiles, ...this.playerTiles];
  }

  getSetWalls() {
    return this.allTiles;
  }

  inBounds(x, y) {
    return x >= 0 && y >= 0 && x < this.width && y < this.height;
  }

  addMapWall(x, y) {
    if (this.inBounds(x, y)) {
      this.tiles.add(this.hash(x, y));
      this.allTiles.add(this.hash(x, y));
    }
  }

  removeMapWall(x, y) {
    this.tiles.delete(this.hash(x, y));
    this.allTiles.delete(this.hash(x, y));
  }

  addPlayerWall(x, y) {
    if (this.inBounds(x, y)) {
      this.playerTiles.add(this.hash(x, y));
      this.allTiles.add(this.hash(x, y));
    }
  }

  removePlayerWall(x, y) {
    this.playerTiles.delete(this.hash(x, y));
    this.allTiles.delete(this.hash(x, y));
  }

  hasWall(x, y) {
    if (!this.inBounds(x, y)) return false;
    return this.allTiles.has(this.hash(x, y));
  }

  clear() {
    this.tiles.clear();
    this.allTiles.clear();
    this.playerTiles.clear();
  }

  generateEdges() {
    const T = this.tileSize;
    const edges = new Set();

    const dirs = [
      {
        dx: -1,
        dy: 0,
        edge: [
          [0, 0],
          [0, 1],
        ],
      }, // izquierda
      {
        dx: 1,
        dy: 0,
        edge: [
          [1, 0],
          [1, 1],
        ],
      }, // derecha
      {
        dx: 0,
        dy: -1,
        edge: [
          [0, 0],
          [1, 0],
        ],
      }, // arriba
      {
        dx: 0,
        dy: 1,
        edge: [
          [0, 1],
          [1, 1],
        ],
      }, // abajo
    ];

    for (let h of this.getWalls()) {
      const [x, y] = this.unhash(h);

      for (let { dx, dy, edge } of dirs) {
        const nx = x + dx,
          ny = y + dy;
        if (!this.hasWall(nx, ny)) {
          const x0 = (x + edge[0][0]) * T;
          const y0 = (y + edge[0][1]) * T;
          const x1 = (x + edge[1][0]) * T;
          const y1 = (y + edge[1][1]) * T;
          edges.add(`${x0},${y0},${x1},${y1}`);
        }
      }
    }

    const rawEdges = Array.from(edges).map((e) => e.split(",").map(Number));
    return this._mergeEdges(rawEdges);
  }

  _mergeEdges(edges) {
    const horizontal = new Map();
    const vertical = new Map();

    for (let [x0, y0, x1, y1] of edges) {
      if (y0 === y1) {
        const y = y0;
        const [xa, xb] = [Math.min(x0, x1), Math.max(x0, x1)];
        if (!horizontal.has(y)) horizontal.set(y, []);
        horizontal.get(y).push([xa, xb]);
      } else if (x0 === x1) {
        const x = x0;
        const [ya, yb] = [Math.min(y0, y1), Math.max(y0, y1)];
        if (!vertical.has(x)) vertical.set(x, []);
        vertical.get(x).push([ya, yb]);
      }
    }

    function merge(map) {
      const merged = [];
      for (let [k, segs] of map.entries()) {
        segs.sort((a, b) => a[0] - b[0]);
        let [s, e] = segs[0];
        for (let i = 1; i < segs.length; i++) {
          const [ns, ne] = segs[i];
          if (ns <= e) e = Math.max(e, ne);
          else {
            merged.push({ k, s, e });
            [s, e] = [ns, ne];
          }
        }
        merged.push({ k, s, e });
      }
      return merged;
    }

    const mergedH = merge(horizontal).map(({ k, s, e }) => [s, k, e, k]);
    const mergedV = merge(vertical).map(({ k, s, e }) => [k, s, k, e]);
    return [...mergedH, ...mergedV];
  }
}
