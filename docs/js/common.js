// 공통 유틸 함수 모음 (회계관리 docs/js/common.js 구조를 재사용/축소 - 재무제표 전용 엑셀 함수는 제외)

// ===== Supabase 클라이언트 =====
window.getSupabaseClient = function () {
  var cfg = window.APP_CONFIG;
  if (!cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY) return null;
  if (!window._supabaseClient) {
    window._supabaseClient = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
  }
  return window._supabaseClient;
};

window.MIN_YEARMONTH = "2024-01";

window.generateYearMonths = function (back, forward) {
  back = back == null ? 36 : back;
  forward = forward == null ? 1 : forward;
  var now = new Date();
  var list = [];
  for (var i = -back; i <= forward; i++) {
    var d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    var ym = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
    if (ym < window.MIN_YEARMONTH) continue;
    list.push(ym);
  }
  return list.reverse();
};

window.defaultYearMonth = function () {
  var now = new Date();
  var d = new Date(now.getFullYear(), now.getMonth() - 1, 1); // 전월
  var ym = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
  return ym < window.MIN_YEARMONTH ? window.MIN_YEARMONTH : ym;
};

// ===== 예산 마감 여부 조회 (공개 RPC) =====
window.fetchClosedMonths = function () {
  var client = window.getSupabaseClient();
  if (!client) return Promise.resolve([]);
  return client.rpc("get_budget_closed_months", {}).then(function (res) {
    return (res.data || []);
  }).catch(function () {
    return [];
  });
};

// ===== 법인 라벨 =====
function findByKo(list, koValue) {
  for (var i = 0; i < list.length; i++) {
    if (list[i].ko === koValue) return list[i];
  }
  return null;
}
window.corpLabel = function (koValue, lang) {
  var item = findByKo(window.APP_CONFIG.CORPORATIONS, koValue);
  if (!item) return koValue;
  return item[lang || getLang()] || item.ko;
};
window.officeLabel = function (koValue, lang) {
  var item = findByKo(window.APP_CONFIG.OFFICES, koValue);
  if (!item) return koValue;
  return item[lang || getLang()] || item.ko;
};

// ===== 세션 컨텍스트 (법인/년월/접근키/역할) =====
window.saveContext = function (ctx) {
  sessionStorage.setItem("bgtContext", JSON.stringify(ctx));
};
window.loadContext = function () {
  var raw = sessionStorage.getItem("bgtContext");
  return raw ? JSON.parse(raw) : null;
};
window.clearContext = function () {
  sessionStorage.removeItem("bgtContext");
};

window.downloadWorkbook = function (wb, filename) {
  XLSX.writeFile(wb, filename);
};
