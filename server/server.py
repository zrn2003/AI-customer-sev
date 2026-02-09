import uvicorn
from fastapi import FastAPI, HTTPException, Body, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import psycopg2
from psycopg2.extras import RealDictCursor
import datetime
import random
import os
import hashlib
from dotenv import load_dotenv

# Machine Learning Imports
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import make_pipeline
import numpy as np


# Load .env file
load_dotenv()


# ==========================================
# CONFIGURATION
# ==========================================
DB_CONFIG = {
    "dbname": os.getenv("DB_NAME", "postgres"),
    "user": os.getenv("DB_USER", "postgres"),
    "password": os.getenv("DB_PASSWORD", ""),
    "host": os.getenv("DB_HOST", ""),
    "port": os.getenv("DB_PORT", "5432")
}

app = FastAPI(title="SupportFlow API", description="AI-Powered Complaint Management Backend")

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# AI ENGINE (Severity Classifier)
# ==========================================
class KeywordSeverityModel:
    def __init__(self):
        self.keyword_map = {
            2: [
                "outage", "breach", "hacked", "data loss", "fraud", "unauthorized",
                "double charged", "charged twice", "payment failed", "cannot login",
                "service down", "crash", "crashes", "blocked", "critical"
            ],
            1: [
                "slow", "lag", "delayed", "not received", "missing",
                "issue", "inconsistent", "misaligned", "bug", "error"
            ],
        }

    def predict(self, text: str) -> int:
        lowered = text.lower()
        for label in sorted(self.keyword_map.keys(), reverse=True):
            if any(keyword in lowered for keyword in self.keyword_map[label]):
                return label
        return 0


class LocalResolutionModel:
    def __init__(self):
        self.training_data = [
            (
                "payment failed but money deducted",
                "We have flagged the charge and will verify the transaction with our billing provider. If confirmed as duplicate, a refund will be issued within 3-5 business days."
            ),
            (
                "cannot login or reset password",
                "Please use the 'Forgot Password' option to reset your credentials. If 2FA is still failing, we can verify your account and reset it on our end."
            ),
            (
                "app crashes on startup",
                "Please update to the latest version and clear the application cache. If the crash persists, share the device model and OS version so we can reproduce and escalate."
            ),
            (
                "feature request or suggestion",
                "We have logged your request for our quarterly roadmap review. We'll keep you updated as we evaluate it."
            ),
        ]
        self._train()

    def _train(self):
        texts, responses = zip(*self.training_data)
        self.vectorizer = TfidfVectorizer()
        self.text_vectors = self.vectorizer.fit_transform(texts)
        self.responses = responses

    def suggest(self, complaint_text: str) -> str:
        if not complaint_text.strip():
            return "We will review the details and follow up with next steps shortly."
        query_vector = self.vectorizer.transform([complaint_text])
        similarities = (self.text_vectors * query_vector.T).toarray()
        best_index = int(np.argmax(similarities))
        return self.responses[best_index]


class SeverityAI:
    def __init__(self):
        self.model = None
        self.keyword_model = KeywordSeverityModel()
        # Seed Training Data: (Text, SeverityLabel [0=Low, 1=Medium, 2=High])
        # In a real app, this would come from a database or CSV
        try:
            from ai_config import TRAINING_DATA
            self.training_data = TRAINING_DATA
        except ImportError:
            print("⚠️ ai_config.py not found, using minimal fallback data.")
            self.training_data = [
                ("The app crashes every time I open settings", 2),
                ("I cannot login to my account, password reset not working", 2),
                ("Double charged for my subscription", 2),
                ("Service is down completely", 2),
                ("Data loss, my files are gone", 2),
                ("How do I change my profile picture?", 0),
                ("Loading is a bit slow today", 1),
            ]
        self._train()

    def _train(self):
        print("🧠 Training AI Severity Model...")
        texts, labels = zip(*self.training_data)
        # Create a pipeline: Text -> Vectors -> Classifier
        self.model = make_pipeline(TfidfVectorizer(), MultinomialNB())
        self.model.fit(texts, labels)
        print("✅ AI Model Trained Successfully")

    def predict(self, text: str):
        if not self.model:
            self._train()
        
        # Predict class (0, 1, 2)
        prediction = self.model.predict([text])[0]
        # Get probabilities to calculate a "Score" (1-10)
        probs = self.model.predict_proba([text])[0]
        confidence = np.max(probs)
        keyword_label = self.keyword_model.predict(text)
        final_label = max(prediction, keyword_label)
        if keyword_label > prediction:
            confidence = max(confidence, 0.85)
        
        # Map class to Severity Score (1-10) heuristics
        if final_label == 2: # High
            score = 8 + int(confidence * 2) # 8-10
            priority = "High"
            est_time = "2-4 hours"
        elif final_label == 1: # Medium
            score = 5 + int(confidence * 2) # 5-7
            priority = "Medium"
            est_time = "24 hours"
        else: # Low
            score = 1 + int(confidence * 3) # 1-4
            priority = "Low"
            est_time = "48 hours"
            
        return score, priority, est_time

# Initialize AI
ai_engine = SeverityAI()

# ==========================================
# MCP AGENT (Resolution Engine)
# ==========================================
class AgentTool:
    def __init__(self, name, description):
        self.name = name
        self.description = description
        
    def execute(self, **kwargs):
        raise NotImplementedError

class PolicyLookupTool(AgentTool):
    def __init__(self):
        super().__init__("PolicyLookup", "Retrieves company policies based on keywords")
        self.knowledge_base = {
            "billing": "Refunds are processed within 3-5 business days for unauthorized charges. Subscription cancellations must be done 24h before renewal.",
            "login": "Users should reset passwords via the 'Forgot Password' link. If 2FA fails, verify server time is synced.",
            "crash": "Ensure the application is updated to the latest version (v2.5). Clear cache if issues persist.",
            "bug": "Report bugs with reproduction steps. Critical bugs are patched within 24 hours.",
            "feature": "Feature requests are logged for the next quarterly roadmap review."
        }
        
    def execute(self, query):
        query = query.lower()
        results = []
        for key, policy in self.knowledge_base.items():
            if key in query:
                results.append(policy)
        
        if not results:
            return "Standard Support Policy: Treat with empathy and escalate if unresolved after 15 minutes of troubleshooting."
        return " | ".join(results)

class SolutionGeneratorTool(AgentTool):
    def __init__(self, local_model: LocalResolutionModel):
        super().__init__("SolutionDraft", "Drafts a response using a local model or templates")
        self.local_model = local_model
        
    def execute(self, complaint_text, policy_context, severity_score):
        # Heuristic to determine tone based on severity
        tone = "urgent and apologetic" if severity_score >= 8 else "professional and helpful"
        opening = "We sincerely apologize for the inconvenience caused." if severity_score >= 8 else "Thank you for bringing this to our attention."
        
        # Check for OpenRouter API Key
        openrouter_key = os.getenv("OPENROUTER_API_KEY")

        if openrouter_key:
            try:
                from openai import OpenAI
                client = OpenAI(
                    base_url="https://openrouter.ai/api/v1",
                    api_key=openrouter_key,
                )
                
                prompt = f"""
                You are a professional customer support agent for 'SupportFlow'.
                
                Complaint: "{complaint_text}"
                Severity Score: {severity_score}/10
                Internal Policy Context: {policy_context}
                
                Task: Write a polite, concise, and helpful email response to the customer.
                - Use a {tone} tone.
                - Address the specific issue.
                - Use the policy context to explain the next steps or solution.
                - Sign off as 'Support Team'.
                - Do NOT include subject lines or placeholders like [Customer Name]. Start with 'Dear Customer,'.
                """
                
                completion = client.chat.completions.create(
                    model="google/gemini-2.0-flash-lite-preview-02-05:free", # Free tier model via OpenRouter
                    messages=[
                        {"role": "system", "content": "You are a helpful support agent."},
                        {"role": "user", "content": prompt}
                    ]
                )
                return completion.choices[0].message.content
                
            except Exception as e:
                print(f"⚠️ OpenRouter Error: {e}. Fallback to local model.")

        local_suggestion = self.local_model.suggest(complaint_text)

        # Template-based Generation (Fallback)
        return f"""Dear Customer,

{opening}

Regarding your issue: "{complaint_text}"

Based on our assessment:
{policy_context}

Recommended action:
{local_suggestion}

We are prioritizing this request. Please allow us some time to verify the details and resolve this for you.

Best Regards,
Support Team"""

# Initialize Tools
policy_tool = PolicyLookupTool()
local_resolution_model = LocalResolutionModel()
solution_tool = SolutionGeneratorTool(local_resolution_model)

def generate_ai_suggestion(complaint_text: str) -> str:
    """
    Orchestrates the MCP tools to generate a solution.
    """
    # 1. Analyze Severity (Re-use existing engine or simple heuristic for this flow)
    # We'll just call the engine to get a fresh score
    score, _, _ = ai_engine.predict(complaint_text)
    
    # 2. Lookup Policy
    policy_context = policy_tool.execute(complaint_text)
    
    # 3. Generate Solution
    resolution_draft = solution_tool.execute(complaint_text, policy_context, score)
    
    return resolution_draft

# ==========================================
# DATABASE
# ==========================================
def get_db_connection():
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        return conn
    except Exception as e:
        print(f"❌ DB Error: {e}")
        raise HTTPException(status_code=500, detail="Database Connection Failed")

# ==========================================
# MODELS
# ==========================================
class ComplaintCreate(BaseModel):
    user_id: int
    title: str
    category: str
    description: str

# ... (Previous imports match)


class ComplaintUpdate(BaseModel):
    # Allow partial updates
    status: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    resolution: Optional[str] = None

class ComplaintResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    user_name: Optional[str] = None
    title: str
    description: str
    category: str
    status: str
    priority: Optional[str] = "Medium"
    ai_severity_score: Optional[int] = None
    ai_predicted_resolution_time: Optional[str] = None
    resolution: Optional[str] = None
    created_at: str



# ==========================================
# AUTHENTICATION
# ==========================================

class UserRegister(BaseModel):
    email: str
    password: str
    full_name: str
    role: Optional[str] = "customer" # Default to customer

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str

def hash_password(password: str) -> str:
    # Simple SHA256 hashing (In production, use bcrypt/argon2)
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return hash_password(plain_password) == hashed_password

@app.post("/api/auth/register", response_model=UserResponse)
def register(user: UserRegister):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        # 1. Check if user exists
        cur.execute("SELECT id FROM users WHERE email = %s", (user.email,))
        if cur.fetchone():
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # 2. Enforce Role (Only allow 'customer' via public registration for safety, or allow whatever is passed if valid)
        if user.role not in ['customer', 'agent', 'admin']:
            raise HTTPException(status_code=400, detail="Invalid role")
        
        # 3. Hash Password
        hashed_pw = hash_password(user.password)
        
        # 4. Insert User
        cur.execute(
            "INSERT INTO users (email, password_hash, full_name, role) VALUES (%s, %s, %s, %s) RETURNING id, email, full_name, role",
            (user.email, hashed_pw, user.full_name, user.role)
        )
        new_user = cur.fetchone()
        conn.commit()
        return new_user
        
    except HTTPException as he:
        raise he
    except Exception as e:
        conn.rollback()
        print(f"Register Error: {e}")
        raise HTTPException(status_code=500, detail="Registration failed")
    finally:
        cur.close()
        conn.close()

@app.post("/api/auth/login", response_model=UserResponse)
def login(user: UserLogin):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute("SELECT * FROM users WHERE email = %s", (user.email,))
        db_user = cur.fetchone()
        
        if not db_user or not verify_password(user.password, db_user['password_hash']):
            raise HTTPException(status_code=401, detail="Invalid email or password")
            
        return {
            "id": db_user['id'],
            "email": db_user['email'],
            "full_name": db_user['full_name'],
            "role": db_user['role']
        }
    finally:
        cur.close()
        conn.close()

# ROUTES

@app.get("/api/complaints/", response_model=List[ComplaintResponse])
def get_complaints(user_id: Optional[int] = None):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        if user_id:
             cur.execute("""
                SELECT c.*, u.full_name as user_name 
                FROM complaints c 
                LEFT JOIN users u ON c.user_id = u.id 
                WHERE c.user_id = %s 
                ORDER BY c.created_at DESC
             """, (user_id,))
        else:
             cur.execute("""
                SELECT c.*, u.full_name as user_name 
                FROM complaints c 
                LEFT JOIN users u ON c.user_id = u.id 
                ORDER BY c.created_at DESC
             """)
             
        complaints = cur.fetchall()
        
        # Convert datetime objects to strings
        for complaint in complaints:
            complaint['created_at'] = str(complaint['created_at'])
            if 'updated_at' in complaint and complaint['updated_at']:
                complaint['updated_at'] = str(complaint['updated_at'])
                
        return complaints
    except Exception as e:
        print(f"Error fetching complaints: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()

@app.post("/api/complaints/", response_model=ComplaintResponse)
def create_complaint(complaint: ComplaintCreate):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        # 1. AI Analysis
        score, priority, est_time = ai_engine.predict(complaint.description)
        
        query = """
        INSERT INTO complaints 
        (user_id, title, description, category, priority, ai_severity_score, ai_predicted_resolution_time)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        RETURNING *
        """
        cur.execute(query, (
            complaint.user_id,
            complaint.title, 
            complaint.description, 
            complaint.category,
            priority,
            score,
            est_time
        ))
        new_complaint = cur.fetchone()
        conn.commit()
        
        new_complaint['created_at'] = str(new_complaint['created_at'])
        if 'updated_at' in new_complaint and new_complaint['updated_at']:
             new_complaint['updated_at'] = str(new_complaint['updated_at'])
             
        return new_complaint
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()



@app.get("/api/complaints/{complaint_id}/", response_model=ComplaintResponse)
def get_complaint(complaint_id: int):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute("SELECT * FROM complaints WHERE id = %s", (complaint_id,))
        complaint = cur.fetchone()
        if not complaint:
            raise HTTPException(status_code=404, detail="Complaint not found")
            
        complaint['created_at'] = str(complaint['created_at'])
        if 'updated_at' in complaint and complaint['updated_at']:
             complaint['updated_at'] = str(complaint['updated_at'])
             
        return complaint
    except Exception as e:
        print(f"Error fetching complaint: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()

@app.patch("/api/complaints/{complaint_id}/", response_model=ComplaintResponse)
def update_complaint(complaint_id: int, update: ComplaintUpdate):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        # 1. Fetch Existing to compare for audit log
        cur.execute("SELECT * FROM complaints WHERE id = %s", (complaint_id,))
        old_record = cur.fetchone()
        
        if not old_record:
            raise HTTPException(status_code=404, detail="Complaint Not Found")

        # 2. Build Dynamic Update Query
        fields = []
        values = []
        
        if update.status:
            fields.append("status = %s")
            values.append(update.status)
            # Log Status Change
            if update.status != old_record['status']:
                 cur.execute(
                    "INSERT INTO complaint_history (complaint_id, action, previous_value, new_value) VALUES (%s, 'STATUS_CHANGE', %s, %s)",
                    (complaint_id, old_record['status'], update.status)
                )

        if update.title:
            fields.append("title = %s")
            values.append(update.title)
            
        if update.description:
            fields.append("description = %s")
            values.append(update.description)

        if update.resolution:
            # Append if exists, else set
            if old_record['resolution']:
                import datetime
                timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                # Add a clear separator
                new_resolution = f"{old_record['resolution']}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n**Update ({timestamp}):**\n{update.resolution}"
                fields.append("resolution = %s")
                values.append(new_resolution)
            else:
                fields.append("resolution = %s")
                values.append(update.resolution)
                
            # Log Resolution Added
            cur.execute(
                "INSERT INTO complaint_history (complaint_id, action, new_value) VALUES (%s, 'RESOLUTION_ADDED', 'Resolution Provided')",
                (complaint_id,)
            )

        if not fields:
            return old_record # No updates

        values.append(complaint_id)
        query = f"UPDATE complaints SET {', '.join(fields)} WHERE id = %s RETURNING *"
        
        cur.execute(query, tuple(values))
        updated_record = cur.fetchone()
        
        conn.commit()
        
        # Format Dates
        updated_record['created_at'] = str(updated_record['created_at'])
        if 'updated_at' in updated_record and updated_record['updated_at']:
             updated_record['updated_at'] = str(updated_record['updated_at'])
             
        return updated_record
        
    except HTTPException as he:
        raise he
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()

@app.get("/api/complaints/{complaint_id}/suggest_resolution/")
def suggest_resolution(complaint_id: int):
    # ... (Same as before, generates suggestion)
    # Note: We don't save it automatically here, we let the user "Apply" it via the PATCH endpoint above
    # ... (Existing logic)
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("SELECT description FROM complaints WHERE id = %s", (complaint_id,))
    record = cur.fetchone()
    cur.close()
    conn.close()
    
    if not record:
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    # Call Tools (Free Version)
    suggestion = generate_ai_suggestion(record['description'])
    return {"suggestion": suggestion}

if __name__ == "__main__":
    uvicorn.run("server:app", host="127.0.0.1", port=8000, reload=True)
