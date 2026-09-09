(function () {
  var ctx = window.loadContext();
  if (!ctx) {
    window.location.href = "index.html";
    return;
  }
  var client = window.getSupabaseClient();
  var closedMonths = [];

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

  function renderGrid(existing) {
    var byKey = {};
    (existing || []).forEach(function (r) { byKey[r.category + "::" + r.kind] = r; });
    var body = document.getElementById("gaBody");
    body.innerHTML = "";
    window.GA_CATEGORIES.forEach(function (cat) {
      var b = byKey[cat.code + "::budget"] || {};
      var a = byKey[cat.code + "::actual"] || {};
      var tr = document.createElement("tr");
      tr.innerHTML =
        "<td style='text-align:left;'>" + window.gaCategoryLabel(cat.code) + "</td>" +
        "<td><input type='number' step='0.01' data-category='" + cat.code + "' data-kind='budget' data-field='fixed' class='ga-input' value='" + (b.fixedCny != null ? b.fixedCny : "") + "'></td>" +
        "<td><input type='number' step='0.01' data-category='" + cat.code + "' data-kind='budget' data-field='variable' class='ga-input' value='" + (b.variableCny != null ? b.variableCny : "") + "'></td>" +
        "<td><input type='number' step='0.01' data-category='" + cat.code + "' data-kind='actual' data-field='fixed' class='ga-input' value='" + (a.fixedCny != null ? a.fixedCny : "") + "'></td>" +
        "<td><input type='number' step='0.01' data-category='" + cat.code + "' data-kind='actual' data-field='variable' class='ga-input' value='" + (a.variableCny != null ? a.variableCny : "") + "'></td>";
      body.appendChild(tr);
    });
  }

  function applyClosedState() {
    var isClosed = closedMonths.indexOf(ctx.yearmonth) !== -1;
    var banner = document.getElementById("closedBanner");
    banner.style.display = isClosed ? "block" : "none";
    banner.textContent = isClosed ? t("monthClosedBanner", { yearmonth: ctx.yearmonth }) : "";
    document.getElementById("submitGaBtn").disabled = isClosed;
  }

  function submitGa() {
    if (closedMonths.indexOf(ctx.yearmonth) !== -1) {
      showToast(t("saveBudgetClosed"));
      return;
    }
    var byKey = {};
    document.querySelectorAll(".ga-input").forEach(function (input) {
      var key = input.dataset.category + "::" + input.dataset.kind;
      if (!byKey[key]) byKey[key] = { category: input.dataset.category, kind: input.dataset.kind, fixedCny: 0, variableCny: 0 };
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
        if (String(res.error.message || "").indexOf("budget_closed") !== -1) {
          closedMonths.push(ctx.yearmonth);
          applyClosedState();
          showToast(t("saveBudgetClosed"));
        } else {
          showToast(t("saveTargetProfitFail"));
        }
        return;
      }
      showToast(t("saveTargetProfitSuccess"));
    }).catch(function () {
      showToast(t("saveTargetProfitFail"));
    });
  }

  function loadAll() {
    if (!client) { showToast(t("fetchFail")); return; }
    Promise.all([
      client.rpc("get_ga_lines", { p_access_key: ctx.accessKey, p_corp: ctx.corp, p_office: ctx.office, p_yearmonth: ctx.yearmonth }),
      window.fetchClosedMonths ? window.fetchClosedMonths() : Promise.resolve([])
    ]).then(function (results) {
      renderContextBar();
      renderGrid(results[0].data || []);
      closedMonths = results[1] || [];
      applyClosedState();
    }).catch(function () {
      showToast(t("fetchFail"));
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    loadAll();
    document.getElementById("submitGaBtn").addEventListener("click", submitGa);
    document.addEventListener("langchange", function () {
      renderContextBar();
      loadAll();
    });
  });
})();
