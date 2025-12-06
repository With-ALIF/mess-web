import { MealType } from "./models.js";
import {
  getMenu,
  saveMenu,
  getPrices,
  savePrices,
  exportAllData,
  importAllData
} from "./storage.js";
import {
  listStudents,
  registerStudent,
  findStudent,
  updateStudent,
  deleteStudent
} from "./student.js";
import { bookMeal, cancelMeal, getBookingForDate } from "./meal.js";
import {
  calculateMonthlyBill,
  formatMonthYear,
  getDailyMealsReport,
  getMonthlyMealsReport,
  getRangeMealsReport
} from "./billing.js";
import {
  isAdminLoggedIn,
  loginAdmin,
  logoutAdmin,
  getAdminUsername
} from "./auth.js";

function qs(selector) {
  const el = document.querySelector(selector);
  if (!el) throw new Error("Element not found: " + selector);
  return el;
}

function formatCurrency(x) {
  return Number(x || 0).toFixed(2);
}

function capitalize(s) {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function parseDateInputValue(value) {
  if (!value) return null;
  return new Date(value + "T00:00:00");
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function getSelectedBookingDate() {
  const inp = document.querySelector("#booking-date");
  if (!inp || !inp.value) return new Date();
  return parseDateInputValue(inp.value);
}

let currentEditingRoll = null;

function renderAppShell() {
  const root = qs(".root");
  root.innerHTML = `
    <div class="app-card">
      <div class="app-header">
        <div>
          <div class="app-title">Student Hall Mess Management</div>
        </div>
        <div class="tabs">
          <button class="tab-btn active" data-tab="student">Student</button>
          <button class="tab-btn" data-tab="admin">Admin</button>
        </div>
      </div>

      <div class="tabs-content">
        <div class="tab-panel" data-panel="student" style="display:block;">
          <div class="layout">
            <div>
              <div class="card">
                <div class="card-header">
                  <div>
                    <div class="card-title">Student Login</div>
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">Roll No</label>
                  <input id="stu-roll" class="form-input" />
                </div>
                <div class="form-group">
                  <button class="btn btn-primary" id="btn-stu-load">Load Profile</button>
                  <span id="stu-message" class="muted"></span>
                </div>
              </div>

              <div class="section-spacer"></div>

              <div class="card">
                <div class="card-header">
                  <div>
                    <div class="card-title">Profile</div>
                    <div class="card-subtitle">Information & balance</div>
                  </div>
                  <span id="stu-balance-badge" class="badge badge-success"></span>
                </div>
                <div id="stu-profile-content" class="muted">Load your profile first.</div>
              </div>
            </div>

            <div>
              <div class="card">
                <div class="card-header">
                  <div>
                    <div class="card-title">Menu & Booking</div>
                    <div class="card-subtitle">Book / cancel meals for a date</div>
                  </div>
                  <div>
                    <div class="muted" style="font-size:12px; text-align:right;">Select Date</div>
                    <input id="booking-date" type="date" class="form-input" style="max-width:150px;" />
                    <div id="today-label" class="badge" style="margin-top:4px;"></div>
                  </div>
                </div>

                <div id="today-menu" class="muted"></div>
                <div class="section-spacer"></div>

                <div class="form-group">
                  <div class="card-subtitle" style="margin-bottom:6px;">Booking Status</div>
                  <div id="booking-status" class="muted">Load profile to see status</div>
                </div>

                <div class="form-group">
                  <div class="card-subtitle" style="margin-bottom:6px;">Actions</div>
                  <div class="row">
                    <div>
                      <div class="muted">Breakfast</div>
                      <button class="btn btn-primary" data-book="breakfast">Book</button>
                      <button class="btn btn-secondary" data-cancel="breakfast">Cancel</button>
                    </div>
                    <div>
                      <div class="muted">Lunch</div>
                      <button class="btn btn-primary" data-book="lunch">Book</button>
                      <button class="btn btn-secondary" data-cancel="lunch">Cancel</button>
                    </div>
                    <div>
                      <div class="muted">Dinner</div>
                      <button class="btn btn-primary" data-book="dinner">Book</button>
                      <button class="btn btn-secondary" data-cancel="dinner">Cancel</button>
                    </div>
                  </div>
                </div>

                <div class="form-group">
                  <span id="booking-message" class="muted"></span>
                </div>
              </div>

              <div class="section-spacer"></div>

              <div class="card">
                <div class="card-header">
                  <div>
                    <div class="card-title">Bulk Booking</div>
                    <div class="card-subtitle">Next days booking / cancel</div>
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">Start Date</label>
                  <input id="bulk-start" type="date" class="form-input" />
                </div>

                <div class="form-group">
                  <label class="form-label">Days</label>
                  <input id="bulk-days" type="number" class="form-input" value="7" min="1" />
                </div>

                <div class="form-group">
                  <label class="form-label">Meals</label>
                  <div class="row">
                    <label><input type="checkbox" id="bulk-bf" checked /> Breakfast</label>
                    <label><input type="checkbox" id="bulk-lunch" checked /> Lunch</label>
                    <label><input type="checkbox" id="bulk-dinner" checked /> Dinner</label>
                  </div>
                </div>

                <div class="form-group">
                  <button class="btn btn-primary" id="btn-bulk-book">Bulk Book</button>
                  <button class="btn btn-secondary" id="btn-bulk-cancel">Bulk Cancel</button>
                  <span id="bulk-message" class="muted"></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="tab-panel" data-panel="admin" style="display:none;">
          <div class="card" id="admin-login-card">
            <div class="card-header">
              <div>
                <div class="card-title">Admin Panel</div>
                <div class="card-subtitle">Login to manage system</div>
              </div>
              <button class="btn btn-secondary" id="btn-admin-logout" style="display:none;">Logout</button>
            </div>

            <div class="form-group">
              <label class="form-label">Username</label>
              <input id="admin-user" class="form-input" value="${getAdminUsername()}" disabled />
            </div>

            <div class="form-group" id="admin-pass-group">
              <label class="form-label">Password</label>
              <input id="admin-pass" type="password" class="form-input" placeholder="Enter admin password" />
            </div>

            <div class="form-group">
              <button class="btn btn-primary" id="btn-admin-login">Login</button>
              <span id="admin-login-message" class="muted"></span>
            </div>
          </div>

          <div id="admin-content" style="display:none;"></div>
        </div>
      </div>
    </div>
  `;
}

function initTabs() {
  const buttons = document.querySelectorAll(".tab-btn");
  const panels = document.querySelectorAll(".tab-panel");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.tab;
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      panels.forEach((p) => {
        p.style.display = p.dataset.panel === target ? "block" : "none";
      });
    });
  });
}

function renderTodayMenu() {
  const menuDiv = qs("#today-menu");
  const menu = getMenu();
  menuDiv.innerHTML = `
    <div><strong>Breakfast:</strong> ${menu.breakfast}</div>
    <div><strong>Lunch:</strong> ${menu.lunch}</div>
    <div><strong>Dinner:</strong> ${menu.dinner}</div>
  `;
}

function updateBookingStatus() {
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

function handleBookingAction(action, mealType) {
  const roll = qs("#stu-roll").value.trim();
  const msg = qs("#booking-message");
  msg.style.color = "#6b7280";
  msg.textContent = "";
  if (!roll) {
    msg.textContent = "Please enter your roll number first.";
    msg.style.color = "red";
    return;
  }
  const date = getSelectedBookingDate();
  const result =
    action === "book" ? bookMeal(roll, mealType, date) : cancelMeal(roll, mealType, date);
  if (result instanceof Error) {
    msg.textContent = result.message || "Something went wrong.";
    msg.style.color = "red";
  } else {
    if (result.ok) {
      msg.textContent =
        result.message ||
        (action === "book"
          ? "Meal booked successfully."
          : "Meal cancelled successfully.");
      msg.style.color = "green";
    } else {
      msg.textContent =
        result.message ||
        (action === "cancel"
          ? "You can no longer cancel this meal."
          : "Action could not be completed.");
      msg.style.color = "red";
    }
  }
  updateBookingStatus();
}

function initBulkBooking() {
  const bulkMsg = qs("#bulk-message");
  function doBulk(action) {
    const roll = qs("#stu-roll").value.trim();
    if (!roll) {
      bulkMsg.textContent = "আগে Roll দিয়ে প্রোফাইল লোড করুন।";
      bulkMsg.style.color = "red";
      return;
    }
    const startStr = qs("#bulk-start").value;
    const days = Number(qs("#bulk-days").value || 0);
    if (!startStr || days <= 0) {
      bulkMsg.textContent = "Valid শুরু তারিখ ও দিনের সংখ্যা দিন।";
      bulkMsg.style.color = "red";
      return;
    }
    const bf = qs("#bulk-bf").checked;
    const ln = qs("#bulk-lunch").checked;
    const dn = qs("#bulk-dinner").checked;
    if (!bf && !ln && !dn) {
      bulkMsg.textContent = "কমপক্ষে একটি মিল নির্বাচন করুন।";
      bulkMsg.style.color = "red";
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
      " দিনের জন্য " +
      (action === "book" ? "বুক" : "ক্যান্সেল") +
      " করা হয়েছে।";
    bulkMsg.style.color = "#16a34a";
    updateBookingStatus();
  }
  qs("#btn-bulk-book").addEventListener("click", () => doBulk("book"));
  qs("#btn-bulk-cancel").addEventListener("click", () => doBulk("cancel"));
}

function initStudentPanel() {
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
  qs("#btn-stu-load").addEventListener("click", () => {
    const roll = qs("#stu-roll").value.trim();
    const msg = qs("#stu-message");
    const profileDiv = qs("#stu-profile-content");
    const balanceBadge = qs("#stu-balance-badge");
    if (!roll) {
      msg.textContent = "Enter roll number.";
      profileDiv.textContent = "No profile loaded.";
      balanceBadge.textContent = "";
      return;
    }
    const student = findStudent(roll);
    if (!student) {
      msg.textContent = "Student not found.";
      profileDiv.textContent = "No profile loaded.";
      balanceBadge.textContent = "";
      return;
    }
    msg.textContent = "";
    profileDiv.innerHTML = `
      <div><strong>${student.name}</strong> (${student.rollNo})</div>
      <div>Room: ${student.roomNumber}</div>
    `;
    balanceBadge.textContent = `Balance: ${formatCurrency(
      student.currentBalance
    )}`;
    updateBookingStatus();
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

function renderStudentsTable() {
  const tbody = qs("#students-tbody");
  const students = listStudents();
  if (!students.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="muted">No students registered yet.</td></tr>`;
    return;
  }
  tbody.innerHTML = students
    .map(
      (s) => `
    <tr>
      <td>${s.name}</td>
      <td>${s.rollNo}</td>
      <td>${s.roomNumber}</td>
      <td>${formatCurrency(s.currentBalance)}</td>
      <td>
        <button class="btn btn-secondary btn-sm" data-edit-roll="${s.rollNo}">Edit</button>
        <button class="btn btn-danger btn-sm" data-delete-roll="${s.rollNo}">Delete</button>
      </td>
    </tr>
  `
    )
    .join("");
}

function populateBillingStudentSelect() {
  const sel = qs("#bill-roll");
  const students = listStudents();
  sel.innerHTML = "";
  if (!students.length) {
    sel.innerHTML = `<option value="">No students</option>`;
    return;
  }
  students.forEach((s) => {
    const opt = document.createElement("option");
    opt.value = s.rollNo;
    opt.textContent = `${s.rollNo} - ${s.name}`;
    sel.appendChild(opt);
  });
}

function renderAdminContent() {
  const adminContent = qs("#admin-content");
  const prices = getPrices();
  const menu = getMenu();
  adminContent.innerHTML = `
    <div class="layout">
      <div>
        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-title">Today's Menu</div>
              <div class="card-subtitle">Set today's items</div>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Breakfast</label>
            <input id="admin-menu-breakfast" class="form-input" value="${menu.breakfast}" />
          </div>
          <div class="form-group">
            <label class="form-label">Lunch</label>
            <input id="admin-menu-lunch" class="form-input" value="${menu.lunch}" />
          </div>
          <div class="form-group">
            <label class="form-label">Dinner</label>
            <input id="admin-menu-dinner" class="form-input" value="${menu.dinner}" />
          </div>
          <div class="form-group">
            <button class="btn btn-primary" id="btn-save-menu">Save Menu</button>
            <span id="admin-menu-message" class="muted"></span>
          </div>
        </div>

        <div class="section-spacer"></div>

        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-title">Meal Prices</div>
              <div class="card-subtitle">Per meal charge</div>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Breakfast Price</label>
            <input id="admin-price-breakfast" type="number" class="form-input" value="${prices.breakfast}" />
          </div>
          <div class="form-group">
            <label class="form-label">Lunch Price</label>
            <input id="admin-price-lunch" type="number" class="form-input" value="${prices.lunch}" />
          </div>
          <div class="form-group">
            <label class="form-label">Dinner Price</label>
            <input id="admin-price-dinner" type="number" class="form-input" value="${prices.dinner}" />
          </div>
          <div class="form-group">
            <button class="btn btn-primary" id="btn-save-prices">Save Prices</button>
            <span id="admin-price-message" class="muted"></span>
          </div>
        </div>

        <div class="section-spacer"></div>

        <div class="card">
          <div class="card-header">
            <div>
              <h3 class="card-title">Data Backup & Restore</h3>
              <p class="card-subtitle">JSON Backup</p>
            </div>
          </div>

          <div class="card-body">
            <div class="form-group">
              <button class="btn btn-primary" id="btn-export-backup">Download JSON</button>
            </div>

            <div class="form-group">
              <label for="backup-file" class="form-label">Import JSON</label>
              <input type="file" id="backup-file" class="form-input" accept="application/json" />
            </div>

            <div class="form-group">
              <button class="btn btn-secondary" id="btn-import-backup">Import Backup</button>
              <span id="backup-message" class="muted"></span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-title">Register Student</div>
              <div class="card-subtitle">Add or edit hall resident</div>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Name</label>
            <input id="reg-name" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">Roll No</label>
            <input id="reg-roll" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">Room No</label>
            <input id="reg-room" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">Balance</label>
            <input id="reg-balance" type="number" class="form-input" value="0" />
          </div>
          <div class="form-group">
            <button class="btn btn-primary" id="btn-register-student">Register</button>
            <span id="reg-message" class="muted"></span>
          </div>
        </div>

        <div class="section-spacer"></div>

        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-title">Students</div>
              <div class="card-subtitle">Registered students</div>
            </div>
          </div>
          <div class="table-wrapper">
            <table class="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Roll</th>
                  <th>Room</th>
                  <th>Balance</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody id="students-tbody"></tbody>
            </table>
          </div>
        </div>

        <div class="section-spacer"></div>

        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-title">Monthly Billing</div>
              <div class="card-subtitle">Calculate student's bill</div>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Student (Roll)</label>
            <select id="bill-roll" class="form-input"></select>
          </div>
          <div class="form-group">
            <label class="form-label">Month (1-12)</label>
            <input id="bill-month" type="number" class="form-input" min="1" max="12" />
          </div>
          <div class="form-group">
            <label class="form-label">Year</label>
            <input id="bill-year" type="number" class="form-input" />
          </div>
          <div class="form-group">
            <button class="btn btn-primary" id="btn-calc-bill">Calculate</button>
          </div>
          <div id="bill-result" class="muted"></div>
        </div>

        <div class="section-spacer"></div>

        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-title">Meal Report</div>
              <div class="card-subtitle">Daily / Monthly / Custom Range</div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Report Type</label>
            <select id="rep-type" class="form-input">
              <option value="daily">Daily</option>
              <option value="monthly">Monthly</option>
              <option value="range">Custom Range</option>
            </select>
          </div>

          <div class="form-group rep-field rep-daily">
            <label class="form-label">Date</label>
            <input id="rep-date" type="date" class="form-input" />
          </div>

          <div class="form-group rep-field rep-monthly" style="display:none;">
            <label class="form-label">Month</label>
            <input id="rep-month" type="number" class="form-input" min="1" max="12" />
            <label class="form-label">Year</label>
            <input id="rep-year" type="number" class="form-input" />
          </div>

          <div class="form-group rep-field rep-range" style="display:none;">
            <label class="form-label">From</label>
            <input id="rep-from" type="date" class="form-input" />
            <label class="form-label">To</label>
            <input id="rep-to" type="date" class="form-input" />
          </div>

          <div class="form-group">
            <button class="btn btn-primary" id="btn-show-report">Show Report</button>
          </div>

          <div id="rep-result" class="muted"></div>
        </div>
      </div>
    </div>
  `;
}

function setupStudentsTableActions() {
  const tbody = qs("#students-tbody");
  const regMsg = qs("#reg-message");
  const regBtn = qs("#btn-register-student");
  tbody.addEventListener("click", (e) => {
    const target = e.target;
    if (target.matches("[data-edit-roll]")) {
      const roll = target.dataset.editRoll;
      const student = findStudent(roll);
      if (!student) {
        regMsg.textContent = "Student not found.";
        regMsg.style.color = "red";
        return;
      }
      qs("#reg-name").value = student.name;
      qs("#reg-roll").value = student.rollNo;
      qs("#reg-room").value = student.roomNumber;
      qs("#reg-balance").value = student.currentBalance;
      currentEditingRoll = student.rollNo;
      regBtn.textContent = "Update Student";
      regMsg.textContent = `Editing student ${student.rollNo}.`;
      regMsg.style.color = "#374151";
    }
    if (target.matches("[data-delete-roll]")) {
      const roll = target.dataset.deleteRoll;
      const sure = window.confirm(
        `Are you sure you want to delete student ${roll}?`
      );
      if (!sure) return;
      const res = deleteStudent(roll);
      regMsg.textContent = res.message;
      regMsg.style.color = res.ok ? "green" : "red";
      if (currentEditingRoll === roll) {
        currentEditingRoll = null;
        regBtn.textContent = "Register";
        qs("#reg-name").value = "";
        qs("#reg-roll").value = "";
        qs("#reg-room").value = "";
        qs("#reg-balance").value = "0";
      }
      renderStudentsTable();
      populateBillingStudentSelect();
    }
  });
}

function renderMealsReport(report) {
  const container = qs("#rep-result");
  if (!report) {
    container.textContent = "No data found.";
    return;
  }
  if (report instanceof Error || report.error) {
    container.textContent =
      report.message || "Could not load report data.";
    return;
  }
  const title = report.title || report.label || "";
  const summary = report.summary || {};
  const list = report.byStudent || [];
  if (!list.length) {
    container.innerHTML = title
      ? `<div><strong>${title}</strong></div><div>No data found.</div>`
      : "No data found.";
    return;
  }
  const summaryHtml = `
    <div style="margin-bottom:10px;">
      <strong>${title}</strong>
    </div>
    <div style="margin-bottom:10px;">
      <table class="table">
        <thead>
          <tr>
            <th>Meal</th>
            <th>Count</th>
            <th>Total Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Breakfast</td>
            <td>${summary.breakfastCount || 0}</td>
            <td>${formatCurrency(summary.breakfastTotal || 0)}</td>
          </tr>
          <tr>
            <td>Lunch</td>
            <td>${summary.lunchCount || 0}</td>
            <td>${formatCurrency(summary.lunchTotal || 0)}</td>
          </tr>
          <tr>
            <td>Dinner</td>
            <td>${summary.dinnerCount || 0}</td>
            <td>${formatCurrency(summary.dinnerTotal || 0)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
  const detailsHtml = `
    <div class="table-wrapper">
      <table class="table">
        <thead>
          <tr>
            <th>Roll</th>
            <th>Name</th>
            <th>Breakfast</th>
            <th>Lunch</th>
            <th>Dinner</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${list
            .map(
              (s) => `
            <tr>
              <td>${s.rollNo}</td>
              <td>${s.name}</td>
              <td>${s.breakfast || 0}</td>
              <td>${s.lunch || 0}</td>
              <td>${s.dinner || 0}</td>
              <td>${formatCurrency(s.total || 0)}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    </div>
    <div style="margin-top:8px;">
      <strong>Grand Total: </strong>${formatCurrency(summary.grandTotal || 0)}
    </div>
  `;
  container.innerHTML = summaryHtml + detailsHtml;
}

function initReports() {
  const typeSel = qs("#rep-type");
  const resultDiv = qs("#rep-result");
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const month = today.getMonth() + 1;
  const year = today.getFullYear();
  const dateInput = qs("#rep-date");
  if (dateInput) dateInput.value = todayStr;
  const monthInput = qs("#rep-month");
  const yearInput = qs("#rep-year");
  if (monthInput) monthInput.value = month;
  if (yearInput) yearInput.value = year;
  const fromInput = qs("#rep-from");
  const toInput = qs("#rep-to");
  if (fromInput && toInput) {
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      .toISOString()
      .slice(0, 10);
    fromInput.value = firstOfMonth;
    toInput.value = todayStr;
  }
  function updateFields() {
    const t = typeSel.value;
    document.querySelectorAll(".rep-field").forEach((el) => {
      el.style.display = "none";
    });
    if (t === "daily") {
      const d = document.querySelector(".rep-daily");
      if (d) d.style.display = "block";
    } else if (t === "monthly") {
      const d = document.querySelector(".rep-monthly");
      if (d) d.style.display = "block";
    } else {
      const d = document.querySelector(".rep-range");
      if (d) d.style.display = "block";
    }
    resultDiv.textContent = "";
  }
  typeSel.addEventListener("change", updateFields);
  updateFields();
  qs("#btn-show-report").addEventListener("click", () => {
    const t = typeSel.value;
    try {
      let report;
      if (t === "daily") {
        const dStr = qs("#rep-date").value;
        if (!dStr) {
          resultDiv.textContent = "Please select a date.";
          return;
        }
        const d = parseDateInputValue(dStr);
        report = getDailyMealsReport(d);
      } else if (t === "monthly") {
        const m = Number(qs("#rep-month").value);
        const y = Number(qs("#rep-year").value);
        if (!m || !y || m < 1 || m > 12) {
          resultDiv.textContent = "Enter valid month and year.";
          return;
        }
        report = getMonthlyMealsReport(y, m - 1);
      } else {
        const fromStr = qs("#rep-from").value;
        const toStr = qs("#rep-to").value;
        if (!fromStr || !toStr) {
          resultDiv.textContent = "Select both from and to dates.";
          return;
        }
        const from = parseDateInputValue(fromStr);
        const to = parseDateInputValue(toStr);
        report = getRangeMealsReport(from, to);
      }
      renderMealsReport(report);
    } catch (e) {
      resultDiv.textContent =
        (e && e.message) || "Could not generate report.";
    }
  });
}

function initAdminPanel() {
  qs("#btn-save-menu").addEventListener("click", () => {
    const bf = qs("#admin-menu-breakfast").value.trim();
    const ln = qs("#admin-menu-lunch").value.trim();
    const dn = qs("#admin-menu-dinner").value.trim();
    const msg = qs("#admin-menu-message");
    saveMenu({
      breakfast: bf || "Not set",
      lunch: ln || "Not set",
      dinner: dn || "Not set"
    });
    msg.textContent = "Menu saved.";
    renderTodayMenu();
  });
  qs("#btn-save-prices").addEventListener("click", () => {
    const bf = Number(qs("#admin-price-breakfast").value);
    const ln = Number(qs("#admin-price-lunch").value);
    const dn = Number(qs("#admin-price-dinner").value);
    const msg = qs("#admin-price-message");
    savePrices({
      breakfast: isNaN(bf) ? 0 : bf,
      lunch: isNaN(ln) ? 0 : ln,
      dinner: isNaN(dn) ? 0 : dn
    });
    msg.textContent = "Prices saved.";
  });
  qs("#btn-register-student").addEventListener("click", () => {
    const name = qs("#reg-name").value.trim();
    const roll = qs("#reg-roll").value.trim();
    const room = qs("#reg-room").value.trim();
    const balance = qs("#reg-balance").value.trim();
    const msg = qs("#reg-message");
    const btn = qs("#btn-register-student");
    msg.style.color = "#374151";
    if (!name || !roll || !room) {
      msg.textContent = "Name, roll and room are required.";
      msg.style.color = "red";
      return;
    }
    if (currentEditingRoll) {
      const existing = findStudent(currentEditingRoll);
      if (!existing) {
        msg.textContent = "Original student not found for update.";
        msg.style.color = "red";
        return;
      }
      const updatedStudent = {
        ...existing,
        rollNo: roll,
        name,
        roomNumber: room,
        currentBalance: Number(balance) || 0
      };
      const res = updateStudent(updatedStudent);
      msg.textContent = res.message || "Student updated.";
      msg.style.color = res.ok ? "green" : "red";
      currentEditingRoll = null;
      btn.textContent = "Register";
    } else {
      const res = registerStudent(roll, name, room, balance);
      if (res instanceof Error || res.ok === false) {
        msg.textContent = res.message || "Could not register student.";
        msg.style.color = "red";
        return;
      }
      msg.textContent = res.message || "Student registered successfully.";
      msg.style.color = "green";
    }
    qs("#reg-name").value = "";
    qs("#reg-roll").value = "";
    qs("#reg-room").value = "";
    qs("#reg-balance").value = "0";
    renderStudentsTable();
    populateBillingStudentSelect();
  });
  renderStudentsTable();
  populateBillingStudentSelect();
  setupStudentsTableActions();
  qs("#btn-calc-bill").addEventListener("click", () => {
    const roll = qs("#bill-roll").value;
    const monthInput = Number(qs("#bill-month").value);
    const year = Number(qs("#bill-year").value);
    const out = qs("#bill-result");
    if (!roll || isNaN(monthInput) || isNaN(year)) {
      out.textContent = "Select student and enter valid month/year.";
      return;
    }
    if (monthInput < 1 || monthInput > 12) {
      out.textContent = "Month must be between 1 and 12.";
      return;
    }
    const monthIndex = monthInput - 1;
    const bill = calculateMonthlyBill(roll, year, monthIndex);
    if (bill instanceof Error) {
      out.textContent = bill.message;
      return;
    }
    const label = formatMonthYear(year, monthIndex);
    out.innerHTML = `
      <div style="margin-bottom:10px;">
        <strong>Bill for:</strong> ${bill.studentName} (${label})
      </div>

      <table class="table billing-table">
        <thead>
          <tr>
            <th>Meal</th>
            <th>Count</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Breakfast</td>
            <td>${bill.counts.breakfast}</td>
            <td>${formatCurrency(bill.prices.breakfast)}</td>
            <td>${formatCurrency(bill.breakdown.breakfast)}</td>
          </tr>
          <tr>
            <td>Lunch</td>
            <td>${bill.counts.lunch}</td>
            <td>${formatCurrency(bill.prices.lunch)}</td>
            <td>${formatCurrency(bill.breakdown.lunch)}</td>
          </tr>
          <tr>
            <td>Dinner</td>
            <td>${bill.counts.dinner}</td>
            <td>${formatCurrency(bill.prices.dinner)}</td>
            <td>${formatCurrency(bill.breakdown.dinner)}</td>
          </tr>
        </tbody>
      </table>

      <div style="margin-top:12px; font-size:16px;">
        <strong>Total:</strong> ${formatCurrency(bill.total)}
      </div>
    `;
  });
  qs("#btn-export-backup").addEventListener("click", () => {
    const backup = exportAllData();
    const json = JSON.stringify(backup, null, 2);
    const blob = new Blob([json], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const today = new Date().toISOString().slice(0, 10);
    a.download = `mess-backup-${today}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });
  qs("#btn-import-backup").addEventListener("click", () => {
    const fileInput = qs("#backup-file");
    const msg = qs("#backup-message");
    msg.style.color = "#039c55ff";
    msg.textContent = "";
    const file = fileInput.files && fileInput.files[0];
    if (!file) {
      msg.textContent = "Please select a backup JSON file.";
      msg.style.color = "#f20303";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        const res = importAllData(data);
        msg.textContent = res.message || "Import done";
        msg.style.color = res.ok ? "#16a34a" : "#f20303";
        if (res.ok) {
          renderStudentsTable();
          populateBillingStudentSelect();
          renderTodayMenu();
        }
      } catch (e) {
        msg.textContent = "Invalid JSON file";
        msg.style.color = "#f20303";
      }
    };
    reader.readAsText(file);
  });
  initReports();
}

function initAdminAuth() {
  const adminContent = qs("#admin-content");
  const loginBtn = qs("#btn-admin-login");
  const logoutBtn = qs("#btn-admin-logout");
  const msgSpan = qs("#admin-login-message");
  const passInput = qs("#admin-pass");
  const passGroup = qs("#admin-pass-group");
  function refreshAdminUI() {
    if (isAdminLoggedIn()) {
      adminContent.style.display = "block";
      loginBtn.style.display = "none";
      logoutBtn.style.display = "inline-block";
      passGroup.style.display = "none";
      msgSpan.textContent = "Logged in as admin.";
    } else {
      adminContent.style.display = "none";
      loginBtn.style.display = "inline-block";
      logoutBtn.style.display = "none";
      passGroup.style.display = "block";
      msgSpan.textContent = "";
      passInput.value = "";
    }
  }
  loginBtn.addEventListener("click", () => {
    const password = passInput.value;
    const res = loginAdmin(password);
    msgSpan.textContent = res.message;
    if (res.ok) {
      refreshAdminUI();
    }
  });
  logoutBtn.addEventListener("click", () => {
    logoutAdmin();
    refreshAdminUI();
  });
  renderAdminContent();
  initAdminPanel();
  refreshAdminUI();
}

document.addEventListener("DOMContentLoaded", () => {
  renderAppShell();
  initTabs();
  initStudentPanel();
  initAdminAuth();
});
