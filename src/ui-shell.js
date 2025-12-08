// src/ui-shell.js
import { qs } from "./utils.js";

 async function loadFragment(containerSelector, url) {
  const container = document.querySelector(containerSelector);
  if (!container) {
    console.error("Container not found for fragment:", containerSelector);
    return;
  }

  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error("Failed to load fragment:", url, res.status);
      container.innerHTML = `<div class="muted">Could not load: ${url}</div>`;
      return;
    }
    const html = await res.text();
    container.innerHTML = html;
  } catch (err) {
    console.error("Error fetching fragment:", url, err);
    container.innerHTML = `<div class="muted">Error loading: ${url}</div>`;
  }
}

export async function renderAppShell() {
   const root = document.querySelector(".root");
  if (!root) {
    console.error("Root element (.root) not found.");
    return;
  }

  root.innerHTML = `
    <div class="app-card">
      <div class="app-header">
        <div>
          <div class="app-title">
            Student Hall Mess Management
          </div>
          <div class="tabs">
            <button class="tab-btn active" data-tab="student">Student</button>
            <button class="tab-btn" data-tab="admin">Admin</button>
          </div>
        </div>
      </div>

      <div class="tabs-content">
        <div class="tab-panel" data-panel="student" style="display:block;">
          <div id="student-tab-root"></div>
        </div>

        <div class="tab-panel" data-panel="admin" style="display:none;">
          <div id="admin-tab-root"></div>
        </div>
      </div>
    </div>
  `;

   try {
    await Promise.all([
      loadFragment("#student-tab-root", "./src/student-tab.html"),
      loadFragment("#admin-tab-root", "./src/admin-tab.html")
    ]);
  } catch (e) {
    console.error("Error loading fragments:", e);
  }
}

export function initTabs() {
  const buttons = document.querySelectorAll(".tab-btn");
  const panels = document.querySelectorAll(".tab-panel");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.tab;

      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      panels.forEach((p) => {
        const panelName = p.dataset.panel;
        p.style.display = panelName === target ? "block" : "none";
      });
    });
  });
}
