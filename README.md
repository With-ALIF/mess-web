https://with-alif.github.io/mess-web/

# Student Hall Mess Management System

A single-page web app for managing a university hall **mess** (canteen) using only HTML, CSS and vanilla JavaScript (ES modules).  
Data is stored in `localStorage`, so everything works completely offline in the browser.

> 💡 UI has two tabs: **Student** and **Admin** – both run from the same page.

---

## ✨ Main Features

### 👨‍🎓 Student Panel

- Login by **Roll** number
- See **today’s menu** (Breakfast/Lunch/Dinner)
- Book / cancel meals for today
- View own **meal history**
- Live **remaining balance** badge
- Works nicely on mobile as well

### 🧑‍💼 Admin Panel

- Admin login (password logic in `admin-auth.js`)
- Dashboard with today’s overview:
  - total students
  - today’s meal counts
  - estimated total cost
- Manage **today’s menu**
- Set **meal prices** (breakfast / lunch / dinner)
- **Register students** (name, roll, room, starting balance)
- View / search **students list** (Name, Roll, Room, Deposit, Balance)
- Edit & delete students
- Add **payments / deposits**
  - Increases both `currentBalance` and `totalDeposits`
- Monthly billing:
  - Calculates meals for a month
  - Only **extra unbilled amount** is charged (using `billedTotals`)
  - Updates student `currentBalance`
- **Data backup & restore**
  - Export all data as JSON
  - Import JSON backup

### 📊 Reports & Exports

- Daily, Monthly, and Custom Range **Meal Report**
- Summary + per-student breakdown table
- Export the current report as:
  - **PDF** (via jsPDF)
  - **JPG image** (via html2canvas, handled by `picture.js`)

---

## 🛠 Tech Stack

- HTML5, CSS3
- Vanilla JavaScript (ES Modules)
- LocalStorage for persistence
- [jsPDF](https://github.com/parallax/jsPDF) – PDF export
- [html2canvas](https://github.com/niklasvh/html2canvas) – JPG export

---

## 📁 Folder Structure (example)

```text
project/

    index.html
    style.css
  src/
    utils.js
    storage.js
    models.js
    student.js
    student-ui.js
    admin-auth.js
    admin-panel.js
    dashboard.js
    admin-reports.js
    picture.js
    ui-shell.js
    main.js

```

## 🧭 Usage Guide

---

## 👨‍🎓 Student Side

1. Go to **Student** tab.  
2. Enter your **Roll** and login.

You can:

- ✔️ See today’s menu  
- ✔️ Book today’s meals  
- ✔️ View your meal history  
- ✔️ Check your remaining balance  

---

## 🧑‍💼 Admin Side

1. Switch to **Admin** tab.  
2. Enter admin password (defined in `admin-auth.js`).  

After login you can:

---

## 🍽️ Menu & Prices

- Set today’s **Breakfast / Lunch / Dinner** menu  
- Set **per-meal prices**  

---

## 🧍 Students

- Register a new student (Name, Roll, Room, starting Balance)  
- View all students in a table:
  - **Name**, **Roll**, **Room**, **Deposit**, **Balance**
- Edit or delete a student  

### ➕ Add Payment

- Select **Roll**  
- Enter **Amount**  
- Click **Add Payment**  
  → This updates **currentBalance** and **totalDeposits**  

---

## 📅 Monthly Billing Logic

1. Choose **Roll**, **Month**, **Year**  
2. Click **Calculate**  
3. System calculates the **total bill** for that month  
4. Compares with previously billed amount:


