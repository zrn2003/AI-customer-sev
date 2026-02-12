import os
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import make_pipeline
from . import ai_config
from gradio_client import Client

# ==========================================
# AI ENGINE (Severity Classifier - Local Sklearn)
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
        self.model = make_pipeline(TfidfVectorizer(), MultinomialNB())
        self.model.fit(texts, labels)
        print("✅ AI Model Trained Successfully")

    def predict(self, text: str):
        if not self.model:
            self._train()
        
        prediction = self.model.predict([text])[0]
        probs = self.model.predict_proba([text])[0]
        confidence = np.max(probs)
        keyword_label = self.keyword_model.predict(text)
        final_label = max(prediction, keyword_label)
        if keyword_label > prediction:
            confidence = max(confidence, 0.85)
        
        if final_label == 2: # High
            score = 8 + int(confidence * 2)
            priority = "High"
            est_time = "2-4 hours"
        elif final_label == 1: # Medium
            score = 5 + int(confidence * 2)
            priority = "Medium"
            est_time = "24 hours"
        else: # Low
            score = 1 + int(confidence * 3)
            priority = "Low"
            est_time = "48 hours"
            
        return score, priority, est_time

ai_engine = SeverityAI()

# ==========================================
# GENERATIVE AI (Replaces complex MCP/OpenRouter logic)
# Based on: https://huggingface.co/spaces/devi1675/Customer-Support-ai/
# ==========================================

class SupportChatbot:
    def __init__(self):
        try:
             # Connect to the Hugging Face Space
             print("🔌 Connecting to Hugging Face Space: devi1675/Customer-Support-ai...")
             self.client = Client("devi1675/Customer-Support-ai")
             print("✅ Connected to Gradio Client")
        except Exception as e:
            print(f"⚠️ Failed to initialize Gradio Client: {e}")
            self.client = None

    def get_response(self, message):
        if not self.client:
            return "System Error: Unable to connect to AI service."
        
        try:
            # The API endpoint is /chat as per user instruction
            result = self.client.predict(
                message=message,
                api_name="/chat"
            )
            return result
        except Exception as e:
            print(f"Error calling Gradio API: {e}")
            return "Error generating suggestion. Please try again later."

chatbot = SupportChatbot()

def generate_ai_suggestion(complaint_text: str) -> str:
    """
    Directly uses the Chatbot logic to suggest a resolution for the complaint.
    """
    return chatbot.get_response(complaint_text)
