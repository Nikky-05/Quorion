from pydantic import BaseModel, Field
from typing import List

class PredictionRequest(BaseModel):
    symptoms: List[str] = Field(
        ..., 
        example=["fever", "cough", "headache"], 
        description="List of patient symptoms to analyze"
    )

class PredictionResponse(BaseModel):
    possible_disease: str = Field(..., example="Flu", description="Predicted disease name")
    confidence: str = Field(..., example="Medium", description="Confidence level (High, Medium, Low)")
    precautions: List[str] = Field(
        ..., 
        example=["Drink water", "Take rest", "Consult a doctor if symptoms persist"],
        description="List of immediate precautions or next steps"
    )
    explanation: str = Field(
        ..., 
        example="The symptoms are characteristic of a viral influenza infection.", 
        description="Short description or reasoning for the prediction"
    )

class HistoryItemResponse(BaseModel):
    id: int
    symptoms: List[str]
    possible_disease: str
    confidence: str
    precautions: List[str]
    explanation: str
    created_at: str

    class Config:
        from_attributes = True

class ChatMessage(BaseModel):
    role: str = Field(..., example="user", description="Sender role: user, assistant, or system")
    content: str = Field(..., example="What are the main remedies for Flu?", description="Content of the message")

class ChatRequest(BaseModel):
    messages: List[ChatMessage] = Field(..., description="Chronological list of chat history messages")
    context_disease: str = Field("", example="Flu", description="Optionally pass the currently predicted disease to keep chat relevant")

class ChatResponse(BaseModel):
    reply: str = Field(..., example="Resting and drinking plenty of fluids is essential.", description="AI response text")

