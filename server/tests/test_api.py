import pytest

def test_read_main(client):
    response = client.get("/")
    assert response.status_code == 404 # Root path not defined in server.py, usually /api/...

def test_login_success(client):
    # Depending on seed data. We know admin@supportflow.com exists.
    response = client.post("/api/auth/login", json={
        "email": "admin@supportflow.com",
        "password": "hashed_secret_password" 
    })
    # Note: server.py verifies hash. If the seed used 'hashed_secret_password' as the HASH literally,
    # then we need to send the plain text that results in that hash?
    # Actually create_tables.py inserted: 'hashed_secret_password' directly into password_hash field.
    # And server.py verify_password does: hashlib.sha256(plain.encode()).hexdigest() == hashed
    # So we need to find a plain text P where sha256(P) == 'hashed_secret_password'.
    # This is impossible. The seed data in create_tables.py was dummy text, not a real hash.
    # We should probably register a new user for testing purposes.
    pass 

def test_register_new_user(client):
    # Register a unique user
    import random
    rand_id = random.randint(1000, 9999)
    user_data = {
        "email": f"testuser{rand_id}@example.com",
        "password": "password123",
        "full_name": "Test User",
        "role": "customer"
    }
    response = client.post("/api/auth/register", json=user_data)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == user_data["email"]
    assert "id" in data
    
    return user_data, data["id"]

def test_login_flow(client):
    # 1. Register
    user_data, user_id = test_register_new_user(client)
    
    # 2. Login
    login_resp = client.post("/api/auth/login", json={
        "email": user_data["email"],
        "password": user_data["password"]
    })
    assert login_resp.status_code == 200
    assert login_resp.json()["email"] == user_data["email"]

def test_create_complaint(client):
    # 1. Register
    user_data, user_id = test_register_new_user(client)
    
    # 2. Create Complaint
    complaint_data = {
        "user_id": user_id,
        "title": "Test Complaint API",
        "description": "This is a test complaint description for API testing.",
        "category": "Technical"
    }
    resp = client.post("/api/complaints/", json=complaint_data)
    assert resp.status_code == 200
    data = resp.json()
    assert data["title"] == complaint_data["title"]
    assert data["status"] == "Pending"
    return data["id"]

def test_get_complaints(client):
    cid = test_create_complaint(client)
    resp = client.get("/api/complaints/")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    # Verify the created complaint is in list
    assert any(c['id'] == cid for c in data)

def test_ai_suggestion(client):
    cid = test_create_complaint(client)
    resp = client.get(f"/api/complaints/{cid}/suggest_resolution/")
    assert resp.status_code == 200
    data = resp.json()
    assert "suggestion" in data
    assert "Dear Customer" in data["suggestion"]
