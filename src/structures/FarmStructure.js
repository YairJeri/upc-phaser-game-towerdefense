import Structure from "./BaseStructure.js";
import StructureTypes from "../other/StructureInfo.js";

export default class FarmStructure extends Structure {
  constructor(scene, id, wx, wy, tx, ty, sprite, lightId) {
    super(id, wx, wy, tx, ty, sprite);

    this.setType(StructureTypes.Farm.id);
    this.setLightId(lightId);
    this.setMaxHealth(StructureTypes.Farm.health);

    scene.game.events.on("WaveOver", () => {
      scene.game.events.emit("MoneyGain", StructureTypes.Farm.income);
    });
  }
}
