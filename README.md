# AI-Based Customer Support & Resolution Predictor

This repository contains an intelligent customer support application that leverages Artificial Intelligence to automatically categorize complaints, assign severity scores (1-10), and draft resolution responses using Large Language Models (LLM).

**Repository**: [https://github.com/zrn2003/AI-customer-sev](https://github.com/zrn2003/AI-customer-sev)

---

## 🚀 Features

- **Automated Severity Scoring**: Analyzes complaint text using a local NLP model (Scikit-Learn) to assign a severity score (Low/Medium/High) and estimate resolution time.
- **AI-Drafted Resolutions**: Generates professional, policy-aware response drafts using a custom **Hugging Face Space** integration (powered by Google Gemini).
- **Dynamic Dashboards**:
  - **Customer Panel**: Submit complaints, track status, and view resolutions.
  - **Admin Console**: Prioritize tickets based on AI severity, review AI suggestions, and resolve issues.
- **Full Authentication**: Secure login/registration for Customers and Admins.
- **Audit Logging**: Tracks all status changes and resolution updates.

---

## 🛠️ Technology Stack

### Backend (Django)
The backend is built using **Django** and **Django REST Framework (DRF)**, providing a robust, scalable, and secure API foundation.

#### 1. Project Structure
- **`supportflow/`**: The main project configuration directory containing `settings.py`, `urls.py`, and WSGI/ASGI configs.
- **`api/`**: The core application module managing all business logic.
  - **`models.py`**: Defines the database schema (Users, Complaints, History).
  - **`views.py`**: Contains the API controllers for handling requests (Auth, Complaints, AI prediction).
  - **`serializers.py`**: Handles data validation and transformation (JSON <-> Python Objects).
  - **`ai_engine.py`**: Encapsulates the ML logic for severity scoring and resolution drafting.

#### 2. Key Components
- **Custom User Model**: Extends `AbstractUser` to support role-based access (Admin/Customer) and email-based login.
- **RESTful API**:
  - `POST /api/auth/register`: User registration with role assignment.
  - `POST /api/auth/login`: Authenticates users and returns user details.
  - `GET/POST /api/complaints/`: Lists complaints (filtered by user/role) or creates new ones.
  - `PATCH /api/complaints/{id}/`: Updates status or adds resolutions.
- **AI Integration**:
  - The `SeverityAI` class in `ai_engine.py` loads scikit-learn models to predict severity scores on-the-fly.
  - `generate_ai_suggestion` utilizes `gradio_client` to connect to the hosted [Customer-Support-ai](https://huggingface.co/spaces/devi1675/Customer-Support-ai) Space for instant resolution drafting.

#### 3. Database & Security
- **PostgreSQL**: Used as the primary data store for production-grade reliability.
- **ORM**: Django ORM abstracts SQL queries, preventing SQL injection.
- **CORS Headers**: Configured to safely allow requests from the React frontend.
- **Environment Variables**: Sensitive data (DB credentials, API keys) are managed via `.env` files.

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
git clone https://github.com/zrn2003/AI-customer-sev
cd AI-customer-sev
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

# AI Configuration
# No API Keys required for basic operation (Uses public Hugging Face Space)

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
3. **Hugging Face Integration**: Connects to `devi1675/Customer-Support-ai` via Gradio Client to leverage a fine-tuned Gemini model for generating empathetic and accurate complaint resolutions.
