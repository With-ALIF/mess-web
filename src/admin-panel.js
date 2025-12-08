// src/admin-panel.js
import {
  qs,
  formatCurrency
} from "./utils.js";

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

import {
  calculateMonthlyBill,
  formatMonthYear
} from "./billing.js";

import { renderTodayMenu } from "./student-ui.js";

import { renderAdminDashboard } from "./dashboard.js";

import { initReports } from "./admin-reports.js";

let currentEditingRoll = null;

function renderStudentsTable() {
  const tbody = qs("#students-tbody");
  const students = listStudents();
  const searchInput = document.querySelector("#students-search");
  const term = searchInput ? searchInput.value.trim().toLowerCase() : "";

  let filtered = students;
  if (term) {
    filtered = students.filter(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        s.rollNo.toLowerCase().includes(term)
    );
  }

  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="muted">No students found.</td></tr>`;
    return;
  }
  tbody.innerHTML = filtered
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
  const paySel = document.querySelector("#pay-roll");
  const students = listStudents();
  sel.innerHTML = "";
  if (paySel) paySel.innerHTML = "";

  if (!students.length) {
    sel.innerHTML = `<option value="">No students</option>`;
    if (paySel) paySel.innerHTML = `<option value="">No students</option>`;
    return;
  }
  students.forEach((s) => {
    const text = `${s.rollNo} - ${s.name}`;
    const opt1 = document.createElement("option");
    opt1.value = s.rollNo;
    opt1.textContent = text;
    sel.appendChild(opt1);

    if (paySel) {
      const opt2 = document.createElement("option");
      opt2.value = s.rollNo;
      opt2.textContent = text;
      paySel.appendChild(opt2);
    }
  });
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
        regMsg.style.color = "#b91c1c";
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
      regMsg.style.color = res.ok ? "#15803d" : "#b91c1c";
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

export function initAdminPanel() {
  const menu = getMenu();
  const prices = getPrices();

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
    msg.style.color = "#15803d";
    renderTodayMenu();
    renderAdminDashboard();
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
    msg.style.color = "#15803d";
    renderAdminDashboard();
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
      msg.style.color = "#b91c1c";
      return;
    }
    if (currentEditingRoll) {
      const existing = findStudent(currentEditingRoll);
      if (!existing) {
        msg.textContent = "Original student not found for update.";
        msg.style.color = "#b91c1c";
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
      msg.style.color = res.ok ? "#15803d" : "#b91c1c";
      currentEditingRoll = null;
      btn.textContent = "Register";
    } else {
      const res = registerStudent(roll, name, room, balance);
      if (res instanceof Error || res.ok === false) {
        msg.textContent = res.message || "Could not register student.";
        msg.style.color = "#b91c1c";
        return;
      }
      msg.textContent = res.message || "Student registered successfully.";
      msg.style.color = "#15803d";
    }
    qs("#reg-name").value = "";
    qs("#reg-roll").value = "";
    qs("#reg-room").value = "";
    qs("#reg-balance").value = "0";
    renderStudentsTable();
    populateBillingStudentSelect();
    renderAdminDashboard();
  });

  renderStudentsTable();
  populateBillingStudentSelect();
  setupStudentsTableActions();

  const searchInput = document.querySelector("#students-search");
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      renderStudentsTable();
    });
  }

  const payBtn = document.querySelector("#btn-add-payment");
  const payMsg = document.querySelector("#pay-message");
  if (payBtn && payMsg) {
    payBtn.addEventListener("click", () => {
      const roll = document.querySelector("#pay-roll").value;
      const amountStr = document.querySelector("#pay-amount").value;
      const amount = Number(amountStr);
      payMsg.style.color = "#374151";

      if (!roll || isNaN(amount) || amount <= 0) {
        payMsg.textContent = "Select student and enter a positive amount.";
        payMsg.style.color = "#b91c1c";
        return;
      }

      const student = findStudent(roll);
      if (!student) {
        payMsg.textContent = "Student not found.";
        payMsg.style.color = "#b91c1c";
        return;
      }

      const updatedStudent = {
        ...student,
        currentBalance: Number(student.currentBalance || 0) + amount
      };
      const res = updateStudent(updatedStudent);
      payMsg.textContent = res.message || "Payment added.";
      payMsg.style.color = res.ok ? "#15803d" : "#b91c1c";

      renderStudentsTable();
      populateBillingStudentSelect();
      renderAdminDashboard();

      const stuRollInput = document.querySelector("#stu-roll");
      if (stuRollInput && stuRollInput.value.trim() === roll) {
        const balanceBadge = document.querySelector("#stu-balance-badge");
        if (balanceBadge) {
          balanceBadge.textContent =
            `Remaining Balance: ${formatCurrency(updatedStudent.currentBalance)}`;
        }
      }
    });
  }

  qs("#btn-calc-bill").addEventListener("click", () => {
    const roll = qs("#bill-roll").value;
    const monthInput = Number(qs("#bill-month").value);
    const year = Number(qs("#bill-year").value);
    const out = qs("#bill-result");
    if (!roll || isNaN(monthInput) || isNaN(year)) {
      out.textContent = "Select student and enter valid month/year.";
      out.style.color = "#b91c1c";
      return;
    }
    if (monthInput < 1 || monthInput > 12) {
      out.textContent = "Month must be between 1 and 12.";
      out.style.color = "#b91c1c";
      return;
    }
    const monthIndex = monthInput - 1;
    const bill = calculateMonthlyBill(roll, year, monthIndex);
    if (bill instanceof Error) {
      out.textContent = bill.message;
      out.style.color = "#b91c1c";
      return;
    }
    const label = formatMonthYear(year, monthIndex);
    const student = findStudent(roll);
    const currentBalance = student ? Number(student.currentBalance || 0) : 0;
    const remainingBalance = currentBalance - bill.total;
    if (student) {
      const updatedStudent = {
        ...student,
        currentBalance: remainingBalance
      };
      updateStudent(updatedStudent);
    }
    renderStudentsTable();
    populateBillingStudentSelect();
    renderAdminDashboard();
    const stuRollInput = document.querySelector("#stu-roll");
    if (stuRollInput && stuRollInput.value.trim() === roll) {
      const balanceBadge = document.querySelector("#stu-balance-badge");
      if (balanceBadge) {
        balanceBadge.textContent =
          `Remaining Balance: ${formatCurrency(remainingBalance)}`;
      }
    }
    out.style.color = "#374151";
    out.innerHTML = `
      <div style="margin-bottom:10px;">
        <strong>Bill for:</strong> ${bill.studentName} (${label})
      </div>

      <div class="table-wrapper" style="max-height:none;">
        <table class="billing-table">
          <thead>
            <tr style="color: green">
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
      </div>

      <div style="margin-top:12px; font-size:1.05rem;">
        <strong>Total:</strong> ${formatCurrency(bill.total)}
      </div>
      <div style="margin-top:4px;">
        <strong>Previous Balance:</strong> ${formatCurrency(currentBalance)}
      </div>
      <div style="margin-top:4px;">
        <strong>Remaining Balance:</strong> ${formatCurrency(remainingBalance)}
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
    const today = new Date().toISOString().slice(0, 10);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mess-backup-${today}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  qs("#btn-import-backup").addEventListener("click", () => {
    const fileInput = qs("#backup-file");
    const msg = qs("#backup-message");
    msg.style.color = "#1f2937";
    msg.textContent = "";
    const file = fileInput.files && fileInput.files[0];
    if (!file) {
      msg.textContent = "Please select a backup JSON file.";
      msg.style.color = "#b91c1c";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        const res = importAllData(data);
        msg.textContent = res.message || "Import done";
        msg.style.color = res.ok ? "#15803d" : "#b91c1c";
        if (res.ok) {
          renderStudentsTable();
          populateBillingStudentSelect();
          renderTodayMenu();
          renderAdminDashboard();
        }
      } catch (e) {
        msg.textContent = "Invalid JSON file";
        msg.style.color = "#b91c1c";
      }
    };
    reader.readAsText(file);
  });

  initReports();
  renderAdminDashboard();
}
