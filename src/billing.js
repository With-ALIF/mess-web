import { getPrices } from "./storage.js";
import { findStudent, listStudents } from "./student.js";

function toISODate(date) {
  if (!date) return null;

  if (date instanceof Date) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  if (typeof date === "string") {
    if (date.length === 10 && date.includes("-")) return date;
    const d = new Date(date);
    if (!isNaN(d)) return toISODate(d);
  }

  return null;
}

function isInMonth(booking, year, monthIndex) {
  if (!booking || !booking.date) return false;
  const [yyyyStr, mmStr] = booking.date.split("-");
  const yyyy = Number(yyyyStr);
  const mmIndex = Number(mmStr) - 1;
  return yyyy === year && mmIndex === monthIndex;
}

export function calculateMonthlyBill(rollNo, year, monthIndex) {
  const student = findStudent(rollNo);
  if (!student) return new Error("Student not found");

  const prices = getPrices();
  const bookings = Array.isArray(student.bookings) ? student.bookings : [];

  let breakfastCount = 0;
  let lunchCount = 0;
  let dinnerCount = 0;

  for (const b of bookings) {
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

export function formatMonthYear(year, monthIndex) {
  const date = new Date(year, monthIndex, 1);
  return date.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric"
  });
}

export function getDailyMealsReport(date) {
  const dateIso = toISODate(date);
  if (!dateIso) return new Error("Invalid date");

  const prices = getPrices();
  const students = listStudents();

  let breakfastCount = 0;
  let lunchCount = 0;
  let dinnerCount = 0;

  const byStudent = [];

  for (const student of students) {
    const bookings = Array.isArray(student.bookings)
      ? student.bookings
      : [];

    let bf = 0;
    let ln = 0;
    let dn = 0;

    for (const b of bookings) {
      if (b.date !== dateIso) continue;
      if (b.breakfast) bf += 1;
      if (b.lunch) ln += 1;
      if (b.dinner) dn += 1;
    }

    if (bf === 0 && ln === 0 && dn === 0) continue;

    breakfastCount += bf;
    lunchCount += ln;
    dinnerCount += dn;

    const total =
      bf * prices.breakfast +
      ln * prices.lunch +
      dn * prices.dinner;

    byStudent.push({
      rollNo: student.rollNo,
      name: student.name,
      breakfast: bf,
      lunch: ln,
      dinner: dn,
      total
    });
  }

  const breakfastTotal = breakfastCount * prices.breakfast;
  const lunchTotal = lunchCount * prices.lunch;
  const dinnerTotal = dinnerCount * prices.dinner;
  const grandTotal =
    breakfastTotal + lunchTotal + dinnerTotal;

  const title =
    "Daily report for " +
    new Date(dateIso).toLocaleDateString();

  return {
    title,
    date: dateIso,
    summary: {
      breakfastCount,
      lunchCount,
      dinnerCount,
      breakfastTotal,
      lunchTotal,
      dinnerTotal,
      grandTotal
    },
    byStudent
  };
}

export function getMonthlyMealsReport(year, monthIndex) {
  if (
    typeof year !== "number" ||
    typeof monthIndex !== "number" ||
    monthIndex < 0 ||
    monthIndex > 11
  ) {
    return new Error("Invalid year or month");
  }

  const prices = getPrices();
  const students = listStudents();

  let breakfastCount = 0;
  let lunchCount = 0;
  let dinnerCount = 0;

  const byStudent = [];

  for (const student of students) {
    const bookings = Array.isArray(student.bookings)
      ? student.bookings
      : [];

    let bf = 0;
    let ln = 0;
    let dn = 0;

    for (const b of bookings) {
      if (!isInMonth(b, year, monthIndex)) continue;
      if (b.breakfast) bf += 1;
      if (b.lunch) ln += 1;
      if (b.dinner) dn += 1;
    }

    if (bf === 0 && ln === 0 && dn === 0) continue;

    breakfastCount += bf;
    lunchCount += ln;
    dinnerCount += dn;

    const total =
      bf * prices.breakfast +
      ln * prices.lunch +
      dn * prices.dinner;

    byStudent.push({
      rollNo: student.rollNo,
      name: student.name,
      breakfast: bf,
      lunch: ln,
      dinner: dn,
      total
    });
  }

  const breakfastTotal = breakfastCount * prices.breakfast;
  const lunchTotal = lunchCount * prices.lunch;
  const dinnerTotal = dinnerCount * prices.dinner;
  const grandTotal =
    breakfastTotal + lunchTotal + dinnerTotal;

  const title =
    "Monthly report for " +
    formatMonthYear(year, monthIndex);

  return {
    title,
    year,
    monthIndex,
    summary: {
      breakfastCount,
      lunchCount,
      dinnerCount,
      breakfastTotal,
      lunchTotal,
      dinnerTotal,
      grandTotal
    },
    byStudent
  };
}

export function getRangeMealsReport(from, to) {
  let fromIso = toISODate(from);
  let toIso = toISODate(to);
  if (!fromIso || !toIso) return new Error("Invalid date range");

  if (fromIso > toIso) {
    const tmp = fromIso;
    fromIso = toIso;
    toIso = tmp;
  }

  const prices = getPrices();
  const students = listStudents();

  let breakfastCount = 0;
  let lunchCount = 0;
  let dinnerCount = 0;

  const byStudent = [];

  for (const student of students) {
    const bookings = Array.isArray(student.bookings)
      ? student.bookings
      : [];

    let bf = 0;
    let ln = 0;
    let dn = 0;

    for (const b of bookings) {
      if (!b.date) continue;
      if (b.date < fromIso || b.date > toIso) continue;
      if (b.breakfast) bf += 1;
      if (b.lunch) ln += 1;
      if (b.dinner) dn += 1;
    }

    if (bf === 0 && ln === 0 && dn === 0) continue;

    breakfastCount += bf;
    lunchCount += ln;
    dinnerCount += dn;

    const total =
      bf * prices.breakfast +
      ln * prices.lunch +
      dn * prices.dinner;

    byStudent.push({
      rollNo: student.rollNo,
      name: student.name,
      breakfast: bf,
      lunch: ln,
      dinner: dn,
      total
    });
  }

  const breakfastTotal = breakfastCount * prices.breakfast;
  const lunchTotal = lunchCount * prices.lunch;
  const dinnerTotal = dinnerCount * prices.dinner;
  const grandTotal =
    breakfastTotal + lunchTotal + dinnerTotal;

  const title =
    "Report from " +
    new Date(fromIso).toLocaleDateString() +
    " to " +
    new Date(toIso).toLocaleDateString();

  return {
    title,
    from: fromIso,
    to: toIso,
    summary: {
      breakfastCount,
      lunchCount,
      dinnerCount,
      breakfastTotal,
      lunchTotal,
      dinnerTotal,
      grandTotal
    },
    byStudent
  };
}
