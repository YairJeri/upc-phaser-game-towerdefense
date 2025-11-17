import { Boot } from "./scenes/Boot.js";
import { HUD } from "./scenes/HUD.js";
import { Preloader } from "./scenes/Preloader.js";
import { MainScene } from "./scenes/MainScene.js";
import { GameOver } from "./scenes/GameOver.js";

const config = {
  type: Phaser.WEBGL,
  width: 1280,
  height: 720,
  parent: "game-container",
  backgroundColor: "#2d3436",
  multiTexture: true,
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 0 },
    },
  },
  scene: [Boot, Preloader, HUD, MainScene, GameOver],
};

const game = new Phaser.Game(config);

window.addEventListener("unload", function () {
  if (game) {
    game.destroy(true);
  }
});
