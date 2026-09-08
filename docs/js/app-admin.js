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
      client.rpc("get_budget_aggregate", { p_access_key: key, p_yearmonth: getYm() })
    ]).then(function (results) {
      if (results[0].error) throw results[0].error;
      if (results[1].error) throw results[1].error;
      renderEditGrid(results[0].data || []);
      aggRows = results[1].data || [];
      corpFilter = null;
      renderAgg();
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
