// src/utils.js
export function qs(selector) {
  const el = document.querySelector(selector);
  if (!el) throw new Error("Element not found: " + selector);
  return el;
}

export function formatCurrency(x) {
  return Number(x || 0).toFixed(2);
}

export function capitalize(s) {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function parseDateInputValue(value) {
  if (!value) return null;
  return new Date(value + "T00:00:00");
}

export function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

export function getSelectedBookingDate() {
  const inp = document.querySelector("#booking-date");
  if (!inp || !inp.value) return new Date();
  return parseDateInputValue(inp.value);
}
