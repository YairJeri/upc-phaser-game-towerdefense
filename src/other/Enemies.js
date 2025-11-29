export default {
  orc: {
    health: 100,
    speed: 40,
    attackRange: 32,
    scale: 1,
    sprite: "orc",
    anim: {
      run: "orc_run",
      attack: "orc_attack",
      death: "orc_death",
    },
  },

  mage: {
    health: 400,
    speed: 30,
    attackRange: 32 * 4,
    wallAttackRange: 32 * 2,
    scale: 0.75,
    sprite: "mage",
    anim: {
      run: "mage_run",
      attack: "mage_attack",
      death: "mage_death",
    },
  },
};
