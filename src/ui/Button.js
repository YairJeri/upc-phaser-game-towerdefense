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
    };

    this.style = { ...this.defaultStyle, ...style };

    if (this.center) {
      this.x -= this.width / 2;
      this.y -= this.height / 2;
    }

    this.createButton();
  }

  createButton() {
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
  }

  setInactive() {
    this.isActive = false;
    this.setButtonStyle(
      this.style.inactiveColor,
      this.style.inactiveBorderColor
    );
  }

  onHover() {
    if (!this.isActive) return;
    this.setButtonStyle(this.style.hoverColor, this.style.hoverBorderColor);
  }

  onOut() {
    if (!this.isActive) return;
    this.setButtonStyle(this.style.backgroundColor, this.style.borderColor);
  }
}
