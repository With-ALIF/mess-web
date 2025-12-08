import { qs } from "./utils.js";
import {
  loginAdmin,
  logoutAdmin,
  getAdminUsername,
  isAdminLoggedIn
} from "./auth.js";

import { initAdminPanel } from "./admin-panel.js";

export function initAdminAuth() {
  const adminContent = qs("#admin-content");
  const loginBtn = qs("#btn-admin-login");
  const logoutBtn = qs("#btn-admin-logout");
  const msgSpan = qs("#admin-login-message");
  const passInput = qs("#admin-pass");
  const passGroup = qs("#admin-pass-group");
  const userInput = qs("#admin-user");
  if (userInput) {
    userInput.value = getAdminUsername();
  }

  function refreshAdminUI() {
    if (isAdminLoggedIn()) {
      adminContent.style.display = "block";
      loginBtn.style.display = "none";
      logoutBtn.style.display = "inline-block";
      passGroup.style.display = "none";
      msgSpan.textContent = "Logged in as admin.";
      msgSpan.style.color = "#15803d";
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
    msgSpan.style.color = res.ok ? "#15803d" : "#b91c1c";
    if (res.ok) {
      refreshAdminUI();
    }
  });

  logoutBtn.addEventListener("click", () => {
    logoutAdmin();
    refreshAdminUI();
  });

  initAdminPanel();
  refreshAdminUI();
}
