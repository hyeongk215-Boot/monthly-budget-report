(function () {
  var closedMonths = [];
  var aggRows = [];
  var corpFilter = null;

  function showToast(msg) {
    var el = document.getElementById("toast");
    el.textContent = msg;
    el.classList.add("show");
    setTimeout(function () { el.classList.remove("show"); }, 3000);
  }

  function getKey() { return document.getElementById("adminKey").value; }
  function getCorp() { return document.getElementById("adminCorp").value; }
  function getYm() { return document.getElementById("adminYm").value; }

  function fillCorp() {
    var sel = document.getElementById("adminCorp");
    var prev = sel.value;
    var lang = getLang();
    sel.innerHTML = "";
    window.APP_CONFIG.CORPORATIONS.forEach(function (item) {
      var o = document.createElement("option");
      o.value = item.ko; o.textContent = item[lang] || item.ko;
      sel.appendChild(o);
    });
    if (prev) sel.value = prev;
  }

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

  function accountLabel(row) {
    return getLang() === "zh" ? row.nameZh : row.nameKo;
  }

  function varianceCell(budget, actual) {
    if (!budget) return "<span class='variance-badge na'>" + t("varianceNa") + "</span>";
    var pct = Math.round((actual / budget) * 100);
    if (actual > budget) return "<span class='variance-badge over'>" + t("varianceOver", { pct: pct }) + "</span>";
    return "<span class='variance-badge under'>" + t("varianceUnder", { pct: pct }) + "</span>";
  }

  function renderEditGrid(rows) {
    var body = document.getElementById("budgetEditBody");
    body.innerHTML = "";
    rows.forEach(function (row) {
      var tr = document.createElement("tr");
      if (row.isSubtotal) tr.className = "subtotal-row";
      tr.innerHTML =
        "<td style='text-align:left;'>" + accountLabel(row) + "</td>" +
        "<td><input type='number' step='0.01' data-code='" + row.accountCode + "' class='budget-input' value='" + row.budgetCny + "'></td>" +
        "<td>" + Number(row.actualCny).toLocaleString(undefined, { maximumFractionDigits: 2 }) + "</td>";
      body.appendChild(tr);
    });
  }

  var gaAggRows = [];

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

  function renderTargetProfitGrid(rows) {
    var byOffice = {};
    (rows || []).forEach(function (r) { byOffice[r.office] = r.targetOperatingProfitCny; });
    var body = document.getElementById("targetProfitBody");
    body.innerHTML = "";
    window.APP_CONFIG.OFFICES.forEach(function (item) {
      var tr = document.createElement("tr");
      var val = byOffice[item.ko] != null ? byOffice[item.ko] : "";
      tr.innerHTML =
        "<td style='text-align:left;'>" + window.officeLabel(item.ko) + "</td>" +
        "<td><input type='number' step='0.01' data-office='" + item.ko + "' class='target-profit-input' value='" + val + "'></td>";
      body.appendChild(tr);
    });
  }

  function saveTargetProfit() {
    var client = window.getSupabaseClient();
    var key = getKey();
    if (!client) { showToast(t("saveTargetProfitFail")); return; }
    if (!key) { showToast(t("adminKeyRequired")); return; }
    var corp = getCorp();
    var ym = getYm();
    var inputs = Array.from(document.querySelectorAll(".target-profit-input"));
    Promise.all(inputs.map(function (input) {
      return client.rpc("set_target_profit", {
        p_access_key: key, p_corp: corp, p_office: input.dataset.office,
        p_yearmonth: ym, p_amount_cny: Number(input.value) || 0
      });
    })).then(function (results) {
      if (results.some(function (r) { return r.error; })) throw new Error("save_failed");
      showToast(t("saveTargetProfitSuccess"));
    }).catch(function () {
      showToast(t("saveTargetProfitFail"));
    });
  }

  function renderMonthStatus() {
    var ym = getYm();
    var isClosed = closedMonths.indexOf(ym) !== -1;
    var badge = document.getElementById("monthStatusBadge");
    badge.textContent = t(isClosed ? "adminMonthClosedBadge" : "adminMonthOpenBadge");
    badge.className = "badge " + (isClosed ? "badge-special" : "badge-general");
    document.getElementById("closeMonthBtn").textContent = t(isClosed ? "adminReopenMonthBtn" : "adminCloseMonthBtn");
    document.getElementById("saveBudgetBtn").disabled = isClosed;
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

  function saveBudget() {
    var client = window.getSupabaseClient();
    var key = getKey();
    if (!client) { showToast(t("saveBudgetFail")); return; }
    if (!key) { showToast(t("adminKeyRequired")); return; }
    var lines = [];
    document.querySelectorAll(".budget-input").forEach(function (input) {
      lines.push({ accountCode: input.dataset.code, amountCny: Number(input.value) || 0 });
    });
    client.rpc("set_budget_lines", { p_access_key: key, p_corp: getCorp(), p_yearmonth: getYm(), p_lines: lines }).then(function (res) {
      if (res.error) {
        if (String(res.error.message || "").indexOf("budget_closed") !== -1) {
          showToast(t("saveBudgetClosed"));
        } else {
          showToast(t("saveBudgetFail"));
        }
        return;
      }
      showToast(t("saveBudgetSuccess"));
      fetchData();
    }).catch(function () {
      showToast(t("saveBudgetFail"));
    });
  }

  function filteredAggRows() {
    return corpFilter ? aggRows.filter(function (r) { return r.corp === corpFilter; }) : aggRows;
  }

  function renderCorpFilterGrid() {
    var grid = document.getElementById("corpFilterGrid");
    grid.innerHTML = "";
    window.APP_CONFIG.CORPORATIONS.forEach(function (item) {
      var div = document.createElement("div");
      div.className = "status-chip";
      div.style.cursor = "pointer";
      if (corpFilter === item.ko) div.style.outline = "2px solid var(--primary)";
      div.innerHTML = "<b>" + window.corpLabel(item.ko) + "</b>";
      div.addEventListener("click", function () {
        corpFilter = (corpFilter === item.ko) ? null : item.ko;
        renderAgg();
      });
      grid.appendChild(div);
    });
    document.getElementById("filterAllWrap").style.display = corpFilter ? "block" : "none";
  }

  function renderAgg() {
    renderCorpFilterGrid();
    var rows = filteredAggRows();
    var body = document.getElementById("aggBody");
    body.innerHTML = "";
    rows.forEach(function (row, i) {
      var tr = document.createElement("tr");
      if (row.isSubtotal) tr.className = "subtotal-row";
      tr.innerHTML =
        "<td>" + (i + 1) + "</td>" +
        "<td>" + window.corpLabel(row.corp) + "</td>" +
        "<td style='text-align:left;'>" + accountLabel(row) + "</td>" +
        "<td>" + Number(row.budgetCny).toLocaleString(undefined, { maximumFractionDigits: 2 }) + "</td>" +
        "<td>" + Number(row.actualCny).toLocaleString(undefined, { maximumFractionDigits: 2 }) + "</td>" +
        "<td>" + varianceCell(Number(row.budgetCny), Number(row.actualCny)) + "</td>";
      body.appendChild(tr);
    });
    document.getElementById("totalRows").textContent = rows.length;
  }

  function downloadAgg() {
    var rows = filteredAggRows();
    var header = [t("rowNumberCol"), t("colCorp"), t("colAccount"), t("colBudgetCny"), t("colActualCny")];
    var aoa = [header];
    rows.forEach(function (row, i) {
      aoa.push([i + 1, window.corpLabel(row.corp), accountLabel(row), row.budgetCny, row.actualCny]);
    });
    var ws = XLSX.utils.aoa_to_sheet(aoa);
    ws["!cols"] = [{ wch: 5 }, { wch: 14 }, { wch: 22 }, { wch: 14 }, { wch: 14 }];
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, getYm());
    var suffix = corpFilter ? "_" + corpFilter : "";
    window.downloadWorkbook(wb, t("fileNamePrefix") + "_" + getYm() + suffix + ".xlsx");
  }

  function fetchData() {
    var client = window.getSupabaseClient();
    var key = getKey();
    if (!client) { showToast(t("adminFetchFail")); return; }
    if (!key) { showToast(t("adminKeyRequired")); return; }
    Promise.all([
      client.rpc("get_budget", { p_access_key: key, p_corp: getCorp(), p_yearmonth: getYm() }),
      client.rpc("get_budget_aggregate", { p_access_key: key, p_yearmonth: getYm() }),
      client.rpc("get_target_profit", { p_access_key: key, p_corp: getCorp(), p_yearmonth: getYm() }),
      client.rpc("get_ga_aggregate", { p_access_key: key, p_yearmonth: getYm() })
    ]).then(function (results) {
      if (results[0].error) throw results[0].error;
      if (results[1].error) throw results[1].error;
      renderEditGrid(results[0].data || []);
      aggRows = results[1].data || [];
      corpFilter = null;
      renderAgg();
      renderTargetProfitGrid(results[2].data || []);
      renderGaAggTable(results[3].data || []);
    }).catch(function () {
      showToast(t("adminFetchFail"));
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    fillCorp();
    fillYm();
    document.addEventListener("langchange", function () { fillCorp(); fillYm(); renderMonthStatus(); renderAgg(); });
    document.getElementById("fetchBtn").addEventListener("click", fetchData);
    document.getElementById("saveBudgetBtn").addEventListener("click", saveBudget);
    document.getElementById("saveTargetProfitBtn").addEventListener("click", saveTargetProfit);
    document.getElementById("downloadGaBtn").addEventListener("click", downloadGaAgg);
    document.getElementById("closeMonthBtn").addEventListener("click", toggleMonthClosed);
    document.getElementById("adminYm").addEventListener("change", renderMonthStatus);
    document.getElementById("downloadBtn").addEventListener("click", downloadAgg);
    document.getElementById("filterAllBtn").addEventListener("click", function () {
      corpFilter = null;
      renderAgg();
    });
    refreshClosedMonths();
  });
})();
