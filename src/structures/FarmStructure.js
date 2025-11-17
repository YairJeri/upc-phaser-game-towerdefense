import Structure from "./BaseStructure.js";
import StructureTypes from "../other/StructureInfo.js";

export default class FarmStructure extends Structure {
  constructor(scene, id, wx, wy, tx, ty, sprite, lightId) {
    super(id, wx, wy, tx, ty, sprite, 16);

    this.setType(StructureTypes.Farm.id);
    this.setLightId(lightId);
    this.setMaxHealth(100);

    scene.game.events.on("WaveOver", () => {
      scene.game.events.emit("MoneyGain", StructureTypes.Farm.income);
    });
  }
}
