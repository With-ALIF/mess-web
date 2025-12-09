# 🌟 Student Hall Mess Management System 

<p align="justify"> <img src="https://img.shields.io/badge/HTML5-Expert-orange?style=for-the-badge&logo=html5" /> <img src="https://img.shields.io/badge/JavaScript-ES%20Modules-yellow?style=for-the-badge&logo=javascript" /> <img src="https://img.shields.io/badge/LocalStorage-Offline%20Data-green?style=for-the-badge&logo=googlechrome" /> <img src="https://img.shields.io/badge/PDF-jsPDF-red?style=for-the-badge&logo=adobe" /> <img src="https://img.shields.io/badge/JPG-html2canvas-purple?style=for-the-badge" /> </p>

The **Student Hall Mess Management System** is a fully offline, browser-based application designed to automate and simplify daily and monthly mess operations inside a university hall or dormitory.  
Built with **HTML, CSS, and Vanilla JavaScript (ES Modules)**, the system stores all data in `localStorage`, requiring no backend or external database.  
Despite being lightweight, it delivers the functionality of a complete management platform.

The project aims to provide a **modern, fast, and intuitive** interface for both students and administrators, featuring real-time updates, accurate meal tracking, smart billing automation, and professional reporting tools.

---
<b>🚀 <h1>Live Demo</h1></b>

<b>🔗 https://with-alif.github.io/mess-web/</b>

A fully offline, browser-based hall mess management system built using HTML + CSS + Vanilla JavaScript (ES Modules) with localStorage as database.

---

## 👨‍🎓 **Student Panel — Full Details**

Students can access their personalized dashboard simply by entering their **Roll Number** —  
no password, signup, or login system is required.  
This makes the system fast, frictionless, and extremely easy to use, even for first-time users.

Once logged in, students get a clean and organized interface that shows all essential mess-related information in real time.

---

### 🎯 **What Students Can Do**

#### 🍽️ **1. View Today’s Menu**
Students can instantly see:
- **Breakfast**
- **Lunch**
- **Dinner**

The menu is fully controlled by the admin and updates live whenever changed.  
This helps students plan their meals before booking.

---

#### 📝 **2. Book or Cancel Today’s Meals**
Students can:
- Select which meals they want to take  
- Cancel a meal if they change their mind  
- View confirmation and updated meal status immediately  

All bookings are stored offline and synced with the monthly billing engine.

---

#### 📅 **3. View Personal Meal History**
Students have access to a complete log of meals they booked each day:
- Easily check past meal activity  
- Ensure billing transparency  
- Understand monthly meal usage  

This builds trust and makes end-of-month billing clear.

---

#### 💰 **4. Check Remaining Balance (Live Update)**
The student dashboard shows their **current balance** at all times.  
Whenever:
- A meal is booked  
- A deposit is added  
- Monthly billing updates the balance  

The amount automatically refreshes and stays accurate.

---

#### 📱 **5. Fully Responsive Experience**
The student interface is designed to work smoothly on:
- Desktop  
- Laptop  
- Tablet  
- Mobile phones  

Buttons, tables, and forms rearrange neatly for smaller screens, making it easy to use from anywhere.

---

### ✅ **Student Panel Summary**

| Feature | Description |
|---------|-------------|
| Menu View | Shows daily menu (Breakfast/Lunch/Dinner) |
| Meal Booking | Book or cancel meals instantly |
| Meal History | View complete monthly meal log |
| Balance Tracking | Live remaining balance display |
| No Login | Roll-number based instant access |
| Offline Support | Works without internet or account |

---
## 🧑‍💼 **Admin Panel — Full Management System**

Admins access a complete, powerful management dashboard using a secure password.  
The Admin Panel provides full control over students, meals, pricing, reports, and billing—all within a clean, modern interface.

---

### 📊 **Dashboard Overview**

The admin dashboard provides a quick, real-time summary of daily mess operations.  
It includes:

- 👥 **Total registered students**  
- 🍽️ **Today’s meal counts** (Breakfast / Lunch / Lunch)  
- 💵 **Estimated daily earnings**  
- 🧾 **Quick-glance cards** for important metrics  
- 📈 Auto-updates as students book or cancel meals  

The dashboard is designed for fast decision-making and easy monitoring.

---

### 👥 **Student Management**

Admins can efficiently manage all student records:

- ➕ Register new students (Name, Roll, Room, Balance)  
- ✏️ Edit student details  
- ❌ Delete students from the system  
- 💳 Add deposit/payments  
  - Updates both **totalDeposits** and **currentBalance**  
- 🔍 Search students by name or roll  
- 📋 View complete student table:
  - Name  
  - Roll  
  - Room  
  - Deposit  
  - Current Balance  

All updates are instant and stored offline.

---

### 🍽️ **Menu & Meal Price Management**

Admins control the daily food menu and pricing:

- Set the **Breakfast, Lunch, Dinner** menu for the day  
- Update **per-meal prices** anytime  
- Menu updates instantly reflect on the Student Panel  
- Prices sync automatically with the monthly billing system  

Ensures accurate reporting and billing.

---

### 📅 **Monthly Billing Engine**

The system includes a smart billing engine for accuracy and transparency.

- Calculates meals taken in any selected month  
- Applies the admin-set prices  
- Tracks previously billed totals to avoid double charges  
- Deducts only the **difference** if billing is re-calculated  

Billing Logic: delta = newTotal - alreadyBilledTotal

---


Billing output includes:

- Total bill amount  
- Previously charged amount  
- Charged this session  
- Updated student balance  

---

### 📊 **Reports & Export**

Admins can generate:

- 📅 Daily Reports  
- 🗓️ Monthly Reports  
- 📆 Custom Range Reports  

Each report includes:

- Summary of meal counts  
- Per-student breakdown  
- Grand total revenue  

Export Options:

- 📄 **PDF download** (jsPDF)  
- 🖼️ **JPG download** (html2canvas)  

Perfect for auditing or record-keeping.

---

### 💾 **Backup & Restore System**

- Export the entire mess database as a **JSON file**  
- Import backup anytime  
- Fully restores:
  - Students  
  - Menu  
  - Pricing  
  - Billing history  
  - Reports  
  - Deposits  
  - Meal bookings  

Ensures long-term data safety and portability.

---
 
## 🎨 UI / UX Design

The interface follows a modern and minimalistic design:

- Rounded cards  
- Soft shadows  
- Clean typography  
- Spacious layout  
- Mobile-responsive structure  
- Simple tab navigation (Student / Admin)  

---

## 🛠️ Tech Stack

- **HTML5**  
- **CSS3**  
- **JavaScript (ES Modules)**  
- **localStorage**  
- **jsPDF** — PDF export  
- **html2canvas** — JPG export  
- **GitHub Pages** — deployment  

---

## ✅ Summary

This system delivers a complete workflow for mess management:

- Students can book meals and track balance  
- Admins can manage menus, prices, students, deposits, billing, and reports  
- Data is safe and persists offline  
- Billing is accurate and prevents duplication  
- Reports are detailed and exportable  
- UI is clean, modern, and highly functional  

### Ideal for:
- Hostels  
- university halls  
- Dormitories  
- Canteen management  
- Offline mess management systems   


