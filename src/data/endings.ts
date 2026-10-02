import type { Ending } from "../types";
export const endings: Record<
  Ending,
  { title: string; name: string; text: string }
> = {
  normal: {
    title: "NORMAL END",
    name: "아침 교대",
    text: "일곱 번의 아침을 맞았다. 후임에게 열쇠를 건넸다. 당신은 살아남았지만, 03:17의 계산은 아직 끝나지 않았다.",
  },
  bad: {
    title: "BAD END",
    name: "꺼지지 않는 형광등",
    text: "냉장고 소리와 당신의 숨소리를 구분할 수 없다. 손님이 누구였는지, 자신이 누구였는지 기억나지 않는다.",
  },
  fired: {
    title: "FIRED END",
    name: "마지막 급여",
    text: "점장은 더 이상 손님을 돌려보낼 수 없다고 했다. 열쇠를 반납했다. 적어도 내일 밤에는 이곳에 있지 않아도 된다.",
  },
  missing: {
    title: "MISSING END",
    name: "빈 근무 일지",
    text: "아침 교대자는 계산대에서 아무도 찾지 못했다. CCTV에는 당신이 뒤돌아보는 장면만 반복된다.",
  },
  true: {
    title: "TRUE END",
    name: "03:18",
    text: "1998년의 야간 근무자는 마지막 생수를 건넨 뒤 돌아오지 못했다. 당신이 끝내준 계산으로 그녀는 드디어 퇴근했다. 시계는 처음으로 03:18을 지나갔다.",
  },
};
