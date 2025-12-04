const NO_DIST = 0xffff;
const UNVISITED = 0xfffe;
const DistArray = Uint16Array;

onmessage = (e) => {
  const { width, height, targets, walls } = e.data;

  const visited = new Uint8Array(width * height).fill(0);

  const _index = (x, y) => y * width + x;
  const isValid = (row, col) => {
    if (row <= 0 || col <= 0 || row >= height || col >= width) return false;
    if (visited[_index(col, row)]) return false;
    return true;
  };
  const dists = BFS(targets, width * height, visited, _index, isValid, walls);

  postMessage(dists);
};

function printFlowField(dists, width, height, _index) {
  let text = "";
  for (let y = 0; y < height; y++) {
    text += y.toString() + " ";
    for (let x = 0; x < width; x++) {
      const dist = dists[_index(x, y)];

      let blocked = dist === NO_DIST;

      if (blocked) {
        text += "X\t";
      } else {
        text += dist.toString() + "\t";
      }
    }
    console.log(text);
    text = "";
  }
}
function worldToCell(px, py, cellSize) {
  return {
    x: Math.floor(px / cellSize),
    y: Math.floor(py / cellSize),
  };
}
function BFS(targets, size, visited, _index, isValid, walls) {
  let queue = [];
  let head = 0;

  let dists = new DistArray(size).fill(UNVISITED);

  for (const h of walls) {
    dists[h] = NO_DIST;
    visited[h] = 1;
  }

  for (let [index, position] of targets) {
    queue.push(position);
    visited[index] = 1;
    dists[index] = 0;
  }

  let dx = [-1, 0, 1, 0];
  let dy = [0, 1, 0, -1];

  while (head < queue.length) {
    let [x, y] = queue[head++];
    let distance = dists[_index(x, y)];

    for (let i = 0; i < 4; i++) {
      let nx = x + dx[i];
      let ny = y + dy[i];

      const cellIndex = _index(nx, ny);

      if (!isValid(ny, nx)) continue;

      if (dists[cellIndex] === NO_DIST) continue;

      if (visited[cellIndex]) continue;

      visited[cellIndex] = 1;
      dists[cellIndex] = distance + 1;

      queue.push([nx, ny]);
    }
  }

  return dists;
}
