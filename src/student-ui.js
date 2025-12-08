// src/student-ui.js
import { MealType } from "./models.js";
import { getMenu } from "./storage.js";
import { findStudent } from "./student.js";
import {
  bookMeal,
  cancelMeal,
  getBookingForDate
} from "./meal.js";
import { getRangeMealsReport } from "./billing.js";

import {
  qs,
  formatCurrency,
  capitalize,
  parseDateInputValue,
  addDays,
  getSelectedBookingDate
} from "./utils.js";

function renderBookingHistoryForRoll(_roll) {}

export function renderTodayMenu() {
  const menuDiv = qs("#today-menu");
  const menu = getMenu();
  menuDiv.innerHTML = `
    <div><strong>Breakfast:</strong> ${menu.breakfast}</div>
    <div><strong>Lunch:</strong> ${menu.lunch}</div>
    <div><strong>Dinner:</strong> ${menu.dinner}</div>
  `;
}

export function updateBookingStatus() {
  const roll = qs("#stu-roll").value.trim();
  const statusDiv = qs("#booking-status");
  if (!roll) {
    statusDiv.textContent = "Enter roll & load profile.";
    return;
  }
  const date = getSelectedBookingDate();
  const booking = getBookingForDate(roll, date);
  if (!booking) {
    statusDiv.innerHTML = `<span class="badge badge-warning">No meals booked for this date.</span>`;
    return;
  }
  const statuses = [
    ["Breakfast", booking.breakfast],
    ["Lunch", booking.lunch],
    ["Dinner", booking.dinner]
  ]
    .map(
      ([label, booked]) =>
        `<span class="badge ${booked ? "badge-success" : ""}">
          ${label}: ${booked ? "Booked" : "Not booked"}
        </span>`
    )
    .join(" ");
  statusDiv.innerHTML = statuses;
}

export function handleBookingAction(action, mealType) {
  const roll = qs("#stu-roll").value.trim();
  const msg = qs("#booking-message");
  msg.style.color = "#6b7280";
  msg.textContent = "";
  if (!roll) {
    msg.textContent = "Please enter your roll number first.";
    msg.style.color = "#b91c1c";
    return;
  }
  const date = getSelectedBookingDate();
  const result =
    action === "book" ? bookMeal(roll, mealType, date) : cancelMeal(roll, mealType, date);
  if (result instanceof Error) {
    msg.textContent = result.message || "Something went wrong.";
    msg.style.color = "#b91c1c";
  } else {
    if (result.ok) {
      msg.textContent =
        result.message ||
        (action === "book"
          ? "Meal booked successfully."
          : "Meal cancelled successfully.");
      msg.style.color = "#15803d";
    } else {
      msg.textContent =
        result.message ||
        (action === "cancel"
          ? "You can no longer cancel this meal."
          : "Action could not be completed.");
      msg.style.color = "#b91c1c";
    }
  }
  updateBookingStatus();

  renderBookingHistoryForRoll(roll);
}

export function initBulkBooking() {
  const bulkMsg = qs("#bulk-message");
  function doBulk(action) {
    const roll = qs("#stu-roll").value.trim();
    if (!roll) {
      bulkMsg.textContent = "Load profile with roll number first.";
      bulkMsg.style.color = "#b91c1c";
      return;
    }
    const startStr = qs("#bulk-start").value;
    const days = Number(qs("#bulk-days").value || 0);
    if (!startStr || days <= 0) {
      bulkMsg.textContent = "Enter a valid start date and number of days.";
      bulkMsg.style.color = "#b91c1c";
      return;
    }
    const bf = qs("#bulk-bf").checked;
    const ln = qs("#bulk-lunch").checked;
    const dn = qs("#bulk-dinner").checked;
    if (!bf && !ln && !dn) {
      bulkMsg.textContent = "Select at least one meal.";
      bulkMsg.style.color = "#b91c1c";
      return;
    }
    const startDate = parseDateInputValue(startStr);
    let successCount = 0;
    for (let i = 0; i < days; i++) {
      const d = addDays(startDate, i);
      if (bf) {
        if (action === "book") {
          bookMeal(roll, MealType.Breakfast, d);
        } else {
          cancelMeal(roll, MealType.Breakfast, d);
        }
      }
      if (ln) {
        if (action === "book") {
          bookMeal(roll, MealType.Lunch, d);
        } else {
          cancelMeal(roll, MealType.Lunch, d);
        }
      }
      if (dn) {
        if (action === "book") {
          bookMeal(roll, MealType.Dinner, d);
        } else {
          cancelMeal(roll, MealType.Dinner, d);
        }
      }
      successCount++;
    }
    bulkMsg.textContent =
      successCount +
      " days " +
      (action === "book" ? "booked." : "cancelled.");
    bulkMsg.style.color = "#15803d";
    updateBookingStatus();
  }
  qs("#btn-bulk-book").addEventListener("click", () => doBulk("book"));
  qs("#btn-bulk-cancel").addEventListener("click", () => doBulk("cancel"));
}

export function initStudentPanel() {
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const todayLabel = qs("#today-label");
  todayLabel.textContent = today.toLocaleDateString();
  const dateInput = document.querySelector("#booking-date");

  if (dateInput) {
    dateInput.value = todayStr;
    dateInput.addEventListener("change", () => {
      updateBookingStatus();
    });
  }

  const bulkStart = document.querySelector("#bulk-start");
  if (bulkStart) {
    bulkStart.value = todayStr;
  }
  renderTodayMenu();

  const rollInput = qs("#stu-roll");
  const msg = qs("#stu-message");
  const profileDiv = qs("#stu-profile-content");
  const balanceBadge = qs("#stu-balance-badge");

  function loadStudentProfile() {
    const roll = rollInput.value.trim();
    if (!roll) {
      msg.textContent = "Enter roll number.";
      profileDiv.textContent = "No profile loaded.";
      balanceBadge.textContent = "";
      renderBookingHistoryForRoll(null);
      return;
    }

    const student = findStudent(roll);
    if (!student) {
      msg.textContent = "Student not found.";
      profileDiv.textContent = "No profile loaded.";
      balanceBadge.textContent = "";
      renderBookingHistoryForRoll(null);
      return;
    }
    msg.textContent = "";
    profileDiv.innerHTML = `
      <div><strong>${student.name}</strong> (${student.rollNo})</div>
      <div>Room: ${student.roomNumber}</div>
    `;
    balanceBadge.textContent = `Remaining Balance: ${formatCurrency(
      student.currentBalance
    )}`;
    updateBookingStatus();
    renderBookingHistoryForRoll(roll);
  }

  qs("#btn-stu-load").addEventListener("click", loadStudentProfile);

  rollInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      loadStudentProfile();
    }
  });

  document.querySelectorAll("[data-book]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const meal = btn.dataset.book;
      const key = capitalize(meal);
      handleBookingAction("book", MealType[key]);
    });
  });
  document.querySelectorAll("[data-cancel]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const meal = btn.dataset.cancel;
      const key = capitalize(meal);
      handleBookingAction("cancel", MealType[key]);
    });
  });
  initBulkBooking();
}

export function initStudentBillSummary() {
  const btn = document.querySelector("#btn-stu-bill");
  const fromInput = document.querySelector("#stu-bill-from");
  const toInput = document.querySelector("#stu-bill-to");
  const resultDiv = document.querySelector("#stu-bill-result");
  if (!btn || !fromInput || !toInput || !resultDiv) return;

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    .toISOString()
    .slice(0, 10);
  fromInput.value = firstOfMonth;
  toInput.value = todayStr;

  btn.addEventListener("click", () => {
    const rollInput = document.querySelector("#stu-roll");
    const roll = rollInput ? rollInput.value.trim() : "";
    resultDiv.style.color = "#374151";

    if (!roll) {
      resultDiv.textContent = "Load your profile with roll number first.";
      resultDiv.style.color = "#b91c1c";
      return;
    }

    const fromStr = fromInput.value;
    const toStr = toInput.value;
    if (!fromStr || !toStr) {
      resultDiv.textContent = "Please select both From and To dates.";
      resultDiv.style.color = "#b91c1c";
      return;
    }

    const from = parseDateInputValue(fromStr);
    const to = parseDateInputValue(toStr);

    try {
      const report = getRangeMealsReport(from, to);
      if (!report || report instanceof Error) {
        resultDiv.textContent =
          (report && report.message) || "Could not load bill data.";
        resultDiv.style.color = "#b91c1c";
        return;
      }

      const list = report.byStudent || [];
      const stu = list.find((s) => s.rollNo === roll);

      if (!stu) {
        resultDiv.textContent = "No meals found in this date range.";
        resultDiv.style.color = "#b91c1c";
        return;
      }

      const label = `${fromStr} to ${toStr}`;
      resultDiv.style.color = "#374151";
      resultDiv.innerHTML = `
        <div style="margin-bottom:10px;">
          <strong>Bill for:</strong> ${stu.name} (${stu.rollNo})<br/>
          <span class="muted">Period: ${label}</span>
        </div>

        <div class="table-wrapper" style="max-height:none;">
          <table class="billing-table">
            <thead>
              <tr>
                <th>Meal</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Breakfast</td>
                <td>${stu.breakfast || 0}</td>
              </tr>
              <tr>
                <td>Lunch</td>
                <td>${stu.lunch || 0}</td>
              </tr>
              <tr>
                <td>Dinner</td>
                <td>${stu.dinner || 0}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style="margin-top:12px; font-size:1.05rem;">
          <strong>Total Amount:</strong> ${formatCurrency(stu.total || 0)}
        </div>
      `;
    } catch (e) {
      resultDiv.textContent =
        (e && e.message) || "Could not calculate bill.";
      resultDiv.style.color = "#b91c1c";
    }
  });
}
