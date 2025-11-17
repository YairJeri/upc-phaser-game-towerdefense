import MainStructure from "./MainStructure.js";
import WallStructure from "./WallStructure.js";
import SingleTargetTower from "./SingleTargetTower.js";
import AreaDamageTower from "./AreaDamageTower.js";
import FarmStructure from "./FarmStructure.js";

export default class StructureFactory {
  static createMain(scene, id, wx, wy, tx, ty, sprite, lightId) {
    return new MainStructure(scene, id, wx, wy, tx, ty, sprite, lightId);
  }
  static createWall(scene, id, wx, wy, tx, ty, sprite) {
    return new WallStructure(scene, id, wx, wy, tx, ty, sprite);
  }
  static createTower1(scene, id, wx, wy, tx, ty, sprite, lightId) {
    return new SingleTargetTower(scene, id, wx, wy, tx, ty, sprite, lightId);
  }
  static createTower2(scene, id, wx, wy, tx, ty, sprite, lightId) {
    return new AreaDamageTower(scene, id, wx, wy, tx, ty, sprite, lightId);
  }
  static createFarm(scene, id, wx, wy, tx, ty, sprite, lightId) {
    return new FarmStructure(scene, id, wx, wy, tx, ty, sprite, lightId);
  }
}
