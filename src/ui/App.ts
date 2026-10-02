import Phaser from "phaser";
import { gameConfig } from "../config";
import type { Save, Action, Inspection } from "../types";
import { SaveManager } from "../systems/SaveManager";
import {
  newRun,
  decide,
  nextEncounter,
  nextDay,
  collectClue,
  canRelease,
} from "../systems/EventManager";
import {
  currentMinute,
  formatTime,
  SLOT_SECONDS,
} from "../systems/TimeManager";
import { sanityLabel } from "../systems/SanityManager";
import { cctvReading } from "../systems/CCTVManager";
import { AudioManager } from "../systems/AudioManager";
import { getProduct } from "../data/products";
import { getCustomer } from "../data/customers";
import { memos } from "../data/story";
import { endings } from "../data/endings";
import { anomalies } from "../data/anomalies";
const labels: Record<Action, string> = {
  pay: "계산",
  refuse: "거절",
  report: "신고",
  ignore: "무시",
  lock: "문 잠그기",
  lights: "불 끄기",
  hide: "창고 숨기",
  replay: "CCTV 다시 보기",
  turn: "뒤를 확인한다",
  release: "마지막 계산을 끝내고 돌려보낸다",
};
const money = (n: number) => "₩" + n.toLocaleString("ko-KR");
const escape = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
export class App {
  private store = new SaveManager();
  private save: Save = this.store.load();
  private loadWarning = this.store.warning;
  private audio = new AudioManager();
  private page = "menu";
  private modal = false;
  private lastTick = performance.now();
  private minute = -1;
  private game: Phaser.Game;
  constructor() {
    this.audio.muted = this.save.muted;
    this.mount();
    this.game = new Phaser.Game(gameConfig);
    this.game.events.once("ready", () => this.render());
    window.addEventListener("store:inspect", (e) => {
      if (this.page === "game" && !this.modal)
        this.inspect((e as CustomEvent).detail);
    });
    window.addEventListener("pagehide", () => this.persist());
    document.addEventListener("visibilitychange", () => {
      this.lastTick = performance.now();
      if (document.hidden) {
        this.persist();
        this.audio.atmosphere(true);
      } else
        this.audio.atmosphere(
          this.save.run?.schedule[this.save.run.index]?.kind === "anomaly",
        );
    });
    setInterval(() => this.tick(), 100);
  }
  private mount() {
    document.querySelector("#app")!.innerHTML =
      `<header class="masthead"><a href="#" id="home">03:17 <span>심야 편의점</span></a><div class="header-tools"><button id="codex">괴담 기록</button><button id="sound">소리 켜짐</button><button id="pause">메뉴</button></div></header><main><section class="shiftbar" id="hud"></section><section class="stage"><div id="store-canvas"></div><div class="stage-caption"><span>COUNTER / CAMERA 01</span><span id="stage-status">야간 근무자를 구합니다</span></div><div class="screen-noise"></div><div id="stage-overlay"></div></section><section id="panel"></section><footer>00:00 — 06:00 · 상품 / 손님 / CCTV / 시간을 비교하세요 <span id="save-status">기기 내 자동 저장</span></footer></main><dialog id="dialog"><div id="dialog-content"></div><button id="close-dialog">확인하고 돌아가기</button></dialog>`;
    document.querySelector("#home")!.addEventListener("click", (e) => {
      e.preventDefault();
      this.menu();
    });
    document
      .querySelector("#pause")!
      .addEventListener("click", () => this.menu());
    document
      .querySelector("#codex")!
      .addEventListener("click", () => this.codex());
    document.querySelector("#sound")!.addEventListener("click", () => {
      this.audio.start();
      this.audio.toggle();
      this.save.muted = this.audio.muted;
      this.persist();
      this.soundLabel();
    });
    document
      .querySelector("#close-dialog")!
      .addEventListener("click", () =>
        (document.querySelector("#dialog") as HTMLDialogElement).close(),
      );
    document.querySelector("#dialog")!.addEventListener("close", () => {
      this.modal = false;
      this.lastTick = performance.now();
    });
  }
  private persist() {
    this.store.write(this.save);
    const node = document.querySelector("#save-status");
    if (node)
      node.textContent =
        this.store.warning || this.loadWarning || "기기 내 자동 저장";
  }
  private soundLabel() {
    document.querySelector("#sound")!.textContent = this.audio.muted
      ? "소리 꺼짐"
      : "소리 켜짐";
  }
  private menu() {
    this.persist();
    this.page = "menu";
    this.audio.atmosphere(true);
    this.render();
  }
  private scene(key: string) {
    if (!this.game.scene.isActive(key)) this.game.scene.start(key);
    setTimeout(
      () =>
        window.dispatchEvent(
          new CustomEvent("store:render", {
            detail: {
              encounter:
                this.page === "game"
                  ? this.save.run?.schedule[this.save.run.index]
                  : undefined,
              sanity: this.save.run?.sanity || 100,
            },
          }),
        ),
      80,
    );
  }
  private button(id: string, text: string, cls = "", disabled = false) {
    return `<button data-action="${id}" class="${cls}" ${disabled ? "disabled" : ""}>${text}</button>`;
  }
  private render() {
    this.soundLabel();
    const panel = document.querySelector("#panel")!,
      overlay = document.querySelector("#stage-overlay")!;
    overlay.innerHTML = "";
    const r = this.save.run;
    if (this.page === "menu") {
      this.scene("MenuScene");
      document.querySelector("#hud")!.innerHTML =
        '<span class="eyebrow">OBSERVATION HORROR / 7 NIGHT SHIFTS</span><span>첫 버전 · 20–30분</span>';
      overlay.innerHTML =
        '<div class="title-card"><div class="eyebrow">NIGHT SHIFT : OCTOBER</div><h1>심야 편의점<span>03:17</span></h1><p>평범한 손님일까요?<br>다음 계산은, 당신의 판단입니다.</p><span class="tag">운영 · 관찰 추리 · 괴담</span></div>';
      panel.innerHTML = `<div class="menu-panel"><div><h2>일곱 번의 새벽을 버티세요.</h2><p>상품, 손님, CCTV, 시간을 비교하고 계산 · 거절 · 신고 · 무시를 선택하세요. 클릭과 터치로 플레이합니다.</p><small>응대 중에도 시계는 흐릅니다. 충분히 관찰할 수 있도록 다음 손님 직전에 기다립니다.<br>놀람 연출과 낮은 환경음이 있습니다. 소리는 위 버튼으로 끌 수 있습니다.</small></div><div class="menu-actions">${this.button("continue", r ? "근무 이어하기" : "저장된 근무 없음", "primary", !r)}${this.button("new", "새 근무 시작")}${this.button("help", "근무 안내")}</div></div>`;
    } else if (r?.ending) {
      this.page = "ending";
      this.scene("EndingScene");
      const end = endings[r.ending];
      overlay.innerHTML = `<div class="title-card end-card"><div class="eyebrow">${end.title}</div><h1>${end.name}</h1><p>${end.text}</p></div>`;
      document.querySelector("#hud")!.innerHTML =
        `<span>DAY ${r.day} / 7</span><span>발견한 엔딩 ${this.save.endings.length} / 5</span>`;
      panel.innerHTML = `<div class="result-row"><div><h2>근무가 끝났습니다.</h2><p>누적 매출 ${money(r.sales)} · 정신력 ${r.sanity} · 점장 신뢰 ${r.trust}</p><small>괴담 기록과 엔딩 수집은 새 근무에도 유지됩니다.</small></div>${this.button("new", "다시 근무하기", "primary")}${this.button("menu", "메뉴")}</div>`;
    } else if (r?.index === 12) {
      this.page = "result";
      this.scene("DayResultScene");
      const l = r.currentLog;
      document.querySelector("#hud")!.innerHTML =
        `<span>DAY ${r.day} / 7 · 근무 종료</span><span>06:00 / 아침 교대</span>`;
      panel.innerHTML = `<div class="result-row"><div><div class="eyebrow">NIGHT SHIFT REPORT</div><h2>야간 근무 일지 — DAY ${r.day}</h2></div>${this.button("nextday", r.day === 7 ? "최종 근무 결과" : "다음 날 출근", "primary")}</div><div class="log-stats"><span>정상 손님<strong>${l.normal}</strong></span><span>특별 손님<strong>${l.anomalies}</strong></span><span>올바른 판단<strong>${l.correct}</strong></span><span>오판<strong>${l.wrong}</strong></span><span>오늘 매출<strong>${money(l.sales)}</strong></span><span>정신력<strong>${r.sanity}</strong></span></div><details><summary>사건 기록 ${l.entries.length}건 확인</summary><ul>${l.entries.map((s) => `<li>${escape(s)}</li>`).join("")}</ul></details>`;
    } else if (r) {
      this.page = "game";
      this.scene("GameScene");
      const e = r.schedule[r.index];
      this.audio.atmosphere(e.kind === "anomaly");
      document.querySelector("#hud")!.innerHTML =
        `<div><span class="eyebrow">DAY ${r.day} / 7</span><strong id="clock">${formatTime(e.minute)}</strong><span class="clock-note" id="clock-note">응대 ${r.index + 1} / 12</span></div><div class="metrics"><span>정신력 <b class="${r.sanity <= 40 ? "danger" : ""}">${r.sanity} <small>${sanityLabel(r.sanity)}</small></b></span><span>점장 신뢰 <b>${r.trust}</b></span><span>누적 매출 <b>${money(r.sales)}</b></span></div>`;
      document.querySelector("#stage-status")!.textContent =
        e.minute === 197
          ? "03:17 / 기록을 비교하세요"
          : "영업 중 / 비가 내립니다";
      document
        .querySelector(".screen-noise")!
        .classList.toggle("unstable", r.sanity <= 40);
      panel.innerHTML = `<div class="response-layout"><div class="evidence-column"><div class="eyebrow">OBSERVE BEFORE YOU DECIDE</div><h2>${e.ghost ? "빈 계산대" : e.kind === "story" ? "회색 코트의 여자" : getCustomer(e.customer).name}</h2><p class="dialogue">“${escape(e.line)}”</p><div class="inspect-buttons">${(["customer", "product", "cctv", "memo"] as Inspection[]).map((id, i) => this.button(id, ["손님 관찰", "상품 / 바코드", "CCTV 확대", "점장 메모"][i], r.inspected.includes(id) ? "seen" : "")).join("")}</div><div class="hint">확인한 단서 ${r.inspected.filter((i) => i !== "memo").length} / 3 · ${r.clues.length}개의 스토리 단서 확보</div></div><div class="decision-column"><div class="decision-heading"><span>POS / 판단</span><span>${money(e.products.reduce((n, id) => n + getProduct(id).price, 0))}</span></div><div class="action-grid">${(["pay", "refuse", "report", "ignore"] as Action[]).map((id, i) => this.button(id, `<small>0${i + 1}</small>${labels[id]}`, id === "pay" ? "primary" : "", r.resolved)).join("")}</div><div class="extra-actions">${[...new Set([...(e.extra || []), "replay" as Action])].map((id) => this.button(id, labels[id], id === "release" ? "special" : "", r.resolved)).join("")}</div>${e.id === "woman" && r.day === 7 && !canRelease(r) ? "<small>마지막 선택에는 연속 관찰과 네 가지 기록이 필요합니다.</small>" : ""}<div class="feedback ${r.resolved ? "active" : ""}" aria-live="polite">${escape(r.feedback || "손님의 외모만으로 판단하지 마세요.")}</div>${r.resolved ? this.button("next", "다음 응대 →", "wide") : ""}</div></div>`;
      this.minute = -1;
      this.tick();
    }
    panel
      .querySelectorAll<HTMLButtonElement>("[data-action]")
      .forEach((b) =>
        b.addEventListener("click", () => this.handle(b.dataset.action!)),
      );
    this.persist();
  }
  private handle(id: string) {
    this.audio.start();
    if (id === "new") {
      if (this.save.run && !this.save.run.ending) {
        this.open(
          '<h2>새 근무 시작</h2><p>진행 중인 근무를 처음부터 다시 시작합니다. 괴담과 엔딩 수집은 유지됩니다.</p><button id="confirm-new" class="primary">새 근무 시작</button>',
        );
        document
          .querySelector("#confirm-new")!
          .addEventListener("click", () => {
            (document.querySelector("#dialog") as HTMLDialogElement).close();
            this.start();
          });
      } else this.start();
      return;
    }
    if (id === "continue") {
      if (this.save.run) {
        this.page = "game";
        this.render();
      }
      return;
    }
    if (id === "menu") {
      this.menu();
      return;
    }
    if (id === "help") {
      this.open(
        '<div class="eyebrow">첫 근무 안내</div><h2>아주 조금 이상한 것</h2><p>계산대의 손님과 상품, 왼쪽 CCTV를 클릭하거나 아래 관찰 버튼을 누르세요. 오른쪽 문과 시간을 함께 비교하세요.</p><p>계산은 매출을 올립니다. 거절·신고·무시는 사건에 따라 결과가 다릅니다. 정상 손님을 거절하면 점장 신뢰가 감소합니다. 정신력이 낮으면 실시간 CCTV가 불안정해지므로 저장 영상을 다시 보세요.</p><p>03:17에는 늘 같은 손님이 옵니다. 반복 관찰과 매일 바뀌는 메모가 중요합니다. 매뉴얼도 완벽하지 않습니다.</p><p>근무는 응대마다 자동 저장됩니다. 새 근무에도 괴담과 엔딩 도감은 남습니다. 관찰 화면이나 메뉴에서는 시간이 멈춥니다.</p>',
      );
      return;
    }
    if (id === "nextday") {
      nextDay(this.save);
      this.page = "game";
      this.render();
      this.audio.bell();
      return;
    }
    if (id === "next") {
      nextEncounter(this.save.run!);
      this.render();
      this.audio.bell();
      return;
    }
    if (["customer", "product", "cctv", "memo"].includes(id)) {
      this.inspect(id as Inspection);
      return;
    }
    const feedback = decide(this.save, id as Action);
    if (id === "replay") {
      this.open(`<h2>저장 영상 / 프레임 비교</h2><p>${escape(feedback)}</p>`);
      this.persist();
      return;
    }
    this.audio.tone(id === "pay" ? 1200 : 330);
    this.render();
  }
  private start() {
    this.save.run = newRun();
    this.page = "game";
    this.render();
    this.audio.bell();
  }
  private inspect(id: Inspection) {
    const r = this.save.run;
    if (!r || r.ending || r.resolved || r.index >= 12 || this.page !== "game")
      return;
    const e = r.schedule[r.index];
    if (!r.inspected.includes(id)) r.inspected.push(id);
    collectClue(r, id);
    const content =
      id === "customer"
        ? e.look
        : id === "cctv"
          ? cctvReading(e, r.sanity)
          : id === "memo"
            ? memos[r.day - 1]
            : `${e.products
                .map((p) => {
                  const item = getProduct(p);
                  return `${item.name} / ${money(item.price)} / ${item.label}`;
                })
                .join("\n")}\n${e.productClue}`;
    this.render();
    this.open(
      `<div class="eyebrow">${id === "cctv" ? "CAMERA 01 / LIVE" : "NIGHT SHIFT / OBSERVATION"}</div><h2>${{ customer: "손님 관찰", product: "상품 · 바코드 조회", cctv: "CCTV 확대", memo: `점장 메모 / DAY ${r.day}` }[id]}</h2>${id === "cctv" ? '<div class="cctv-frame"><span>REC ●</span><div class="cctv-silhouette"></div><small>시간 · 형상 · 그림자 · 상품을 비교하세요</small></div>' : ""}<p class="clue-text">${escape(content)}</p>${r.sanity <= 40 && id === "product" ? '<small class="danger">POS 상품명이 순간적으로 「돌아오지 마」로 바뀝니다. 인쇄된 라벨을 비교하세요.</small>' : ""}`,
    );
    if (id === "product") this.audio.tone(1100);
  }
  private open(html: string) {
    this.modal = true;
    document.querySelector("#dialog-content")!.innerHTML = html;
    (document.querySelector("#dialog") as HTMLDialogElement).showModal();
  }
  private codex() {
    const list = [
      ...anomalies.map((a) => ({ id: a.id, name: a.line })),
      { id: "blackout", name: "꺼진 형광등" },
      { id: "last", name: "마지막 손님" },
      { id: "woman", name: "03:17의 여자" },
    ];
    this.open(
      `<div class="eyebrow">ARCHIVE / ACROSS ALL RUNS</div><h2>괴담 기록 ${this.save.codex.length} / ${list.length}</h2><p>정확히 처리한 사건만 이름이 기록됩니다. 그녀는 3일 연속 관찰해야 기록됩니다.</p><div class="codex-grid">${list.map((a, i) => `<div><small>No.${String(i + 1).padStart(2, "0")}</small><strong>${this.save.codex.includes(a.id) ? escape(a.name) : "???"}</strong></div>`).join("")}</div><h3>발견한 엔딩 ${this.save.endings.length} / 5</h3><p>${Object.entries(
        endings,
      )
        .map(([id, e]) =>
          this.save.endings.includes(id as keyof typeof endings)
            ? e.title + " · " + e.name
            : "???",
        )
        .join("<br>")}</p>`,
    );
  }
  private tick() {
    const now = performance.now(),
      dt = Math.min((now - this.lastTick) / 1000, 0.5);
    this.lastTick = now;
    const r = this.save.run;
    if (
      this.page !== "game" ||
      this.modal ||
      document.hidden ||
      !r ||
      r.resolved ||
      r.ending ||
      r.index >= 12
    )
      return;
    r.elapsed += dt;
    const e = r.schedule[r.index],
      next = r.schedule[r.index + 1]?.minute || Math.max(360, e.minute + 10);
    const minute = currentMinute(e.minute, next, r.elapsed);
    if (minute !== this.minute) {
      this.minute = minute;
      const clock = document.querySelector("#clock");
      if (clock) clock.textContent = formatTime(minute);
    }
    const note = document.querySelector("#clock-note");
    if (note)
      note.textContent =
        r.elapsed >= SLOT_SECONDS
          ? "응대 중 · 시계 대기"
          : `응대 ${r.index + 1} / 12`;
  }
}
