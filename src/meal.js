import { MealType } from "./models.js";
import { findStudent, updateStudent } from "./student.js";

function getTodayISO() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function toISODate(date) {
  if (!date) return getTodayISO();

  if (date instanceof Date) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  if (typeof date === "string") {
    if (date.length === 10 && date.includes("-")) {
      return date;
    }
    const d = new Date(date);
    if (!isNaN(d)) {
      return toISODate(d);
    }
  }

  return getTodayISO();
}

function ensureBookingsArray(student) {
  if (!Array.isArray(student.bookings)) {
    student.bookings = [];
  }
}

function getOrCreateBooking(student, dateStr) {
  ensureBookingsArray(student);
  let booking = student.bookings.find((b) => b.date === dateStr);
  if (!booking) {
    booking = {
      date: dateStr,
      breakfast: false,
      lunch: false,
      dinner: false
    };
    student.bookings.push(booking);
  }
  return booking;
}

function canCancel(mealType, bookingDateStr, now = new Date()) {
  const todayStr = toISODate(now);

  if (bookingDateStr > todayStr) {
    return true;
  }

  if (bookingDateStr < todayStr) {
    return false;
  }

  const hour = now.getHours();

  if (mealType === MealType.Breakfast) return hour < 9;
  if (mealType === MealType.Lunch) return hour < 13;
  if (mealType === MealType.Dinner) return hour < 16;
  return true;
}

export function bookMeal(rollNo, mealType, date) {
  const student = findStudent(rollNo);
  if (!student) {
    return { ok: false, message: "Student not found" };
  }

  const dateStr = toISODate(date);
  const booking = getOrCreateBooking(student, dateStr);

  if (booking[mealType]) {
    return { ok: false, message: "Meal already booked" };
  }

  booking[mealType] = true;
  updateStudent(student);
  return { ok: true, message: "Meal booked successfully" };
}

export function cancelMeal(rollNo, mealType, date) {
  const student = findStudent(rollNo);
  if (!student) {
    return { ok: false, message: "Student not found" };
  }

  const dateStr = toISODate(date);
  ensureBookingsArray(student);
  const booking = student.bookings.find((b) => b.date === dateStr);

  if (!booking || !booking[mealType]) {
    return { ok: false, message: "No booked meal to cancel" };
  }

  const now = new Date();
  if (!canCancel(mealType, dateStr, now)) {
    return { ok: false, message: "Cancellation time is over for this meal" };
  }

  booking[mealType] = false;
  updateStudent(student);
  return { ok: true, message: "Meal cancelled successfully" };
}

export function getBookingForDate(rollNo, date) {
  const student = findStudent(rollNo);
  if (!student) return undefined;

  const dateStr = toISODate(date);
  ensureBookingsArray(student);
  return student.bookings.find((b) => b.date === dateStr);
}

function isInMonth(booking, month, year) {
  if (!booking || !booking.date) return false;
  const parts = booking.date.split("-");
  const yyyy = Number(parts[0]);
  const mm = Number(parts[1]);
  return yyyy === year && mm === month;
}

export function getBookingsForMonth(rollNo, month, year) {
  const student = findStudent(rollNo);
  if (!student) {
    return new Error("Student not found");
  }

  ensureBookingsArray(student);
  const list = student.bookings.filter((b) => isInMonth(b, month, year));
  list.sort((a, b) => a.date.localeCompare(b.date));
  return list;
}
