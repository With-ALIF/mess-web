import { DEFAULT_MENU,
    DEFAULT_PRICES
 } from "./models.js";

const STUDENT_KEY = "mess.students";
const MENU_KEY = "mess.menu";
const PRICES_KEY = "mess.prices";

function readJson(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        if(!raw) return fallback;
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

