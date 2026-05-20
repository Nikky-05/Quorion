import json
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime
from app.database import Base

class PredictionHistory(Base):
    __tablename__ = "prediction_history"

    id = Column(Integer, primary_key=True, index=True)
    symptoms_json = Column(Text, nullable=False)  # Stored as JSON string
    possible_disease = Column(String(100), nullable=False)
    confidence = Column(String(50), nullable=False)
    precautions_json = Column(Text, nullable=False)  # Stored as JSON string
    explanation = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    @property
    def symptoms(self):
        try:
            return json.loads(self.symptoms_json)
        except Exception:
            return []

    @symptoms.setter
    def symptoms(self, val):
        self.symptoms_json = json.dumps(val)

    @property
    def precautions(self):
        try:
            return json.loads(self.precautions_json)
        except Exception:
            return []

    @precautions.setter
    def precautions(self, val):
        self.precautions_json = json.dumps(val)

    def to_dict(self):
        return {
            "id": self.id,
            "symptoms": self.symptoms,
            "possible_disease": self.possible_disease,
            "confidence": self.confidence,
            "precautions": self.precautions,
            "explanation": self.explanation,
            "created_at": self.created_at.strftime("%Y-%m-%d %H:%M:%S")
        }
