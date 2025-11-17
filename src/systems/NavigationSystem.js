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
  }

  generateStatic(targets, buildSystem) {
    this.flowFieldStatic.generate(targets, buildSystem.wallManager);
    this.flowFieldDynamic.generate(targets, buildSystem.wallManager);
  }

  removeMapWall(tx, ty) {
    this.flowFieldStatic.removeWall(tx, ty);
    this.flowFieldStatic.regenerateFull();
    this.flowFieldDynamic.removeWall(tx, ty);
    this.flowFieldDynamic.regenerateFull();
  }

  addObstacle(tx, ty) {
    this.flowFieldDynamic.setWall(tx, ty);
    this.flowFieldDynamic.regenerateFull();
  }

  removeObstacle(tx, ty) {
    this.flowFieldDynamic.removeWall(tx, ty);
    this.flowFieldDynamic.regenerateFull();
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
