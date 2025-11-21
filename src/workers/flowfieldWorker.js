const NO_DIST = 0xffff;
const DistArray = Uint16Array;

onmessage = (e) => {
  console.log("received message");
  const { width, height, cell_size, targets, walls } = e.data;

  const visited = new Uint8Array(width * height).fill(0);

  const _index = (x, y) => y * width + x;
  const isValid = (row, col) =>
    row < height && col < width && visited[_index(col, row)] === 0;

  console.log("generating static");
  const dists = BFS(
    targets,
    cell_size,
    width * height,
    visited,
    _index,
    isValid,
    walls
  );

  printFlowField(dists, width, height, _index);

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
function BFS(targets, cell_size, size, visited, _index, isValid, walls) {
  let queue = [];
  let head = 0;

  let dists = new DistArray(size).fill(0);

  for (const h of walls) {
    dists[h] = -1;
  }

  for (let i = 0; i < targets.length; i += 2) {
    let { x, y } = worldToCell(targets[i], targets[i + 1], cell_size);
    queue.push([x, y]);
    const index = _index(x, y);
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

      if (isValid(ny, nx)) {
        const index = _index(nx, ny);
        visited[index] = 1;

        if (dists[index] === NO_DIST) {
          continue;
        }

        dists[index] = distance + 1;
        queue.push([nx, ny]);
      }
    }
  }
  return dists;
}
