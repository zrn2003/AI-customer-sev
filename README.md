# AI-Based Customer Support & Resolution Predictor

This repository contains an intelligent customer support application that leverages Artificial Intelligence to automatically categorize complaints, assign severity scores (1-10), and draft resolution responses using Large Language Models (LLM).

**Repository**: [https://github.com/Trups09/AI-based-Customer-Support-and-Resolution-Predictor.git](https://github.com/Trups09/AI-based-Customer-Support-and-Resolution-Predictor.git)

---

## 🚀 Features

- **Automated Severity Scoring**: Analyzes complaint text using a local NLP model (Scikit-Learn) to assign a severity score (Low/Medium/High) and estimate resolution time.
- **AI-Drafted Resolutions**: Generates professional, policy-aware response drafts using Google Gemini (via OpenRouter) or local fallback templates.
- **Dynamic Dashboards**:
  - **Customer Panel**: Submit complaints, track status, and view resolutions.
  - **Admin Console**: Prioritize tickets based on AI severity, review AI suggestions, and resolve issues.
- **Full Authentication**: Secure login/registration for Customers and Admins.
- **Audit Logging**: Tracks all status changes and resolution updates.

---

## 🛠️ Technology Stack

### Backend
- **Framework**: Django & Django REST Framework (Python)
- **Database**: PostgreSQL
- **AI/ML**:
  - **Scikit-Learn**: For keyword-based severity classification (TF-IDF + Naive Bayes).
  - **OpenAI/OpenRouter API**: For bridging with LLMs (Google Gemini Flash Lite).
- **Authentication**: JWT / Session Authentication (Django Auth).

### Frontend
- **Framework**: React (Vite)
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **HTTP Client**: Axios

---

## ⚙️ Installation & Setup

### Prerequisites
- Python 3.10+
- Node.js 18+ & npm
- PostgreSQL (ensure it is running locally or via Docker)

### 1. Clone the Repository
```bash
git clone https://github.com/Trups09/AI-based-Customer-Support-and-Resolution-Predictor.git
cd AI-based-Customer-Support-and-Resolution-Predictor
```

### 2. Backend Setup
Navigate to the `server/` directory and set up the Python environment.

```bash
cd server

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

**Configuration (.env)**
Create a `.env` file in the `server/` root directory:

```env
# Database Configuration
DB_NAME=supportflow
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_PORT=5432

# AI Configuration (Optional for LLM features)
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Security
SECRET_KEY=django-insecure-your-secret-key
DEBUG=True
```

**Database Migration & Admin User**
Initialize the database and create a superuser for dashboard access.

```bash
# Apply migrations
python manage.py makemigrations
python manage.py migrate

# Create Admin User
python manage.py createsuperuser
# Follow the prompts (e.g., email: admin@supportflow.com)
```

**Run the Server**
```bash
python manage.py runserver
# The API will be available at http://127.0.0.1:8000
```

### 3. Frontend Setup
Open a new terminal and navigate to the `frontend/` directory.

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```
The application will launch at `http://localhost:5173`.

---

## 📖 Usage Guide

### Logins
- **Admin Dashboard**: Use the superuser credentials created during setup.
  - View high-priority tickets first.
  - Click "See Solution" to view AI-generated drafts.
- **Customer Dashboard**: Register a new account via the "Sign Up" page.
  - Submit new complaints.
  - View status updates in real-time.

### Deployment (Docker)
A `docker-compose.yml` is provided for containerized deployment.
```bash
docker-compose up --build
```

---

## 🧩 AI Engine Details
The system uses a hybrid AI approach:
1. **KeywordSeverityModel**: A rule-based classifier for immediate triage of critical issues (e.g., "outage", "hack").
2. **LocalResolutionModel**: A TF-IDF similarity search against a knowledge base of past solutions.
3. **LLM Integration**: Uses OpenRouter to access large language models for drafting human-like email responses based on company policy.
