https://with-alif.github.io/mess-web/

# Student Hall Mess Management System

A complete offline-capable mess (canteen) management system built using  
**HTML + CSS + Vanilla JavaScript (ES Modules)** with localStorage-based data storage.  
This system includes both **Student Panel** and **Admin Panel** inside a single-page app.

---

## 🖼️ App Preview (Screenshots)

### 🔹 Overview (Dashboard)
![Overview](./picture/overview.jpg)

### 🔹 Booking / Daily Meal Selection
![Booking](./picture/booking.jpg)

### 🔹 Meal Report Export (PDF / JPG)
![Meal Report](./picture/meal-report.jpg)

---

## ✨ Features

### 👨‍🎓 Student Features
- View today’s **Breakfast / Lunch / Dinner** menu  
- Book meals for the day  
- See meal history  
- Check **Remaining Balance**  
- Simple Roll-based login  
- Fully mobile-responsive UI  

---

### 🧑‍💼 Admin Features

#### 🛡️ Admin Login
- Password-protected admin access  
- Credentials handled in `admin-auth.js`

#### 🍽️ Menu & Prices
- Set daily **Breakfast / Lunch / Dinner** menu  
- Configure per-meal price settings  

#### 👥 Student Management
- Add new students (Name, Roll, Room, Starting Balance)  
- Edit / Delete students  
- Add **Payments (Deposits)**  
  - Updates both `totalDeposits` & `currentBalance`  
- View searchable student list:
  - Name  
  - Roll  
  - Room  
  - Deposit  
  - Balance  

#### 💵 Monthly Billing
- Select student, month, and year  
- Calculates based on actual meals taken  
- Smart billing:
  - `delta = newTotal - previousBilledAmount`
  - Only extra meals are charged  
- Updates `currentBalance` automatically  
- Prevents **double billing**  

#### 📊 Reports (Daily / Monthly / Range)
- Summary table (meal counts + total amount)  
- Per-student breakdown  
- Grand Total  
- Export options:
  - **PDF (jsPDF)**
  - **JPG (html2canvas via picture.js)**  

---

## 🛠 Tech Stack

- HTML5, CSS3
- Vanilla JavaScript (ES Modules)
- LocalStorage for persistence
- [jsPDF](https://github.com/parallax/jsPDF) – PDF export
- [html2canvas](https://github.com/niklasvh/html2canvas) – JPG export

---

## 📁 Folder Structure  

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


