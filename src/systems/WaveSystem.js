import waves from "../other/Wave.js";

export default class WaveSystem {
  constructor(scene, enemySystem, BuildSystem) {
    this.scene = scene;
    this.enemySystem = enemySystem;
    this.waves = waves;

    const w = this.scene.mapWidth;
    const h = this.scene.mapHeight;

    this.edgeSpawn = [
      { x: w / 2, y: h - 32, x2: w - 32, y2: h - 32 },
      { x: w - 32, y: h - 32, x2: w - 32, y2: 32 * 16 - 32 },
    ];
    this.currentWaveIndex = 0;
    this.isWaveActive = false;
    this.spawnedEnemies = 0;
    this.timeSinceLastSpawn = 0;
    this.spawnInterval = 0;
    this.updateInterval = 0;

    this.buildSystem = BuildSystem;

    this.scene.game.events.on("StartWave", () => {
      this.startNextWave();
    });
  }

  startNextWave() {
    if (this.currentWaveIndex >= this.waves.length) return;

    this.wave = this.waves[this.currentWaveIndex++];
    this.spawnedEnemies = 0;
    this.isWaveActive = true;

    this.spawnInterval = Phaser.Math.Between(
      this.wave.minTimeBetweenSpawns,
      this.wave.maxTimeBetweenSpawns
    );
  }

  update(delta) {
    if (!this.isWaveActive) return;

    this.timeSinceLastSpawn += delta;
    this.updateInterval += delta;

    if (this.updateInterval >= 1) {
      this.updateInterval = 0;
    }

    this.scene.game.events.emit(
      "Remaining",
      this.wave.count -
        (this.spawnedEnemies - this.enemySystem.pool.getActiveCount())
    );

    if (this.spawnedEnemies >= this.wave.count) {
      if (this.enemySystem.pool.getActiveCount() === 0) {
        this.scene.game.events.emit("WaveOver");
        this.scene.game.events.emit("MoneyGain", this.wave.money);
        this.scene.game.events.emit("Remaining", 0);
        this.isWaveActive = false;
      }
      return;
    }

    if (this.timeSinceLastSpawn >= this.spawnInterval / 1000) {
      this.spawnedEnemies++;
      this.spawnTick();
      this.timeSinceLastSpawn = 0;

      this.spawnInterval = Phaser.Math.Between(
        this.wave.minTimeBetweenSpawns,
        this.wave.maxTimeBetweenSpawns
      );
    }
  }

  spawnTick() {
    if (!this.isWaveActive) return;

    const availableSections = this.edgeSpawn.slice(
      0,
      this.wave.spawnPointsToUse
    );

    const spawnSection = Phaser.Math.Between(0, availableSections.length - 1);
    const section = availableSections[spawnSection];

    let spawnPoint;
    let attempts = 0;
    const maxAttempts = 5;

    const w = this.scene.mapWidth / this.scene.cell_size;
    const cellSize = this.scene.cell_size;

    do {
      if (section.x === section.x2) {
        spawnPoint = {
          x: section.x,
          y: Phaser.Math.Between(section.y, section.y2),
        };
      } else {
        spawnPoint = {
          x: Phaser.Math.Between(section.x, section.x2),
          y: section.y,
        };
      }

      const tx = Math.floor(spawnPoint.x / cellSize);
      const ty = Math.floor(spawnPoint.y / cellSize) - 1;

      const hash = ty * w + tx;

      if (!this.buildSystem.wallManager.getSetWalls().has(ty * w + tx)) {
        break;
      }

      attempts++;
    } while (attempts < maxAttempts);

    let type = "orc";
    if (Math.random() < 0.1) {
      type = "mage";
    }

    this.enemySystem.spawn(spawnPoint.x, spawnPoint.y, type);
  }

  reset() {
    this.currentWaveIndex = 0;
    this.isWaveActive = false;
    this.spawnedEnemies = 0;
    this.timeSinceLastSpawn = 0;
    this.spawnInterval = 0;
    this.updateInterval = 0;
    this.wave = null;
  }
}
