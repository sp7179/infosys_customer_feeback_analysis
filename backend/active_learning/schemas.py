# schemas.py
from pydantic import BaseModel, Field
from typing import Optional, List, Dict

class PredictRequest(BaseModel):
    text: str

class PredictResponse(BaseModel):
    label: str
    probabilities: Dict[str, float]
    confidence: float
    model_version: str

class FeedbackItem(BaseModel):
    text: str
    predicted: str
    confidence: float
    corrected: Optional[str] = None
    user_id: Optional[str] = None

class UploadResponse(BaseModel):
    dataset_id: str
    filename: str
    rows: int

class RetrainRequest(BaseModel):
    dataset_id: Optional[str] = None
    include_feedbacks: bool = True
    base_model_version: Optional[str] = None
    promote_if_improved: bool = True

class RetrainStatus(BaseModel):
    job_id: str
    status: str
    progress: Optional[int] = 0
    message: Optional[str] = None
    result_metrics: Optional[Dict] = None
