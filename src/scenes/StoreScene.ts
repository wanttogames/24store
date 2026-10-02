import Phaser from "phaser";
import { getCustomer } from "../data/customers";
import { getProduct } from "../data/products";
import type { Encounter, Inspection } from "../types";
export class StoreScene extends Phaser.Scene {
  private actor?: Phaser.GameObjects.Container;
  private ambience?: Phaser.GameObjects.Rectangle;
  create() {
    this.drawStore();
    window.addEventListener("store:render", this.handle);
    this.events.once("shutdown", () =>
      window.removeEventListener("store:render", this.handle),
    );
    this.time.addEvent({
      delay: 4000,
      loop: true,
      callback: () => {
        if (this.ambience)
          this.tweens.add({
            targets: this.ambience,
            alpha: { from: 0.025, to: 0.08 },
            duration: 100,
            yoyo: true,
            repeat: 1,
          });
      },
    });
  }
  private handle = (event: Event) => {
    const e = (event as CustomEvent).detail as {
      encounter?: Encounter;
      sanity: number;
    };
    this.showCustomer(e.encounter, e.sanity);
  };
  private text(x: number, y: number, s: string, size = 18, color = "#abbba5") {
    return this.add.text(x, y, s, {
      fontFamily: "monospace",
      fontSize: size,
      color,
    });
  }
  private rect(x: number, y: number, w: number, h: number, c: number) {
    return this.add.rectangle(x, y, w, h, c).setOrigin(0);
  }
  private inspect(x: number, y: number, w: number, h: number, id: Inspection) {
    this.add
      .zone(x, y, w, h)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () =>
        window.dispatchEvent(new CustomEvent("store:inspect", { detail: id })),
      );
  }
  private drawStore() {
    this.cameras.main.setBackgroundColor("#141e19");
    this.rect(0, 0, 1280, 650, 0x29362c);
    this.rect(0, 105, 1280, 360, 0x485343);
    const g = this.add.graphics();
    g.lineStyle(1, 0x8d957c, 0.13);
    for (let x = 0; x < 1280; x += 80) g.lineBetween(x, 106, x, 465);
    for (let y = 105; y < 465; y += 60) g.lineBetween(0, y, 1280, y);
    this.rect(0, 0, 1280, 52, 0x1a251f);
    this.text(490, 14, "24 / NIGHT STORE", 23, "#b9c49c");
    this.rect(60, 73, 300, 6, 0xd0d9b7);
    this.rect(490, 73, 300, 6, 0xd0d9b7);
    this.rect(920, 73, 300, 6, 0xd0d9b7);
    this.rect(80, 143, 820, 306, 0x263a2e);
    for (let shelf = 0; shelf < 3; shelf++) {
      for (let i = 0; i < 21; i++) {
        const colors = [0x9a7057, 0x8e9570, 0x688a7d, 0xc0b38e];
        this.rect(
          98 + i * 37,
          164 + shelf * 88,
          22,
          49,
          colors[(i + shelf) % 4],
        );
        this.rect(100 + i * 37, 183 + shelf * 88, 18, 10, 0xb8b5a0);
      }
      this.rect(80, 216 + shelf * 88, 820, 9, 0x1f3027);
    }
    this.rect(930, 114, 300, 357, 0x162520);
    this.rect(944, 128, 271, 330, 0x34463e);
    this.rect(951, 135, 256, 310, 0x0f1c19);
    for (let i = 0; i < 6; i++) {
      this.rect(957, 178 + i * 44, 246, 2, 0x496051);
      this.rect(972 + i * 38, 139, 2, 296, 0x263d31);
    }
    this.rect(1069, 135, 6, 310, 0x819080);
    this.rect(1086, 267, 6, 51, 0x99a28d);
    this.text(982, 151, "OPEN 24 HOURS", 16, "#9da58e");
    this.text(993, 392, "雨 / 18°C", 17, "#748875");
    for (let i = 0; i < 28; i++) {
      const rain = this.add.rectangle(
        955 + Math.random() * 247,
        190 + Math.random() * 170,
        1,
        14,
        0xb0c2b4,
        0.17,
      );
      this.tweens.add({
        targets: rain,
        y: rain.y + 110,
        duration: 900 + Math.random() * 1000,
        repeat: -1,
      });
    }
    this.rect(0, 446, 1280, 55, 0x25332b);
    this.rect(0, 501, 1280, 149, 0x777a60);
    this.rect(0, 507, 1280, 8, 0xa9a88a);
    this.rect(0, 593, 1280, 57, 0x28392f);
    this.rect(29, 336, 327, 237, 0x151e19);
    this.rect(43, 350, 299, 180, 0x50644d);
    this.rect(50, 357, 285, 166, 0x172d21);
    const camera = this.add.graphics();
    camera.lineStyle(1, 0x74976d, 0.25);
    for (let y = 358; y < 522; y += 5) camera.lineBetween(50, y, 335, y);
    this.text(64, 368, "CAM 01 • LIVE", 16, "#a3b895");
    this.text(64, 495, "REC ●  /  COUNTER", 14, "#98af89");
    this.rect(78, 430, 225, 44, 0x496047);
    this.rect(180, 406, 31, 28, 0x819577);
    this.rect(363, 518, 90, 52, 0x253830);
    this.text(374, 533, "POS", 19, "#a8c193");
    this.rect(970, 501, 257, 82, 0x1a2b22);
    this.text(985, 521, "ご来店ありがとうございます", 14, "#98a887");
    this.text(986, 549, "24 NIGHT · 0317", 16, "#a3b299");
    this.actor = this.add.container(0, 0).setDepth(5);
    this.ambience = this.add
      .rectangle(640, 325, 1280, 650, 0xdce0bb, 0.025)
      .setDepth(8);
    const vignette = this.add.graphics().setDepth(9);
    vignette.fillStyle(0x06130c, 0.22);
    vignette.fillRect(0, 0, 1280, 65);
    vignette.fillRect(0, 0, 25, 650);
    vignette.fillRect(1255, 0, 25, 650);
    this.inspect(660, 310, 360, 340, "customer");
    this.inspect(690, 549, 360, 83, "product");
    this.inspect(188, 441, 329, 240, "cctv");
  }
  showCustomer(e?: Encounter, sanity = 100) {
    if (!this.actor) return;
    this.actor.removeAll(true);
    if (!e) return;
    const c = getCustomer(e.customer);
    const g = this.add.graphics();
    this.actor.add(g);
    if (!e.ghost) {
      g.fillStyle(0x0b1610, 0.35);
      g.fillEllipse(680, 454, 296, 44);
      g.fillStyle(c.color);
      g.fillRoundedRect(561, 308, 215, 193, 48);
      g.fillStyle(c.skin);
      g.fillRect(649, 278, 45, 54);
      g.fillEllipse(673, 243, 105, 137);
      g.fillStyle(c.hair);
      g.fillEllipse(674, 191, 115, 70);
      g.fillRect(618, 192, 16, 70);
      g.fillRect(712, 192, 16, 70);
      if (c.id === "woman") {
        g.fillRect(615, 207, 18, 123);
        g.fillRect(715, 207, 20, 123);
        g.fillStyle(0x303c33);
        g.fillTriangle(642, 328, 675, 443, 613, 329);
        g.fillTriangle(701, 328, 675, 443, 735, 329);
      }
      g.fillStyle(0x26352d);
      g.fillEllipse(652, 241, 6, 4);
      g.fillEllipse(694, 241, 6, 4);
      g.lineStyle(2, 0x8f7c69);
      g.lineBetween(667, 278, 681, 278);
      g.lineBetween(674, 247, 671, 263);
      g.fillStyle(c.skin);
      g.fillEllipse(594, 483, 61, 20);
      g.fillEllipse(755, 483, 61, 20);
      g.lineStyle(2, 0x243b30, 0.4);
      g.lineBetween(580, 385, 590, 470);
      g.lineBetween(764, 385, 756, 470);
      if (c.id === "student" || c.id === "rider") {
        g.lineStyle(12, c.color);
        g.strokeEllipse(674, 232, 133, 161);
      }
      if (c.id === "elder") {
        g.fillStyle(c.hair);
        g.fillEllipse(674, 187, 103, 43);
        g.lineStyle(1, 0x726657);
        g.lineBetween(641, 257, 661, 257);
        g.lineBetween(687, 257, 705, 257);
      }
    }
    e.products.forEach((id, i) => {
      const p = getProduct(id),
        x = 565 + i * 95;
      g.fillStyle(p.color);
      if (id === "water" || id === "tea") {
        g.fillRoundedRect(x, 517, 35, 65, 5);
        g.fillStyle(0xc3c8ad);
        g.fillRect(x + 5, 510, 25, 9);
      } else {
        g.fillRoundedRect(x, 525, 65, 51, 4);
      }
      g.fillStyle(0xe0dfc4);
      g.fillRect(x + 4, 543, 27, 17);
    });
    if (e.faceless) {
      g.fillStyle(0x899c7c);
      g.fillEllipse(195, 408, 23, 28);
    } else if (!e.ghost) {
      g.fillStyle(0x899c7c);
      g.fillEllipse(195, 408, 23, 28);
      g.fillStyle(0x182b20);
      g.fillCircle(191, 408, 1);
      g.fillCircle(199, 408, 1);
    }
    if (e.ghost) {
      g.fillStyle(0x8b9d7c, 0.7);
      g.fillEllipse(192, 405, 22, 28);
      g.fillRect(178, 418, 29, 29);
    }
    this.actor.setAlpha(0);
    this.tweens.add({ targets: this.actor, alpha: 1, duration: 600 });
    if (sanity <= 40) {
      this.cameras.main.shake(150, 0.0015);
    }
  }
}
