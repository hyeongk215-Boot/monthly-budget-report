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
    varianceNa: "예산 미설정",

    yearLabel: "연도",
    monthSuffix: "월",
    annualBudgetDesc: "1~12월 일반관리비 항목별(고정비/변동비) 예산과 목표영업이익을 한 번에 입력해서 제출합니다. 제출 후에는 자동으로 잠기며, 본사(관리자)만 잠금을 해제하고 수정할 수 있습니다.",
    targetSectionHeading: "목표영업이익 (한국식)",
    budgetSectionHeading: "일반관리비 항목별 연간 예산",
    gaBudgetGridDesc: "이 예산은 \"실적 입력\" 화면 왼쪽에 참고용으로 함께 표시됩니다.",
    annualTotalLabel: "연간합계",
    targetProfitRowLabel: "목표영업이익",
    submitAnnualBtn: "연간 제출",
    submitAnnualConfirm: "제출하면 자동으로 잠기며, 이후 수정은 본사(관리자)만 할 수 있습니다. 계속하시겠습니까?",
    submitAnnualLockedFail: "이미 제출되어 잠긴 연도입니다. 본사 담당자에게 잠금 해제를 요청해주세요.",
    annualLockedNote: "⚠ 이미 제출되어 잠겨 있습니다. 수정이 필요하면 본사 담당자에게 문의해주세요.",

    adminHeading: "[본사용] 예산관리 관리자 화면",
    adminDesc: "접근키(system_admin 또는 finance)로 예산관리표 취합 리포트를 조회하고, 일반관리비 취합 자료를 다운로드/정정할 수 있습니다. 항목별 예산/목표영업이익은 각 지점이 연간 화면에서 직접 입력합니다.",
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

    gaSubmitNavLink: "실적 입력",
    gaSubmitHeading: "일반관리비 실적 입력",
    gaSubmitDesc: "이번 달 우리 지점의 일반관리비 실적을 항목별로 고정비/변동비로 나누어 입력하고 제출합니다. 예산 칸은 연간 예산 입력 화면에서 제출한 값을 참고용으로 불러온 것으로 이 화면에서는 수정할 수 없습니다. 제출 후에는 자동으로 잠기며, 본사(관리자)만 잠금을 해제하고 수정할 수 있습니다.",
    annualBudgetNavLink: "연간 예산 입력",
    colOperatingProfit: "실적 영업이익 (CNY)",
    ytdRecapHeading: "당해 누계 목표영업이익 달성 상황",
    ytdRecapDesc: "1~12월 목표영업이익(연간 입력)과 실적 영업이익(회계관리 PL 한국)을 월별로 비교하고, 분기/반기/연간 소계도 함께 표시합니다.",
    colCategory: "비용항목",
    colBudget: "예산",
    colActual: "실적",
    colFixed: "고정비",
    colVariable: "변동비",
    gaSubtotalRowLabel: "소계",
    gaTotalRowLabel: "고정비+변동비 합계",
    gaActualLockedNote: "⚠ 이번 달 실적은 이미 제출되어 잠겼습니다. 수정이 필요하면 본사 담당자에게 마감 해제를 요청해주세요.",
    submitGaActualConfirm: "제출 후에는 이번 달 실적을 스스로 수정할 수 없습니다 (수정이 필요하면 본사에 마감 해제를 요청해야 합니다). 제출하시겠습니까?",
    colQ1: "1분기",
    colQ2: "2분기",
    colQ3: "3분기",
    colQ4: "4분기",
    colH1: "상반기",
    colH2: "하반기",
    colAnnual: "연간",

    saveTargetProfitSuccess: "목표영업이익이 저장되었습니다.",
    saveTargetProfitFail: "저장에 실패했습니다.",

    gaReportHeading: "예산관리표 취합",
    gaReportDesc: "법인/연도/기간(월·분기·반기·연간)을 선택하면 지점별 일반관리비 예산·실적·증감을 한 번에 볼 수 있습니다.",
    periodLabel: "기간 구분",
    periodMonth: "월",
    periodQuarter: "분기",
    periodHalf: "반기",
    periodAnnual: "연간",
    periodValueLabel: "기간 선택",
    gaReportBudgetHeading: "예산",
    gaReportActualHeading: "실적",
    gaReportVarianceHeading: "예산 초과액(증감)",
    colTotal: "합계",
    yearSuffix: "년",
    reportUnitNote: "단위: CNY",
    gaTotalRowLabel2: "관리비 합계",
    gaVariancePctRowLabel: "증감율",

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
    gaAggDesc: "전체 법인·지점이 제출한 일반관리비 항목별 예산/실적(고정비+변동비 합계)입니다. 값 옆의 × 버튼 또는 체크박스+선택 삭제로 오기 입력을 정정할 수 있습니다.",
    colCorp: "법인",
    colDelete: "선택",
    adminDownload: "리포트 엑셀 다운로드",
    adminDeleteSelectedBtn: "선택 삭제",
    adminDeleteSelectedNone: "삭제할 항목을 선택해주세요.",
    adminDeleteSuccess: "삭제되었습니다.",
    adminDeleteFail: "삭제에 실패했습니다.",
    gaDeleteConfirm: "선택한 일반관리비 항목을 삭제하시겠습니까? 삭제 후에는 되돌릴 수 없습니다.",

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
    varianceNa: "尚未设置预算",

    yearLabel: "年度",
    monthSuffix: "月",
    annualBudgetDesc: "一次性填写并提交1~12月一般管理费各项目(固定费/浮动费)预算与目标营业利润。提交后自动锁定，此后只有总部(管理员)可以解锁并修改。",
    targetSectionHeading: "目标营业利润 (韩国式)",
    budgetSectionHeading: "一般管理费项目年度预算",
    gaBudgetGridDesc: "该预算会作为参考显示在\"实际填报\"页面左侧。",
    annualTotalLabel: "年度合计",
    targetProfitRowLabel: "目标营业利润",
    submitAnnualBtn: "年度提交",
    submitAnnualConfirm: "提交后将自动锁定，此后只有总部(管理员)可以修改。是否继续？",
    submitAnnualLockedFail: "该年度已提交并锁定，请联系总部负责人解锁。",
    annualLockedNote: "⚠ 已提交并锁定。如需修改，请联系总部负责人。",

    adminHeading: "【总部用】预算管理管理员页面",
    adminDesc: "使用接入密钥（system_admin 或 finance）查看预算管理表汇总报告，下载/更正一般管理费汇总资料。各项目预算/目标营业利润由各分公司在年度填报页面自行填写。",
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

    gaSubmitNavLink: "实际填报",
    gaSubmitHeading: "一般管理费实际填报",
    gaSubmitDesc: "请按固定费/浮动费填写本月本分公司一般管理费实际数并提交。预算栏为年度预算填报页面提交的数值，仅供参考，本页面无法修改。提交后自动锁定，此后只有总部(管理员)可以解锁并修改。",
    annualBudgetNavLink: "年度预算填报",
    colOperatingProfit: "实际营业利润 (CNY)",
    ytdRecapHeading: "本年度目标营业利润达成情况累计",
    ytdRecapDesc: "按月比较1~12月目标营业利润(年度填报)与实际营业利润(会计管理PL韩国)，并显示季度/半年/年度小计。",
    colCategory: "费用项目",
    colBudget: "预算",
    colActual: "实际",
    colFixed: "固定费",
    colVariable: "浮动费",
    gaSubtotalRowLabel: "小计",
    gaTotalRowLabel: "固定费+浮动费合计",
    gaActualLockedNote: "⚠ 本月实际数已提交并锁定。如需修改，请联系总部负责人解除锁定。",
    submitGaActualConfirm: "提交后将无法自行修改本月实际数（如需修改，须请总部解除锁定）。确定要提交吗？",
    colQ1: "第1季度",
    colQ2: "第2季度",
    colQ3: "第3季度",
    colQ4: "第4季度",
    colH1: "上半年",
    colH2: "下半年",
    colAnnual: "年度",

    saveTargetProfitSuccess: "目标营业利润已保存。",
    saveTargetProfitFail: "保存失败。",

    gaReportHeading: "预算管理表汇总",
    gaReportDesc: "选择法人/年度/期间(月·季度·半年·年度)即可一次查看各分公司一般管理费预算·实际·增减。",
    periodLabel: "期间类型",
    periodMonth: "月",
    periodQuarter: "季度",
    periodHalf: "半年",
    periodAnnual: "年度",
    periodValueLabel: "选择期间",
    gaReportBudgetHeading: "预算",
    gaReportActualHeading: "实际",
    gaReportVarianceHeading: "预算超额(增减)",
    colTotal: "合计",
    yearSuffix: "年",
    reportUnitNote: "单位：CNY",
    gaTotalRowLabel2: "管理费合计",
    gaVariancePctRowLabel: "增减率",

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
    gaAggDesc: "全法人·分公司提交的一般管理费各项目预算/实际（固定费+浮动费合计）。可通过数值旁的×按钮或勾选后选择删除来更正误填数据。",
    colCorp: "法人",
    colDelete: "选择",
    adminDownload: "下载报告Excel",
    adminDeleteSelectedBtn: "删除所选",
    adminDeleteSelectedNone: "请先选择要删除的数据。",
    adminDeleteSuccess: "已删除。",
    adminDeleteFail: "删除失败。",
    gaDeleteConfirm: "确定要删除所选的一般管理费数据吗？删除后无法恢复。",

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
