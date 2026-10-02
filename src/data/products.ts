import type { Product } from "../types";
export const products: Product[] = [
  ["water", "맑은 생수", 1000, "500mL · 유통기한 2027.10.02", 0x98b7ae],
  ["milk", "오늘 우유", 1800, "200mL · 유통기한 2026.10.05", 0xddd7ba],
  ["coffee", "캔 커피", 1500, "175mL · 유통기한 2027.04.12", 0x9c7358],
  ["rice", "참치 삼각김밥", 1400, "유통기한 2026.10.03 08:00", 0x35463f],
  ["noodle", "매운 컵라면", 1700, "유통기한 2027.02.17", 0xb06046],
  ["sandwich", "햄 샌드위치", 2800, "유통기한 2026.10.03", 0xbaaa76],
  ["beer", "캔 맥주", 2700, "성인 확인 완료 · 500mL", 0xb1a063],
  ["tea", "보리차", 1600, "500mL · 유통기한 2027.01.01", 0xc19a59],
  ["chips", "감자칩", 1700, "유통기한 2027.03.01", 0xb7a86e],
  ["chocolate", "초콜릿", 1200, "유통기한 2027.05.04", 0x695141],
  ["bread", "단팥빵", 1500, "유통기한 2026.10.04", 0xbd8e66],
  ["gum", "민트 껌", 1000, "유통기한 2027.10.01", 0x669d85],
  ["battery", "건전지", 3500, "AA 2개 · 정상 바코드", 0x6c7980],
  ["tissue", "휴대용 휴지", 900, "10매 · 정상 바코드", 0xbfc6b7],
  [
    "oldmilk",
    "서울밤 우유",
    1800,
    "제조 1998.03.17 · 등록되지 않은 상품입니다.",
    0xbeb79d,
  ],
].map(
  ([id, name, price, label, color]) =>
    ({ id, name, price, label, color }) as Product,
);
export const getProduct = (id: string) => products.find((p) => p.id === id)!;
