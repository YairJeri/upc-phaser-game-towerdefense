import FlowField from "../tools/FlowField.js";

export default class NavigationSystem {
  constructor(width, height, cell_size, scene) {
    this.width = width;
    this.height = height;
    this.cell_size = cell_size;

    this.flowFieldStatic = new FlowField(
      this.width,
      this.height,
      this.cell_size,
      scene.flowStatic
    );
    this.flowFieldDynamic = new FlowField(
      this.width,
      this.height,
      this.cell_size,
      scene.flowDynamic
    );

    this.scene = scene;
  }

  generateStatic(targets, buildSystem) {
    this.flowFieldStatic.generate(targets, buildSystem.wallManager);
    this.flowFieldDynamic.generate(targets, buildSystem.wallManager);
  }

  addTarget(tx, ty) {
    this.flowFieldStatic.addTarget(tx, ty);
    this.flowFieldDynamic.addTarget(tx, ty);
  }

  removeTarget(tx, ty) {
    this.flowFieldStatic.removeTarget(tx, ty);
    this.flowFieldDynamic.removeTarget(tx, ty);
  }

  removeMapWall(tx, ty) {
    this.flowFieldStatic.removeWall(tx, ty);
    this.flowFieldDynamic.removeWall(tx, ty);
  }

  addObstacle(tx, ty) {
    this.flowFieldDynamic.setWall(tx, ty);
  }

  removeObstacle(tx, ty) {
    this.flowFieldDynamic.removeWall(tx, ty);
  }

  getVector(x, y) {
    const tx = Math.floor(x / this.cell_size);
    const ty = Math.floor(y / this.cell_size);

    const distStatic = this.flowFieldStatic.getCellVector(tx, ty);
    const distDynamic = this.flowFieldDynamic.getCellVector(tx, ty);

    if (distDynamic > distStatic + 7 || distDynamic === 0) {
      return { destroy: true, flow: this.flowFieldStatic.getVector(x, y) };
    }
    return { destroy: false, flow: this.flowFieldDynamic.getVector(x, y) };
  }
}
