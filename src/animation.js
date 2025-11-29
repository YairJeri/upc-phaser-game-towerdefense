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
  orc: {
    attack: {
      key: "orc_attack",
      texture: "orc",
      frameRate: 10,
      config: { frames: [16, 17, 18, 19, 20, 21] },
    },
    run: {
      key: "orc_run",
      texture: "orc",
      frameRate: 10,
      config: { frames: [8, 9, 10, 11, 12, 13, 14, 15] },
      repeat: -1,
    },
    death: {
      key: "orc_death",
      texture: "orc",
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
  mage: {
    attack: {
      key: "mage_attack",
      texture: "mage",
      frameRate: 10,
      config: { frames: [34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46] },
    },
    run: {
      key: "mage_run",
      texture: "mage",
      frameRate: 10,
      config: { frames: [17, 18, 19, 20, 21, 22, 23, 24] },
      repeat: -1,
    },
    death: {
      key: "mage_death",
      texture: "mage",
      frameRate: 4,
      config: { frames: [102, 103, 104, 105, 106, 107, 108, 109, 110, 111] },
    },
  },
};
