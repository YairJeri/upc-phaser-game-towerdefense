export default class UIContainer {
  constructor(
    scene,
    x,
    y,
    width,
    height,
    alpha = 0.8,
    padding = 10,
    center = false
  ) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.alpha = alpha;
    this.padding = padding;
    this.elements = [];
    this.offsetX = 0;
    this.offsetY = 0;

    this.center = center;

    if (this.center) {
      this.offsetX = -this.width / 2;
      this.offsetY = -this.height / 2;
    }

    this.container = this.scene.add.graphics().setDepth(-10);
    this.container.fillStyle(0x000000, this.alpha);
    this.container.fillRoundedRect(
      this.x - this.padding + this.offsetX,
      this.y - this.padding + this.offsetY,
      this.width + 2 * this.padding,
      this.height + 2 * this.padding,
      20
    );
    this.container.lineStyle(2, 0xffffff, 0.35);
    this.container.strokeRoundedRect(
      this.x - this.padding + this.offsetX,
      this.y - this.padding + this.offsetY,
      this.width + 2 * this.padding,
      this.height + 2 * this.padding,
      20
    );
  }

  addElement(element, x = 0, y = 0) {
    const paddedX = this.x + x + this.offsetX;
    const paddedY = this.y + y + this.offsetY;
    element.offsetX = x;
    element.offsetY = y;

    element.setPosition(paddedX, paddedY);

    this.elements.push(element);
    return element;
  }

  removeElement(element) {
    const index = this.elements.indexOf(element);
    if (index !== -1) {
      this.elements.splice(index, 1);
      element.destroy();
    }
  }

  showInmediately() {
    this.container.setAlpha(this.alpha);
    this.elements.forEach((el) => el.setAlpha(1));
  }

  hideInmediately() {
    this.container.setAlpha(0);
    this.elements.forEach((el) => el.setAlpha(0));
  }
  show(duration = 300) {
    this.scene.tweens.add({
      targets: this.container,
      alpha: this.alpha,
      duration: duration,
      ease: "Sine.easeOut",
    });

    this.scene.tweens.add({
      targets: this.elements,
      alpha: 1,
      duration: duration,
      ease: "Sine.easeOut",
    });
  }

  hide(duration = 300) {
    this.scene.tweens.add({
      targets: this.container,
      alpha: 0,
      duration: duration,
      ease: "Sine.easeIn",
    });

    this.scene.tweens.add({
      targets: this.elements,
      alpha: 0,
      duration: duration,
      ease: "Sine.easeIn",
    });
  }

  updatePosition(x, y) {
    this.x = x;
    this.y = y;
    this.container.setPosition(x, y);

    this.elements.forEach((el) => {
      const paddedX = x + el.offsetX + this.offsetX;
      const paddedY = y + el.offsetY + this.offsetY;
      el.setPosition(paddedX, paddedY);
    });
  }

  setPadding(padding) {
    this.padding = padding;

    this.container.clear();
    this.container.fillStyle(0x000000, this.alpha);
    this.container.fillRoundedRect(
      this.x - this.padding,
      this.y - this.padding,
      this.width + 2 * this.padding,
      this.height + 2 * this.padding,
      20
    );
    this.container.lineStyle(2, 0xffffff, 0.35);
    this.container.strokeRoundedRect(
      this.x - this.padding,
      this.y - this.padding,
      this.width + 2 * this.padding,
      this.height + 2 * this.padding,
      20
    );

    this.elements.forEach((el) => {
      const paddedX = this.x + this.padding + el.offsetX;
      const paddedY = this.y + this.padding + el.offsetY;
      el.setPosition(paddedX, paddedY);
    });
  }

  getDimensions() {
    return {
      width: this.width + 2 * this.padding,
      height: this.height + 2 * this.padding,
    };
  }
}
