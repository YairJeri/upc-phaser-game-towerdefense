import Structure from "./BaseStructure.js";
import StructureTypes from "../other/StructureInfo.js";

export default class MainStructure extends Structure {
  constructor(scene, id, wx, wy, tx, ty, sprite, lightId) {
    super(id, wx, wy, tx, ty, sprite, 32);

    this.setType(StructureTypes.Main.id);
    this.setLightId(lightId);
    this.setMaxHealth(StructureTypes.Main.health);
  }

  setCurrentHealth(currentHealth, scene) {
    super.setCurrentHealth(currentHealth, scene);
    scene.game.events.emit("CurrentHealth", this.currentHealth);

    if (this.currentHealth <= 0) {
      scene.game.events.emit("GameOver", this);
    }
  }
}
