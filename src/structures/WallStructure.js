import Structure from "./BaseStructure.js";
import StructureTypes from "../other/StructureInfo.js";

export default class WallStructure extends Structure {
  constructor(scene, id, wx, wy, tx, ty, sprite) {
    super(id, wx, wy, tx, ty, sprite, 16);

    this.setType(StructureTypes.Wall.id);
    this.setRange(0);
    this.setMaxHealth(200);
  }
}
