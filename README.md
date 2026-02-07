# SupportFlow - AI Customer Service System

SupportFlow is an AI-powered customer service application that helps manage and resolve customer issues efficiently. It features a modern frontend built with React/Vite and a robust Python backend.

## 🚀 Quick Start with Docker

This is the easiest way to run the application on any system.

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

### Setup

1.  **Clone the repository** (if you haven't already):
    ```bash
    git clone <repository-url>
    cd AI-customer-sev
    ```

2.  **Environment Configuration**:
    Navigate to the `server/` directory and create a `.env` file based on the example provided.

    ```bash
    cp server/.env.example server/.env
    ```

    Open `server/.env` and fill in your credentials:
    ```env
    DB_HOST=your_db_host
    DB_USER=your_db_user
    DB_PASSWORD=your_db_password
    DB_NAME=your_db_name
    DB_PORT=5432
    OPENROUTER_API_KEY=your_openrouter_api_key
    SUPABASE_URL=your_supabase_url
    SUPABASE_KEY=your_supabase_key
    ```

### Running the Application

1.  Open a terminal in the root directory (where `docker-compose.yml` is located).
2.  Run the following command to build and start the containers:

    ```bash
    docker-compose up --build
    ```

    *The first run might take a few minutes as it builds the images.*

### Accessing the Application

Once the containers are running, you can access the application at:

-   **Frontend Web App**: [http://localhost:5173](http://localhost:5173)
-   **Backend API Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)

### Stopping the Application

To stop the containers, press `Ctrl+C` in the terminal, or run:

```bash
docker-compose down
```

## 🛠 Project Structure

-   `frontend/`: React application (Vite)
-   `server/`: Python backend (FastAPI/Flask)
-   `docker-compose.yml`: Docker services configuration
