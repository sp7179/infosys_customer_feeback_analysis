# active_learning.py
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi import Depends
from .schemas import PredictRequest, PredictResponse, FeedbackItem, UploadResponse, RetrainRequest, RetrainStatus
from .model_manager import predict_text, load_model, predict_text_transformer
from .utils import save_uploaded_file
from .retrain_worker import submit_retrain_job, _JOBS
import uuid
from app.db import get_db
from bson import ObjectId
from fastapi import Query
from datetime import datetime

  # expects a function returning pymongo db

router = APIRouter(prefix="/active", tags=["active-learning"])

@router.get("/info")
def info():
    return {"title": "Active Learning", "desc": "Interactive model feedback & retrain"}

@router.post("/predict", response_model=PredictResponse)
def predict(payload: PredictRequest):
    label, probs, confidence, version = predict_text_transformer(payload.text)
    # save prediction into feedbacks collection (append-only)
    db = get_db()
    db.feedbacks.insert_one({
        "text": payload.text,
        "predicted": label,
        "probabilities": probs,
        "confidence": confidence,
        "model_version": version,
    })
    return PredictResponse(label=label, probabilities=probs, confidence=confidence, model_version=version)

@router.post("/feedback")
def feedback(item: FeedbackItem):
    db = get_db()
    doc = item.dict()
    doc.update({"saved_at": __import__("datetime").datetime.utcnow()})
    db.feedbacks.insert_one(doc)
    return {"status": "ok", "saved_id": str(doc.get("_id", None))}

@router.post("/upload", response_model=UploadResponse)
async def upload_csv(file: UploadFile = File(...)):
    path, df = save_uploaded_file(await file.read(), filename=file.filename)
    # store dataset record
    db = get_db()
    ds = {"filename": file.filename, "path": path, "rows": len(df)}
    res = db.datasets.insert_one(ds)
    return UploadResponse(dataset_id=str(res.inserted_id), filename=file.filename, rows=len(df))

@router.post("/retrain", response_model=RetrainStatus)
def retrain(req: RetrainRequest):
    job_id = f"job_{uuid.uuid4().hex[:8]}"
    # find dataset path
    db = get_db()
    dataset_path = None
    if req.dataset_id:
        ds = db.datasets.find_one({"_id": ObjectId(req.dataset_id)})  if isinstance(req.dataset_id, str) else None
        # if using ObjectId you must convert; for simplicity we assume string
        if ds:
            dataset_path = ds["path"]
    if not dataset_path:
        raise HTTPException(status_code=400, detail="dataset_id required")
    submit_retrain_job(job_id, dataset_path, include_feedbacks=req.include_feedbacks, base_version=req.base_model_version)
    db.retrain_jobs.insert_one({"job_id": job_id, "status": "queued"})
    return RetrainStatus(job_id=job_id, status="queued", progress=0)

@router.get("/status/{job_id}", response_model=RetrainStatus)
def job_status(job_id: str):
    info = _JOBS.get(job_id)
    if not info:
        db = get_db()
        rec = db.retrain_jobs.find_one({"job_id": job_id})
        if rec:
            return RetrainStatus(job_id=job_id, status=rec.get("status", "unknown"))
        raise HTTPException(status_code=404, detail="job not found")
    return RetrainStatus(job_id=job_id, status=info.get("status"), progress=info.get("progress", 0),
                         message=info.get("message"), result_metrics=info.get("result"))
    
@router.get("/models")
def get_models():
    db = get_db()
    models = list(db.models.find())
    for m in models:
        m["_id"] = str(m["_id"])
    return models

@router.get("/latest_metrics")
def latest_metrics():
    db = get_db()

    rec = db.metrics_history.find_one(sort=[("created_at", -1)])
    if rec:
        rec["_id"] = str(rec["_id"])      # <--- IMPORTANT FIX
        return rec

    model_rec = db.models.find_one(sort=[("created_at", -1)])
    if model_rec:
        model_rec["_id"] = str(model_rec["_id"])   # <--- FIX HERE TOO
        return model_rec

    return {"msg": "no metrics found"}

@router.get("/metrics_latest")
def metrics_latest():
    db = get_db()
    rec = db.metrics_history.find_one(sort=[("created_at", -1)])
    if not rec:
        return {"msg": "no metrics"}
    rec["_id"] = str(rec["_id"])
    # convert datetimes to iso
    if isinstance(rec.get("created_at"), datetime):
        rec["created_at"] = rec["created_at"].isoformat()
    return rec

@router.get("/confusion_matrix")
def confusion_matrix_endpoint():
    db = get_db()
    rec = db.metrics_history.find_one(sort=[("created_at", -1)])
    if not rec or "confusion" not in rec:
        raise HTTPException(status_code=404, detail="confusion not found")
    return rec["confusion"]

@router.get("/confidence_dist")
def confidence_dist():
    db = get_db()
    rec = db.metrics_history.find_one(sort=[("created_at", -1)])
    if not rec or "confidence_dist" not in rec:
        raise HTTPException(status_code=404, detail="confidence dist not found")
    return rec["confidence_dist"]

@router.get("/pr_curve")
def pr_curve():
    db = get_db()
    rec = db.metrics_history.find_one(sort=[("created_at", -1)])
    if not rec or "pr_curve" not in rec:
        raise HTTPException(status_code=404, detail="pr curve not found")
    return rec["pr_curve"]

@router.get("/version_trend")
def version_trend(limit: int = Query(50, ge=1, le=500)):
    db = get_db()
    rows = list(db.models.find().sort("created_at", 1).limit(limit))
    out = []
    for r in rows:
        entry = {
            "version": r.get("version"),
            "created_at": r.get("created_at").isoformat() if isinstance(r.get("created_at"), datetime) else r.get("created_at"),
            "metrics": r.get("metrics", {})
        }
        out.append(entry)
    return out

@router.get("/uncertain_samples")
def uncertain_samples(limit: int = 50):
    db = get_db()
    docs = list(db.feedbacks.find({"confidence": {"$lt": 0.5}}).sort("saved_at", -1).limit(limit))
    out = []
    for d in docs:
        out.append({
            "_id": str(d.get("_id")),
            "text": d.get("text"),
            "predicted": d.get("predicted"),
            "confidence": float(d.get("confidence", 0)),
            "model_version": d.get("model_version", "")
        })
    return out

@router.get("/prediction_history")
def prediction_history(limit: int = 50):
    db = get_db()
    docs = list(db.feedbacks.find().sort("saved_at", -1).limit(limit))
    out = []
    for d in docs:
        out.append({
            "_id": str(d.get("_id")),
            "text": d.get("text"),
            "predicted": d.get("predicted"),
            "probabilities": d.get("probabilities"),
            "confidence": float(d.get("confidence", 0)),
            "saved_at": d.get("saved_at").isoformat() if isinstance(d.get("saved_at"), datetime) else d.get("saved_at"),
            "model_version": d.get("model_version", "")
        })
    return out
