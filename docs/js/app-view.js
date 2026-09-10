(function () {
  var ctx = window.loadContext();
  if (!ctx) {
    window.location.href = "index.html";
    return;
  }

  var MONTHS = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
  var year = String(ctx.yearmonth).slice(0, 4);
  var client = window.getSupabaseClient();
  var locked = false;
  var gaBudget = {}; // { category: { "01": {fixedCny, variableCny}, ... } }
  var targetCache = {}; // { "01": amt, ... }

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
      "<span><b>" + t("yearLabel") + "</b>: " + year + "</span>";
  }

  function renderTargetRow(targetMonths) {
    var headRow = document.getElementById("targetHeadRow");
    headRow.innerHTML = "<th>" + t("colAccount") + "</th>";
    MONTHS.forEach(function (m) {
      var th = document.createElement("th");
      th.textContent = Number(m) + t("monthSuffix");
      headRow.appendChild(th);
    });
    var thTotal = document.createElement("th");
    thTotal.textContent = t("annualTotalLabel");
    headRow.appendChild(thTotal);

    var body = document.getElementById("targetBody");
    body.innerHTML = "";
    var tr = document.createElement("tr");
    var cells = "<td style='text-align:left;'>" + t("targetProfitRowLabel") + "</td>";
    MONTHS.forEach(function (m) {
      var v = targetMonths[m] != null ? targetMonths[m] : "";
      cells += "<td><input type='number' step='0.01' data-month='" + m + "' class='target-input' value='" + v + "' " + (locked ? "disabled" : "") + "></td>";
    });
    tr.innerHTML = cells;
    body.appendChild(tr);
    var tdTotal = document.createElement("td");
    tdTotal.id = "targetAnnualTotal";
    tdTotal.style.fontWeight = "700";
    tr.appendChild(tdTotal);
    updateTargetTotal();
  }

  function updateTargetTotal() {
    var sum = 0;
    document.querySelectorAll(".target-input").forEach(function (input) {
      sum += Number(input.value) || 0;
    });
    var el = document.getElementById("targetAnnualTotal");
    if (el) el.textContent = sum.toLocaleString();
  }

  function renderBudgetHead() {
    var row1 = document.getElementById("budgetHeadRow1");
    var row2 = document.getElementById("budgetHeadRow2");
    row1.innerHTML = "<th rowspan='2'>" + t("colCategory") + "</th>";
    row2.innerHTML = "";
    MONTHS.forEach(function (m) {
      var th1 = document.createElement("th");
      th1.colSpan = 2;
      th1.textContent = Number(m) + t("monthSuffix");
      row1.appendChild(th1);
      var thF = document.createElement("th");
      thF.textContent = t("colFixed");
      var thV = document.createElement("th");
      thV.textContent = t("colVariable");
      row2.appendChild(thF);
      row2.appendChild(thV);
    });
    var thTotal1 = document.createElement("th");
    thTotal1.colSpan = 2;
    thTotal1.textContent = t("annualTotalLabel");
    row1.appendChild(thTotal1);
    var thTotalF = document.createElement("th");
    thTotalF.textContent = t("colFixed");
    var thTotalV = document.createElement("th");
    thTotalV.textContent = t("colVariable");
    row2.appendChild(thTotalF);
    row2.appendChild(thTotalV);
  }

  function renderBudgetGrid() {
    renderBudgetHead();
    var body = document.getElementById("budgetBody");
    body.innerHTML = "";
    window.GA_CATEGORIES.forEach(function (cat) {
      var months = gaBudget[cat.code] || {};
      var tr = document.createElement("tr");
      var cells = "<td style='text-align:left;'>" + window.gaCategoryLabel(cat.code) + "</td>";
      MONTHS.forEach(function (m) {
        var v = months[m] || {};
        cells +=
          "<td><input type='number' step='0.01' data-category='" + cat.code + "' data-month='" + m + "' data-field='fixed' class='ga-budget-input' value='" + (v.fixedCny != null ? v.fixedCny : "") + "' " + (locked ? "disabled" : "") + "></td>" +
          "<td><input type='number' step='0.01' data-category='" + cat.code + "' data-month='" + m + "' data-field='variable' class='ga-budget-input' value='" + (v.variableCny != null ? v.variableCny : "") + "' " + (locked ? "disabled" : "") + "></td>";
      });
      cells += "<td class='cat-total-fixed' style='font-weight:700;'>-</td><td class='cat-total-variable' style='font-weight:700;'>-</td>";
      tr.innerHTML = cells;
      tr.dataset.category = cat.code;
      body.appendChild(tr);
    });
    updateBudgetTotals();
  }

  function updateBudgetTotals() {
    window.GA_CATEGORIES.forEach(function (cat) {
      var tr = document.querySelector('#budgetBody tr[data-category="' + cat.code + '"]');
      if (!tr) return;
      var fixedSum = 0, variableSum = 0;
      tr.querySelectorAll('.ga-budget-input[data-field="fixed"]').forEach(function (input) { fixedSum += Number(input.value) || 0; });
      tr.querySelectorAll('.ga-budget-input[data-field="variable"]').forEach(function (input) { variableSum += Number(input.value) || 0; });
      tr.querySelector(".cat-total-fixed").textContent = fixedSum.toLocaleString();
      tr.querySelector(".cat-total-variable").textContent = variableSum.toLocaleString();
    });
  }

  function applyLockedState() {
    var banner = document.getElementById("lockedBanner");
    banner.style.display = locked ? "block" : "none";
    banner.textContent = locked ? t("annualLockedNote") : "";
    document.getElementById("submitAnnualBtn").style.display = locked ? "none" : "inline-block";
  }

  function submitAnnual() {
    var lines = window.GA_CATEGORIES.map(function (cat) {
      var months = {};
      document.querySelectorAll('.ga-budget-input[data-category="' + cat.code + '"]').forEach(function (input) {
        var m = input.dataset.month;
        if (!months[m]) months[m] = { fixedCny: 0, variableCny: 0 };
        months[m][input.dataset.field === "fixed" ? "fixedCny" : "variableCny"] = Number(input.value) || 0;
      });
      return { category: cat.code, months: months };
    });
    var targetMonths = {};
    document.querySelectorAll(".target-input").forEach(function (input) {
      targetMonths[input.dataset.month] = Number(input.value) || 0;
    });

    if (!confirm(t("submitAnnualConfirm"))) return;

    client.rpc("submit_annual_budget", {
      p_access_key: ctx.accessKey,
      p_corp: ctx.corp,
      p_office: ctx.office,
      p_year: year,
      p_ga_budget_lines: lines,
      p_target_months: targetMonths,
      p_submitted_by: ctx.submitter
    }).then(function (res) {
      if (res.error) {
        if (String(res.error.message || "").indexOf("annual_locked") !== -1) {
          showToast(t("submitAnnualLockedFail"));
        } else {
          showToast(t("saveBudgetFail"));
        }
        return;
      }
      showToast(t("saveBudgetSuccess"));
      loadAll();
    }).catch(function () {
      showToast(t("saveBudgetFail"));
    });
  }

  function loadAll() {
    if (!client) {
      showToast(t("fetchFail"));
      return;
    }
    client.rpc("get_annual_budget", { p_access_key: ctx.accessKey, p_corp: ctx.corp, p_office: ctx.office, p_year: year }).then(function (res) {
      if (res.error) throw res.error;
      var data = res.data || {};
      locked = !!data.locked;
      gaBudget = data.gaBudget || {};
      targetCache = data.target || {};
      renderContextBar();
      renderTargetRow(targetCache);
      renderBudgetGrid();
      applyLockedState();
    }).catch(function () {
      showToast(t("fetchFail"));
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    loadAll();
    document.getElementById("submitAnnualBtn").addEventListener("click", submitAnnual);
    document.getElementById("targetBody").addEventListener("input", updateTargetTotal);
    document.getElementById("budgetBody").addEventListener("input", updateBudgetTotals);
    document.addEventListener("langchange", function () {
      renderContextBar();
      renderTargetRow(targetCache);
      renderBudgetGrid();
    });
  });
})();
