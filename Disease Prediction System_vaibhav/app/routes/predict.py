from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import PredictionHistory
from app.schemas import PredictionRequest, PredictionResponse, ChatRequest, ChatResponse
from app.services.ollama import OllamaService

router = APIRouter(
    prefix="/api",
    tags=["Prediction"]
)

ollama_service = OllamaService()

@router.get("/status", summary="Check connection to local Ollama server")
async def get_status():
    """
    Check if the Ollama server is running locally and the configured model is pulled.
    This helps the frontend guide the user on how to run Ollama offline.
    """
    is_connected = await ollama_service.check_connection()
    if not is_connected:
        return {
            "status": "offline",
            "message": f"Ollama is offline or not installed. Please launch it locally on {ollama_service.base_url}",
            "troubleshooting": [
                "Make sure Ollama is installed (https://ollama.com)",
                "Open a terminal and run: ollama serve",
                "Ensure Ollama is not blocked by your firewall"
            ]
        }
        
    is_model_present = await ollama_service.check_model_downloaded()
    if not is_model_present:
        return {
            "status": "missing_model",
            "message": f"Ollama is online, but model '{ollama_service.model}' is not pulled.",
            "troubleshooting": [
                f"Open your terminal and run: ollama pull {ollama_service.model}",
                "Ensure you have a stable internet connection during model download"
            ]
        }
        
    return {
        "status": "online",
        "model": ollama_service.model,
        "message": f"Ollama is connected and '{ollama_service.model}' model is ready!"
    }

@router.post("/predict", response_model=PredictionResponse, summary="Predict disease based on symptoms")
async def predict_disease(request: PredictionRequest, db: Session = Depends(get_db)):
    """
    Analyze symptoms and predict a possible disease using the local Ollama LLM.
    Results are saved to the local SQLite database for history tracking.
    """
    # 1. Input Validation
    if not request.symptoms or len(request.symptoms) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one symptom must be provided."
        )

    # 2. Check Ollama Status
    is_connected = await ollama_service.check_connection()
    if not is_connected:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                f"Ollama server is not running on {ollama_service.base_url}. "
                "Please start Ollama before submitting symptoms. "
                "Command: 'ollama serve'"
            )
        )
        
    is_model_present = await ollama_service.check_model_downloaded()
    if not is_model_present:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                f"The AI model '{ollama_service.model}' is not installed in your local Ollama. "
                f"Please download it by running: 'ollama pull {ollama_service.model}' in a terminal."
            )
        )

    # 3. Call Ollama Service to perform AI inference
    try:
        prediction_result = await ollama_service.predict_disease(request.symptoms)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate prediction from local AI: {str(e)}"
        )

    # 4. Save to Local SQLite Database History
    try:
        history_entry = PredictionHistory()
        history_entry.symptoms = request.symptoms
        history_entry.possible_disease = prediction_result.get("possible_disease", "Unknown")
        history_entry.confidence = prediction_result.get("confidence", "Medium")
        history_entry.precautions = prediction_result.get("precautions", ["No precautions specified"])
        history_entry.explanation = prediction_result.get("explanation", "No explanation provided")
        
        db.add(history_entry)
        db.commit()
        db.refresh(history_entry)
    except Exception as db_err:
        # Don't fail the request if database logging fails, just log it and proceed
        print(f"Database error while saving prediction: {str(db_err)}")

    # 5. Return Pydantic formatted prediction
    return PredictionResponse(
        possible_disease=prediction_result.get("possible_disease", "Unknown"),
        confidence=prediction_result.get("confidence", "Medium"),
        precautions=prediction_result.get("precautions", []),
        explanation=prediction_result.get("explanation", "")
    )

@router.post("/chat", response_model=ChatResponse, summary="Offline health chat assistant")
async def chat_assistant(request: ChatRequest):
    """
    Chat with the offline healthcare assistant AI.
    Integrates context about a currently diagnosed disease to give targeted care insights.
    """
    # Verify Ollama status
    is_connected = await ollama_service.check_connection()
    if not is_connected:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Ollama local server is not running."
        )

    # Format Pydantic models back to standard dictionaries for the service
    formatted_messages = [{"role": msg.role, "content": msg.content} for msg in request.messages]

    try:
        reply = await ollama_service.chat_response(
            messages=formatted_messages,
            context_disease=request.context_disease
        )
        return ChatResponse(reply=reply)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Chat execution failed: {str(e)}"
        )
