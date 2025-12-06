// main.js (updated)

import { MealType } from "./models.js";
import { getMenu, saveMenu, getPrices, savePrices } from "./storage.js";
import {
  listStudents,
  registerStudent,
  findStudent,
  updateStudent,
  deleteStudent
} from "./student.js";
import { bookMeal, cancelMeal, getBookingForDate } from "./meal.js";
import { calculateMonthlyBill, formatMonthYear } from "./billing.js";
import {
  isAdminLoggedIn,
  loginAdmin,
  logoutAdmin,
  getAdminUsername
} from "./auth.js";

// -------- Helper --------
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

// এখন আমরা কোন student টা edit করছি সেটা ট্র্যাক করব
let currentEditingRoll = null;

/* ------------------------------------------------
   RENDER APP UI (DEFAULT = STUDENT TAB ACTIVE)
------------------------------------------------ */
function renderAppShell() {
  const root = qs(".root");
  root.innerHTML = `
    <div class="app-card">
      <div class="app-header">
        <div>
          <div class="app-title">Student Hall Mess Management</div>
        </div>

        <!-- DEFAULT ACTIVE = STUDENT -->
        <div class="tabs">
          <button class="tab-btn active" data-tab="student">Student</button>
          <button class="tab-btn" data-tab="admin">Admin</button>
        </div>
      </div>

      <div class="tabs-content">

        <!-- ===== STUDENT PANEL (Visible by Default) ===== -->
        <div class="tab-panel" data-panel="student" style="display:block;">
          <div class="layout">
            <div>
              <!-- Student Login -->
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

              <!-- Student Profile -->
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
              <!-- Today's Menu & Booking -->
              <div class="card">
                <div class="card-header">
                  <div>
                    <div class="card-title">Today's Menu & Booking</div>
                    <div class="card-subtitle">Book / cancel meals</div>
                  </div>
                  <span id="today-label" class="badge"></span>
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
            </div>
          </div>
        </div>

        <!-- ===== ADMIN PANEL (Hidden by Default) ===== -->
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

          <div id="admin-content" style="display:none;">
            <!-- Admin content will be rendered by JS -->
          </div>
        </div>

      </div>
    </div>
  `;
}

/* ------------------------  
   TAB SWITCHING
------------------------ */
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

/* ------------------------
   STUDENT PANEL FUNCTIONS
------------------------ */
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

  const booking = getBookingForDate(roll);
  if (!booking) {
    statusDiv.innerHTML = `<span class="badge badge-warning">No meals booked today.</span>`;
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

  // Reset message display
  msg.style.color = "#6b7280";
  msg.textContent = "";

  // No roll entered
  if (!roll) {
    msg.textContent = "Please enter your roll number first.";
    msg.style.color = "red";
    return;
  }

  // Perform booking/cancellation
  const result =
    action === "book" ? bookMeal(roll, mealType) : cancelMeal(roll, mealType);

  // If unexpected error
  if (result instanceof Error) {
    msg.textContent = result.message || "Something went wrong.";
    msg.style.color = "red";
  } else {
    if (result.ok) {
      // ✅ Success message
      msg.textContent =
        result.message ||
        (action === "book"
          ? "Meal booked successfully."
          : "Meal cancelled successfully.");
      msg.style.color = "green";
    } else {
      // ❌ Failed (e.g., cancel time passed)
      msg.textContent =
        result.message ||
        (action === "cancel"
          ? "You can no longer cancel this meal."
          : "Action could not be completed.");
      msg.style.color = "red";
    }
  }

  // Refresh UI
  updateBookingStatus();
}

function initStudentPanel() {
  const today = new Date();
  qs("#today-label").textContent = today.toLocaleDateString();

  renderTodayMenu();

  qs("#btn-stu-load").addEventListener("click", () => {
    const roll = qs("#stu-roll").value.trim();
    const msg = qs("#stu-message");
    const profileDiv = qs("#stu-profile-content");
    const balanceBadge = qs("#stu-balance-badge");

    if (!roll) {
      msg.textContent = "Enter roll number.";
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

  // Booking buttons
  document.querySelectorAll("[data-book]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const meal = btn.dataset.book;      // "breakfast" / "lunch" / "dinner"
      const key = capitalize(meal);       // "Breakfast" / "Lunch" / "Dinner"
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
}

/* ------------------------
   ADMIN PANEL CONTENT
------------------------ */
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
        <!-- Menu Card -->
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

        <!-- Prices Card -->
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
      </div>

      <div>
        <!-- Register / Edit Student -->
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

        <!-- Students Table -->
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

        <!-- Billing -->
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
      </div>
    </div>
  `;
}

/* ------------------------
   ADMIN PANEL LOGIC
------------------------ */

function setupStudentsTableActions() {
  const tbody = qs("#students-tbody");
  const regMsg = qs("#reg-message");
  const regBtn = qs("#btn-register-student");

  tbody.addEventListener("click", (e) => {
    const target = e.target;

    // EDIT
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

    // DELETE
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

function initAdminPanel() {
  // Save menu
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
    renderTodayMenu(); // student side update
  });

  // Save prices
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

  // Register / Update student
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
      // UPDATE
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
      // NEW REGISTER
      const res = registerStudent(roll, name, room, balance);

      if (res instanceof Error || res.ok === false) {
        msg.textContent = res.message || "Could not register student.";
        msg.style.color = "red";
        return;
      }

      msg.textContent = res.message || "Student registered successfully.";
      msg.style.color = "green";
    }

    // reset form
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

  // Billing
  qs("#btn-calc-bill").addEventListener("click", () => {
    const roll = qs("#bill-roll").value;
    const monthInput = Number(qs("#bill-month").value); // 1-12
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

    const monthIndex = monthInput - 1; // 0-11
    const bill = calculateMonthlyBill(roll, year, monthIndex);

    if (bill instanceof Error) {
      out.textContent = bill.message;
      return;
    }

    const label = formatMonthYear(year, monthIndex);

    out.innerHTML = `
      <div><strong>Bill for:</strong> ${roll} (${label})</div>
      <div>Breakfast: ${bill.counts.breakfast} × ${formatCurrency(
        bill.prices.breakfast
      )} = ${formatCurrency(bill.breakdown.breakfast)}</div>
      <div>Lunch: ${bill.counts.lunch} × ${formatCurrency(
        bill.prices.lunch
      )} = ${formatCurrency(bill.breakdown.lunch)}</div>
      <div>Dinner: ${bill.counts.dinner} × ${formatCurrency(
        bill.prices.dinner
      )} = ${formatCurrency(bill.breakdown.dinner)}</div>
      <div style="margin-top:6px;"><strong>Total:</strong> ${formatCurrency(
        bill.total
      )}</div>
    `;
  });
}

/* ------------------------
   ADMIN AUTH HANDLING
------------------------ */
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

  // admin UI তৈরি + ইভেন্ট অ্যাটাচ
  renderAdminContent();
  initAdminPanel();
  refreshAdminUI();
}

/* ------------------------
   BOOTSTRAP APPLICATION
------------------------ */
document.addEventListener("DOMContentLoaded", () => {
  renderAppShell();
  initTabs();
  initStudentPanel();
  initAdminAuth();
});
