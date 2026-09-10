(function () {
  var closedMonths = [];
  var gaAggRows = [];
  var achievementRows = [];

  function showToast(msg) {
    var el = document.getElementById("toast");
    el.textContent = msg;
    el.classList.add("show");
    setTimeout(function () { el.classList.remove("show"); }, 3000);
  }

  function getKey() { return document.getElementById("adminKey").value; }
  function getYm() { return document.getElementById("adminYm").value; }
  function getYear() { return document.getElementById("achievementYear").value; }

  function fillYm() {
    var sel = document.getElementById("adminYm");
    var prev = sel.value;
    sel.innerHTML = "";
    window.generateYearMonths().forEach(function (ym) {
      var o = document.createElement("option");
      o.value = ym; o.textContent = ym;
      sel.appendChild(o);
    });
    sel.value = prev || window.defaultYearMonth();
  }

  function fillYear() {
    var sel = document.getElementById("achievementYear");
    var prev = sel.value;
    sel.innerHTML = "";
    var thisYear = new Date().getFullYear();
    for (var y = thisYear + 1; y >= thisYear - 3; y--) {
      var o = document.createElement("option");
      o.value = String(y); o.textContent = String(y);
      sel.appendChild(o);
    }
    sel.value = prev || String(thisYear);
  }

  function fmt(n) {
    return Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 });
  }
  function fmtPct(actual, target) {
    if (!target) return t("varianceNa");
    return Math.round((actual / target) * 100) + "%";
  }

  function renderAchievementTable(rows) {
    achievementRows = rows || [];
    var body = document.getElementById("achievementBody");
    body.innerHTML = "";
    achievementRows.forEach(function (row) {
      var tr = document.createElement("tr");
      tr.innerHTML =
        "<td>" + window.corpLabel(row.corp) + "</td>" +
        "<td>" + window.officeLabel(row.office) + "</td>" +
        "<td>" + fmt(row.targetProfitCny) + "</td>" +
        "<td>" + fmt(row.actualProfitCny) + "</td>" +
        "<td>" + fmtPct(row.actualProfitCny, row.targetProfitCny) + "</td>" +
        "<td>" + fmt(row.budgetRevenueCny) + "</td>" +
        "<td>" + fmt(row.actualRevenueCny) + "</td>" +
        "<td>" + fmtPct(row.actualRevenueCny, row.budgetRevenueCny) + "</td>" +
        "<td>" + (row.locked ? t("adminMonthClosedBadge") : t("adminMonthOpenBadge")) + "</td>" +
        "<td>" + (row.locked ? "<button class='btn-secondary unlock-btn' data-corp='" + row.corp + "' data-office='" + row.office + "'>" + t("adminUnlockBtn") + "</button>" : "") + "</td>";
      body.appendChild(tr);
    });
  }

  function fetchAchievement() {
    var client = window.getSupabaseClient();
    var key = getKey();
    if (!client) { showToast(t("adminFetchFail")); return; }
    if (!key) { showToast(t("adminKeyRequired")); return; }
    client.rpc("get_annual_achievement_aggregate", { p_access_key: key, p_year: getYear() }).then(function (res) {
      if (res.error) throw res.error;
      renderAchievementTable(res.data || []);
    }).catch(function () {
      showToast(t("adminFetchFail"));
    });
  }

  function unlockAnnual(corp, office) {
    var client = window.getSupabaseClient();
    var key = getKey();
    if (!key) { showToast(t("adminKeyRequired")); return; }
    if (!confirm(t("adminUnlockConfirm", { corp: window.corpLabel(corp), office: window.officeLabel(office) }))) return;
    client.rpc("unlock_annual_budget", { p_access_key: key, p_corp: corp, p_office: office, p_year: getYear() }).then(function (res) {
      if (res.error) throw res.error;
      showToast(t("adminUnlockSuccess"));
      fetchAchievement();
    }).catch(function () {
      showToast(t("adminCloseFail"));
    });
  }

  function downloadAchievement() {
    if (!achievementRows.length) { showToast(t("adminDeleteSelectedNone")); return; }
    var header = [t("colCorp"), t("office"), t("colTargetProfitCny"), t("colOperatingProfit"), t("colAchievementRate"),
      t("colBudgetCny"), t("colActualCny"), t("colAchievementRate")];
    var aoa = [header];
    achievementRows.forEach(function (row) {
      aoa.push([
        window.corpLabel(row.corp), window.officeLabel(row.office),
        row.targetProfitCny, row.actualProfitCny, fmtPct(row.actualProfitCny, row.targetProfitCny),
        row.budgetRevenueCny, row.actualRevenueCny, fmtPct(row.actualRevenueCny, row.budgetRevenueCny)
      ]);
    });
    var ws = XLSX.utils.aoa_to_sheet(aoa);
    ws["!cols"] = [{ wch: 14 }, { wch: 10 }, { wch: 14 }, { wch: 14 }, { wch: 10 }, { wch: 14 }, { wch: 14 }, { wch: 10 }];
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, getYear());
    window.downloadWorkbook(wb, t("fileNamePrefix") + "_달성현황_" + getYear() + ".xlsx");
  }

  function renderGaAggTable(rows) {
    gaAggRows = rows || [];
    var body = document.getElementById("gaAggBody");
    body.innerHTML = "";
    var byKey = {};
    var keys = [];
    gaAggRows.forEach(function (r) {
      var k = r.corp + "::" + r.office + "::" + r.category;
      if (!byKey[k]) { byKey[k] = { corp: r.corp, office: r.office, category: r.category }; keys.push(k); }
      var total = Number(r.fixedCny || 0) + Number(r.variableCny || 0);
      byKey[k][r.kind] = total;
    });
    keys.sort();
    keys.forEach(function (k) {
      var row = byKey[k];
      var tr = document.createElement("tr");
      tr.innerHTML =
        "<td>" + window.corpLabel(row.corp) + "</td>" +
        "<td>" + window.officeLabel(row.office) + "</td>" +
        "<td style='text-align:left;'>" + window.gaCategoryLabel(row.category) + "</td>" +
        "<td>" + Number(row.budget || 0).toLocaleString(undefined, { maximumFractionDigits: 2 }) + "</td>" +
        "<td>" + Number(row.actual || 0).toLocaleString(undefined, { maximumFractionDigits: 2 }) + "</td>";
      body.appendChild(tr);
    });
  }

  function downloadGaAgg() {
    if (!gaAggRows.length) { showToast(t("adminDeleteSelectedNone")); return; }
    var header = [t("colCorp"), t("office"), t("colCategory"), t("colFixed"), t("colVariable"), "kind"];
    var aoa = [header];
    gaAggRows.forEach(function (r) {
      aoa.push([window.corpLabel(r.corp), window.officeLabel(r.office), window.gaCategoryLabel(r.category), r.fixedCny, r.variableCny, r.kind]);
    });
    var ws = XLSX.utils.aoa_to_sheet(aoa);
    ws["!cols"] = [{ wch: 14 }, { wch: 10 }, { wch: 16 }, { wch: 12 }, { wch: 12 }, { wch: 8 }];
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, getYm());
    window.downloadWorkbook(wb, t("fileNamePrefix") + "_일반관리비_" + getYm() + ".xlsx");
  }

  function renderMonthStatus() {
    var ym = getYm();
    var isClosed = closedMonths.indexOf(ym) !== -1;
    var badge = document.getElementById("monthStatusBadge");
    badge.textContent = t(isClosed ? "adminMonthClosedBadge" : "adminMonthOpenBadge");
    badge.className = "badge " + (isClosed ? "badge-special" : "badge-general");
    document.getElementById("closeMonthBtn").textContent = t(isClosed ? "adminReopenMonthBtn" : "adminCloseMonthBtn");
  }

  function refreshClosedMonths() {
    return window.fetchClosedMonths().then(function (list) {
      closedMonths = list;
      renderMonthStatus();
    });
  }

  function toggleMonthClosed() {
    var ym = getYm();
    var key = getKey();
    var isClosed = closedMonths.indexOf(ym) !== -1;
    var client = window.getSupabaseClient();
    if (!client) { showToast(t("adminCloseFail")); return; }
    if (!key) { showToast(t("adminKeyRequired")); return; }
    if (!confirm(t(isClosed ? "adminReopenConfirm" : "adminCloseConfirm", { yearmonth: ym }))) return;
    var fn = isClosed ? "reopen_budget_month" : "close_budget_month";
    client.rpc(fn, { p_access_key: key, p_yearmonth: ym }).then(function (res) {
      if (res.error) throw res.error;
      showToast(t(isClosed ? "adminReopenSuccess" : "adminCloseSuccess"));
      return refreshClosedMonths();
    }).catch(function () {
      showToast(t("adminCloseFail"));
    });
  }

  function fetchGaAggregate() {
    var client = window.getSupabaseClient();
    var key = getKey();
    if (!client) { showToast(t("adminFetchFail")); return; }
    if (!key) { showToast(t("adminKeyRequired")); return; }
    client.rpc("get_ga_aggregate", { p_access_key: key, p_yearmonth: getYm() }).then(function (res) {
      if (res.error) throw res.error;
      renderGaAggTable(res.data || []);
    }).catch(function () {
      showToast(t("adminFetchFail"));
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    fillYm();
    fillYear();
    document.addEventListener("langchange", function () { fillYm(); fillYear(); renderMonthStatus(); });
    document.getElementById("fetchBtn").addEventListener("click", fetchGaAggregate);
    document.getElementById("fetchAchievementBtn").addEventListener("click", fetchAchievement);
    document.getElementById("downloadAchievementBtn").addEventListener("click", downloadAchievement);
    document.getElementById("achievementBody").addEventListener("click", function (e) {
      var btn = e.target.closest(".unlock-btn");
      if (!btn) return;
      unlockAnnual(btn.dataset.corp, btn.dataset.office);
    });
    document.getElementById("downloadGaBtn").addEventListener("click", downloadGaAgg);
    document.getElementById("closeMonthBtn").addEventListener("click", toggleMonthClosed);
    document.getElementById("adminYm").addEventListener("change", renderMonthStatus);
    refreshClosedMonths();
  });
})();
