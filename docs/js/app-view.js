(function () {
  var ctx = window.loadContext();
  if (!ctx) {
    window.location.href = "index.html";
    return;
  }

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
      "<span><b>" + t("yearmonth") + "</b>: " + ctx.yearmonth + "</span>";
  }

  function accountLabel(row) {
    return getLang() === "zh" ? row.nameZh : row.nameKo;
  }

  function varianceCell(budget, actual) {
    if (!budget) {
      return "<span class='variance-badge na'>" + t("varianceNa") + "</span>";
    }
    var pct = Math.round((actual / budget) * 100);
    if (actual > budget) {
      return "<span class='variance-badge over'>" + t("varianceOver", { pct: pct }) + "</span>";
    }
    return "<span class='variance-badge under'>" + t("varianceUnder", { pct: pct }) + "</span>";
  }

  var lastRows = [];

  function renderTable() {
    var body = document.getElementById("budgetBody");
    body.innerHTML = "";
    lastRows.forEach(function (row) {
      var tr = document.createElement("tr");
      if (row.isSubtotal) {
        tr.className = "subtotal-row";
      } else if (row.budgetCny && row.actualCny > row.budgetCny) {
        tr.className = "over-budget";
      } else if (row.budgetCny) {
        tr.className = "under-budget";
      }
      tr.innerHTML =
        "<td style='text-align:left;'>" + accountLabel(row) + "</td>" +
        "<td>" + Number(row.budgetCny).toLocaleString(undefined, { maximumFractionDigits: 2 }) + "</td>" +
        "<td>" + Number(row.actualCny).toLocaleString(undefined, { maximumFractionDigits: 2 }) + "</td>" +
        "<td>" + varianceCell(Number(row.budgetCny), Number(row.actualCny)) + "</td>";
      body.appendChild(tr);
    });
  }

  function loadAll() {
    var client = window.getSupabaseClient();
    if (!client) {
      showToast(t("fetchFail"));
      return;
    }
    client.rpc("get_budget", { p_access_key: ctx.accessKey, p_corp: ctx.corp, p_yearmonth: ctx.yearmonth }).then(function (res) {
      if (res.error) throw res.error;
      lastRows = res.data || [];
      renderContextBar();
      renderTable();
    }).catch(function () {
      showToast(t("fetchFail"));
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    loadAll();
    document.addEventListener("langchange", function () {
      renderContextBar();
      renderTable();
    });
  });
})();
