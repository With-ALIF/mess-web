import { renderAppShell, initTabs } from "./ui-shell.js";
import {
  initStudentPanel,
  initStudentBillSummary,
  renderTodayMenu
} from "./student-ui.js";
import { initAdminAuth } from "./admin-ui.js";

document.addEventListener("DOMContentLoaded", () => {
  (async () => {
    await renderAppShell();
    initTabs();
    initStudentPanel();
    initAdminAuth();
    initStudentBillSummary();
    renderTodayMenu();
  })();
});
