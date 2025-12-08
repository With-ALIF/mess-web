// auth.js

const ADMIN_STATE_KEY = "mess_admin_state";

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123";

export function getAdminUsername() {
  return ADMIN_USERNAME;
}

export function isAdminLoggedIn() {
  try {
    const raw = localStorage.getItem(ADMIN_STATE_KEY);
    if (!raw) return false;
    const obj = JSON.parse(raw);
    return !!obj.loggedIn;
  } catch (e) {
    return false;
  }
}

export function loginAdmin(password) {
  if (password === ADMIN_PASSWORD) {
    localStorage.setItem(
      ADMIN_STATE_KEY,
      JSON.stringify({ loggedIn: true, username: ADMIN_USERNAME })
    );
    return { ok: true, message: "Login successful." };
  }
  return { ok: false, message: "Invalid password." };
}

export function logoutAdmin() {
  localStorage.removeItem(ADMIN_STATE_KEY);
}
