import { DEFAULT_MENU, DEFAULT_PRICES } from "./models.js";

const STUDENT_KEY = "mess.students";
const MENU_KEY = "mess.menu";
const PRICES_KEY = "mess.prices";
const BOOKINGS_KEY = "mess_bookings";

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getStudents() {
  return readJson(STUDENT_KEY, []);
}

export function saveStudents(students) {
  writeJson(STUDENT_KEY, students);
}

export function getMenu() {
  return readJson(MENU_KEY, DEFAULT_MENU);
}

export function saveMenu(menu) {
  writeJson(MENU_KEY, menu);
}

export function getPrices() {
  return readJson(PRICES_KEY, DEFAULT_PRICES);
}

export function savePrices(prices) {
  writeJson(PRICES_KEY, prices);
}

export function exportAllData() {
  const menu = getMenu();
  const prices = getPrices();
  const students = getStudents();
  const bookings = readJson(BOOKINGS_KEY, []);

  return {
    version: 1,
    createdAt: new Date().toISOString(),
    menu,
    prices,
    students,
    bookings
  };
}

export function importAllData(backup) {
  if (!backup || typeof backup !== "object") {
    return { ok: false, message: "Invalid backup data." };
  }

  try {
    if (backup.menu) {
      saveMenu(backup.menu);
    }

    if (backup.prices) {
      savePrices(backup.prices);
    }

    if (Array.isArray(backup.students)) {
      saveStudents(backup.students);
    }

    if (Array.isArray(backup.bookings)) {
      writeJson(BOOKINGS_KEY, backup.bookings);
    }

    return { ok: true, message: "Backup imported successfully." };
  } catch (e) {
    console.error(e);
    return { ok: false, message: "Failed to import backup." };
  }
}
