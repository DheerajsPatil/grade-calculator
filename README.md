# GradeMaster - Academic Grade Calculator & Target Planner

A sleek, modern, and responsive web application designed for students and educators to calculate grades, project required final exam scores, track points-based courses, and compute semester GPA.

[![Live Demo](https://img.shields.io/badge/🌐%20Live%20Demo-GitHub%20Pages-4f46e5?style=for-the-badge)](https://dheerajspatil.github.io/grade-calculator/)

![GradeMaster Screenshot](https://img.shields.io/badge/status-active-success.svg)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)

> 🔗 **Live App:** https://dheerajspatil.github.io/grade-calculator/

---

## ✨ Features

- **Weighted Category Grade Calculator**:
  - Add, edit, and delete course components (Homework, Midterms, Quizzes, Projects, Finals).
  - Dual input: Direct Percentage (`%`) or Points Fraction (`Earned / Total Possible`).
  - Real-time weight sum validation with colored progress indicator.
  - Automatic normalization for courses currently in progress.

- **Final Exam Target Planner ("What Do I Need on the Final?")**:
  - Solves for the exact score needed on your final exam to achieve your desired target grade.
  - Visual status badges (Grade Secured, Attainable, Challenging, or Extra Credit Required).

- **Points-Based Grade Calculator**:
  - For courses evaluated purely on total accumulated points.
  - Live totals for points earned, total possible, and letter grade conversion.

- **Semester GPA Calculator**:
  - Calculate semester GPA based on course credit hours and letter grades on a standard 4.0 scale.

- **Visual Circular Gauge & Metrics**:
  - Animated SVG radial gauge reflecting current percentage and letter grade standing in real-time.
  - GPA equivalent readout and category contribution breakdown.

- **Productivity & Usability**:
  - 🌓 Dark & Light mode toggle with stored preference.
  - 📋 Quick-load syllabus templates (*Standard College*, *STEM Lab*, *High School*).
  - ⚙️ Customizable grading scale cutoffs.
  - 💾 Automatic offline saving via `localStorage`.
  - 🖨️ Clean Print & PDF export layout.

---

## 🚀 Quick Start

No build tools or server setup required!

### Option 1: Direct File
Simply double-click `index.html` to open it in any web browser.

### Option 2: Local HTTP Server (Python)
```bash
# Clone the repository
git clone https://github.com/DheerajsPatil/grade-calculator.git
cd grade-calculator

# Launch local server
python -m http.server 8000
```
Open `http://localhost:8000` in your web browser.

---

## 📁 Project Structure

```
├── index.html        # Main web interface & accessible structure
├── styles.css        # Responsive layout, animations & theme definitions
├── app.js            # Reactive calculation engine & state synchronization
└── README.md         # Project documentation
```

---

## 📄 License
This project is open source and available under the [MIT License](LICENSE).
