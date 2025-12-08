// student.js (final)

import { getStudents, saveStudents } from "./storage.js";

export function listStudents() {
  return getStudents();
}

export function findStudent(rollNo) {
  const students = getStudents();
  return students.find((s) => s.rollNo === String(rollNo).trim()) || null;
}



export function updateStudent(updated) {
  const students = getStudents();
  const trimmedRoll = String(updated.rollNo).trim();

  const idx = students.findIndex((s) => s.rollNo === trimmedRoll);
  if (idx === -1) {
    return { ok: false, message: "Student not found" };
  }

  students[idx] = {
    ...students[idx],
    ...updated,
    rollNo: trimmedRoll,
    currentBalance: Number(updated.currentBalance) || 0
  };

  saveStudents(students);
  return { ok: true, message: "Student updated", student: students[idx] };
}

export function registerStudent(rollNo, name, roomNumber, initialBalance) {
  const trimmedRoll = String(rollNo).trim();
  const trimmedName = String(name).trim();
  const trimmedRoom = String(roomNumber).trim();

  if (!trimmedRoll || !trimmedName || !trimmedRoom) {
    return { ok: false, message: "Roll, name and room are required" };
  }

  const students = getStudents();
  const existing = students.find((s) => s.rollNo === trimmedRoll);
  if (existing) {
    return { ok: false, message: "Student with this roll already exists" };
  }

  const student = {
    rollNo: trimmedRoll,
    name: trimmedName,
    roomNumber: trimmedRoom,
    currentBalance: Number(initialBalance) || 0,
    bookings: [] // meal booking history
  };

  students.push(student);
  saveStudents(students);

  return { ok: true, message: "Student registered successfully", student };
}

export function deleteStudent(rollNo) {
  const trimmedRoll = String(rollNo).trim();
  const students = getStudents();
  const idx = students.findIndex((s) => s.rollNo === trimmedRoll);

  if (idx === -1) {
    return { ok: false, message: "Student not found" };
  }

  students.splice(idx, 1);
  saveStudents(students);

  return { ok: true, message: "Student deleted successfully" };
}
