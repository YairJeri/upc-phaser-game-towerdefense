export default class UIButton {
  constructor(
    scene,
    x,
    y,
    width,
    height,
    label,
    onClick,
    style = {},
    center = false
  ) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.label = label;
    this.onClick = onClick;
    this.isActive = true;
    this.center = center;

    this.defaultStyle = {
      backgroundColor: 0x222222,
      borderColor: 0xff5733,
      hoverColor: 0x333333,
      hoverBorderColor: 0xff6f4d,
      inactiveColor: 0x111111,
      inactiveBorderColor: 0x555555,
      textColor: 0xffffff,
      fontSize: 20,
      fontKey: "minogram",
      shadowColor: 0x000000,
      shadowAlpha: 0.35,
      shadowOffsetX: 4,
      shadowOffsetY: 4,
    };

    this.style = { ...this.defaultStyle, ...style };

    if (this.center) {
      this.x -= this.width / 2;
      this.y -= this.height / 2;
    }

    this.createButton();
  }

  createButton() {
    // Optional shadow behind button
    this.shadow = this.scene.add.graphics().setDepth(9000);
    this.setShadowStyle();

    this.bg = this.scene.add.graphics().setDepth(9001);
    this.setButtonStyle(this.style.backgroundColor, this.style.borderColor);

    this.buttonText = this.scene.add
      .bitmapText(
        this.x + this.width / 2,
        this.y + this.height / 2,
        this.style.fontKey,
        this.label,
        this.style.fontSize
      )
      .setOrigin(0.5)
      .setDepth(9001);

    this.bg.setInteractive(
      new Phaser.Geom.Rectangle(this.x, this.y, this.width, this.height),
      Phaser.Geom.Rectangle.Contains
    );

    this.bg.on("pointerover", this.onHover.bind(this));
    this.bg.on("pointerout", this.onOut.bind(this));
    this.bg.on("pointerdown", () => {
      if (!this.isActive) return;
      this.onClick();
    });
  }

  setShadowStyle() {
    this.shadow.clear();
    if (this.style.shadowAlpha > 0) {
      this.shadow.fillStyle(this.style.shadowColor, this.style.shadowAlpha);
      this.shadow.fillRoundedRect(
        this.x + this.style.shadowOffsetX,
        this.y + this.style.shadowOffsetY,
        this.width,
        this.height,
        12
      );
    }
  }

  setButtonStyle(bgColor, borderColor) {
    this.bg.clear();
    this.bg.fillStyle(bgColor, 0.85);
    this.bg.fillRoundedRect(this.x, this.y, this.width, this.height, 12);
    this.bg.lineStyle(3, borderColor);
    this.bg.strokeRoundedRect(this.x, this.y, this.width, this.height, 12);
  }

  setActive() {
    this.isActive = true;
    this.setButtonStyle(this.style.backgroundColor, this.style.borderColor);
    this.setShadowStyle();
  }

  setInactive() {
    this.isActive = false;
    this.setButtonStyle(
      this.style.inactiveColor,
      this.style.inactiveBorderColor
    );
    this.setShadowStyle();
  }

  onHover() {
    if (!this.isActive) return;
    this.setButtonStyle(this.style.hoverColor, this.style.hoverBorderColor);
    this.setShadowStyle();
  }

  onOut() {
    if (!this.isActive) return;
    this.setButtonStyle(this.style.backgroundColor, this.style.borderColor);
    this.setShadowStyle();
  }
}
