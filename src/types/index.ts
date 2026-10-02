export type Action =
  | "pay"
  | "refuse"
  | "report"
  | "ignore"
  | "lock"
  | "lights"
  | "hide"
  | "replay"
  | "turn"
  | "release";
export type Inspection = "customer" | "product" | "cctv" | "memo";
export type Ending = "normal" | "bad" | "fired" | "missing" | "true";
export interface Product {
  id: string;
  name: string;
  price: number;
  label: string;
  color: number;
}
export interface Customer {
  id: string;
  name: string;
  line: string;
  look: string;
  color: number;
  skin: number;
  hair: number;
}
export interface Encounter {
  id: string;
  customer: string;
  products: string[];
  minute: number;
  kind: "normal" | "anomaly" | "story";
  line: string;
  look: string;
  productClue: string;
  cctv: string;
  correct: Action[];
  extra?: Action[];
  ghost?: boolean;
  faceless?: boolean;
  fatal?: Action[];
  sanityCost?: number;
  result: string;
}
export interface DayLog {
  day: number;
  normal: number;
  anomalies: number;
  correct: number;
  wrong: number;
  sales: number;
  sanity: number;
  entries: string[];
}
export interface Run {
  day: number;
  index: number;
  sanity: number;
  trust: number;
  sales: number;
  danger: number;
  schedule: Encounter[];
  observedDays: number[];
  clues: string[];
  logs: DayLog[];
  currentLog: DayLog;
  inspected: Inspection[];
  resolved: boolean;
  feedback: string;
  ending?: Ending;
  elapsed: number;
}
export interface Save {
  version: 1;
  run: Run | null;
  codex: string[];
  endings: Ending[];
  muted: boolean;
}
