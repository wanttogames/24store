import Phaser from "phaser";
import { getCustomer } from "../data/customers";
import { getProduct } from "../data/products";
import { CustomerPortrait } from "../rendering/CustomerPortrait";
import { cameraAppearance } from "../systems/CCTVManager";
import { formatTime } from "../systems/TimeManager";
import type { Encounter, Inspection } from "../types";
export class StoreScene extends Phaser.Scene {
  private world!: Phaser.GameObjects.Container;
  private counter!: Phaser.GameObjects.Container;
  private basket!: Phaser.GameObjects.Container;
  private monitor!: Phaser.GameObjects.RenderTexture;
  private cameraHud!: Phaser.GameObjects.Container;
  private cameraText!: Phaser.GameObjects.Text;
  private cameraShadow!: Phaser.GameObjects.Graphics;
  private cameraEffects!: Phaser.GameObjects.Graphics;
  private portrait?: CustomerPortrait;
  private cameraPortrait?: CustomerPortrait;
  private encounter?: Encounter;
  private day = 1;
  private sanity = 100;
  private clock = 10;
  private lastFrame = 0;
  private pendingSnapshot = false;
  create() {
    this.encounter = undefined;
    this.pendingSnapshot = false;
    this.lastFrame = 0;
    this.drawStore();
    window.addEventListener("store:render", this.handle);
    window.addEventListener("store:cctv-request", this.snapshot);
    window.addEventListener("store:clock", this.clockUpdate);
    this.events.once("shutdown", () => {
      window.removeEventListener("store:render", this.handle);
      window.removeEventListener("store:cctv-request", this.snapshot);
      window.removeEventListener("store:clock", this.clockUpdate);
      this.portrait = undefined;
      this.cameraPortrait = undefined;
    });
  }
  private clockUpdate = (e: Event) => {
    this.clock = (e as CustomEvent<number>).detail;
  };
  private handle = (event: Event) => {
    const d = (event as CustomEvent).detail as {
      encounter?: Encounter;
      sanity: number;
      day?: number;
      minute?: number;
    };
    this.showCustomer(d.encounter, d.sanity, d.day || 1);
    if (d.minute !== undefined && d.minute >= 0) this.clock = d.minute;
  };
  private snapshot = (event: Event) => {
    if (this.pendingSnapshot || !this.monitor) return;
    this.pendingSnapshot = true;
    this.drawCamera(!!(event as CustomEvent).detail?.replay);
    this.monitor.snapshot((image) => {
      this.pendingSnapshot = false;
      if (image instanceof HTMLImageElement)
        window.dispatchEvent(
          new CustomEvent("store:cctv-image", { detail: image.src }),
        );
    });
  };
  private text(
    parent: Phaser.GameObjects.Container,
    x: number,
    y: number,
    s: string,
    size = 18,
    color = "#b5bda4",
  ) {
    const t = this.add.text(x, y, s, {
      fontFamily: "Arial, sans-serif",
      fontSize: size,
      color,
    });
    parent.add(t);
    return t;
  }
  private inspect(x: number, y: number, w: number, h: number, id: Inspection) {
    this.add
      .zone(x, y, w, h)
      .setDepth(15)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () =>
        window.dispatchEvent(new CustomEvent("store:inspect", { detail: id })),
      );
  }
  private drawStore() {
    this.cameras.main.setBackgroundColor("#111d17");
    this.world = this.add.container(0, 0);
    const g = this.add.graphics();
    this.world.add(g);
    const rect = (
      x: number,
      y: number,
      w: number,
      h: number,
      color: number,
      alpha = 1,
    ) => {
      g.fillStyle(color, alpha);
      g.fillRect(x, y, w, h);
    };
    rect(0, 0, 1280, 650, 0x354638);
    rect(0, 0, 1280, 107, 0x1d2b23);
    rect(0, 107, 1280, 347, 0x52614b);
    g.lineStyle(1, 0x9ba28b, 0.15);
    for (let x = 0; x < 1280; x += 76) g.lineBetween(x, 109, x, 450);
    for (let y = 109; y < 450; y += 58) g.lineBetween(0, y, 1280, y);
    rect(0, 0, 1280, 45, 0x14231a);
    rect(0, 45, 1280, 8, 0x708068);
    this.text(this.world, 500, 13, "24 / NIGHT STORE", 21, "#c2cba7");
    for (const x of [65, 482, 906]) {
      for (let i = 4; i > 0; i--) {
        rect(
          x - 16 * i,
          55 - i * 3,
          320 + 32 * i,
          36 + 10 * i,
          0xdae4ba,
          0.018,
        );
      }
      rect(x, 66, 320, 17, 0x273d2d);
      rect(x + 8, 71, 304, 7, 0xe0e5bc);
      rect(x + 2, 87, 315, 3, 0x0b1811, 0.5);
    }
    // Shelving with cartons, tins, price tags, and small packaging variation.
    rect(43, 136, 871, 313, 0x253a2b);
    rect(49, 142, 860, 305, 0x324936);
    const colors = [0xc6ab80, 0x7d9e8c, 0x93775e, 0xb0ad7d, 0xb0c0a7, 0x8b6860];
    for (let row = 0; row < 3; row++) {
      rect(58, 153 + row * 93, 837, 72, 0x1a3022);
      for (let i = 0; i < 23; i++) {
        const x = 66 + i * 36,
          y = 166 + row * 93,
          h = 41 + (i % 3) * 6;
        rect(x, y, 24, h, colors[(i + row * 2) % colors.length]);
        rect(x + 3, y + 11, 18, 17, 0xe2debe, 0.8);
        rect(x + 4, y + 12, 15, 2, 0x53684c, 0.7);
        rect(x, y + h - 5, 24, 5, 0x172c21, 0.28);
        if (row === 1) rect(x + 3, y - 4, 18, 5, 0xaaa98c);
      }
      rect(48, 225 + row * 93, 862, 10, 0x667759);
      rect(48, 235 + row * 93, 862, 6, 0x182b1e);
      for (let i = 0; i < 11; i++) {
        rect(66 + i * 76, 226 + row * 93, 34, 7, 0xc6c9af);
        rect(70 + i * 76, 228 + row * 93, 20, 2, 0x667958);
      }
    }
    // Rainy street, wet pavement and a reflected door frame.
    rect(932, 114, 297, 342, 0x112019);
    rect(944, 124, 273, 328, 0x687760);
    rect(951, 131, 257, 314, 0x0e1d19);
    rect(952, 320, 255, 124, 0x182d25);
    rect(953, 354, 253, 6, 0x839879, 0.25);
    rect(1129, 175, 3, 190, 0x547360);
    g.fillStyle(0xb9c39a, 0.17);
    g.fillEllipse(1130, 192, 93, 41);
    rect(1115, 183, 31, 5, 0xd0c6a2, 0.8);
    g.lineStyle(2, 0xadc3aa, 0.1);
    for (let i = 0; i < 18; i++)
      g.lineBetween(
        957 + ((i * 47) % 246),
        365 + i * 4,
        1000 + ((i * 47) % 195),
        365 + i * 4,
      );
    rect(1074, 131, 7, 314, 0x7f8a73);
    rect(1086, 267, 7, 52, 0xb4b79a);
    rect(958, 136, 7, 304, 0x8ea089, 0.12);
    g.fillStyle(0xd6debd, 0.035);
    g.fillTriangle(964, 137, 1025, 137, 1159, 443);
    g.fillTriangle(1025, 137, 1201, 443, 1159, 443);
    this.text(this.world, 978, 156, "OPEN 24 HOURS", 17, "#c3c7a3");
    this.text(this.world, 972, 386, "RAIN / 18°C", 13, "#8aa38e");
    for (let i = 0; i < 35; i++) {
      const rain = this.add.rectangle(
        956 + ((i * 43) % 247),
        150 + ((i * 59) % 242),
        1,
        i % 3 === 0 ? 21 : 11,
        0xb0c9b4,
        0.19,
      );
      this.world.add(rain);
      this.tweens.add({
        targets: rain,
        y: rain.y + 95,
        duration: 1000 + (i % 7) * 180,
        repeat: -1,
      });
    }
    // Recessed fridge detail and a worn notice pinned by the entrance.
    rect(841, 150, 72, 287, 0x152c20, 0.45);
    g.lineStyle(2, 0x82977b, 0.35);
    g.strokeRect(846, 156, 61, 270);
    rect(851, 176, 3, 207, 0xacc5a4, 0.16);
    rect(888, 111, 38, 49, 0xd4cfaa);
    rect(900, 108, 7, 7, 0x917e56);
    this.text(this.world, 892, 118, "SHIFT\n00–06", 8, "#4b5c42");
    this.counter = this.add.container(0, 0).setDepth(6);
    const surface = this.add.graphics();
    this.counter.add(surface);
    surface.fillStyle(0x20382a);
    surface.fillRect(0, 471, 1280, 48);
    surface.fillStyle(0x8d9171);
    surface.fillRect(0, 505, 1280, 88);
    surface.fillStyle(0xb6b998);
    surface.fillRect(0, 506, 1280, 6);
    surface.fillStyle(0x475f43);
    surface.fillRect(0, 593, 1280, 57);
    surface.fillStyle(0x20382b);
    surface.fillRect(0, 599, 1280, 51);
    surface.lineStyle(1, 0xd6d6b3, 0.14);
    for (let i = 0; i < 30; i++) {
      const x = (i * 113) % 1250;
      surface.lineBetween(
        x,
        527 + ((i * 17) % 55),
        x + 25,
        529 + ((i * 17) % 55),
      );
    }
    surface.fillStyle(0x5b7251, 0.3);
    surface.fillRoundedRect(520, 515, 345, 69, 9);
    surface.lineStyle(1, 0xb0bc91, 0.3);
    surface.strokeRoundedRect(520, 515, 345, 69, 9);
    surface.fillStyle(0x20382d);
    surface.fillRoundedRect(371, 502, 94, 65, 7);
    surface.fillStyle(0x7e9e75);
    surface.fillRect(381, 510, 74, 35);
    this.text(this.counter, 391, 515, "POS", 17, "#203c28");
    surface.fillStyle(0x111f18);
    surface.fillRoundedRect(438, 567, 64, 10, 3);
    surface.fillStyle(0x23362a);
    surface.fillRect(1008, 501, 220, 82);
    this.text(this.counter, 1022, 522, "THANK YOU", 17, "#a7b38d");
    this.text(this.counter, 1022, 550, "24 NIGHT / 0317", 13, "#7e9b7c");
    // Receipt roll, loose coins, taped note and bag dispenser.
    surface.fillStyle(0xc6cbb0);
    surface.fillRoundedRect(884, 519, 54, 29, 7);
    surface.fillStyle(0xe0dfbd);
    surface.fillRect(893, 540, 31, 36);
    surface.lineStyle(1, 0x859577);
    for (let i = 0; i < 5; i++)
      surface.lineBetween(899, 547 + i * 4, 918, 547 + i * 4);
    surface.fillStyle(0xb0ab80);
    surface.fillCircle(956, 563, 7);
    surface.fillCircle(975, 555, 5);
    surface.fillStyle(0xbebea0);
    surface.fillRect(980, 497, 18, 47);
    this.basket = this.add.container(0, 0).setDepth(7);
    const monitorFrame = this.add.graphics().setDepth(8);
    monitorFrame.fillStyle(0x0a1710);
    monitorFrame.fillRoundedRect(23, 336, 337, 245, 9);
    monitorFrame.fillStyle(0x768368);
    monitorFrame.fillRect(36, 350, 310, 176);
    monitorFrame.fillStyle(0x162a1c);
    monitorFrame.fillRect(44, 358, 294, 160);
    monitorFrame.fillStyle(0x314b35);
    monitorFrame.fillRect(124, 581, 130, 11);
    monitorFrame.fillStyle(0xa4b687);
    monitorFrame.fillCircle(330, 552, 3);
    this.monitor = this.add
      .renderTexture(44, 358, 1280, 650)
      .setOrigin(0)
      .setDisplaySize(294, 160)
      .setDepth(9)
      .setTint(0xaac3a1);
    this.add
      .text(44, 546, "CAM 01 / COUNTER", {
        fontFamily: "monospace",
        fontSize: 12,
        color: "#91ab82",
      })
      .setDepth(10);
    this.cameraShadow = this.add.graphics().setVisible(false);
    this.cameraHud = this.add.container(0, 0).setVisible(false);
    this.cameraEffects = this.add.graphics();
    this.cameraHud.add(this.cameraEffects);
    this.cameraText = this.text(
      this.cameraHud,
      27,
      22,
      "CAM 01",
      26,
      "#d2e1c1",
    );
    const ambience = this.add.graphics().setDepth(11);
    ambience.fillStyle(0x05170d, 0.19);
    ambience.fillRect(0, 0, 1280, 32);
    ambience.fillRect(0, 0, 22, 650);
    ambience.fillRect(1258, 0, 22, 650);
    ambience.fillStyle(0xd2dbaf, 0.028);
    ambience.fillEllipse(673, 310, 690, 565);
    this.inspect(677, 310, 300, 320, "customer");
    this.inspect(693, 549, 355, 83, "product");
    this.inspect(190, 455, 339, 249, "cctv");
    this.drawCamera();
  }
  private drawBasket(e?: Encounter) {
    this.basket.removeAll(true);
    if (!e) return;
    const g = this.add.graphics();
    this.basket.add(g);
    e.products.forEach((id, i) => {
      const p = getProduct(id),
        x = 557 + i * 94;
      g.fillStyle(0x142b1e, 0.22);
      g.fillEllipse(x + 30, 579, 78, 14);
      g.fillStyle(p.color);
      if (id === "water" || id === "tea") {
        g.fillRoundedRect(x + 10, 521, 38, 60, 7);
        g.fillStyle(0xc0c9b0);
        g.fillRect(x + 16, 514, 26, 8);
        g.fillStyle(0xe0e5c9, 0.33);
        g.fillRect(x + 15, 526, 4, 48);
      } else if (id === "rice") {
        g.fillTriangle(x, 577, x + 60, 577, x + 30, 524);
      } else if (id === "coffee" || id === "beer") {
        g.fillRoundedRect(x + 7, 524, 45, 54, 5);
        g.fillStyle(0xb7bba5);
        g.fillEllipse(x + 29, 524, 44, 8);
      } else {
        g.fillRoundedRect(x, 526, 64, 53, 4);
      }
      g.fillStyle(0xe1ddbf);
      g.fillRect(x + 13, 548, 34, 18);
      g.fillStyle(0x50664b);
      for (let n = 0; n < 7; n++) g.fillRect(x + 17 + n * 3, 558, 1, 5);
      this.text(
        this.basket,
        x + 16,
        548,
        id === "oldmilk"
          ? "1998"
          : id === "water"
            ? "WATER"
            : id.toUpperCase().slice(0, 5),
        7,
        "#425b45",
      );
    });
  }
  showCustomer(e?: Encounter, sanity = 100, day = 1) {
    const unchanged =
      this.encounter?.id === e?.id &&
      this.day === day &&
      this.encounter?.minute === e?.minute;
    this.sanity = sanity;
    if (unchanged) {
      this.drawCamera();
      return;
    }
    this.portrait?.destroy();
    this.cameraPortrait?.destroy();
    this.portrait = undefined;
    this.cameraPortrait = undefined;
    this.encounter = e;
    this.day = day;
    this.clock = e?.minute || 0;
    if (e) {
      const c = getCustomer(e.customer),
        appearance = cameraAppearance(e, day, sanity);
      if (!e.ghost) {
        this.portrait = new CustomerPortrait(
          this,
          c,
          false,
          e.kind === "anomaly",
        );
        this.portrait.root.setDepth(5).setAlpha(0);
        this.tweens.add({
          targets: this.portrait.root,
          alpha: 1,
          duration: 480,
        });
      }
      if (appearance.visible) {
        this.cameraPortrait = new CustomerPortrait(
          this,
          c,
          appearance.faceless,
          appearance.frozen,
          appearance.uniform,
        );
        this.cameraPortrait.root.setVisible(false);
      }
    }
    this.drawBasket(e);
    this.drawCamera();
  }
  private drawCamera(replay = false) {
    if (!this.monitor) return;
    const a = cameraAppearance(this.encounter, this.day, this.sanity, replay);
    this.monitor.clear();
    this.monitor.draw(this.world);
    const shadow = this.cameraShadow;
    shadow.clear();
    if (a.shadow) {
      shadow.fillStyle(0x020b06, 0.87);
      shadow.fillEllipse(778, 223, 74, 114);
      shadow.fillRoundedRect(733, 267, 92, 206, 24);
      shadow.fillStyle(0x739075, 0.18);
      shadow.fillCircle(765, 222, 3);
      shadow.fillCircle(790, 222, 3);
    }
    shadow.setVisible(true);
    this.monitor.draw(shadow);
    shadow.setVisible(false);
    if (this.cameraPortrait) {
      this.cameraPortrait.root.setVisible(true);
      this.monitor.draw(this.cameraPortrait.root);
      this.cameraPortrait.root.setVisible(false);
    }
    this.monitor.draw(this.counter);
    this.monitor.draw(this.basket);
    const g = this.cameraEffects;
    g.clear();
    if (a.label) {
      g.fillStyle(0x193423, 0.9);
      g.fillRect(527, 576, 327, 41);
    }
    g.fillStyle(0x0b2a12, 0.13);
    g.fillRect(0, 0, 1280, 650);
    g.lineStyle(1, 0xb4d0a1, 0.12);
    for (let y = 0; y < 650; y += 6) g.lineBetween(0, y, 1280, y);
    if (a.noise) {
      g.fillStyle(0xabc8a0, 0.25);
      for (let i = 0; i < 120; i++)
        g.fillRect((i * 67 + this.time.now) % 1280, (i * 47) % 650, 22, 2);
      g.fillStyle(0x071c0e, 0.7);
      g.fillRect(0, 200, 1280, 86);
    }
    g.fillStyle(0x091a0f, 0.9);
    g.fillRect(0, 0, 1280, a.brand ? 88 : 58);
    this.cameraText.setText(
      `REC ●  CAM 01                         ${a.date}  ${formatTime(this.clock)}${a.brand ? "\n" + a.brand : ""}`,
    );
    let label = this.cameraHud.getByName(
      "evidence-label",
    ) as Phaser.GameObjects.Text | null;
    if (a.label) {
      if (!label)
        label = this.text(
          this.cameraHud,
          544,
          583,
          a.label,
          24,
          "#d7e3c7",
        ).setName("evidence-label");
      else label.setText(a.label);
      label.setVisible(true);
    } else label?.setVisible(false);
    this.cameraHud.setVisible(true);
    this.monitor.draw(this.cameraHud);
    this.cameraHud.setVisible(false);
  }
  update(time: number) {
    this.portrait?.update(time);
    this.cameraPortrait?.update(time);
    if (time - this.lastFrame > 300 && !this.pendingSnapshot) {
      this.lastFrame = time;
      this.drawCamera();
    }
  }
}
