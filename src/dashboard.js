// src/dashboard.js
import { formatCurrency } from "./utils.js";
import { getPrices } from "./storage.js";
import { listStudents } from "./student.js";
import { getDailyMealsReport } from "./billing.js";

export function renderAdminDashboard() {
  const dash = document.querySelector("#admin-dashboard");
  if (!dash) return;

  try {
    const today = new Date();
    const report = getDailyMealsReport(today);
    const prices = getPrices() || {};
    const studentCount = listStudents().length;

     if (!report || report instanceof Error) {
      dash.innerHTML = `
        <div class="card-header">
          <div>
            <div class="card-title">Today Overview</div>
            <div class="card-subtitle">${today.toLocaleDateString()}</div>
          </div>
        </div>
        <div class="muted">No data for today.</div>
      `;
      return;
    }

    const summary = report.summary || {};
    const estTotal =
      (summary.breakfastCount || 0) * (prices.breakfast || 0) +
      (summary.lunchCount || 0) * (prices.lunch || 0) +
      (summary.dinnerCount || 0) * (prices.dinner || 0);

    dash.innerHTML = `
      <div class="card-header">
        <div>
          <div class="card-title">Today Overview</div>
          <div class="card-subtitle">${today.toLocaleDateString()}</div>
        </div>
      </div>
      <div class="row">
        <div>
          <div class="muted">Students</div>
          <div><strong>${studentCount}</strong></div>
        </div>
        <div>
          <div class="muted">Breakfast / Lunch / Dinner</div>
          <div><strong>${summary.breakfastCount || 0} / ${
      summary.lunchCount || 0
    } / ${summary.dinnerCount || 0}</strong></div>
        </div>
        <div>
          <div class="muted">Estimated Total</div>
          <div><strong>${formatCurrency(estTotal)}</strong></div>
        </div>
      </div>
    `;
  } catch (e) {
    dash.textContent = "Could not load dashboard.";
  }
}
