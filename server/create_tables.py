import psycopg2
from dotenv import load_dotenv
import os

# Load environment variables from .env
load_dotenv()

# Fetch variables
USER = os.getenv("DB_USER")
PASSWORD = os.getenv("DB_PASSWORD")
HOST = os.getenv("DB_HOST")
PORT = os.getenv("DB_PORT")
DBNAME = os.getenv("DB_NAME")

def create_full_schema():
    print(f"Connecting to database at {HOST}...")
    try:
        connection = psycopg2.connect(
            user=USER,
            password=PASSWORD,
            host=HOST,
            port=PORT,
            dbname=DBNAME
        )
        cursor = connection.cursor()
        
        # SQL Statements
        # 1. Clean up existing tables (CASCADE to handle foreign keys)
        print("⚠️ Dropping existing tables (if any)...")
        cursor.execute("DROP TABLE IF EXISTS complaint_history CASCADE;")
        cursor.execute("DROP TABLE IF EXISTS complaints CASCADE;")
        cursor.execute("DROP TABLE IF EXISTS users CASCADE;")
        
        # 2. Create Users Table
        print("Creating 'users' table...")
        create_users_query = """
        CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            full_name VARCHAR(100),
            role VARCHAR(20) CHECK (role IN ('admin', 'customer', 'agent')) DEFAULT 'customer',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
        cursor.execute(create_users_query)

        # 3. Create Complaints Table
        print("Creating 'complaints' table...")
        create_complaints_query = """
        CREATE TABLE complaints (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
            title VARCHAR(200) NOT NULL,
            description TEXT NOT NULL,
            category VARCHAR(50) DEFAULT 'General',
            status VARCHAR(20) DEFAULT 'Pending',
            priority VARCHAR(20) DEFAULT 'Medium',
            ai_severity_score INTEGER,
            ai_predicted_resolution_time VARCHAR(100),
            resolution TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
        cursor.execute(create_complaints_query)

        # 4. Create History/Audit Table
        print("Creating 'complaint_history' table...")
        create_history_query = """
        CREATE TABLE complaint_history (
            id SERIAL PRIMARY KEY,
            complaint_id INTEGER REFERENCES complaints(id) ON DELETE CASCADE,
            action VARCHAR(50) NOT NULL,
            previous_value TEXT,
            new_value TEXT,
            changed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
        cursor.execute(create_history_query)
        
        # 5. Insert a Default Admin User (Optional but helpful)
        print("Seeding default admin user...")
        seed_admin_query = """
        INSERT INTO users (email, password_hash, full_name, role)
        VALUES ('admin@supportflow.com', 'hashed_secret_password', 'System Admin', 'admin')
        ON CONFLICT (email) DO NOTHING;
        """
        cursor.execute(seed_admin_query)

        connection.commit()
        print("✅ Full database schema created successfully!")
        
        cursor.close()
        connection.close()

    except Exception as e:
        print(f"❌ Failed to create schema: {e}")

if __name__ == "__main__":
    create_full_schema()
