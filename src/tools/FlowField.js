const NO_DIST = 0xffff;
const DistArray = Uint16Array;

export default class FlowField {
  constructor(width, height, cellSize) {
    this.width = width / cellSize;
    this.height = height / cellSize;
    this.cellSize = cellSize;

    this.walls = new Set();

    this.dists = new DistArray(this.width * this.height).fill(0);
    this.visited = new Uint8Array(this.width * this.height).fill(0);
    this.flow = new Float32Array(2 * this.width * this.height).fill(0);

    this.targets = [];
  }

  _index(x, y) {
    return y * this.width + x;
  }

  cleanUp() {
    this.dists = null;
    this.visited = null;
    this.flow = null;
  }

  worldToCell(px, py) {
    return {
      x: Math.floor(px / this.cellSize),
      y: Math.floor(py / this.cellSize),
    };
  }

  inBounds(x, y) {
    return x >= 0 && y >= 0 && x < this.width && y < this.height;
  }

  isValid(row, col) {
    if (row < 0 || col < 0 || row >= this.height || col >= this.width)
      return false;
    if (this.visited[this._index(col, row)]) return false;
    return true;
  }

  BFS(targets) {
    let queue = [];
    let head = 0;

    for (let i = 0; i < targets.length; i += 2) {
      let { x, y } = this.worldToCell(targets[i], targets[i + 1]);
      queue.push([x, y]);
      const index = this._index(x, y);
      this.visited[index] = 1;
      this.dists[index] = 0;
    }

    let dx = [-1, 0, 1, 0];
    let dy = [0, 1, 0, -1];

    while (head < queue.length) {
      let [x, y] = queue[head++];

      let distance = this.dists[this._index(x, y)];

      for (let i = 0; i < 4; i++) {
        let nx = x + dx[i];
        let ny = y + dy[i];

        if (this.isValid(ny, nx)) {
          const index = this._index(nx, ny);
          this.visited[index] = 1;

          if (this.dists[index] === NO_DIST) {
            continue;
          }

          this.dists[index] = distance + 1;
          queue.push([nx, ny]);
        }
      }
    }
  }

  calculateAngles() {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const index = this._index(x, y);

        const dist = this.dists[index];

        if (dist === NO_DIST || dist === 0) {
          continue;
        }

        let distLeft = this.dists[this._index(x - 1, y)] || NO_DIST;
        let distRight = this.dists[this._index(x + 1, y)] || NO_DIST;
        let distUp = this.dists[this._index(x, y - 1)] || NO_DIST;
        let distDown = this.dists[this._index(x, y + 1)] || NO_DIST;

        if (distLeft === NO_DIST) distLeft = dist;
        if (distRight === NO_DIST) distRight = dist;
        if (distUp === NO_DIST) distUp = dist;
        if (distDown === NO_DIST) distDown = dist;

        let gradX = distLeft - distRight;
        let gradY = distUp - distDown;

        this.flow[index * 2] = gradX;
        this.flow[index * 2 + 1] = gradY;
      }
    }
  }

  smoothFlowComponents(iterations = 1) {
    const directions = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ];

    for (let iter = 0; iter < iterations; iter++) {
      const newFlow = new Float32Array(this.flow.length);

      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          const index = this._index(x, y);
          if (this.dists[index] === NO_DIST || this.dists[index] === 0) {
            newFlow[2 * index] = NaN;
            newFlow[2 * index + 1] = NaN;
            continue;
          }

          let sumX = 0,
            sumY = 0,
            count = 0;

          const selfWeight = 2;
          if (!isNaN(this.flow[2 * index])) {
            sumX += this.flow[2 * index] * selfWeight;
            sumY += this.flow[2 * index + 1] * selfWeight;
            count += selfWeight;
          }

          for (const [dx, dy] of directions) {
            const nx = x + dx,
              ny = y + dy;
            if (this.inBounds(nx, ny)) {
              const nidx = this._index(nx, ny);
              if (!isNaN(this.flow[2 * nidx])) {
                sumX += this.flow[2 * nidx];
                sumY += this.flow[2 * nidx + 1];
                count++;
              }
            }
          }

          if (count > 0) {
            let vx = sumX / count;
            let vy = sumY / count;
            const len = Math.hypot(vx, vy);
            if (len > 1e-6) {
              vx /= len;
              vy /= len;
            }
            newFlow[2 * index] = vx;
            newFlow[2 * index + 1] = vy;
          } else {
            newFlow[2 * index] = this.flow[2 * index];
            newFlow[2 * index + 1] = this.flow[2 * index + 1];
          }
        }
      }

      this.flow = newFlow;
    }
  }

  setWalls(wallManager) {
    let walls = wallManager.getStaticWalls();

    for (const h of walls) {
      this.walls.add(h);
      this.dists[h] = -1;
    }
  }

  setWall(x, y) {
    this.walls.add(this._index(x, y));
  }

  removeWall(x, y) {
    this.walls.delete(this._index(x, y));
  }

  generate(targets, walls) {
    this.targets = targets;
    this.setWalls(walls);
    this.BFS(targets);
    this.calculateAngles();
    this.smoothFlowComponents(10);
  }

  regenerateFull() {
    this.visited.fill(0);
    this.dists.fill(0);
    this.flow.fill(NaN);

    for (const h of this.walls) {
      this.dists[h] = -1;
    }

    this.BFS(this.targets);
    this.calculateAngles();
  }

  drawFlowField(graphics) {
    graphics.clear();
    for (let y = 0; y < this.height; y++) {
      let text = y.toString() + " ";
      for (let x = 0; x < this.width; x++) {
        const px = x * this.cellSize;
        const py = y * this.cellSize;
        const dist = this.dists[this._index(x, y)];

        const flowX = this.flow[this._index(x, y) * 2];
        const flowY = this.flow[this._index(x, y) * 2 + 1];

        let blocked = dist === NO_DIST;

        if (blocked) {
          text += "X\t";
          graphics.fillStyle(0x000000, 0.3);
        } else {
          graphics.fillStyle(0x00ff00, 0.3);
          text += dist.toString() + "\t";
        }
        const centerX = px + this.cellSize / 2;
        const centerY = py + this.cellSize / 2;

        if (!isNaN(flowX) && !isNaN(flowY)) {
          const scale = this.cellSize * 0.5;
          const endX = centerX + flowX * scale;
          const endY = centerY + flowY * scale;

          graphics.beginPath();
          graphics.moveTo(centerX, centerY);
          graphics.lineTo(endX, endY);
          graphics.stroke();
        }
      }
    }
  }

  getCellVector(x, y) {
    if (!this.inBounds(x, y)) return NO_DIST;
    return this.dists[this._index(x, y)];
  }

  getVector(px, py) {
    const { x, y } = this.worldToCell(px, py);
    if (!this.inBounds(x, y)) return { x: 0, y: 0 };
    const flowX = this.flow[this._index(x, y) * 2];
    const flowY = this.flow[this._index(x, y) * 2 + 1];
    if (isNaN(flowX) || isNaN(flowY)) return { x: 0, y: 0 };
    return { x: flowX, y: flowY };
  }
}
