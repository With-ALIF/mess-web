// billing.js (final fixed)

import { getPrices } from "./storage.js";
import { findStudent } from "./student.js";

// booking.date = "YYYY-MM-DD"
// main.js থেকে monthIndex = 0–11 (January = 0)
function isInMonth(booking, year, monthIndex) {
  const [yyyyStr, mmStr] = booking.date.split("-");
  const yyyy = Number(yyyyStr);
  const mmIndex = Number(mmStr) - 1; // 1–12 → 0–11

  return yyyy === year && mmIndex === monthIndex;
}

// main.js থেকে কল: calculateMonthlyBill(roll, year, monthIndex)
export function calculateMonthlyBill(rollNo, year, monthIndex) {
  const student = findStudent(rollNo);
  if (!student) {
    return new Error("Student not found");
  }

  const prices = getPrices();

  let breakfastCount = 0;
  let lunchCount = 0;
  let dinnerCount = 0;

  for (const b of student.bookings) {
    if (!isInMonth(b, year, monthIndex)) continue;
    if (b.breakfast) breakfastCount += 1;
    if (b.lunch) lunchCount += 1;
    if (b.dinner) dinnerCount += 1;
  }

  const breakdown = {
    breakfast: breakfastCount * prices.breakfast,
    lunch: lunchCount * prices.lunch,
    dinner: dinnerCount * prices.dinner
  };

  const total =
    breakdown.breakfast + breakdown.lunch + breakdown.dinner;

  // 👉 এই অবজেক্টের স্ট্রাকচার main.js ঠিক এভাবেই ব্যবহার করছে
  return {
    rollNo: student.rollNo,
    studentName: student.name,
    counts: {
      breakfast: breakfastCount,
      lunch: lunchCount,
      dinner: dinnerCount
    },
    prices,
    breakdown,
    total,
    year,
    monthIndex
  };
}

// main.js থেকে কল: formatMonthYear(year, monthIndex)
export function formatMonthYear(year, monthIndex) {
  const date = new Date(year, monthIndex, 1); // 0–11
  return date.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric"
  });
}
