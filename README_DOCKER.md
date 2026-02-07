# How to Run SupportFlow (Docker)

To run this project on another machine, you only need **Docker Desktop** installed.

## 1. Prerequisites
*   Install [Docker Desktop](https://www.docker.com/products/docker-desktop/)

## 2. Setup
1.  Unzip this project folder.
2.  Navigate to `server/` and create a `.env` file (if not present) with your database keys:
    ```env
    DB_HOST=...
    DB_USER=...
    DB_PASSWORD=...
    OPENROUTER_API_KEY=...
    ```

## 3. Run
Open a terminal in the main project folder (where `docker-compose.yml` is) and run:

```bash
docker-compose up --build
```

## 4. Access
*   **Web App**: http://localhost:5173
*   **API Docs**: http://localhost:8000/docs
