from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import PredictionHistory
from app.schemas import HistoryItemResponse

router = APIRouter(
    prefix="/api/history",
    tags=["History"]
)

@router.get("", response_model=List[HistoryItemResponse], summary="Retrieve prediction history")
def get_prediction_history(db: Session = Depends(get_db)):
    """
    Get all past symptoms diagnoses and predictions saved in SQLite database.
    Results are returned in reverse chronological order (newest first).
    """
    try:
        records = db.query(PredictionHistory).order_by(PredictionHistory.created_at.desc()).all()
        return [HistoryItemResponse(
            id=r.id,
            symptoms=r.symptoms,
            possible_disease=r.possible_disease,
            confidence=r.confidence,
            precautions=r.precautions,
            explanation=r.explanation,
            created_at=r.created_at.strftime("%Y-%m-%d %H:%M:%S")
        ) for r in records]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch history from local database: {str(e)}"
        )

@router.delete("/{id}", summary="Delete specific history item")
def delete_history_item(id: int, db: Session = Depends(get_db)):
    """
    Delete a single past prediction from local database by its ID.
    """
    record = db.query(PredictionHistory).filter(PredictionHistory.id == id).first()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"History item with ID {id} not found"
        )
    try:
        db.delete(record)
        db.commit()
        return {"status": "success", "message": f"Successfully deleted history item with ID {id}."}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete history item: {str(e)}"
        )

@router.delete("", summary="Clear all prediction history")
def clear_all_history(db: Session = Depends(get_db)):
    """
    Wipe out all stored history entries from the local SQLite database.
    """
    try:
        num_deleted = db.query(PredictionHistory).delete()
        db.commit()
        return {"status": "success", "message": f"Successfully cleared all {num_deleted} history records."}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to clear history: {str(e)}"
        )
