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
  var accounts = []; // budget rows: [{accountCode, nameKo, nameZh, months:{...}}]

  function showToast(msg) {
    var el = document.getElementById("toast");
    el.textContent = msg;
    el.classList.add("show");
    setTimeout(function () { el.classList.remove("show"); }, 3000);
  }

  function accountLabel(row) {
    return getLang() === "zh" ? row.nameZh : row.nameKo;
  }

  function renderContextBar() {
    var el = document.getElementById("contextBar");
    el.innerHTML =
      "<span><b>" + t("corp") + "</b>: " + window.corpLabel(ctx.corp) + "</span>" +
      "<span><b>" + t("office") + "</b>: " + window.officeLabel(ctx.office) + "</span>" +
      "<span><b>" + t("yearLabel") + "</b>: " + year + "</span>";
  }

  function renderHeadRow(elId) {
    var tr = document.getElementById(elId);
    tr.innerHTML = "<th>" + t("colAccount") + "</th>";
    MONTHS.forEach(function (m) {
      var th = document.createElement("th");
      th.textContent = Number(m) + t("monthSuffix");
      tr.appendChild(th);
    });
  }

  function renderTargetRow(targetMonths) {
    renderHeadRow("targetHeadRow");
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
  }

  function renderBudgetGrid(rows) {
    renderHeadRow("budgetHeadRow");
    var body = document.getElementById("budgetBody");
    body.innerHTML = "";
    rows.forEach(function (row) {
      var tr = document.createElement("tr");
      var cells = "<td style='text-align:left;'>" + accountLabel(row) + "</td>";
      MONTHS.forEach(function (m) {
        var v = row.months && row.months[m] != null ? row.months[m] : "";
        cells += "<td><input type='number' step='0.01' data-code='" + row.accountCode + "' data-month='" + m + "' class='budget-input' value='" + v + "' " + (locked ? "disabled" : "") + "></td>";
      });
      tr.innerHTML = cells;
      body.appendChild(tr);
    });
  }

  function applyLockedState() {
    var banner = document.getElementById("lockedBanner");
    banner.style.display = locked ? "block" : "none";
    banner.textContent = locked ? t("annualLockedNote") : "";
    document.getElementById("submitAnnualBtn").style.display = locked ? "none" : "inline-block";
  }

  function submitAnnual() {
    var lines = accounts.map(function (row) {
      var months = {};
      document.querySelectorAll('.budget-input[data-code="' + row.accountCode + '"]').forEach(function (input) {
        months[input.dataset.month] = Number(input.value) || 0;
      });
      return { accountCode: row.accountCode, months: months };
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
      p_budget_lines: lines,
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
      accounts = data.budget || [];
      renderContextBar();
      renderTargetRow(data.target || {});
      renderBudgetGrid(accounts);
      applyLockedState();
    }).catch(function () {
      showToast(t("fetchFail"));
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    loadAll();
    document.getElementById("submitAnnualBtn").addEventListener("click", submitAnnual);
    document.addEventListener("langchange", function () {
      renderContextBar();
      renderHeadRow("targetHeadRow");
      renderHeadRow("budgetHeadRow");
    });
  });
})();
