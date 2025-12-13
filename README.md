# Infosys Customer Feedback Analysis System

## 📌 Overview

A **full‑stack, production‑grade Customer Feedback Analysis platform** designed to collect, analyze, and visualize customer feedback using **Machine Learning** and **Active Learning** techniques. The system enables organizations to gain deep insights into customer sentiment, confidence, issues, and trends through an elegant, scalable, and enterprise‑ready architecture.

This project is built and structured to align with **Infosys industry evaluation standards**.

---

## 🚀 Key Features

### 🔐 Authentication & Roles

* User registration and login
* Secure admin authentication
* Role‑based access control

### 🤖 Intelligent Feedback Analysis

* Sentiment analysis (positive / negative / neutral)
* Confidence scoring for predictions
* Aspect‑based sentiment insights
* Issue detection and suggestions

### 🔁 Active Learning & Model Management

* Active learning workflow for uncertain samples
* Model retraining with new feedback data
* Versioned ML models with history tracking
* Background retraining jobs

### 📊 Advanced Visualizations

* Interactive charts and dashboards
* Trend analysis over time
* Downloadable visual reports
* Clean and professional UI/UX

### 🛠️ Admin Dashboard

* User management
* Dataset and model management
* Retraining job monitoring
* Logs and system insights

---

## 🧱 Tech Stack

### Backend

* **Language:** Python
* **Framework:** FastAPI
* **Architecture:** RESTful APIs
* **Background Tasks:** Worker‑based processing

### Frontend

* **Language:** JavaScript
* **Framework:** Next.js
* **UI:** Component‑based, responsive layouts
* **Charts & Animations:** Modern visualization components

### Database

* **Type:** NoSQL
* **Database:** MongoDB

### Machine Learning

* TF‑IDF + Logistic Regression (TLR)
* Transformer‑based models
* Active Learning pipeline

---

## 🏗️ Architecture Overview

* Clear separation of **Frontend** and **Backend**
* Modular and scalable project structure
* Secure API communication
* Deployment‑ready and Git‑safe

```
Root
│── backend/        # FastAPI backend & ML logic
│── frontend/       # Next.js frontend application
│── notes/          # Project documentation & references
│── requirements.txt
│── README.md
```

---

## ▶️ Run Locally (Basic)

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate   # Windows
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## ☁️ Deployment Note

* Environment variables are managed via `.env` files (not committed to GitHub)
* MongoDB connection uses secure environment configuration
* Designed for cloud platforms like Vercel, Render, or similar

---

## 🧠 Machine Learning Models

The system incorporates **custom-trained sentiment analysis models**, including a **TF-IDF + Logistic Regression (TLR/LR) pipeline** and an advanced learning-based model.  
These models are integrated into an **active learning framework** to support continuous improvement, versioning, and retraining.


---

## 📄 License

This project is licensed under the **MIT License**.

---

## ✨ Final Note

This system demonstrates **end‑to‑end engineering skills**, combining **backend APIs**, **frontend UI/UX**, **machine learning**, and **system design**, making it suitable for **enterprise‑level evaluation and real‑world deployment**.

---

**Built with precision, scalability, and professionalism.** 🚀
