import Phaser from "phaser";
import type { Customer } from "../types";
/** Shared illustration for the counter and CCTV; only evidence overlays differ. */
export class CustomerPortrait {
  readonly root: Phaser.GameObjects.Container;
  private head: Phaser.GameObjects.Container;
  private eyes: Phaser.GameObjects.Graphics;
  constructor(
    scene: Phaser.Scene,
    c: Customer,
    private faceless = false,
    private frozen = false,
    uniform = false,
  ) {
    this.root = scene.add.container(680, 488);
    const body = scene.add.graphics();
    this.root.add(body);
    const coat = uniform ? 0x728d80 : c.color;
    body.fillStyle(0x08120e, 0.28);
    body.fillEllipse(0, 0, 300, 35);
    body.fillStyle(coat);
    body.fillRoundedRect(-110, -183, 220, 184, {
      tl: 42,
      tr: 42,
      bl: 8,
      br: 8,
    });
    body.fillStyle(0x0d2218, 0.17);
    body.fillTriangle(-105, -160, -74, 0, -111, 0);
    body.fillTriangle(105, -160, 74, 0, 111, 0);
    body.lineStyle(2, 0xc0c5a7, 0.14);
    body.lineBetween(-86, -151, -86, -27);
    body.lineBetween(85, -151, 85, -27);
    body.fillStyle(c.skin);
    body.fillRect(-20, -211, 40, 39);
    body.fillStyle(0x121f18, 0.4);
    body.fillTriangle(-33, -184, 0, -136, -54, -178);
    body.fillTriangle(33, -184, 0, -136, 54, -178);
    body.fillStyle(0x161f1c, 0.55);
    body.fillRoundedRect(-82, -57, 27, 35, 4);
    body.fillRoundedRect(55, -57, 27, 35, 4);
    body.fillStyle(c.skin);
    body.fillRoundedRect(-93, -22, 67, 24, 12);
    body.fillRoundedRect(28, -22, 67, 24, 12);
    body.lineStyle(1, 0x8d7865, 0.65);
    for (let i = 0; i < 3; i++) {
      body.lineBetween(-78 + i * 10, -10, -78 + i * 10, -1);
      body.lineBetween(45 + i * 10, -10, 45 + i * 10, -1);
    }
    this.head = scene.add.container(0, -244);
    this.root.add(this.head);
    const face = scene.add.graphics();
    this.head.add(face);
    face.fillStyle(c.skin);
    face.fillEllipse(-50, 8, 16, 27);
    face.fillEllipse(50, 8, 16, 27);
    face.fillRoundedRect(-49, -58, 98, 131, { tl: 42, tr: 42, bl: 38, br: 38 });
    face.fillStyle(0x5d5245, 0.13);
    face.fillEllipse(27, 28, 27, 56);
    face.fillStyle(0xe7ccb1, 0.18);
    face.fillEllipse(-22, -12, 28, 68);
    face.fillStyle(c.hair);
    face.fillEllipse(0, -54, 111, 58);
    face.fillRect(-54, -51, 12, 65);
    face.fillRect(42, -51, 12, 65);
    face.fillTriangle(-47, -55, -25, -5, -5, -57);
    face.fillTriangle(-5, -58, 39, -27, 43, -55);
    if (c.id === "woman") {
      face.fillRoundedRect(-57, -40, 16, 140, 8);
      face.fillRoundedRect(41, -40, 17, 140, 8);
      face.fillStyle(c.hair);
      face.fillTriangle(-50, -61, -22, -9, 5, -62);
    }
    if (c.id === "elder") {
      face.fillStyle(0xc5c5b3);
      face.fillEllipse(0, -54, 107, 42);
      face.lineStyle(1, 0x887963, 0.65);
      for (const x of [-31, 14]) {
        face.lineBetween(x, 25, x + 18, 25);
        face.lineBetween(x, 29, x + 18, 29);
      }
      face.lineBetween(-18, -17, 17, -17);
    }
    if (!faceless) {
      face.lineStyle(2, 0x6e6654, 0.8);
      face.lineBetween(-34, -1, -14, -4);
      face.lineBetween(15, -4, 34, -1);
      face.lineStyle(1, 0x957e68);
      face.lineBetween(2, 15, -2, 29);
      face.lineBetween(-2, 29, 7, 30);
      face.lineStyle(2, 0x806c5b);
      face.lineBetween(-11, 48, 12, 48);
      face.fillStyle(0xba907c, 0.3);
      face.fillEllipse(-27, 28, 20, 7);
      face.fillEllipse(27, 28, 20, 7);
    }
    this.eyes = scene.add.graphics().setPosition(0, 11);
    this.head.add(this.eyes);
    if (!faceless) {
      this.eyes.fillStyle(0x283a31);
      this.eyes.fillEllipse(-23, 0, 10, 5);
      this.eyes.fillEllipse(23, 0, 10, 5);
      this.eyes.fillStyle(0xd9dfcb, 0.75);
      this.eyes.fillCircle(-21, -1, 1);
      this.eyes.fillCircle(25, -1, 1);
    }
    const details = scene.add.graphics();
    this.root.add(details);
    const badge = (x: number, y: number) => {
      details.fillStyle(0xbac6b0);
      details.fillRoundedRect(x, y, 29, 38, 2);
      details.fillStyle(0x6a826e);
      details.fillRect(x + 4, y + 5, 10, 12);
      details.lineStyle(1, 0x6f806b);
      details.lineBetween(x + 4, y + 23, x + 24, y + 23);
    };
    switch (c.id) {
      case "worker":
        details.fillStyle(0xa9bca3);
        details.fillTriangle(-13, -179, 13, -179, 0, -152);
        details.fillStyle(0x253c34);
        details.fillTriangle(0, -166, -9, -80, 10, -80);
        badge(45, -150);
        break;
      case "student":
        details.lineStyle(15, coat);
        details.strokeEllipse(0, -242, 131, 159);
        details.lineStyle(2, 0xc2c5ad);
        details.lineBetween(-24, -173, -29, -121);
        details.lineBetween(24, -173, 29, -121);
        break;
      case "courier":
        details.fillStyle(0x9e865a);
        details.fillRect(-85, -154, 170, 27);
        details.fillStyle(0xc6bc91);
        details.fillRect(-65, -147, 47, 9);
        badge(37, -114);
        details.fillStyle(0x535e4d);
        details.fillRoundedRect(-94, -20, 67, 23, 10);
        break;
      case "drunk":
        details.lineStyle(2, 0x6b7563);
        details.lineBetween(-135, -152, -135, 1);
        details.strokeCircle(-125, -153, 10);
        details.fillStyle(0xa57765, 0.35);
        details.fillEllipse(-27, -216, 23, 13);
        details.fillEllipse(27, -216, 23, 13);
        break;
      case "couple":
        details.fillStyle(0x9a8678);
        details.fillRoundedRect(-39, -191, 78, 28, 7);
        details.fillRect(14, -169, 18, 69);
        details.fillStyle(0xbaaa91);
        details.fillCircle(-55, -7, 3);
        break;
      case "elder":
        details.lineStyle(4, 0x776b4f);
        details.lineBetween(120, -115, 120, 12);
        details.strokeCircle(110, -115, 10);
        details.lineStyle(2, 0xaaa590);
        details.strokeEllipse(-23, -231, 33, 25);
        details.strokeEllipse(23, -231, 33, 25);
        details.lineBetween(-7, -231, 7, -231);
        break;
      case "nurse":
        details.lineStyle(2, 0xadc1b2);
        details.lineBetween(-23, -171, 0, -131);
        details.lineBetween(23, -171, 0, -131);
        badge(-14, -131);
        details.fillStyle(0xbbcac0);
        details.fillRect(52, -141, 4, 19);
        break;
      case "rider":
        details.fillStyle(0x31453c);
        details.fillEllipse(0, -291, 137, 70);
        details.lineStyle(8, 0x31453c);
        details.strokeEllipse(0, -250, 130, 135);
        details.fillStyle(0x85a99a, 0.24);
        details.fillRoundedRect(-52, -266, 104, 40, 8);
        details.fillStyle(0xc4d09a);
        details.fillRect(-95, -129, 190, 8);
        details.lineStyle(2, 0x142f24);
        details.lineBetween(0, -175, 0, -25);
        break;
      case "woman":
        details.fillStyle(0x3b4e44);
        details.fillTriangle(-28, -182, 0, -56, -71, -175);
        details.fillTriangle(28, -182, 0, -56, 71, -175);
        details.fillStyle(0x28382e);
        for (let y = -100; y < -26; y += 27) details.fillCircle(7, y, 3);
        details.fillStyle(0x759082, 0.2);
        details.fillEllipse(-82, -55, 27, 62);
        break;
    }
    if (uniform) badge(38, -143);
  }
  update(time: number) {
    if (this.frozen) return;
    this.root.scaleY = 1 + Math.sin(time / 1550) * 0.004;
    this.head.angle = Math.sin(time / 3100) * 0.6;
    const phase = time % 4700;
    this.eyes.scaleY = phase > 4490 && phase < 4620 ? 0.12 : 1;
  }
  destroy() {
    this.root.destroy(true);
  }
}
