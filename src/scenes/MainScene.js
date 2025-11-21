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

export class MainScene extends Phaser.Scene {
  constructor() {
    super("MainScene");
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
      .setScale(4);
    this.mountain2 = this.add
      .image(-320, 946, "mountain")
      .setOrigin(0, 0)
      .setScale(3);
    this.mountain3 = this.add
      .image(-160, 1216, "mountain")
      .setOrigin(0, 0)
      .setScale(2);

    this.water.anims.play("flow");
  }

  initDebug() {
    this.highlightTile = this.add
      .rectangle(0, 0, this.cell_size, this.cell_size)
      .setStrokeStyle(4, 0xff0000)
      .setOrigin(0, 0);

    this.debug = this.add.graphics();
  }

  initManagers() {
    this.cloudManager = new CloudManager(this);
  }

  initSystems() {
    this.enemySystem = new EnemySystem(this, 1000, 64);
    this.navigationSystem = new NavigationSystem(
      this.mapWidth,
      this.mapHeight,
      32
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
    this.economySystem = new EconomySystem(this, 500);
    this.soundSystem = new SoundSystem(this);
  }

  initEmitters() {
    this.explosionEmitter = this.add.particles(0, 0, "flares", {
      frame: "white",
      color: [0xfacc22, 0xf89800, 0xf83600, 0x9f0404],
      colorEase: "quad.out",
      lifespan: 1000,
      rotate: { min: 0, max: 360 },
      alpha: { start: 1, end: 0 },
      scale: { start: 0.7, end: 0, ease: "sine.out" },
      speed: 100,
      advance: 2000,
      blendMode: "ADD",
    });
  }

  create() {
    this.scene.launch("HUD");
    this.scene.bringToTop("HUD");

    this.initAnimations();
    this.initMap();
    this.initDebug();
    this.initCamera();
    this.initManagers();
    this.initEmitters();

    this.initSystems();

    this.economySystem.addMoney(500);

    this.game.events.on("TowerChange", (tower) => {
      this.actualTower = tower;
    });

    this.game.events.on("GameOver", (tower) => {
      this.scene.start("GameOver");
      this.scene.stop("HUD");
    });

    this.buildSystem.addMainStructure(12);

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

    this.buildSystem.generateColliders();

    this.initInputs();
  }
  condition = false;
  initInputs() {
    this.space = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );

    // this.debug.clear();
    // this.debug.lineStyle(10, 0xff0000, 1);
    // this.drawWalls();
    this.space.on("down", () => {});

    this.input.on("pointermove", (pointer) => {
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
      console.log("Tile clickeado:", this.actTileX, this.actTileY);
      if (pointer.button === 1) {
      }
      if (pointer.button === 0) {
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

      // this.navigationSystem.flowFieldDynamic.drawFlowField(this.debug);
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
    const enemyAnimations = ANIMATION.enemy;
    for (const key in enemyAnimations) {
      const animation = enemyAnimations[key];
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

    const desiredZoomFactor = 3;
    const zoomX = cam.width / (this.mapWidth / desiredZoomFactor);
    const zoomY = cam.height / (this.mapHeight / desiredZoomFactor);

    const zoom = Math.min(zoomX, zoomY);

    cam.setZoom(zoom);

    cam.centerOn(this.mapWidth / 2, this.mapHeight / 2);
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

    // camera.scrollX = Phaser.Math.Clamp(
    //   camera.scrollX,
    //   -camera.width / (camera.zoom),
    //   this.mapWidth * camera.zoom - camera.width
    // );

    // console.log(camera.scrollX, camera.scrollY);
    // camera.scrollY = Phaser.Math.Clamp(
    //   camera.scrollY,

    //   -camera.height / (camera.zoom * 2),
    //   this.mapHeight * camera.zoom - camera.height
    // );
  }

  update(time, dt_ms) {
    const dt = dt_ms / 1000;
    this.updateCamera(dt);
    this.cloudManager.update(dt);
    this.buildSystem.update(dt, this.enemySystem, this.proyectilePool);
    this.condition =
      this.buildSystem.canPlace(this.actTileX, this.actTileY) &&
      !this.waveSystem.isWaveActive;
    this.enemySystem.update(dt, this.navigationSystem, this.buildSystem);
    this.proyectilePool.update(dt, this.enemySystem, this);
    this.waveSystem.update(dt);
  }
}
