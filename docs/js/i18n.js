window.I18N = {
  ko: {
    appTitle: "예산관리 - 중국법인 예산 대비 실적 시스템",
    langName: "한국어",
    navAdmin: "본사용: 관리자 화면",
    backBtn: "← 뒤로",

    indexHeading: "예산 대비 실적 조회",
    indexDesc: "법인/적용년도월과 접근키를 입력하면 해당 법인의 예산 대비 실적을 조회할 수 있습니다.",
    corp: "법인",
    yearmonth: "적용년도월",
    accessKeyLabel: "접근키",
    selectPlaceholder: "선택하세요",
    startBtn: "조회하기",
    requiredWarning: "법인, 적용년도월, 접근키를 모두 입력해주세요.",
    invalidKey: "접근키가 올바르지 않습니다. 본사 담당자에게 확인해주세요.",
    keyMismatchBranch: "이 접근키는 {branch} 전용입니다. 법인 선택이 자동으로 변경되었습니다.",

    viewHeading: "예산 대비 실적",
    fetchFail: "조회에 실패했습니다. 접근키를 확인해주세요.",
    colAccount: "계정과목",
    colBudgetCny: "예산 (CNY)",
    colActualCny: "실적 (CNY)",
    colVarianceRate: "달성률",
    varianceOver: "초과 {pct}%",
    varianceUnder: "정상 ({pct}%)",
    varianceNa: "예산 미설정",

    adminHeading: "[본사용] 예산관리 관리자 화면",
    adminDesc: "접근키(system_admin 또는 finance)로 법인/월별 예산을 수립하고, 전체 법인 통합 리포트를 확인할 수 있습니다.",
    adminKeyLabel: "접근키",
    adminCorp: "법인",
    adminYm: "년월",
    adminFetch: "불러오기",
    adminFetchFail: "조회에 실패했습니다. 접근키를 확인해주세요.",
    adminKeyRequired: "접근키를 먼저 입력해주세요.",

    saveBudgetBtn: "예산 저장",
    saveBudgetSuccess: "예산이 저장되었습니다.",
    saveBudgetFail: "저장에 실패했습니다.",
    saveBudgetClosed: "이 달 예산은 마감되어 더 이상 수정할 수 없습니다.",

    adminMonthStatus: "이 달 예산 상태",
    adminMonthOpenBadge: "수정가능",
    adminMonthClosedBadge: "마감됨",
    adminCloseMonthBtn: "이 달 예산 마감하기",
    adminReopenMonthBtn: "마감 해제",
    adminCloseConfirm: "{yearmonth} 예산을 마감하시겠습니까? 마감 후에는 더 이상 예산을 수정할 수 없습니다.",
    adminReopenConfirm: "{yearmonth} 예산 마감을 해제하시겠습니까?",
    adminCloseSuccess: "마감되었습니다.",
    adminReopenSuccess: "마감이 해제되었습니다.",
    adminCloseFail: "처리에 실패했습니다.",

    aggHeading: "전체 법인 통합 리포트",
    colCorp: "법인",
    adminDownload: "통합 리포트 엑셀 다운로드",
    adminFilterHint: "법인을 클릭하면 해당 법인만 필터링됩니다 (다시 클릭하면 해제).",
    adminFilterAll: "전체 법인 보기",

    totalRows: "총 항목 수",
    rowNumberCol: "번호",
    fileNamePrefix: "예산대비실적"
  },
  zh: {
    appTitle: "预算管理 - 中国法人预算实际对比系统",
    langName: "中文",
    navAdmin: "总部用：管理员页面",
    backBtn: "← 返回",

    indexHeading: "预算与实际对比查询",
    indexDesc: "请填写法人/适用年月及接入密钥，即可查询该法人的预算与实际对比情况。",
    corp: "法人",
    yearmonth: "适用年月",
    accessKeyLabel: "接入密钥",
    selectPlaceholder: "请选择",
    startBtn: "查询",
    requiredWarning: "请填写法人、适用年月和接入密钥。",
    invalidKey: "接入密钥不正确，请向总部负责人确认。",
    keyMismatchBranch: "该接入密钥仅限{branch}使用，已自动切换法人选择。",

    viewHeading: "预算与实际对比",
    fetchFail: "查询失败，请检查接入密钥。",
    colAccount: "科目",
    colBudgetCny: "预算 (CNY)",
    colActualCny: "实际 (CNY)",
    colVarianceRate: "达成率",
    varianceOver: "超出 {pct}%",
    varianceUnder: "正常 ({pct}%)",
    varianceNa: "尚未设置预算",

    adminHeading: "【总部用】预算管理管理员页面",
    adminDesc: "使用接入密钥（system_admin 或 finance）按法人/月设置预算，并查看全法人汇总报告。",
    adminKeyLabel: "接入密钥",
    adminCorp: "法人",
    adminYm: "年月",
    adminFetch: "加载",
    adminFetchFail: "查询失败，请检查接入密钥。",
    adminKeyRequired: "请先输入接入密钥。",

    saveBudgetBtn: "保存预算",
    saveBudgetSuccess: "预算已保存。",
    saveBudgetFail: "保存失败。",
    saveBudgetClosed: "本月预算已截止，无法再修改。",

    adminMonthStatus: "本月预算状态",
    adminMonthOpenBadge: "可修改",
    adminMonthClosedBadge: "已截止",
    adminCloseMonthBtn: "截止本月预算",
    adminReopenMonthBtn: "解除截止",
    adminCloseConfirm: "确定要截止 {yearmonth} 的预算吗？截止后将无法再修改。",
    adminReopenConfirm: "确定要解除 {yearmonth} 预算的截止状态吗？",
    adminCloseSuccess: "已截止。",
    adminReopenSuccess: "已解除截止。",
    adminCloseFail: "操作失败。",

    aggHeading: "全法人汇总报告",
    colCorp: "法人",
    adminDownload: "下载汇总报告Excel",
    adminFilterHint: "点击法人可只筛选该法人（再次点击取消筛选）。",
    adminFilterAll: "查看全部法人",

    totalRows: "总项目数",
    rowNumberCol: "编号",
    fileNamePrefix: "预算实际对比"
  }
};

window.getLang = function () {
  return localStorage.getItem("appLang") || "ko";
};
window.setLang = function (lang) {
  localStorage.setItem("appLang", lang);
  applyI18n();
  document.dispatchEvent(new CustomEvent("langchange"));
};
window.t = function (key, vars) {
  var lang = getLang();
  var dict = window.I18N[lang] || window.I18N.ko;
  var str = dict[key] || window.I18N.ko[key] || key;
  if (vars) {
    Object.keys(vars).forEach(function (k) {
      str = str.split("{" + k + "}").join(vars[k]);
    });
  }
  return str;
};
window.applyI18n = function () {
  document.documentElement.lang = getLang();
  document.querySelectorAll("[data-i18n]").forEach(function (el) {
    el.textContent = t(el.getAttribute("data-i18n"));
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
    el.placeholder = t(el.getAttribute("data-i18n-placeholder"));
  });
  document.title = t("appTitle");
  document.querySelectorAll(".lang-btn").forEach(function (btn) {
    btn.classList.toggle("active", btn.dataset.lang === getLang());
  });
};
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".lang-btn").forEach(function (btn) {
    btn.addEventListener("click", function () { setLang(btn.dataset.lang); });
  });
  applyI18n();
});
