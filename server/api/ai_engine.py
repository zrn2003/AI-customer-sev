import os
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import make_pipeline
from . import ai_config

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
        try:
             query_vector = self.vectorizer.transform([complaint_text])
             similarities = (self.text_vectors * query_vector.T).toarray()
             best_index = int(np.argmax(similarities))
             return self.responses[best_index]
        except Exception as e:
            print(f"Error in LocalResolutionModel: {e}")
            return "We will review your request."


class SeverityAI:
    def __init__(self):
        self.model = None
        self.keyword_model = KeywordSeverityModel()
        try:
             self.training_data = ai_config.TRAINING_DATA
        except AttributeError:
            print("⚠️ ai_config.TRAINING_DATA not found, using minimal fallback data.")
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
    # 1. Analyze Severity
    score, _, _ = ai_engine.predict(complaint_text)
    
    # 2. Lookup Policy
    policy_context = policy_tool.execute(complaint_text)
    
    # 3. Generate Solution
    resolution_draft = solution_tool.execute(complaint_text, policy_context, score)
    
    return resolution_draft
