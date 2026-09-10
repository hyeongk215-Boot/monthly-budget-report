(function () {
  var ctx = window.loadContext();
  if (!ctx) {
    window.location.href = "index.html";
    return;
  }
  var client = window.getSupabaseClient();
  var closedMonths = [];
  var gaLocked = false;
  var gaBudgetThisMonth = {}; // { category: { fixedCny, variableCny } } for ctx.yearmonth

  function showToast(msg) {
    var el = document.getElementById("toast");
    el.textContent = msg;
    el.classList.add("show");
    setTimeout(function () { el.classList.remove("show"); }, 3000);
  }

  function renderContextBar() {
    var el = document.getElementById("contextBar");
    el.innerHTML =
      "<span><b>" + t("corp") + "</b>: " + window.corpLabel(ctx.corp) + "</span>" +
      "<span><b>" + t("office") + "</b>: " + window.officeLabel(ctx.office) + "</span>" +
      "<span><b>" + t("yearmonth") + "</b>: " + ctx.yearmonth + "</span>" +
      "<span><b>" + t("submitterName") + "</b>: " + ctx.submitter + "</span>";
  }

  function fmt(n) {
    return Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 });
  }

  function renderGrid(existingActual) {
    var byKey = {};
    (existingActual || []).forEach(function (r) { byKey[r.category] = r; });
    var body = document.getElementById("gaBody");
    body.innerHTML = "";
    window.GA_CATEGORIES.forEach(function (cat) {
      var b = gaBudgetThisMonth[cat.code] || {};
      var a = byKey[cat.code] || {};
      var tr = document.createElement("tr");
      tr.innerHTML =
        "<td style='text-align:left;'>" + window.gaCategoryLabel(cat.code) + "</td>" +
        "<td class='budget-cell' data-category='" + cat.code + "' data-field='fixed'>" + fmt(b.fixedCny) + "</td>" +
        "<td class='budget-cell' data-category='" + cat.code + "' data-field='variable'>" + fmt(b.variableCny) + "</td>" +
        "<td><input type='number' step='0.01' data-category='" + cat.code + "' data-field='fixed' class='ga-input' value='" + (a.fixedCny != null ? a.fixedCny : "") + "' " + (gaLocked ? "disabled" : "") + "></td>" +
        "<td><input type='number' step='0.01' data-category='" + cat.code + "' data-field='variable' class='ga-input' value='" + (a.variableCny != null ? a.variableCny : "") + "' " + (gaLocked ? "disabled" : "") + "></td>";
      body.appendChild(tr);
    });
    renderTotals();
  }

  function renderTotals() {
    var budgetFixed = 0, budgetVariable = 0, actualFixed = 0, actualVariable = 0;
    window.GA_CATEGORIES.forEach(function (cat) {
      var b = gaBudgetThisMonth[cat.code] || {};
      budgetFixed += Number(b.fixedCny) || 0;
      budgetVariable += Number(b.variableCny) || 0;
    });
    document.querySelectorAll('.ga-input[data-field="fixed"]').forEach(function (input) { actualFixed += Number(input.value) || 0; });
    document.querySelectorAll('.ga-input[data-field="variable"]').forEach(function (input) { actualVariable += Number(input.value) || 0; });

    var foot = document.getElementById("gaFoot");
    foot.innerHTML =
      "<tr class='subtotal-row'><td style='text-align:left;'>" + t("gaSubtotalRowLabel") + "</td>" +
      "<td>" + fmt(budgetFixed) + "</td><td>" + fmt(budgetVariable) + "</td>" +
      "<td>" + fmt(actualFixed) + "</td><td>" + fmt(actualVariable) + "</td></tr>" +
      "<tr class='subtotal-row'><td style='text-align:left;'>" + t("gaTotalRowLabel") + "</td>" +
      "<td colspan='2'>" + fmt(budgetFixed + budgetVariable) + "</td>" +
      "<td colspan='2'>" + fmt(actualFixed + actualVariable) + "</td></tr>";
  }

  var MONTHS = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
  var PERIODS = [
    { key: "q1", label: "colQ1", months: ["01", "02", "03"] },
    { key: "q2", label: "colQ2", months: ["04", "05", "06"] },
    { key: "q3", label: "colQ3", months: ["07", "08", "09"] },
    { key: "q4", label: "colQ4", months: ["10", "11", "12"] },
    { key: "h1", label: "colH1", months: ["01", "02", "03", "04", "05", "06"] },
    { key: "h2", label: "colH2", months: ["07", "08", "09", "10", "11", "12"] },
    { key: "annual", label: "colAnnual", months: MONTHS }
  ];

  function sumOver(obj, months) {
    var hasAny = false;
    var sum = 0;
    months.forEach(function (m) {
      if (obj[m] != null) { hasAny = true; sum += Number(obj[m]) || 0; }
    });
    return hasAny ? sum : null;
  }

  function renderYtdRecap(target, targetActual) {
    var headRow = document.getElementById("ytdRecapHeadRow");
    headRow.innerHTML = "<th>" + t("colAccount") + "</th>";
    MONTHS.forEach(function (m) {
      var th = document.createElement("th");
      th.textContent = Number(m) + t("monthSuffix");
      headRow.appendChild(th);
    });
    PERIODS.forEach(function (p) {
      var th = document.createElement("th");
      th.textContent = t(p.label);
      th.style.background = "#e6edf7";
      headRow.appendChild(th);
    });
    var body = document.getElementById("ytdRecapBody");
    body.innerHTML = "";
    var targetRow = "<td style='text-align:left;'>" + t("targetProfitRowLabel") + "</td>";
    var actualRow = "<td style='text-align:left;'>" + t("colOperatingProfit") + "</td>";
    MONTHS.forEach(function (m) {
      targetRow += "<td>" + (target[m] != null ? Number(target[m]).toLocaleString() : "-") + "</td>";
      actualRow += "<td>" + (targetActual[m] != null ? Number(targetActual[m]).toLocaleString() : "-") + "</td>";
    });
    PERIODS.forEach(function (p) {
      var tSum = sumOver(target, p.months);
      var aSum = sumOver(targetActual, p.months);
      targetRow += "<td style='background:#f3f6fb; font-weight:700;'>" + (tSum != null ? tSum.toLocaleString() : "-") + "</td>";
      actualRow += "<td style='background:#f3f6fb; font-weight:700;'>" + (aSum != null ? aSum.toLocaleString() : "-") + "</td>";
    });
    var tr1 = document.createElement("tr");
    tr1.innerHTML = targetRow;
    var tr2 = document.createElement("tr");
    tr2.innerHTML = actualRow;
    body.appendChild(tr1);
    body.appendChild(tr2);
  }

  function loadAnnualBudget() {
    var year = String(ctx.yearmonth).slice(0, 4);
    return client.rpc("get_annual_budget", { p_access_key: ctx.accessKey, p_corp: ctx.corp, p_office: ctx.office, p_year: year }).then(function (res) {
      if (res.error) return;
      var data = res.data || {};
      var gaBudget = data.gaBudget || {};
      var mm = String(ctx.yearmonth).slice(5, 7);
      gaBudgetThisMonth = {};
      Object.keys(gaBudget).forEach(function (cat) {
        gaBudgetThisMonth[cat] = (gaBudget[cat] && gaBudget[cat][mm]) || {};
      });
      renderYtdRecap(data.target || {}, data.targetActual || {});
    });
  }

  function applyClosedState() {
    var isClosed = closedMonths.indexOf(ctx.yearmonth) !== -1;
    var banner = document.getElementById("closedBanner");
    banner.style.display = isClosed ? "block" : "none";
    banner.textContent = isClosed ? t("monthClosedBanner", { yearmonth: ctx.yearmonth }) : "";
    if (isClosed) document.getElementById("submitGaBtn").disabled = true;
  }

  function applyLockedState() {
    var banner = document.getElementById("lockedBanner");
    banner.style.display = gaLocked ? "block" : "none";
    banner.textContent = gaLocked ? t("gaActualLockedNote") : "";
    document.getElementById("submitGaBtn").style.display = gaLocked ? "none" : "inline-block";
    document.querySelectorAll(".ga-input").forEach(function (input) { input.disabled = gaLocked; });
  }

  function submitGa() {
    if (closedMonths.indexOf(ctx.yearmonth) !== -1) {
      showToast(t("saveBudgetClosed"));
      return;
    }
    if (gaLocked) {
      showToast(t("gaActualLockedNote"));
      return;
    }
    if (!confirm(t("submitGaActualConfirm"))) return;
    var byKey = {};
    document.querySelectorAll(".ga-input").forEach(function (input) {
      var key = input.dataset.category;
      if (!byKey[key]) byKey[key] = { category: input.dataset.category, kind: "actual", fixedCny: 0, variableCny: 0 };
      byKey[key][input.dataset.field === "fixed" ? "fixedCny" : "variableCny"] = Number(input.value) || 0;
    });
    var lines = Object.keys(byKey).map(function (k) { return byKey[k]; });
    client.rpc("submit_ga_lines", {
      p_access_key: ctx.accessKey,
      p_corp: ctx.corp,
      p_office: ctx.office,
      p_yearmonth: ctx.yearmonth,
      p_submitted_by: ctx.submitter,
      p_lines: lines
    }).then(function (res) {
      if (res.error) {
        var msg = String(res.error.message || "");
        if (msg.indexOf("budget_closed") !== -1) {
          closedMonths.push(ctx.yearmonth);
          applyClosedState();
          showToast(t("saveBudgetClosed"));
        } else if (msg.indexOf("ga_actual_locked") !== -1) {
          gaLocked = true;
          applyLockedState();
          showToast(t("gaActualLockedNote"));
        } else {
          showToast(t("saveTargetProfitFail"));
        }
        return;
      }
      gaLocked = true;
      applyLockedState();
      showToast(t("saveTargetProfitSuccess"));
    }).catch(function () {
      showToast(t("saveTargetProfitFail"));
    });
  }

  function loadAll() {
    if (!client) { showToast(t("fetchFail")); return; }
    Promise.all([
      client.rpc("get_ga_lines", { p_access_key: ctx.accessKey, p_corp: ctx.corp, p_office: ctx.office, p_yearmonth: ctx.yearmonth }),
      window.fetchClosedMonths ? window.fetchClosedMonths() : Promise.resolve([]),
      client.rpc("get_ga_actual_lock", { p_access_key: ctx.accessKey, p_corp: ctx.corp, p_office: ctx.office, p_yearmonth: ctx.yearmonth }),
      loadAnnualBudget()
    ]).then(function (results) {
      renderContextBar();
      var actualOnly = (results[0].data || []).filter(function (r) { return r.kind === "actual"; });
      closedMonths = results[1] || [];
      gaLocked = !!(results[2] && results[2].data);
      renderGrid(actualOnly);
      applyClosedState();
      applyLockedState();
    }).catch(function () {
      showToast(t("fetchFail"));
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    loadAll();
    document.getElementById("submitGaBtn").addEventListener("click", submitGa);
    document.getElementById("gaBody").addEventListener("input", renderTotals);
    document.addEventListener("langchange", function () {
      renderContextBar();
      loadAll();
    });
  });
})();
