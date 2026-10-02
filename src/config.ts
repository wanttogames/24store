import Phaser from "phaser";
import { BootScene } from "./scenes/BootScene";
import { MenuScene } from "./scenes/MenuScene";
import { GameScene } from "./scenes/GameScene";
import { DayResultScene } from "./scenes/DayResultScene";
import { EndingScene } from "./scenes/EndingScene";
export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "store-canvas",
  width: 1280,
  height: 650,
  backgroundColor: "#17241b",
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [BootScene, MenuScene, GameScene, DayResultScene, EndingScene],
  render: { antialias: true },
  audio: { noAudio: true },
};
