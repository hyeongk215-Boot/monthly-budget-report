(function () {
  var closedMonths = [];
  var gaAggRows = [];
  var gaReportData = null; // { corp, year, periodLabel, offices: [...], budget:{}, actual:{}, variance:{} }

  function showToast(msg) {
    var el = document.getElementById("toast");
    el.textContent = msg;
    el.classList.add("show");
    setTimeout(function () { el.classList.remove("show"); }, 3000);
  }

  function getKey() { return document.getElementById("adminKey").value; }
  function getYm() { return document.getElementById("adminYm").value; }

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

  function fmt(n) {
    return Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 });
  }

  function officesForCorp(corp) {
    var codes = (window.APP_CONFIG.CORP_OFFICES && window.APP_CONFIG.CORP_OFFICES[corp]) || [];
    return window.APP_CONFIG.OFFICES.filter(function (o) { return codes.indexOf(o.ko) !== -1; });
  }

  // ===== 예산관리표 취합 리포트 =====
  function fillGaReportCorp() {
    var sel = document.getElementById("gaReportCorp");
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

  function fillGaReportYear() {
    var sel = document.getElementById("gaReportYear");
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

  function fillGaReportPeriodValue() {
    var type = document.getElementById("gaReportPeriodType").value;
    var sel = document.getElementById("gaReportPeriodValue");
    var wrap = document.getElementById("gaReportPeriodValueWrap");
    sel.innerHTML = "";
    if (type === "month") {
      wrap.style.display = "block";
      for (var m = 1; m <= 12; m++) {
        var mm = String(m).padStart(2, "0");
        var o = document.createElement("option");
        o.value = mm; o.textContent = m + t("monthSuffix");
        sel.appendChild(o);
      }
    } else if (type === "quarter") {
      wrap.style.display = "block";
      ["Q1", "Q2", "Q3", "Q4"].forEach(function (q, i) {
        var o = document.createElement("option");
        o.value = q; o.textContent = t("colQ" + (i + 1));
        sel.appendChild(o);
      });
    } else if (type === "half") {
      wrap.style.display = "block";
      ["H1", "H2"].forEach(function (h, i) {
        var o = document.createElement("option");
        o.value = h; o.textContent = t(i === 0 ? "colH1" : "colH2");
        sel.appendChild(o);
      });
    } else {
      wrap.style.display = "none";
    }
  }

  function monthRangeFor(type, value) {
    if (type === "month") return { start: value, end: value, label: Number(value) + t("monthSuffix") };
    if (type === "quarter") {
      var qMap = { Q1: ["01", "03"], Q2: ["04", "06"], Q3: ["07", "09"], Q4: ["10", "12"] };
      var qi = ["Q1", "Q2", "Q3", "Q4"].indexOf(value);
      return { start: qMap[value][0], end: qMap[value][1], label: t("colQ" + (qi + 1)) };
    }
    if (type === "half") {
      var hMap = { H1: ["01", "06"], H2: ["07", "12"] };
      return { start: hMap[value][0], end: hMap[value][1], label: t(value === "H1" ? "colH1" : "colH2") };
    }
    return { start: "01", end: "12", label: t("colAnnual") };
  }

  function emptyPivot() {
    var p = {};
    window.GA_CATEGORIES.forEach(function (c) { p[c.code] = {}; });
    return p;
  }

  function fetchGaReport() {
    var client = window.getSupabaseClient();
    var key = getKey();
    var corp = document.getElementById("gaReportCorp").value;
    var year = document.getElementById("gaReportYear").value;
    var type = document.getElementById("gaReportPeriodType").value;
    var value = document.getElementById("gaReportPeriodValue").value;
    if (!client) { showToast(t("adminFetchFail")); return; }
    if (!key) { showToast(t("adminKeyRequired")); return; }
    var range = monthRangeFor(type, value);
    client.rpc("get_ga_period_report", {
      p_access_key: key, p_corp: corp, p_year: year, p_start_month: range.start, p_end_month: range.end
    }).then(function (res) {
      if (res.error) throw res.error;
      var offices = officesForCorp(corp);
      var budget = emptyPivot(), actual = emptyPivot();
      offices.forEach(function (o) {
        window.GA_CATEGORIES.forEach(function (c) {
          budget[c.code][o.ko] = { fixedCny: 0, variableCny: 0 };
          actual[c.code][o.ko] = { fixedCny: 0, variableCny: 0 };
        });
      });
      (res.data || []).forEach(function (r) {
        var target = r.kind === "budget" ? budget : actual;
        if (!target[r.category]) target[r.category] = {};
        target[r.category][r.office] = { fixedCny: r.fixedCny, variableCny: r.variableCny };
      });
      gaReportData = { corp: corp, year: year, offices: offices, periodLabel: range.label, budget: budget, actual: actual };
      document.getElementById("gaReportMeta").textContent =
        window.corpLabel(corp) + " · " + year + t("yearSuffix") + " " + range.label + " (" + t("reportUnitNote") + ")";
      renderGaReportBlock("gaReportBudgetTable", budget, offices);
      renderGaReportBlock("gaReportActualTable", actual, offices);
      renderGaVarianceBlock(offices, budget, actual);
    }).catch(function () {
      showToast(t("adminFetchFail"));
    });
  }

  function officeTotal(pivotForOffice) {
    var fixed = 0, variable = 0;
    window.GA_CATEGORIES.forEach(function (c) {
      var v = pivotForOffice[c.code] || { fixedCny: 0, variableCny: 0 };
      fixed += Number(v.fixedCny) || 0;
      variable += Number(v.variableCny) || 0;
    });
    return { fixedCny: fixed, variableCny: variable };
  }

  function buildReportHead(offices) {
    var row1 = "<tr><th rowspan='2'>" + t("colCategory") + "</th>";
    var row2 = "<tr>";
    offices.forEach(function (o) {
      row1 += "<th colspan='2'>" + window.officeLabel(o.ko) + "</th>";
      row2 += "<th>" + t("colFixed") + "</th><th>" + t("colVariable") + "</th>";
    });
    row1 += "<th colspan='2'>" + t("colTotal") + "</th>";
    row2 += "<th>" + t("colFixed") + "</th><th>" + t("colVariable") + "</th>";
    row1 += "</tr>";
    row2 += "</tr>";
    return row1 + row2;
  }

  function renderGaReportBlock(tableId, pivot, offices) {
    var table = document.getElementById(tableId);
    table.querySelector("thead").innerHTML = buildReportHead(offices);
    var body = table.querySelector("tbody");
    body.innerHTML = "";
    var subtotalFixed = {}, subtotalVariable = {}, grandFixed = 0, grandVariable = 0;
    offices.forEach(function (o) { subtotalFixed[o.ko] = 0; subtotalVariable[o.ko] = 0; });

    window.GA_CATEGORIES.forEach(function (cat) {
      var tr = "<tr><td style='text-align:left;'>" + window.gaCategoryLabel(cat.code) + "</td>";
      offices.forEach(function (o) {
        var v = (pivot[cat.code] && pivot[cat.code][o.ko]) || { fixedCny: 0, variableCny: 0 };
        subtotalFixed[o.ko] += Number(v.fixedCny) || 0;
        subtotalVariable[o.ko] += Number(v.variableCny) || 0;
        tr += "<td>" + fmt(v.fixedCny) + "</td><td>" + fmt(v.variableCny) + "</td>";
      });
      var rowFixed = 0, rowVariable = 0;
      offices.forEach(function (o) {
        var v = (pivot[cat.code] && pivot[cat.code][o.ko]) || { fixedCny: 0, variableCny: 0 };
        rowFixed += Number(v.fixedCny) || 0;
        rowVariable += Number(v.variableCny) || 0;
      });
      tr += "<td>" + fmt(rowFixed) + "</td><td>" + fmt(rowVariable) + "</td></tr>";
      body.innerHTML += tr;
    });

    var subRow = "<tr class='subtotal-row'><td style='text-align:left;'>" + t("gaSubtotalRowLabel") + "</td>";
    offices.forEach(function (o) {
      subRow += "<td>" + fmt(subtotalFixed[o.ko]) + "</td><td>" + fmt(subtotalVariable[o.ko]) + "</td>";
      grandFixed += subtotalFixed[o.ko]; grandVariable += subtotalVariable[o.ko];
    });
    subRow += "<td>" + fmt(grandFixed) + "</td><td>" + fmt(grandVariable) + "</td></tr>";
    body.innerHTML += subRow;

    var totalRow = "<tr class='subtotal-row'><td style='text-align:left;'>" + t("gaTotalRowLabel2") + "</td>";
    offices.forEach(function (o) {
      totalRow += "<td colspan='2'>" + fmt(subtotalFixed[o.ko] + subtotalVariable[o.ko]) + "</td>";
    });
    totalRow += "<td colspan='2'>" + fmt(grandFixed + grandVariable) + "</td></tr>";
    body.innerHTML += totalRow;
  }

  function renderGaVarianceBlock(offices, budget, actual) {
    var table = document.getElementById("gaReportVarianceTable");
    table.querySelector("thead").innerHTML = buildReportHead(offices);
    var body = table.querySelector("tbody");
    body.innerHTML = "";
    var officeBudgetTotal = {}, officeActualTotal = {};
    offices.forEach(function (o) { officeBudgetTotal[o.ko] = 0; officeActualTotal[o.ko] = 0; });
    var grandBudget = 0, grandActual = 0;

    window.GA_CATEGORIES.forEach(function (cat) {
      var tr = "<tr><td style='text-align:left;'>" + window.gaCategoryLabel(cat.code) + "</td>";
      var rowB = 0, rowA = 0;
      offices.forEach(function (o) {
        var b = (budget[cat.code] && budget[cat.code][o.ko]) || { fixedCny: 0, variableCny: 0 };
        var a = (actual[cat.code] && actual[cat.code][o.ko]) || { fixedCny: 0, variableCny: 0 };
        var dFixed = (Number(a.fixedCny) || 0) - (Number(b.fixedCny) || 0);
        var dVariable = (Number(a.variableCny) || 0) - (Number(b.variableCny) || 0);
        tr += "<td>" + fmt(dFixed) + "</td><td>" + fmt(dVariable) + "</td>";
        officeBudgetTotal[o.ko] += (Number(b.fixedCny) || 0) + (Number(b.variableCny) || 0);
        officeActualTotal[o.ko] += (Number(a.fixedCny) || 0) + (Number(a.variableCny) || 0);
        rowB += (Number(b.fixedCny) || 0) + (Number(b.variableCny) || 0);
        rowA += (Number(a.fixedCny) || 0) + (Number(a.variableCny) || 0);
      });
      tr += "<td colspan='2'>" + fmt(rowA - rowB) + "</td></tr>";
      body.innerHTML += tr;
    });

    var totalRow = "<tr class='subtotal-row'><td style='text-align:left;'>" + t("gaTotalRowLabel2") + "</td>";
    offices.forEach(function (o) {
      totalRow += "<td colspan='2'>" + fmt(officeActualTotal[o.ko] - officeBudgetTotal[o.ko]) + "</td>";
      grandBudget += officeBudgetTotal[o.ko]; grandActual += officeActualTotal[o.ko];
    });
    totalRow += "<td colspan='2'>" + fmt(grandActual - grandBudget) + "</td></tr>";
    body.innerHTML += totalRow;

    var pctRow = "<tr><td style='text-align:left;'>" + t("gaVariancePctRowLabel") + "</td>";
    offices.forEach(function (o) {
      pctRow += "<td colspan='2'>" + fmtPct(officeActualTotal[o.ko], officeBudgetTotal[o.ko]) + "</td>";
    });
    pctRow += "<td colspan='2'>" + fmtPct(grandActual, grandBudget) + "</td></tr>";
    body.innerHTML += pctRow;
  }

  function fmtPct(actual, budget) {
    if (!budget) return t("varianceNa");
    return (Math.round(((actual - budget) / budget) * 1000) / 10) + "%";
  }

  function downloadGaReport() {
    if (!gaReportData) { showToast(t("adminDeleteSelectedNone")); return; }
    var wb = XLSX.utils.book_new();
    ["gaReportBudgetTable", "gaReportActualTable", "gaReportVarianceTable"].forEach(function (id, i) {
      var ws = XLSX.utils.table_to_sheet(document.getElementById(id));
      XLSX.utils.book_append_sheet(wb, ws, [t("gaReportBudgetHeading"), t("gaReportActualHeading"), t("gaReportVarianceHeading")][i].slice(0, 28));
    });
    window.downloadWorkbook(wb, t("fileNamePrefix") + "_예산관리표_" + window.corpLabel(gaReportData.corp) + "_" + gaReportData.year + ".xlsx");
  }

  function fillGaAggFilterCorp() {
    var sel = document.getElementById("gaAggFilterCorp");
    var prev = sel.value;
    var lang = getLang();
    sel.innerHTML = "<option value=''>" + t("selectPlaceholder") + "</option>";
    window.APP_CONFIG.CORPORATIONS.forEach(function (item) {
      var o = document.createElement("option");
      o.value = item.ko; o.textContent = item[lang] || item.ko;
      sel.appendChild(o);
    });
    if (prev) sel.value = prev;
  }

  function fillGaAggFilterOffice() {
    var corp = document.getElementById("gaAggFilterCorp").value;
    var sel = document.getElementById("gaAggFilterOffice");
    var prev = sel.value;
    sel.innerHTML = "<option value=''>" + t("selectPlaceholder") + "</option>";
    (corp ? officesForCorp(corp) : window.APP_CONFIG.OFFICES).forEach(function (o) {
      var opt = document.createElement("option");
      opt.value = o.ko; opt.textContent = window.officeLabel(o.ko);
      sel.appendChild(opt);
    });
    if (prev) sel.value = prev;
  }

  function filteredGaAggRows() {
    var corp = document.getElementById("gaAggFilterCorp").value;
    var office = document.getElementById("gaAggFilterOffice").value;
    return gaAggRows.filter(function (r) {
      return (!corp || r.corp === corp) && (!office || r.office === office);
    });
  }

  function renderGaAggTable(rows) {
    gaAggRows = rows || [];
    renderGaAggBody();
  }

  function renderGaAggBody() {
    var rows = filteredGaAggRows();
    var body = document.getElementById("gaAggBody");
    body.innerHTML = "";
    var byKey = {};
    var keys = [];
    rows.forEach(function (r) {
      var k = r.corp + "::" + r.office + "::" + r.category;
      if (!byKey[k]) { byKey[k] = { corp: r.corp, office: r.office, category: r.category }; keys.push(k); }
      byKey[k][r.kind] = { fixedCny: r.fixedCny, variableCny: r.variableCny };
    });
    keys.sort();
    keys.forEach(function (k) {
      var row = byKey[k];
      var b = row.budget, a = row.actual;
      var bTotal = b ? (Number(b.fixedCny) || 0) + (Number(b.variableCny) || 0) : null;
      var aTotal = a ? (Number(a.fixedCny) || 0) + (Number(a.variableCny) || 0) : null;
      var tr = document.createElement("tr");
      tr.innerHTML =
        "<td>" + window.corpLabel(row.corp) + "</td>" +
        "<td>" + window.officeLabel(row.office) + "</td>" +
        "<td style='text-align:left;'>" + window.gaCategoryLabel(row.category) + "</td>" +
        "<td>" + (bTotal != null ? bTotal.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "-") +
          (b ? " <button type='button' class='btn-danger ga-del-btn' data-corp='" + row.corp + "' data-office='" + row.office + "' data-category='" + row.category + "' data-kind='budget' style='font-size:10px; padding:1px 6px;'>×</button>" : "") + "</td>" +
        "<td>" + (aTotal != null ? aTotal.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "-") +
          (a ? " <button type='button' class='btn-danger ga-del-btn' data-corp='" + row.corp + "' data-office='" + row.office + "' data-category='" + row.category + "' data-kind='actual' style='font-size:10px; padding:1px 6px;'>×</button>" : "") + "</td>" +
        "<td style='text-align:center;'><input type='checkbox' class='ga-row-select' data-corp='" + row.corp + "' data-office='" + row.office + "' data-category='" + row.category + "'></td>";
      body.appendChild(tr);
    });
  }

  function deleteGaLine(corp, office, category, kind) {
    var client = window.getSupabaseClient();
    var key = getKey();
    if (!key) { showToast(t("adminKeyRequired")); return; }
    if (!confirm(t("gaDeleteConfirm"))) return;
    client.rpc("delete_ga_line", { p_access_key: key, p_corp: corp, p_office: office, p_yearmonth: getYm(), p_category: category, p_kind: kind }).then(function (res) {
      if (res.error) throw res.error;
      showToast(t("adminDeleteSuccess"));
      fetchGaAggregate();
    }).catch(function () {
      showToast(t("adminDeleteFail"));
    });
  }

  function deleteGaSelected() {
    var checked = Array.from(document.querySelectorAll(".ga-row-select:checked"));
    if (!checked.length) { showToast(t("adminDeleteSelectedNone")); return; }
    if (!confirm(t("gaDeleteConfirm"))) return;
    var client = window.getSupabaseClient();
    var key = getKey();
    if (!key) { showToast(t("adminKeyRequired")); return; }
    var calls = [];
    checked.forEach(function (cb) {
      ["budget", "actual"].forEach(function (kind) {
        calls.push(client.rpc("delete_ga_line", {
          p_access_key: key, p_corp: cb.dataset.corp, p_office: cb.dataset.office,
          p_yearmonth: getYm(), p_category: cb.dataset.category, p_kind: kind
        }));
      });
    });
    Promise.all(calls).then(function (results) {
      if (results.some(function (r) { return r.error; })) throw new Error("delete_failed");
      showToast(t("adminDeleteSuccess"));
      fetchGaAggregate();
    }).catch(function () {
      showToast(t("adminDeleteFail"));
    });
  }

  function downloadGaAgg() {
    var rows = filteredGaAggRows();
    if (!rows.length) { showToast(t("adminDeleteSelectedNone")); return; }
    var header = [t("colCorp"), t("office"), t("colCategory"), t("colFixed"), t("colVariable"), "kind"];
    var aoa = [header];
    rows.forEach(function (r) {
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
    fillGaReportCorp();
    fillGaReportYear();
    fillGaReportPeriodValue();
    fillGaAggFilterCorp();
    fillGaAggFilterOffice();
    document.addEventListener("langchange", function () {
      fillYm(); fillGaReportCorp(); fillGaReportYear(); fillGaReportPeriodValue();
      fillGaAggFilterCorp(); fillGaAggFilterOffice(); renderMonthStatus(); renderGaAggBody();
    });
    document.getElementById("fetchBtn").addEventListener("click", fetchGaAggregate);
    document.getElementById("gaReportPeriodType").addEventListener("change", fillGaReportPeriodValue);
    document.getElementById("fetchGaReportBtn").addEventListener("click", fetchGaReport);
    document.getElementById("downloadGaReportBtn").addEventListener("click", downloadGaReport);
    document.getElementById("downloadGaBtn").addEventListener("click", downloadGaAgg);
    document.getElementById("deleteGaSelectedBtn").addEventListener("click", deleteGaSelected);
    document.getElementById("gaAggFilterCorp").addEventListener("change", function () { fillGaAggFilterOffice(); renderGaAggBody(); });
    document.getElementById("gaAggFilterOffice").addEventListener("change", renderGaAggBody);
    document.getElementById("gaAggBody").addEventListener("click", function (e) {
      var btn = e.target.closest(".ga-del-btn");
      if (!btn) return;
      deleteGaLine(btn.dataset.corp, btn.dataset.office, btn.dataset.category, btn.dataset.kind);
    });
    document.getElementById("closeMonthBtn").addEventListener("click", toggleMonthClosed);
    document.getElementById("adminYm").addEventListener("change", renderMonthStatus);
    refreshClosedMonths();
  });
})();
