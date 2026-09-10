window.I18N = {
  ko: {
    appTitle: "예산관리 - 중국법인 예산 대비 실적 시스템",
    langName: "한국어",
    navAdmin: "본사용: 관리자 화면",
    backBtn: "← 뒤로",

    indexHeading: "예산관리 입력·조회",
    indexDesc: "법인/지점/적용년도월/담당자 이름과 접근키를 입력하면 일반관리비 입력 화면으로 이동합니다.",
    corp: "법인",
    yearmonth: "적용년도월",
    submitterName: "담당자 이름",
    accessKeyLabel: "접근키",
    selectPlaceholder: "선택하세요",
    startBtn: "조회하기",
    requiredWarning: "법인, 지점, 적용년도월, 담당자 이름, 접근키를 모두 입력해주세요.",
    invalidKey: "접근키가 올바르지 않습니다. 본사 담당자에게 확인해주세요.",
    keyMismatchBranch: "이 접근키는 {branch} 전용입니다. 법인 선택이 자동으로 변경되었습니다.",

    viewHeading: "연간 예산 · 목표영업이익 입력",
    fetchFail: "조회에 실패했습니다. 접근키를 확인해주세요.",
    colAccount: "계정과목",
    colBudgetCny: "예산 (CNY)",
    colActualCny: "실적 (CNY)",
    varianceNa: "예산 미설정",

    yearLabel: "연도",
    monthSuffix: "월",
    annualBudgetDesc: "1~12월 계정과목별 예산과 목표영업이익을 한 번에 입력해서 제출합니다. 제출 후에는 자동으로 잠기며, 본사(관리자)만 잠금을 해제하고 수정할 수 있습니다.",
    targetSectionHeading: "목표영업이익 (한국식)",
    budgetSectionHeading: "계정과목별 예산",
    targetProfitRowLabel: "목표영업이익",
    submitAnnualBtn: "연간 제출",
    submitAnnualConfirm: "제출하면 자동으로 잠기며, 이후 수정은 본사(관리자)만 할 수 있습니다. 계속하시겠습니까?",
    submitAnnualLockedFail: "이미 제출되어 잠긴 연도입니다. 본사 담당자에게 잠금 해제를 요청해주세요.",
    annualLockedNote: "⚠ 이미 제출되어 잠겨 있습니다. 수정이 필요하면 본사 담당자에게 문의해주세요.",

    adminHeading: "[본사용] 예산관리 관리자 화면",
    adminDesc: "접근키(system_admin 또는 finance)로 법인×지점별 목표달성 현황을 조회하고, 일반관리비 취합 자료를 다운로드할 수 있습니다. 계정과목별 예산/목표영업이익은 각 지점이 연간 화면에서 직접 입력합니다.",
    adminKeyLabel: "접근키",
    adminCorp: "법인",
    adminYm: "년월",
    adminFetch: "불러오기",
    adminFetchFail: "조회에 실패했습니다. 접근키를 확인해주세요.",
    adminKeyRequired: "접근키를 먼저 입력해주세요.",

    saveBudgetSuccess: "예산이 저장되었습니다.",
    saveBudgetFail: "저장에 실패했습니다.",
    saveBudgetClosed: "이 달 예산은 마감되어 더 이상 수정할 수 없습니다.",

    office: "지점",
    monthClosedBanner: "⚠ {yearmonth} 은(는) 예산이 마감되어 더 이상 입력/제출할 수 없습니다. 본사 담당자에게 문의해주세요.",
    submitTabBtn: "제출",

    gaSubmitNavLink: "일반관리비 입력",
    gaSubmitHeading: "일반관리비 세부 예산/실적 입력",
    gaSubmitDesc: "이번 달 우리 지점의 일반관리비 항목별 예산과 실적을 고정비/변동비로 나누어 입력하고 제출합니다. 접대비/출장비는 참고용 세부 항목으로, 회계관리 PL(한국)의 관리비(700000) 총액과는 별도로 관리됩니다.",
    annualBudgetNavLink: "연간 예산 입력",
    colOperatingProfit: "실적 영업이익 (CNY)",
    ytdRecapHeading: "당해 누계 목표영업이익 달성 상황",
    ytdRecapDesc: "1~12월 목표영업이익(연간 입력)과 실적 영업이익(회계관리 PL 한국)을 월별로 비교합니다.",
    colCategory: "비용항목",
    colBudget: "예산",
    colActual: "실적",
    colFixed: "고정비",
    colVariable: "변동비",

    colTargetProfitCny: "목표영업이익 (CNY)",
    saveTargetProfitSuccess: "목표영업이익이 저장되었습니다.",
    saveTargetProfitFail: "저장에 실패했습니다.",

    achievementHeading: "법인×지점별 목표달성 현황",
    achievementDesc: "연도를 선택하면 법인·지점별 목표영업이익 달성률과 매출액 예산 달성률을 한눈에 볼 수 있습니다. 잠긴 연도는 잠금 해제 후 지점이 다시 제출할 수 있습니다.",
    colAchievementRate: "달성률",
    adminAction: "동작",
    adminUnlockBtn: "잠금 해제",
    adminUnlockConfirm: "{corp} - {office}의 연간 예산/목표영업이익 잠금을 해제하시겠습니까? 해제하면 지점이 다시 제출할 수 있습니다.",
    adminUnlockSuccess: "잠금이 해제되었습니다.",

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

    gaAggHeading: "일반관리비 세부 예산/실적 취합",
    gaAggDesc: "전체 법인·지점이 제출한 일반관리비 항목별 예산/실적(고정비+변동비 합계)입니다.",
    colCorp: "법인",
    adminDownload: "리포트 엑셀 다운로드",

    totalRows: "총 항목 수",
    rowNumberCol: "번호",
    fileNamePrefix: "예산대비실적"
  },
  zh: {
    appTitle: "预算管理 - 中国法人预算实际对比系统",
    langName: "中文",
    navAdmin: "总部用：管理员页面",
    backBtn: "← 返回",

    indexHeading: "预算管理填报·查询",
    indexDesc: "请填写法人/分公司/适用年月/负责人姓名及接入密钥，即可进入一般管理费填报页面。",
    corp: "法人",
    yearmonth: "适用年月",
    submitterName: "负责人姓名",
    accessKeyLabel: "接入密钥",
    selectPlaceholder: "请选择",
    startBtn: "查询",
    requiredWarning: "请填写法人、分公司、适用年月、负责人姓名和接入密钥。",
    invalidKey: "接入密钥不正确，请向总部负责人确认。",
    keyMismatchBranch: "该接入密钥仅限{branch}使用，已自动切换法人选择。",

    viewHeading: "年度预算 · 目标营业利润填报",
    fetchFail: "查询失败，请检查接入密钥。",
    colAccount: "科目",
    colBudgetCny: "预算 (CNY)",
    colActualCny: "实际 (CNY)",
    varianceNa: "尚未设置预算",

    yearLabel: "年度",
    monthSuffix: "月",
    annualBudgetDesc: "一次性填写并提交1~12月各科目预算与目标营业利润。提交后自动锁定，此后只有总部(管理员)可以解锁并修改。",
    targetSectionHeading: "目标营业利润 (韩国式)",
    budgetSectionHeading: "各科目预算",
    targetProfitRowLabel: "目标营业利润",
    submitAnnualBtn: "年度提交",
    submitAnnualConfirm: "提交后将自动锁定，此后只有总部(管理员)可以修改。是否继续？",
    submitAnnualLockedFail: "该年度已提交并锁定，请联系总部负责人解锁。",
    annualLockedNote: "⚠ 已提交并锁定。如需修改，请联系总部负责人。",

    adminHeading: "【总部用】预算管理管理员页面",
    adminDesc: "使用接入密钥（system_admin 或 finance）查看各法人×分公司目标达成情况，并下载一般管理费汇总资料。各科目预算/目标营业利润由各分公司在年度填报页面自行填写。",
    adminKeyLabel: "接入密钥",
    adminCorp: "法人",
    adminYm: "年月",
    adminFetch: "加载",
    adminFetchFail: "查询失败，请检查接入密钥。",
    adminKeyRequired: "请先输入接入密钥。",

    saveBudgetSuccess: "预算已保存。",
    saveBudgetFail: "保存失败。",
    saveBudgetClosed: "本月预算已截止，无法再修改。",

    office: "分公司",
    monthClosedBanner: "⚠ {yearmonth} 预算已截止，无法再填报/提交。请联系总部负责人。",
    submitTabBtn: "提交",

    gaSubmitNavLink: "一般管理费填报",
    gaSubmitHeading: "一般管理费明细预算/实际填报",
    gaSubmitDesc: "请按固定费/浮动费填写本月本分公司各项一般管理费的预算与实际数并提交。招待费/差旅费为参考用明细项目，与会计管理PL(韩国)的管理费(700000)总额分开管理。",
    annualBudgetNavLink: "年度预算填报",
    colOperatingProfit: "实际营业利润 (CNY)",
    ytdRecapHeading: "本年度目标营业利润达成情况累计",
    ytdRecapDesc: "按月比较1~12月目标营业利润(年度填报)与实际营业利润(会计管理PL韩国)。",
    colCategory: "费用项目",
    colBudget: "预算",
    colActual: "实际",
    colFixed: "固定费",
    colVariable: "浮动费",

    colTargetProfitCny: "目标营业利润 (CNY)",
    saveTargetProfitSuccess: "目标营业利润已保存。",
    saveTargetProfitFail: "保存失败。",

    achievementHeading: "各法人×分公司目标达成情况",
    achievementDesc: "选择年度即可查看各法人·分公司的目标营业利润达成率与营业收入预算达成率。已锁定的年度解锁后分公司可重新提交。",
    colAchievementRate: "达成率",
    adminAction: "操作",
    adminUnlockBtn: "解锁",
    adminUnlockConfirm: "确定要解锁 {corp} - {office} 的年度预算/目标营业利润吗？解锁后分公司可重新提交。",
    adminUnlockSuccess: "已解锁。",

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

    gaAggHeading: "一般管理费明细预算/实际汇总",
    gaAggDesc: "全法人·分公司提交的一般管理费各项目预算/实际（固定费+浮动费合计）。",
    colCorp: "法人",
    adminDownload: "下载报告Excel",

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
