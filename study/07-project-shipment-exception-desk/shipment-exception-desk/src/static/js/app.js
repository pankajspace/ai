// Northwind Logistics Exception Desk Frontend Application

document.addEventListener("DOMContentLoaded", () => {
  // Preset definitions
  const PRESETS = {
    delay: {
      text: "My shipment was scheduled for delivery yesterday afternoon. Tracking now indicates a weather delay at the regional depot and delivery is rescheduled for tomorrow.",
      value: 50.0,
      tier: "standard",
    },
    loss: {
      text: "Our pallet of high-end consumer electronics was marked delivered, but our warehouse never received it. The carrier has officially confirmed the cargo was lost in transit.",
      value: 500.0,
      tier: "standard",
    },
    damage: {
      text: "The parcel arrived on time, but the exterior box was crushed and one of the ceramic mugs inside was cracked and unusable.",
      value: 60.0,
      tier: "standard",
    },
    unknown: {
      text: "asdf1234 !!@@##$$ order ?? xx zz 998234 lkjasdf invalid token received",
      value: 10.0,
      tier: "standard",
    },
    premium: {
      text: "Package carton arrived torn and contents slightly scratched. We are a priority enterprise account.",
      value: 120.0,
      tier: "premium",
    },
  };

  // DOM Elements
  const triageForm = document.getElementById("triage-form");
  const reportTextInput = document.getElementById("report-text");
  const shipmentValueInput = document.getElementById("shipment-value");
  const submitBtn = document.getElementById("submit-btn");
  const btnSpinner = submitBtn.querySelector(".btn-spinner");
  const btnText = submitBtn.querySelector(".btn-text");

  // Output Elements
  const statusBanner = document.getElementById("status-banner");
  const bannerTitle = document.getElementById("banner-title");
  const bannerDesc = document.getElementById("banner-desc");
  const bannerIcon = statusBanner.querySelector(".banner-icon");
  const decisionPill = document.getElementById("decision-pill");
  const categoryOutput = document.getElementById("category-output");
  const compOutput = document.getElementById("comp-output");
  const routeOutput = document.getElementById("route-output");
  const pipelineSteps = document.getElementById("pipeline-steps");
  const draftLabel = document.getElementById("draft-label");
  const draftOutput = document.getElementById("draft-output");
  const copyDraftBtn = document.getElementById("copy-draft-btn");

  // Tab & Table Elements
  const tabBtns = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");
  const refreshDataBtn = document.getElementById("refresh-data-btn");
  const clearLogBtn = document.getElementById("clear-log-btn");
  const triageTableBody = document.getElementById("triage-table-body");

  // KPI Elements
  const kpiTotalExceptions = document.getElementById("kpi-total-exceptions");
  const kpiTotalCompensation = document.getElementById("kpi-total-compensation");
  const kpiEscalationRate = document.getElementById("kpi-escalation-rate");
  const kpiEscalationCounts = document.getElementById("kpi-escalation-counts");
  const kpiCostliestCategory = document.getElementById("kpi-costliest-category");
  const kpiCostliestAmount = document.getElementById("kpi-costliest-amount");
  const breakdownTableBody = document.getElementById("breakdown-table-body");

  // 1. Preset Handlers
  document.querySelectorAll(".btn-preset").forEach((btn) => {
    btn.addEventListener("click", () => {
      const presetKey = btn.getAttribute("data-preset");
      const preset = PRESETS[presetKey];
      if (preset) {
        reportTextInput.value = preset.text;
        shipmentValueInput.value = preset.value.toFixed(2);
        const tierRadio = document.querySelector(
          `input[name="customer_tier"][value="${preset.tier}"]`
        );
        if (tierRadio) tierRadio.checked = true;
      }
    });
  });

  // 2. Tab Navigation
  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabBtns.forEach((b) => b.classList.remove("active"));
      tabContents.forEach((c) => c.classList.remove("active"));

      btn.classList.add("active");
      const targetTab = document.getElementById(btn.getAttribute("data-tab"));
      if (targetTab) targetTab.classList.add("active");
    });
  });

  // 3. Form Submission
  triageForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const reportText = reportTextInput.value.trim();
    const shipmentValue = parseFloat(shipmentValueInput.value);
    const selectedTier = document.querySelector(
      'input[name="customer_tier"]:checked'
    )?.value || "standard";

    if (!reportText) {
      alert("Please enter the exception report text.");
      return;
    }

    // Set loading state
    setLoading(true);

    try {
      const response = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          report_text: reportText,
          shipment_value: shipmentValue,
          customer_tier: selectedTier,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Error processing exception report.");
      }

      const data = await response.json();
      displayTriageResult(data);

      // Refresh data tables and summaries
      await refreshData();
    } catch (err) {
      console.error(err);
      alert(`Pipeline error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  });

  function setLoading(isLoading) {
    if (isLoading) {
      submitBtn.disabled = true;
      btnSpinner.classList.remove("hidden");
      btnText.textContent = "Processing via LangChain...";
      statusBanner.className = "status-banner banner-idle";
      bannerIcon.textContent = "⚙️";
      bannerTitle.textContent = "Pipeline Running...";
      bannerDesc.textContent = "Running LLM classification and policy evaluation...";
    } else {
      submitBtn.disabled = false;
      btnSpinner.classList.add("hidden");
      btnText.textContent = "🚀 Triage & Process Exception";
    }
  }

  function displayTriageResult(data) {
    const isEscalated = data.escalated;

    // Status Banner
    if (isEscalated) {
      statusBanner.className = "status-banner banner-escalated";
      bannerIcon.textContent = "🚨";
      bannerTitle.textContent = "ESCALATED TO OPERATIONS MANAGER";
      bannerDesc.textContent = data.escalation_reason;
      decisionPill.className = "badge badge-danger";
      decisionPill.textContent = "Escalated";
      routeOutput.innerHTML = '<span style="color: var(--danger); font-weight: 700;">Manager Queue</span>';
      draftLabel.textContent = "Internal Operations Manager Briefing:";
    } else {
      statusBanner.className = "status-banner banner-resolved";
      bannerIcon.textContent = "✅";
      bannerTitle.textContent = "AUTO-RESOLVED & APPROVED";
      bannerDesc.textContent = `Approved compensation: $${data.compensation_amount.toFixed(2)} under Northwind Policy.`;
      decisionPill.className = "badge badge-success";
      decisionPill.textContent = "Auto-Resolved";
      routeOutput.innerHTML = '<span style="color: var(--success); font-weight: 700;">Auto-Email Sent</span>';
      draftLabel.textContent = "Customer Resolution Email Draft:";
    }

    // Metrics Row
    const catClass = getCategoryBadgeClass(data.category);
    categoryOutput.innerHTML = `<span class="badge ${catClass}">${data.category}</span>`;
    compOutput.textContent = `$${data.compensation_amount.toFixed(2)}`;

    // Steps Trail
    pipelineSteps.innerHTML = "";
    if (data.steps && data.steps.length > 0) {
      data.steps.forEach((step) => {
        const li = document.createElement("li");
        li.textContent = step;
        pipelineSteps.appendChild(li);
      });
    }

    // Draft box
    draftOutput.textContent = data.draft || "No draft generated.";
  }

  function getCategoryBadgeClass(cat) {
    switch (cat.toLowerCase()) {
      case "delayed": return "badge-info";
      case "damaged": return "badge-warning";
      case "lost": return "badge-danger";
      default: return "badge-neutral";
    }
  }

  // 4. Copy Draft to Clipboard
  copyDraftBtn.addEventListener("click", () => {
    const text = draftOutput.textContent;
    if (!text || text.includes("will be generated here")) return;
    navigator.clipboard.writeText(text).then(() => {
      const originalText = copyDraftBtn.textContent;
      copyDraftBtn.textContent = "✅ Copied!";
      setTimeout(() => {
        copyDraftBtn.textContent = originalText;
      }, 2000);
    });
  });

  // 5. Data Refresh (Log & Summary)
  async function refreshData() {
    try {
      const [logRes, summaryRes] = await Promise.all([
        fetch("/api/log"),
        fetch("/api/summary"),
      ]);

      if (logRes.ok) {
        const records = await logRes.json();
        renderLogTable(records);
      }

      if (summaryRes.ok) {
        const summary = await summaryRes.json();
        renderSummary(summary);
      }
    } catch (err) {
      console.error("Failed to refresh session data:", err);
    }
  }

  function renderLogTable(records) {
    if (!records || records.length === 0) {
      triageTableBody.innerHTML = `
        <tr>
          <td colspan="7" class="empty-state">No exceptions processed yet in this session.</td>
        </tr>
      `;
      return;
    }

    triageTableBody.innerHTML = records
      .slice()
      .reverse()
      .map((r) => {
        const isEsc = r.escalated;
        const statusBadge = isEsc
          ? '<span class="badge badge-danger">Escalated</span>'
          : '<span class="badge badge-success">Resolved</span>';
        const catBadge = `<span class="badge ${getCategoryBadgeClass(r.category)}">${r.category}</span>`;
        return `
          <tr>
            <td>${r.timestamp || "—"}</td>
            <td>${catBadge}</td>
            <td>$${parseFloat(r.shipment_value || 0).toFixed(2)}</td>
            <td><strong>$${parseFloat(r.compensation_amount || 0).toFixed(2)}</strong></td>
            <td><span class="badge badge-neutral">${(r.customer_tier || "standard").toUpperCase()}</span></td>
            <td>${statusBadge}</td>
            <td title="${r.escalation_reason || ""}">${(r.escalation_reason || "—").slice(0, 60)}${r.escalation_reason && r.escalation_reason.length > 60 ? "..." : ""}</td>
          </tr>
        `;
      })
      .join("");
  }

  function renderSummary(summary) {
    kpiTotalExceptions.textContent = summary.total_exceptions || 0;
    kpiTotalCompensation.textContent = `$${parseFloat(summary.total_compensation || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    kpiEscalationRate.textContent = `${parseFloat(summary.escalation_rate || 0).toFixed(1)}%`;
    kpiEscalationCounts.textContent = `${summary.escalated_count || 0} escalated / ${summary.resolved_count || 0} resolved`;

    const costliest = (summary.costliest_category || "None").toUpperCase();
    const costliestAmt = parseFloat(summary.costliest_category_amount || 0);
    kpiCostliestCategory.textContent = costliest;
    kpiCostliestAmount.textContent = `$${costliestAmt.toFixed(2)} total payout`;

    // Render category breakdown table
    const breakdown = summary.category_breakdown || {};
    const totalComp = parseFloat(summary.total_compensation || 0);
    const catKeys = Object.keys(breakdown);

    if (catKeys.length === 0 || summary.total_exceptions === 0) {
      breakdownTableBody.innerHTML = `
        <tr>
          <td colspan="5" class="empty-state">No data available yet.</td>
        </tr>
      `;
      return;
    }

    breakdownTableBody.innerHTML = catKeys
      .sort((a, b) => breakdown[b].total_compensation - breakdown[a].total_compensation)
      .map((cat) => {
        const item = breakdown[cat];
        const share = totalComp > 0 ? ((item.total_compensation / totalComp) * 100).toFixed(1) : "0.0";
        return `
          <tr>
            <td><span class="badge ${getCategoryBadgeClass(cat)}">${cat.toUpperCase()}</span></td>
            <td>${item.count}</td>
            <td><strong>$${item.total_compensation.toFixed(2)}</strong></td>
            <td>${item.escalated}</td>
            <td>${share}%</td>
          </tr>
        `;
      })
      .join("");
  }

  refreshDataBtn.addEventListener("click", refreshData);

  // Clear Session Handler
  clearLogBtn.addEventListener("click", async () => {
    if (!confirm("Are you sure you want to clear the daily session ledger?")) return;
    try {
      const res = await fetch("/api/reset", { method: "POST" });
      if (res.ok) {
        await refreshData();
      }
    } catch (err) {
      console.error(err);
    }
  });

  // Initial load
  refreshData();
});

