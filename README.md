# MyTravelCanvas – Smart Trip Planner 🌍✈️

## 📋 Overview
**MyTravelCanvas** is an interactive, all-in-one trip planning web application designed to simplify travel organization.  
Built as my **Trimester 2 End Term Project**, it combines itinerary management, budget tracking, packing lists, and trip summaries into a single, intuitive interface.

> **Note:** This project is deeply personal to me as someone passionate about travel and aims to solve real-world trip planning challenges I’ve experienced firsthand.

---

## 🎯 The Problem
Planning trips typically involves juggling multiple tools:

- 📝 Notes for itineraries  
- 📊 Spreadsheets for budgets  
- ✅ Checklists for packing  

This fragmentation often leads to poor organization, missed details, and unnecessary stress.

---

## ✨ The Solution
**MyTravelCanvas** centralizes all trip planning aspects into one cohesive platform.

---

## 🧭 Trip Management
- Create multiple trips with destination, dates, and type  
- Interactive trip cards with quick access  
- Persistent storage using `localStorage`  
- Delete trips with confirmation  

---

## 📅 Smart Itinerary Planner
- Auto-generates days based on trip duration  
- Add activities with time slots and optional notes  
- Intelligent activity icons based on keywords  
  - 🍽️ Food  
  - 🚗 Travel  
  - 🏛️ Sightseeing  
- Mark activities as completed  
- Reorder activities (move up / down)  
- Delete activities with confirmation  

---

## 💰 Budget Tracker
- Set total trip budget  
- Add categorized expenses (Food, Stay, Transport, etc.)  
- Associate expenses with specific days  
- Automatic calculations:
  - Total spent  
  - Remaining budget  
  - Budget usage percentage  
- Visual budget warnings (⚠️ nearing / exceeding limits)  
- Category-wise breakdown using progress bars  
- Expense history with delete functionality  

---

## 🎒 Packing Checklist
- Auto-generated lists based on trip type  
  - 🏖️ Beach  
  - ❄️ Winter  
  - 💼 Business  
- Category-wise organization  
- Progress tracking (overall & per category)  
- Add custom items  
- Visual completion indicators  
- Delete items as needed  

---

## 📊 Trip Summary Dashboard
- Total trip duration  
- Number of activities planned  
- Budget usage percentage  
- Packing completion percentage  
- Detailed trip information  
- Visual expense distribution by category  

---

## 🎨 UI / UX Features
- 🌙 Dark / Light mode with persistence  
- 📱 Fully responsive design  
- 🎬 Smooth animations and transitions  
- ⚡ Modal-based interactions  
- 💭 Rotating inspirational travel quotes  
- 🔔 Toast-style notifications for user actions  

---

## 🛠️ Technical Implementation

### 🧠 DOM Concepts Utilized
This project heavily leverages core DOM manipulation techniques:

```js
// Core DOM Methods
document.getElementById()
document.querySelector()
document.querySelectorAll()
document.createElement()

// UI Updates
element.innerHTML
classList.add()
classList.remove()
classList.toggle()

// Event Handling
addEventListener()
event delegation for dynamic elements
preventDefault() for form handling

// Data Attributes
data-* attributes for state management

// Storage
localStorage.getItem()
localStorage.setItem()

// Styling
dynamic styling and conditional rendering

// Timers
setTimeout()
setInterval()
```

## ▶️ Getting Started

### Prerequisites
- Any modern web browser (Chrome, Firefox, Edge, Safari)
- No external libraries or build tools required

### Steps to Run
1. Clone or download the repository
2. Open the project folder
3. Open `index.html` in a browser  
   *(Using Live Server is recommended for best experience)*

> The application runs completely on the frontend and does not require a backend.

## ⚠️ Known Limitations
- No backend integration (data stored only in browser `localStorage`)
- Data will be lost if browser storage is cleared
- No user authentication or multi-user support
- Budget supports numeric values only (no currency conversion)

## 🚀 Future Improvements
- Backend support with authentication
- Cloud-based data storage
- Trip sharing and collaboration
- Export itinerary as PDF
- Currency conversion support
- Integration with maps and location services

## 👨‍💻 Author
**Naman Golchha**  
Trimester 2 – End Term Project  
Built with passion for travel and creativity.
