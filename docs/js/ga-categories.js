// 일반관리비 세부 예산/실적 그리드의 11개 비용항목 정의 (submit/admin 화면 공용).
// code는 DB의 bgt_ga_lines.category 값과 일치해야 합니다.
window.GA_CATEGORIES = [
  { code: "wage", ko: "인건비", zh: "工资费用" },
  { code: "welfare", ko: "복리후생비", zh: "福利费用" },
  { code: "entertainment", ko: "접대비", zh: "招待费" },
  { code: "travel", ko: "출장비", zh: "差旅费" },
  { code: "depreciation", ko: "감가상각비", zh: "折旧费" },
  { code: "rent", ko: "임차료", zh: "租赁费" },
  { code: "office_ops", ko: "사무실운영비", zh: "办公室运营费" },
  { code: "vehicle", ko: "차량유지비", zh: "车辆维持费" },
  { code: "consulting", ko: "자문및감사비", zh: "咨询+审计费" },
  { code: "system", ko: "시스템유지비", zh: "系统维护+其他" },
  { code: "bank_fee", ko: "은행수수료", zh: "银行手续费" }
];
window.gaCategoryLabel = function (code) {
  var item = window.GA_CATEGORIES.filter(function (c) { return c.code === code; })[0];
  if (!item) return code;
  return getLang() === "zh" ? item.zh : item.ko;
};
