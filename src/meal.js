// meal.js  (ES module version)

import { MealType } from "./models.js";
import { findStudent, updateStudent } from "./student.js";

function getTodayISO() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function getOrCreateBooking(student, date) {
  let booking = student.bookings.find((b) => b.date === date);
  if (!booking) {
    booking = {
      date,
      breakfast: false,
      lunch: false,
      dinner: false
    };
    student.bookings.push(booking);
  }
  return booking;
}

function canCancel(mealType, now) {
  // Breakfast: 9টার পরে cancel করা যাবে না
  // Lunch:     1টার পরে
  // Dinner:    4টার পরে
  const hour = now.getHours();

  if (mealType === MealType.Breakfast) return hour < 9;
  if (mealType === MealType.Lunch) return hour < 13;
  if (mealType === MealType.Dinner) return hour < 16;
  return true;
}

export function bookMeal(rollNo, mealType, date = getTodayISO()) {
  const student = findStudent(rollNo);
  if (!student) {
    return { ok: false, message: "Student not found" };
  }

  const booking = getOrCreateBooking(student, date);

  if (booking[mealType]) {
    return { ok: false, message: "Meal already booked" };
  }

  booking[mealType] = true;
  updateStudent(student);
  return { ok: true, message: "Meal booked successfully" };
}

export function cancelMeal(rollNo, mealType, date = getTodayISO()) {
  const student = findStudent(rollNo);
  if (!student) {
    return { ok: false, message: "Student not found" };
  }

  const booking = student.bookings.find((b) => b.date === date);
  if (!booking || !booking[mealType]) {
    return { ok: false, message: "No booked meal to cancel" };
  }

  const now = new Date();
  if (!canCancel(mealType, now)) {
    return { ok: false, message: "Cancellation time is over for this meal" };
  }

  booking[mealType] = false;
  updateStudent(student);
  return { ok: true, message: "Meal cancelled successfully" };
}

export function getBookingForDate(rollNo, date = getTodayISO()) {
  const student = findStudent(rollNo);
  if (!student) return undefined;
  return student.bookings.find((b) => b.date === date);
}

// মাসভিত্তিক view এর জন্য
function isInMonth(booking, month, year) {
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

  const list = student.bookings.filter((b) => isInMonth(b, month, year));
  list.sort((a, b) => a.date.localeCompare(b.date));
  return list;
}
