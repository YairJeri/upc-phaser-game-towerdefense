import waves from "../other/Wave.js";

export default class WaveSystem {
  constructor(scene, enemySystem) {
    this.scene = scene;
    this.enemySystem = enemySystem;
    this.waves = waves;
    this.spawnPoints = [
      { x: this.scene.mapWidth / 2, y: this.scene.mapHeight - 64 },
      { x: this.scene.mapWidth / 2 + 32, y: this.scene.mapHeight - 64 },
    ];
    this.currentWaveIndex = 0;
    this.isWaveActive = false;
    this.spawnedEnemies = 0;
    this.timeSinceLastSpawn = 0;
    this.spawnInterval = 0;
    this.updateInterval = 0;

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
      this.scene.game.events.emit(
        "Remaining",
        this.wave.count -
          (this.spawnedEnemies - this.enemySystem.pool.getActiveCount())
      );
    }

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

    const availableSpawns = this.spawnPoints.slice(
      0,
      this.wave.spawnPointsToUse
    );
    const spawnPoint =
      availableSpawns[Phaser.Math.Between(0, availableSpawns.length - 1)];

    this.enemySystem.spawn(spawnPoint.x, spawnPoint.y, 1, 1);
  }
}
