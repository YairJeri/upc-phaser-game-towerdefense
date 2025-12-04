import ANIMATION from "../animation.js";

import { LightPipeline } from "../shaders/LightPipeline.js";
import { CloudPipeline } from "../shaders/CloudPipeline.js";
import CloudManager from "../managers/CloudManager.js";
import BuildSystem from "../systems/BuildSystem.js";
import EnemySystem from "../systems/EnemySystem.js";
import NavigationSystem from "../systems/NavigationSystem.js";
import ProjectilePool from "../tools/ProyectilePool.js";
import WaveSystem from "../systems/WaveSystem.js";
import EconomySystem from "../systems/EconomySystem.js";
import SoundSystem from "../systems/SoundSystem.js";
import StructureTypes from "../data/StructureInfo.js";

export class MainScene extends Phaser.Scene {
  constructor() {
    super("MainScene");
  }

  init() {
    this.grid = [];
    this.condition = false;
    this.actualTower = null;
    this.cameraVelX = 0;
    this.cameraVelY = 0;
    this.isGamePaused = false;
    this.isSellMode = false;
  }

  preload() {
    // @ts-ignore
    this.renderer.pipelines.addPostPipeline("lights", LightPipeline);
    // @ts-ignore
    this.renderer.pipelines.addPostPipeline("clouds", CloudPipeline);

    this.cameras.main.setPostPipeline(["clouds", "lights"]);

    this.load.image("main_structure", "assets/Main.png");

    this.load.spritesheet("water", "assets/map/water.png", {
      frameWidth: 480,
      frameHeight: 480,
    });
  }

  map;
  base;
  grid = [];
  cell_size = 32;
  finalStats = {
    wave: 1,
    money: 0,
    enemies: 0,
  };

  actualTower = null;
  initMap() {
    this.map = this.add.image(0, 0, "map_base").setOrigin(0, 0).setScale(2);
    this.mapWidth = this.map.width * this.map.scaleX;
    this.mapHeight = this.map.height * this.map.scaleY;

    this.forest = this.add
      .image(0, 0, "forest")
      .setOrigin(0, 0)
      .setScale(2)
      .setDepth(50);
    this.water = this.add.sprite(0, 0, "water").setOrigin(0, 0).setScale(2);

    this.mountain = this.add
      .image(-412, 704, "mountain")
      .setOrigin(0, 0)
      .setScale(4)
      .setDepth(1000);
    this.mountain2 = this.add
      .image(-320, 946, "mountain")
      .setOrigin(0, 0)
      .setScale(3)
      .setDepth(1000);
    this.mountain3 = this.add
      .image(-160, 1216, "mountain")
      .setOrigin(0, 0)
      .setScale(2)
      .setDepth(1000);

    this.water.anims.play("flow");
  }

  initDebug() {
    this.highlightTile = this.add
      .rectangle(0, 0, this.cell_size, this.cell_size)
      .setStrokeStyle(4, 0xff0000)
      .setOrigin(0, 0);

    this.debug = this.add.graphics();

    this.flowDynamic = this.add.graphics();
    this.flowStatic = this.add.graphics();
  }

  initManagers() {
    this.cloudManager = new CloudManager(this);
  }

  initSystems() {
    this.enemySystem = new EnemySystem(this, 1000, 64);
    this.navigationSystem = new NavigationSystem(
      this.mapWidth,
      this.mapHeight,
      32,
      this
    );
    this.buildSystem = new BuildSystem(
      this,
      this.mapWidth,
      this.mapHeight,
      32,
      this.navigationSystem
    );
    this.proyectilePool = new ProjectilePool(this, 1000);
    this.waveSystem = new WaveSystem(this, this.enemySystem, this.buildSystem);
    this.economySystem = new EconomySystem(this, 0);
    this.soundSystem = new SoundSystem(this);
  }

  initEmitters() {
    this.explosionEmitter = this.add
      .particles(0, 0, "flares", {
        frame: "white",
        color: [0xff0404, 0xf83600, 0xf89800, 0xfacc22],
        colorEase: "quad.out",
        lifespan: 1000,
        rotate: { min: 0, max: 360 },
        alpha: { start: 1, end: 0 },
        scale: { start: 0.7, end: 0, ease: "sine.out" },
        speed: 100,
        advance: 2000,
        blendMode: "ADD",
      })
      .setDepth(1000);

    this.debrisEmitter = this.add
      .particles(0, 0, "particle", {
        color: [0x8c8c8c, 0x6e6e6e, 0x4f4f4f, 0xc2b280],
        colorEase: "quad.out",
        lifespan: 800,
        rotate: { min: 0, max: 360 },
        alpha: { start: 1, end: 0 },
        scale: { start: 0.5, end: 0.3, ease: "sine.out" },
        gravityY: 200,
        speed: 60,
        advance: 2000,
      })
      .setDepth(1000);

    this.bloodAngleMin = -100;
    this.bloodAngleMax = -80;
    this.bloodEmitter = this.add
      .particles(0, 0, "particle", {
        colorEase: "quad.out",
        color: [0xff0000, 0x8b0000, 0x400000],
        alpha: { start: 1, end: 0 },
        scale: { start: 0.5, end: 0, ease: "sine.in" },
        speed: 100,
        advance: 1500,
        lifespan: 500,
        angle: {
          onEmit: () => {
            return Phaser.Math.Between(this.bloodAngleMin, this.bloodAngleMax);
          },
        },
      })
      .setDepth(1000);

    this.mageAttackEmitter = this.add
      .particles(0, 0, "flares", {
        color: [0xff0000, 0xd10000, 0x8b0000, 0x660000],
        colorEase: "quad.out",
        lifespan: 300,
        rotate: { min: 0, max: 360 },
        alpha: { start: 1, end: 0 },
        scale: { start: 0.2, end: 0.1, ease: "sine.out" },
        speed: -30,
        advance: 1500,
      })
      .setDepth(1000);
  }

  create() {
    this.scene.launch("HUD");
    this.scene.bringToTop("HUD");
    this.scene.launch("GameOver");
    this.scene.bringToTop("GameOver");
    this.scene.sleep("GameOver");

    this.initAnimations();
    this.initMap();
    this.initDebug();
    this.initCamera();
    this.initManagers();
    this.initEmitters();

    this.initSystems();
    // Keep local pause flag in sync even when HUD toggles pause
    this.game.events.on("GamePaused", (paused) => {
      this.isGamePaused = paused;
    });

    this.economySystem.addMoney(500);

    this.game.events.on("TowerChange", (tower) => {
      this.actualTower = tower;
    });

    this.game.events.on("GameOver", (tower) => {
      this.soundSystem.stop();
      this.scene.pause("MainScene");
    });

    this.game.events.on("Restart", () => {
      this.resetGame();
      this.scene.resume("MainScene");
    });

    this.game.events.on("EKilled", () => {
      this.finalStats.enemies += 1;
    });

    this.game.events.on("VillageDestroyed", ([tx, ty]) => {
      this.navigationSystem.removeTarget(tx, ty);
    });

    this.game.events.on("MainStructureDestroyed", () => {
      this.finalStats.wave = this.waveSystem.currentWaveIndex;
      this.finalStats.money = this.economySystem.money;
      this.game.events.emit("GameOver", this.finalStats);
    });

    this.game.events.on("StartWave", () => {
      this.soundSystem.playHorn(0.5);
    });

    this.game.events.on("WaveOver", () => {
      this.soundSystem.playTrumpet(0.5);
    });

    this.buildSystem.addMainStructure(16);

    const targets = [
      (this.mapWidth - 16) / 2,
      (this.mapHeight - 16) / 2,
      (this.mapWidth - 16) / 2 + 32,
      (this.mapHeight - 16) / 2,
      (this.mapWidth - 16) / 2,
      (this.mapHeight - 16) / 2 + 32,
      (this.mapWidth - 16) / 2 + 32,
      (this.mapHeight - 16) / 2 + 32,
    ];

    this.navigationSystem.generateStatic(targets, this.buildSystem);

    this.flowGraphics = this.add.graphics();

    this.flowGraphics.lineStyle(2, 0xff0000, 1);

    this.initInputs();

    this.soundSystem.playGameMusic(0.25);
    this.addInitialVillages();
    this.addBridge();
    this.buildSystem.generateColliders();

    // Sell mode toggle from HUD
    this.game.events.on("SellMode", (enabled) => {
      this.isSellMode = !!enabled;
    });
  }

  addBridge() {
    const bridge = [
      20, 24, 21, 24, 21, 23, 21, 22, 22, 22, 22, 21, 23, 21, 23, 20, 23, 19,
      20, 25, 19, 25,
    ];
    for (let i = 0; i < bridge.length; i += 2) {
      this.buildSystem.removeMapWall(bridge[i], bridge[i + 1]);
      this.navigationSystem.removeMapWall(bridge[i], bridge[i + 1]);
      const sprite = this.add
        .sprite(
          bridge[i] * this.cell_size + this.cell_size / 2,
          bridge[i + 1] * this.cell_size + this.cell_size / 2,
          "buildings"
        )
        .setOrigin(0.5)
        .setScale(2.5);
      sprite.setFrame(10);
    }
  }

  condition = false;
  initInputs() {
    this.input.off("pointermove");
    this.input.off("pointerup");

    this.space = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );

    this.space.on("down", () => {});

    // Toggle pause/resume with Escape
    this.escape = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.ESC
    );
    this.escape.on("down", () => {
      const isPaused = this.scene.isPaused("MainScene");
      if (isPaused) {
        this.scene.resume("MainScene");
        this.isGamePaused = false;
        this.game.events.emit("GamePaused", false);
        this.sound.resumeAll?.();
      } else {
        this.scene.pause("MainScene");
        this.isGamePaused = true;
        this.game.events.emit("GamePaused", true);
        this.sound.pauseAll?.();
      }
    });

    this.input.on("pointermove", (pointer) => {
      if (this.isGamePaused) return;
      this.handleCameraMovement(pointer);
      const worldX = pointer.worldX;
      const worldY = pointer.worldY;

      this.actTileX = Math.floor(worldX / this.cell_size);
      this.actTileY = Math.floor(worldY / this.cell_size);

      this.highlightTile.x = this.actTileX * this.cell_size;
      this.highlightTile.y = this.actTileY * this.cell_size;

      if (
        this.condition &&
        this.actualTower &&
        this.economySystem.hasEnoughMoney(this.actualTower.cost)
      ) {
        this.highlightTile.setStrokeStyle(4, 0x00ff00);
      } else {
        this.highlightTile.setStrokeStyle(4, 0xff0000);
      }
    });

    this.input.on("pointerup", (pointer) => {
      if (this.isGamePaused) return;
      console.log("Tile clickeado:", this.actTileX, this.actTileY);
      if (pointer.button === 1) {
      }
      if (pointer.button === 0) {
        if (this.isSellMode) {
          const st = this.buildSystem.structureManager.getStructureAt(
            this.actTileX,
            this.actTileY
          );
          if (st && st.type !== 0) {
            // Refund half cost
            const typeInfo = Phaser.Utils.Objects.GetValue(
              StructureTypes,
              Object.keys(StructureTypes).find(
                (k) => StructureTypes[k].id === st.type
              )
            );
            const refund = Math.floor((typeInfo?.cost || 0) / 2);
            if (refund > 0) this.economySystem.addMoney(refund);
            this.buildSystem.removeStructureObj(st);
          }
        } else {
          if (
            this.condition &&
            this.actualTower &&
            this.economySystem.hasEnoughMoney(this.actualTower.cost)
          ) {
            this.economySystem.spendMoney(this.actualTower.cost);
            this.buildSystem.addStructure(
              this.actualTower.type,
              this.actTileX,
              this.actTileY,
              7
            );
          }
        }
      }
    });
  }

  drawWalls() {
    this.debug.clear();
    this.debug.lineStyle(10, 0xff0000, 1);
    const contours = this.buildSystem.getCountours();
    for (const seg of contours) {
      if (Array.isArray(seg)) {
        const [x1, y1, x2, y2] = seg;
        this.debug.strokeLineShape(new Phaser.Geom.Line(x1, y1, x2, y2));
      }
    }
  }

  initAnimations() {
    const waterAnimations = ANIMATION.water;
    for (const key in waterAnimations) {
      const animation = waterAnimations[key];
      this.anims.create({
        key: animation.key,
        frames: this.anims.generateFrameNumbers(
          animation.texture,
          animation.config
        ),
        frameRate: animation.frameRate,
        repeat: animation.repeat,
      });
    }
    const orcAnimations = ANIMATION.orc;
    for (const key in orcAnimations) {
      const animation = orcAnimations[key];
      this.anims.create({
        key: animation.key,
        frames: this.anims.generateFrameNumbers(
          animation.texture,
          animation.config
        ),
        frameRate: animation.frameRate,
        repeat: animation.repeat,
      });
    }
    const mageAnimations = ANIMATION.mage;
    for (const key in mageAnimations) {
      const animation = mageAnimations[key];
      this.anims.create({
        key: animation.key,
        frames: this.anims.generateFrameNumbers(
          animation.texture,
          animation.config
        ),
        frameRate: animation.frameRate,
        repeat: animation.repeat,
      });
    }
  }

  initCamera() {
    const cam = this.cameras.main;

    cam.setBackgroundColor("#64C26E");
    cam.setBounds(0, 0, this.mapWidth, this.mapHeight);

    this.cameraSpeed = 800;
    this.dampingFactor = 0.99;
    this.cameraSpeedFactor = 0;
    this.cameraVelX = 0;
    this.cameraVelY = 0;

    this.minZoom = Math.max(
      cam.width / this.mapWidth,
      cam.height / this.mapHeight
    );

    this.maxZoom = 5;

    let initialZoom = 0.7;
    initialZoom = Phaser.Math.Clamp(initialZoom, this.minZoom, this.maxZoom);
    cam.setZoom(initialZoom);

    cam.centerOn(this.mapWidth / 2, this.mapHeight / 2);

    this.input.on("wheel", (pointer, objs, dx, dy) => {
      let newZoom = cam.zoom - dy * 0.001;
      newZoom = Phaser.Math.Clamp(newZoom, this.minZoom, this.maxZoom);
      cam.setZoom(newZoom);
    });
  }

  handleCameraMovement(pointer) {
    const camera = this.cameras.main;
    const { width, height } = camera;

    const mouseX = pointer.x;
    const mouseY = pointer.y;

    const marginRatio = 0.1;
    const marginX = width * marginRatio;
    const marginY = height * marginRatio;

    this.cameraVelX = 0;
    this.cameraVelY = 0;

    if (mouseX < marginX) {
      const factor = Phaser.Math.Clamp((marginX - mouseX) / marginX, 0, 1);
      this.cameraVelX = -this.cameraSpeed * factor;
    } else if (mouseX > width - marginX) {
      const factor = Phaser.Math.Clamp(
        (mouseX - (width - marginX)) / marginX,
        0,
        1
      );
      this.cameraVelX = this.cameraSpeed * factor;
    }

    if (mouseY < marginY) {
      const factor = Phaser.Math.Clamp((marginY - mouseY) / marginY, 0, 1);
      this.cameraVelY = -this.cameraSpeed * factor;
    } else if (mouseY > height - marginY) {
      const factor = Phaser.Math.Clamp(
        (mouseY - (height - marginY)) / marginY,
        0,
        1
      );
      this.cameraVelY = this.cameraSpeed * factor;
    }
  }

  updateCamera(dt) {
    const camera = this.cameras.main;

    camera.scrollX += this.cameraVelX * dt;
    camera.scrollY += this.cameraVelY * dt;
  }

  addInitialVillages() {
    const villages = [
      // --- CLUSTER ESTE (zona agrícola con varias aldeas)
      43, 18, 44, 20, 46, 21, 44, 23, 47, 24,

      // --- CLUSTER SUR (pueblos costeros / desorganizados)
      28, 46, 30, 47, 33, 50, 27, 50, 33, 48, 29, 52,

      // --- CLUSTER OESTE (zona montañosa)
      23, 26, 26, 24, 26, 27,

      // --- MICROALDEAS / PUEBLOS SUELTOS
      35, 27, 39, 30, 28, 26, 30, 38, 49, 29, 37, 47,
    ];

    for (let i = 0; i < villages.length; i += 2) {
      this.buildSystem.addVillage(villages[i], villages[i + 1]);
    }
  }

  resetGame() {
    this.waveSystem.currentWaveIndex = 0;
    this.waveSystem.isWaveActive = false;
    this.waveSystem.spawnedEnemies = 0;
    this.waveSystem.timeSinceLastSpawn = 0;

    // Reset economy system
    this.economySystem.money = 500;
    this.economySystem.updateUI();

    // Reset build system - clear all structures except main structure
    this.buildSystem.reset();

    // Reset enemy system
    this.enemySystem.reset();

    // Reset projectile pool
    this.proyectilePool.reset();

    // Reset actual tower selection
    this.actualTower = null;

    // Reset game registry values
    this.game.registry.set("finalWave", 1);
    this.game.registry.set("finalMoney", 0);
    this.game.registry.set("finalEnemies", 0);

    // Re-add main structure
    this.buildSystem.addMainStructure(12);
    this.addInitialVillages();

    // Regenerate navigation
    const targets = [
      (this.mapWidth - 16) / 2,
      (this.mapHeight - 16) / 2,
      (this.mapWidth - 16) / 2 + 32,
      (this.mapHeight - 16) / 2,
      (this.mapWidth - 16) / 2,
      (this.mapHeight - 16) / 2 + 32,
      (this.mapWidth - 16) / 2 + 32,
      (this.mapHeight - 16) / 2 + 32,
    ];
    this.navigationSystem.generateStatic(targets, this.buildSystem);
    this.buildSystem.generateColliders();

    this.soundSystem.playGameMusic(0.25);
  }

  update(time, dt_ms) {
    const dt = dt_ms / 1000;
    this.updateCamera(dt);
    this.cloudManager.update(dt);
    this.buildSystem.update(dt, this.enemySystem, this.proyectilePool);
    this.condition = this.buildSystem.canPlace(this.actTileX, this.actTileY);
    this.enemySystem.update(dt, this.navigationSystem, this.buildSystem);
    this.proyectilePool.update(dt, this.enemySystem, this);
    this.waveSystem.update(dt);
  }
}
