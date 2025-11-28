export default class EconomySystem {
  constructor(scene, money = 500) {
    this.scene = scene;
    this.money = money;

    this.scene.game.events.on("MoneyGain", (amount) => {
      this.addMoney(amount);
    });
  }

  addMoney(amount) {
    this.money += amount;
    this.updateUI();
  }

  spendMoney(amount) {
    if (this.money >= amount) {
      this.money -= amount;
      this.updateUI();
      return true;
    }
    return false;
  }

  hasEnoughMoney(amount) {
    return this.money >= amount;
  }

  updateUI() {
    this.scene.game.events.emit("Money", this.money);
  }

  getMoney() {
    return this.money;
  }
}
