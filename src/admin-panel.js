import { qs, formatCurrency } from "./utils.js";
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
import { calculateMonthlyBill, formatMonthYear } from "./billing.js";
import { renderTodayMenu } from "./student-ui.js";
import { renderAdminDashboard } from "./dashboard.js";
import { initReports } from "./admin-reports.js";

let currentEditingRoll = null;

function renderStudentsTable() {
  const tbody = qs("#students-tbody");
  const students = listStudents();
  const term = (qs("#students-search")?.value || "").trim().toLowerCase();
  const filtered = term
    ? students.filter(
        (s) =>
          s.name.toLowerCase().includes(term) ||
          s.rollNo.toLowerCase().includes(term)
      )
    : students;

  if (!filtered.length) {
    tbody.innerHTML =
      '<tr><td colspan="6" class="muted">No students found.</td></tr>';
    return;
  }

  tbody.innerHTML = filtered
    .map(
      (s) => `
    <tr>
      <td>${s.name}</td>
      <td>${s.rollNo}</td>
      <td>${s.roomNumber}</td>
      <td>${formatCurrency(s.totalDeposits || 0)}</td>
      <td>${formatCurrency(s.currentBalance || 0)}</td>
      <td>
        <button class="btn btn-secondary btn-sm" data-edit-roll="${s.rollNo}">Edit</button>
        <button class="btn btn-danger btn-sm" data-delete-roll="${s.rollNo}">Delete</button>
      </td>
    </tr>`
    )
    .join("");
}

function populateBillingStudentSelect() {
  const sel = qs("#bill-roll");
  const paySel = qs("#pay-roll");
  const students = listStudents();
  sel.innerHTML = "";
  paySel.innerHTML = "";

  if (!students.length) {
    sel.innerHTML = `<option>No students</option>`;
    paySel.innerHTML = `<option>No students</option>`;
    return;
  }

  students.forEach((s) => {
    const t = `${s.rollNo} - ${s.name}`;
    let o1 = document.createElement("option");
    o1.value = s.rollNo;
    o1.textContent = t;
    sel.appendChild(o1);

    let o2 = document.createElement("option");
    o2.value = s.rollNo;
    o2.textContent = t;
    paySel.appendChild(o2);
  });
}

function setupStudentsTableActions() {
  const tbody = qs("#students-tbody");
  const regBtn = qs("#btn-register-student");

  tbody.addEventListener("click", (e) => {
    const t = e.target;

    if (t.matches("[data-edit-roll]")) {
      const roll = t.dataset.editRoll;
      const s = findStudent(roll);
      if (!s) return;
      qs("#reg-name").value = s.name;
      qs("#reg-roll").value = s.rollNo;
      qs("#reg-room").value = s.roomNumber;
      qs("#reg-balance").value = s.currentBalance || 0;
      currentEditingRoll = roll;
      regBtn.textContent = "Update Student";
      return;
    }

    if (t.matches("[data-delete-roll]")) {
      const roll = t.dataset.deleteRoll;
      if (!confirm(`Delete student ${roll}?`)) return;
      deleteStudent(roll);

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
  qs("#btn-save-menu").addEventListener("click", () => {
    saveMenu({
      breakfast: qs("#admin-menu-breakfast").value || "Not set",
      lunch: qs("#admin-menu-lunch").value || "Not set",
      dinner: qs("#admin-menu-dinner").value || "Not set"
    });
    qs("#admin-menu-message").textContent = "Menu saved.";
    renderTodayMenu();
    renderAdminDashboard();
  });

  qs("#btn-save-prices").addEventListener("click", () => {
    savePrices({
      breakfast: Number(qs("#admin-price-breakfast").value) || 0,
      lunch: Number(qs("#admin-price-lunch").value) || 0,
      dinner: Number(qs("#admin-price-dinner").value) || 0
    });
    qs("#admin-price-message").textContent = "Prices saved.";
    renderAdminDashboard();
  });

  qs("#btn-register-student").addEventListener("click", () => {
    const name = qs("#reg-name").value.trim();
    const roll = qs("#reg-roll").value.trim();
    const room = qs("#reg-room").value.trim();
    const bal = Number(qs("#reg-balance").value) || 0;

    if (!name || !roll || !room) return;

    if (currentEditingRoll) {
      const s = findStudent(currentEditingRoll);
      updateStudent({
        ...s,
        name,
        rollNo: roll,
        roomNumber: room,
        currentBalance: bal,
        totalDeposits: s.totalDeposits || bal
      });
      currentEditingRoll = null;
      qs("#btn-register-student").textContent = "Register";
    } else {
      registerStudent(roll, name, room, bal);
      const s = findStudent(roll);
      updateStudent({
        ...s,
        totalDeposits: bal
      });
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

  qs("#students-search").addEventListener("input", renderStudentsTable);

  qs("#btn-add-payment").addEventListener("click", () => {
    const roll = qs("#pay-roll").value;
    const amount = Number(qs("#pay-amount").value);
    if (!roll || isNaN(amount) || amount <= 0) return;

    const s = findStudent(roll);
    const updated = {
      ...s,
      currentBalance: (s.currentBalance || 0) + amount,
      totalDeposits: (s.totalDeposits || 0) + amount
    };

    updateStudent(updated);
    renderStudentsTable();
    populateBillingStudentSelect();
    renderAdminDashboard();
  });

  qs("#btn-calc-bill").addEventListener("click", () => {
    const roll = qs("#bill-roll").value;
    const m = Number(qs("#bill-month").value);
    const y = Number(qs("#bill-year").value);
    const out = qs("#bill-result");

    if (!roll || isNaN(m) || isNaN(y) || m < 1 || m > 12) {
      out.textContent = "Invalid month or year.";
      out.style.color = "#b91c1c";
      return;
    }

    const student = findStudent(roll);
    if (!student) {
      out.textContent = "Student not found.";
      out.style.color = "#b91c1c";
      return;
    }

    const bill = calculateMonthlyBill(roll, y, m - 1);
    if (bill instanceof Error) {
      out.textContent = bill.message;
      out.style.color = "#b91c1c";
      return;
    }

    const key = `${y}-${m}`;
    const prevBalance = Number(student.currentBalance || 0);
    const billedTotals = student.billedTotals || {};
    const prevBilled = Number(billedTotals[key] || 0);
    const total = Number(bill.total);
    const delta = total - prevBilled;

    let newBalance = prevBalance;
    if (delta > 0) {
      newBalance = prevBalance - delta;
      const updated = {
        ...student,
        currentBalance: newBalance,
        billedTotals: {
          ...billedTotals,
          [key]: total
        }
      };
      updateStudent(updated);
      renderStudentsTable();
      renderAdminDashboard();
    }

    const s2 = findStudent(roll);
    const storedBalance = Number(s2.currentBalance || 0);

    out.style.color = "#374151";
    out.innerHTML = `
      <div><strong>Bill for:</strong> ${bill.studentName} (${formatMonthYear(
      y,
      m - 1
    )})</div>

      <div class="table-wrapper" style="max-height:none;">
        <table class="billing-table">
          <thead>
            <tr>
              <th>Meal</th><th>Count</th><th>Price</th><th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Breakfast</td><td>${bill.counts.breakfast}</td><td>${formatCurrency(
      bill.prices.breakfast
    )}</td><td>${formatCurrency(bill.breakdown.breakfast)}</td></tr>
            <tr><td>Lunch</td><td>${bill.counts.lunch}</td><td>${formatCurrency(
      bill.prices.lunch
    )}</td><td>${formatCurrency(bill.breakdown.lunch)}</td></tr>
            <tr><td>Dinner</td><td>${bill.counts.dinner}</td><td>${formatCurrency(
      bill.prices.dinner
    )}</td><td>${formatCurrency(bill.breakdown.dinner)}</td></tr>
          </tbody>
        </table>
      </div>

      <div><strong>Total Bill:</strong> ${formatCurrency(total)}</div>
      <div><strong>Previously Charged:</strong> ${formatCurrency(
        prevBilled
      )}</div>
      <div><strong>Charged Now:</strong> ${formatCurrency(Math.max(delta, 0))}</div>
      <div><strong>New Balance:</strong> ${formatCurrency(storedBalance)}</div>
    `;
  });

  qs("#btn-export-backup").addEventListener("click", () => {
    const data = exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mess-backup.json";
    a.click();
    URL.revokeObjectURL(url);
  });

  qs("#btn-import-backup").addEventListener("click", () => {
    const f = qs("#backup-file").files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      importAllData(JSON.parse(reader.result));
      renderStudentsTable();
      populateBillingStudentSelect();
      renderTodayMenu();
      renderAdminDashboard();
    };
    reader.readAsText(f);
  });

  initReports();
  renderAdminDashboard();
}
