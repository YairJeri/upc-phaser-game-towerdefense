export default {
  player: {
    idle: {
      key: "player_idle",
      texture: "playerIdle",
      frameRate: 10,
      config: { frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] },
      repeat: -1,
    },
    run: {
      key: "player_run",
      texture: "playerRun",
      frameRate: 9,
      config: { frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] },
      repeat: -1,
    },
    attackCombo1: {
      key: "player_attack_1",
      texture: "playerAttackCombo",
      frameRate: 10,
      config: { frames: [0, 1, 2, 3, 4] },
    },
    attackCombo2: {
      key: "player_attack_2",
      texture: "playerAttackCombo",
      frameRate: 10,
      config: { frames: [5, 6, 7, 8, 9] },
    },
  },
  enemy: {
    attack: {
      key: "enemy_attack",
      texture: "enemy",
      frameRate: 10,
      config: { frames: [16, 17, 18, 19, 20, 21] },
    },
    run: {
      key: "enemy_run",
      texture: "enemy",
      frameRate: 10,
      config: { frames: [8, 9, 10, 11, 12, 13, 14, 15] },
      repeat: -1,
    },
    death: {
      key: "enemy_death",
      texture: "enemy",
      frameRate: 8,
      config: { frames: [40, 41, 42, 43, 43, 43, 43] },
    },
  },
  water: {
    flow: {
      key: "flow",
      texture: "water",
      frameRate: 6,
      repeat: -1,
    },
  },
};
