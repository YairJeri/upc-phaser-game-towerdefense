import Structure from "./BaseStructure.js";
import StructureTypes from "../data/StructureInfo.js";

export default class MainStructure extends Structure {
  constructor(scene, id, wx, wy, tx, ty, sprite, lightId) {
    super(id, wx, wy, tx, ty, sprite, 32);

    this.setType(StructureTypes.Main.id);
    this.setLightId(lightId);
    this.setMaxHealth(StructureTypes.Main.health);
    this.scene = scene;
  }

  setCurrentHealth(currentHealth) {
    super.setCurrentHealth(currentHealth);
    this.scene.game.events.emit("CurrentHealth", this.currentHealth);

    if (this.currentHealth <= 0) {
      this.scene.game.events.emit("MainStructureDestroyed");
    }
  }
}
