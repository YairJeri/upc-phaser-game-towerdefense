import { walls } from "../other/walls.js";
import FlowField from "../tools/FlowField.js";

export default class NavigationSystem {
  constructor(width, height, cell_size) {
    this.width = width;
    this.height = height;
    this.cell_size = cell_size;

    this.flowFieldStatic = new FlowField(
      this.width,
      this.height,
      this.cell_size
    );
    this.flowFieldDynamic = new FlowField(
      this.width,
      this.height,
      this.cell_size
    );

    this.staticWorker = new Worker("/src/workers/flowfieldWorker.js");
    this.dynamicWorker = new Worker("/src/workers/flowfieldWorker.js");

    this.staticWorker.onmessage = (e) => {
      this.flowFieldStatic.dists = e.data;
      this.flowFieldStatic.calculateAngles();
      this.flowFieldStatic.smoothFlowComponents(10);
    };
    this.dynamicWorker.onmessage = (e) => {
      this.flowFieldDynamic.dists = e.data;
      this.flowFieldDynamic.calculateAngles();
      this.flowFieldDynamic.smoothFlowComponents(10);
    };
  }

  generateStatic(targets, buildSystem) {
    this.flowFieldStatic.generate(targets, buildSystem.wallManager);
    this.flowFieldDynamic.generate(targets, buildSystem.wallManager);
  }

  removeMapWall(tx, ty) {
    this.flowFieldStatic.removeWall(tx, ty);
    this.flowFieldDynamic.removeWall(tx, ty);

    this.staticWorker.postMessage({
      width: this.flowFieldStatic.width,
      height: this.flowFieldStatic.height,
      cell_size: this.cell_size,
      targets: this.flowFieldStatic.targets,
      walls: this.flowFieldStatic.walls,
    });
    this.dynamicWorker.postMessage({
      width: this.flowFieldStatic.width,
      height: this.flowFieldStatic.height,
      cell_size: this.cell_size,
      targets: this.flowFieldDynamic.targets,
      walls: this.flowFieldDynamic.walls,
    });
  }

  addObstacle(tx, ty) {
    this.flowFieldDynamic.setWall(tx, ty);
    console.log("adding obstacle");
    this.dynamicWorker.postMessage({
      width: this.flowFieldStatic.width,
      height: this.flowFieldStatic.height,
      cell_size: this.cell_size,
      targets: this.flowFieldDynamic.targets,
      walls: this.flowFieldDynamic.walls,
    });
  }

  removeObstacle(tx, ty) {
    this.flowFieldDynamic.removeWall(tx, ty);

    this.dynamicWorker.postMessage({
      width: this.flowFieldStatic.width,
      height: this.flowFieldStatic.height,
      cell_size: this.cell_size,
      targets: this.flowFieldDynamic.targets,
      walls: this.flowFieldDynamic.walls,
    });
  }

  getVector(x, y) {
    const tx = Math.floor(x / this.cell_size);
    const ty = Math.floor(y / this.cell_size);

    const distStatic = this.flowFieldStatic.getCellVector(tx, ty);
    const distDynamic = this.flowFieldDynamic.getCellVector(tx, ty);

    if (distDynamic > distStatic * 2.5 || distDynamic === 0) {
      return { destroy: true, flow: this.flowFieldStatic.getVector(x, y) };
    }
    return { destroy: false, flow: this.flowFieldDynamic.getVector(x, y) };
  }
}
