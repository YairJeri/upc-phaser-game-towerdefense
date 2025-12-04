import Structure from "./BaseStructure.js";
import StructureTypes from "../data/StructureInfo.js";

export default class WallStructure extends Structure {
  constructor(scene, id, wx, wy, tx, ty, sprite) {
    super(id, wx, wy, tx, ty, sprite);

    this.setType(StructureTypes.Wall.id);
    this.setRange(0);
    this.setMaxHealth(StructureTypes.Wall.health);
  }
}
