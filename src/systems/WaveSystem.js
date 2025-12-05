import waves from "../data/Wave.js";

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
      { x: 30 * 32, y: 32, x2: 35 * 32, y2: 32 },
      { x: 3 * 32, y: 44 * 32, x2: 3 * 32, y2: 43 * 32 },
      { x: 5 * 32, y: 30 * 32, x2: 5 * 32, y2: 34 * 32 },
      { x: 32, y: 46 * 32, x2: 32, y2: 60 * 32 },
      { x: 32, y: 59 * 32, x2: 24 * 32, y2: 59 * 32 },
      { x: 32, y: 32, x2: 32, y2: 26 * 32 },
      { x: 32, y: 32, x2: 26 * 32, y2: 32 },
    ];
    this.currentWaveIndex = 0;
    this.isWaveActive = false;
    this.spawnedEnemies = 0;
    this.timeSinceLastSpawn = 0;
    this.spawnInterval = 0;
    this.updateInterval = 0;

    this.previousRemaining = 0;
    this.currentRemaining = 0;

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

    this.currentRemaining =
      this.wave.count -
      (this.spawnedEnemies - this.enemySystem.pool.getActiveCount());

    if (this.updateInterval >= 1) {
      this.updateInterval = 0;
    }

    if (this.currentRemaining !== this.previousRemaining) {
      this.scene.game.events.emit("Remaining", this.currentRemaining);
      this.previousRemaining = this.currentRemaining;
    }

    if (this.spawnedEnemies >= this.wave.count) {
      if (this.enemySystem.pool.getActiveCount() === 0) {
        this.isWaveActive = false;

        if (this.currentWaveIndex >= this.waves.length) {
          this.scene.game.events.emit("GameEnded", true);
        } else {
          this.scene.game.events.emit("MoneyGain", this.wave.money, false);
          this.scene.game.events.emit("WaveOver");
          this.scene.game.events.emit("Remaining", 0);
        }
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

    if (this.currentWaveIndex === 1) {
      const spawnPoint = this.tutorialSpawn(this.spawnedEnemies - 1);
      this.enemySystem.spawn(spawnPoint.x, spawnPoint.y, "orc", 1);
      return;
    }

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

      if (!this.buildSystem.wallManager.getSetWalls().has(ty * w + tx)) {
        break;
      }

      attempts++;
    } while (attempts < maxAttempts);

    let type = "orc";
    let level = 1;

    const wave = this.wave;

    const r = Math.random();

    if (this.currentWaveIndex >= 4 && r < wave.mageProbability) {
      type = "mage";
    } else if (r < wave.strongMageProbability) {
      type = "mage";
      level = Phaser.Math.Between(2, wave.maxStrongLevel); // strong mage
    } else if (r < wave.strongProbability + wave.strongMageProbability) {
      type = "orc";
      level = Phaser.Math.Between(2, wave.maxStrongLevel); // strong orc
    }

    this.enemySystem.spawn(spawnPoint.x, spawnPoint.y, type, level);
  }

  tutorialSpawn(spawnIndex) {
    const pointA = { x: 30 * 32, y: 58 * 32 };
    const pointB = { x: 58 * 32, y: 37 * 32 };

    const half = Math.floor(this.wave.count / 2);

    if (spawnIndex < half) {
      return pointA;
    }

    return pointB;
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
