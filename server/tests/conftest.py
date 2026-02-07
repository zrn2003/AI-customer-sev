import pytest
from fastapi.testclient import TestClient
from server import app, get_db_connection
import os
from dotenv import load_dotenv

# Load env
load_dotenv()

@pytest.fixture(scope="module")
def client():
    # In a real scenario, we might use a separate Test DB
    # For this simplified setup, we will use the existing DB but be careful
    # to clean up or use specific test users.
    # Ideally: Override get_db_connection to point to a test DB.
    with TestClient(app) as c:
        yield c

@pytest.fixture
def auth_headers(client):
    # Login as Admin to get token/mock auth
    # Since our app uses simple ID/Email based checks or Session storage in frontend,
    # and the backend isn't using strict JWT middleware yet (it checks request body or simple params),
    # we can just prepare standard headers if needed.
    # Note: The current server.py implementation is quite loose on Auth Middleware.
    return {}

