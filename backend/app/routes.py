from fastapi import APIRouter, UploadFile, File, HTTPException, Body
from fastapi.responses import StreamingResponse
from active_learning.active_learning import router as active_router

from typing import List, Optional
from itertools import zip_longest
import csv, io, base64
from app.analyze import analyze_reviews
from app.db import connect_db
from datetime import datetime, timezone
from app.preprocess import clean_text  # import the cleaning function
from fastapi import Path

import csv, io, base64
from bson import ObjectId

router = APIRouter(prefix="/feedback", tags=["Feedback"])

router.include_router(active_router)





# ----------------- Global Model State -----------------
CURRENT_MODEL = "vader"

# ----------------- Model Routes -----------------
@router.get("/get_model")
def get_model():
    return {"current_model": CURRENT_MODEL}

@router.post("/set_model")
def set_model(model: str = Body(..., embed=True)):
    global CURRENT_MODEL
    if model not in ["vader", "huggingface", "tlrl"]:
        raise HTTPException(status_code=400, detail="Invalid model name.")
    CURRENT_MODEL = model
    return {"message": f"Model switched to {CURRENT_MODEL}"}

# ----------------- Upload Reviews -----------------
@router.post("/upload")
async def upload_reviews(file: UploadFile = File(None), reviews_json: Optional[List[str]] = Body(None)):
    reviews = []

    if reviews_json:
        reviews = [r.strip() for r in reviews_json if r.strip()]
    elif file:
        content = await file.read()
        filename = file.filename.lower()
        if filename.endswith(".txt"):
            reviews = [line.strip() for line in content.decode("utf-8").splitlines() if line.strip()]
        elif filename.endswith(".csv"):
            reader = csv.reader(io.StringIO(content.decode("utf-8")))
            next(reader, None)
            for row in reader:
                if row and row[0].strip():
                    reviews.append(row[0].strip())
        else:
            raise HTTPException(status_code=400, detail="Unsupported file type. Use .txt or .csv")
    else:
        raise HTTPException(status_code=400, detail="No input provided. Upload file or JSON array.")

    return {"count": len(reviews)}

# ----------------- Analyze Reviews -----------------
@router.post("/analyze")
async def analyze_reviews_endpoint(
    file: UploadFile = File(None),
    reviews_json: Optional[List[str]] = Body(None)
    ):
    reviews, timestamps, feedback_ids = [], [], None


    # Extract reviews
    if reviews_json:
        reviews = [r.strip() for r in reviews_json if r.strip()]
    elif file:
        content = await file.read()
        filename = file.filename.lower()
        text = content.decode("utf-8").lstrip("\ufeff")

        if filename.endswith(".txt"):
            reviews = [line.strip() for line in text.splitlines() if line.strip()]
        elif filename.endswith(".csv"):
            # auto-detect delimiter (comma, tab, semicolon, pipe)
            sample = text[:4096]
            try:
                dialect = csv.Sniffer().sniff(sample, delimiters=",\t;|")
            except:
                dialect = csv.excel  # default comma

            reader = csv.DictReader(io.StringIO(text), dialect=dialect)

            # normalize headers
            fieldnames = [f.strip().lower() for f in (reader.fieldnames or [])]

            # ensure required column exists
            if "feedbackid" not in fieldnames:
                raise HTTPException(status_code=400, detail="CSV must contain a 'FeedbackID' column.")

            

            feedback_ids = []
            # normalize header keys to lowercase for safe access
            lower_fieldnames = [f.lower() for f in (reader.fieldnames or [])]

            for row in reader:
                # try multiple casing variants
                review_text = (row.get("Review") or row.get("review") or row.get("review_text") or "").strip()
                fid = (row.get("FeedbackID") or row.get("feedbackid") or row.get("feedback_id") or "").strip()
                ts = (row.get("Timestamp") or row.get("timestamp") or row.get("Date") or row.get("date") or "").strip()

                # fallback: if DictReader used different casing, try lookup by lowercased keys
                if not review_text and row:
                    # find the first field that looks like review (case-insensitive)
                    for key in row.keys():
                        if key and key.strip().lower() in ("review", "review_text", "text"):
                            review_text = (row.get(key) or "").strip()
                            break
                    for key in row.keys():
                        if key and key.strip().lower() in ("feedbackid", "feedback_id"):
                            fid = (row.get(key) or "").strip()
                            break
                    for key in row.keys():
                        if key and key.strip().lower() in ("timestamp", "date", "time"):
                            ts = (row.get(key) or "").strip()
                            break

                if review_text:
                    reviews.append(review_text)
                    feedback_ids.append(fid)
                    if ts:
                        timestamps.append(ts)


        else:
            raise HTTPException(status_code=400, detail="Unsupported file type. Use .txt or .csv")
    else:
        raise HTTPException(status_code=400, detail="No input provided. Upload file or JSON array.")
    

    # ---------- Clean and preprocess all extracted reviews ----------
    cleaned_reviews = [clean_text(r) for r in reviews if r.strip()]


    # Analyze reviews
    try:
        result = analyze_reviews(
            reviews,
            model=CURRENT_MODEL,
            timestamps=timestamps or None,
            cleaned_reviews=cleaned_reviews,
            feedback_ids=feedback_ids
                                 )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Convert report to base64
    report_csv_base64 = base64.b64encode(result["report_download"].encode("utf-8")).decode("utf-8")
    result["report_download"] = report_csv_base64

    # Save to MongoDB (upsert to keep only one record per submit)
    db = connect_db()
    doc = {
        "model": CURRENT_MODEL,
        "review_count": len(reviews),
        "result": result,
        "created_at": datetime.now(timezone.utc),
    }

    # Use a unique key to avoid duplicates (e.g., "Visual 1" always updates)
    unique_name = f"Visual_{int(datetime.now(timezone.utc).timestamp())}"
    res = db.analysis.update_one(
    {"name": unique_name},  # keep unique name
    {
        "$set": {
            "model": CURRENT_MODEL,
            "review_count": len(reviews),
            "result": result,  # report_download stays inside result only
            "created_at": datetime.now(timezone.utc),
        },
        "$setOnInsert": {"name": unique_name}
    },
    upsert=True
    )

    # ---------- Store cleaned feedbacks in a separate collection ----------
        
    feed_name = unique_name.replace("Visual_", "Feed_")

    # Build cleaned pairs with feedback_id fallback if missing
    cleaned_pairs = []
    for idx, txt in enumerate(cleaned_reviews):
        if feedback_ids and idx < len(feedback_ids) and feedback_ids[idx]:
            fid = feedback_ids[idx]
        else:
            fid = f"F{idx+1:03d}"  # fallback id if CSV didn't provide one
        cleaned_pairs.append({"feedback_id": fid, "cleaned_text": txt})

    clean_doc = {
        "name": feed_name,
        "original_count": len(reviews),
        "cleaned_count": len(cleaned_pairs),
        "cleaned_reviews": cleaned_pairs,
        "created_at": datetime.now(timezone.utc),
    }

    db.cleaned_feedbacks.update_one(
        {"name": feed_name},
        {
            "$setOnInsert": {"name": feed_name},
            "$set": {
                "original_count": len(reviews),
                "cleaned_count": len(cleaned_pairs),
                "cleaned_reviews": cleaned_pairs,
                "created_at": datetime.now(timezone.utc),
            }
        },
        upsert=True
    )


    # Get the document _id
    if res.upserted_id:
     _id = res.upserted_id
    else:
     _id = db.analysis.find_one({"name": unique_name})["_id"]
    visual_id = str(_id)

    response_doc = {
    "visualId": visual_id,
    "_id": visual_id,
    "name": unique_name,
    "model": doc["model"],
    "review_count": doc["review_count"],
    "result": doc["result"],
    "created_at": doc["created_at"].isoformat()
}

    return response_doc
# ----------------- Download CSV Report -----------------
@router.post("/report/download")
async def download_report(report_base64: str = Body(..., embed=True)):
    try:
        csv_bytes = base64.b64decode(report_base64)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid base64 content.")

    return StreamingResponse(
        io.BytesIO(csv_bytes),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=report.csv"}
    )



# ----------------- Visuals CRUD -----------------


@router.get("/visuals")
def get_all_visuals():
    """Return all visuals sorted by created_at DESC."""
    db = connect_db()
    visuals = list(db.analysis.find().sort("created_at", -1))
    for v in visuals:
        v["_id"] = str(v["_id"])
    return visuals


@router.get("/visuals/{id}")
def get_visual_by_id(id: str = Path(...)):
    """Return a single visual by ID."""
    db = connect_db()
    try:
        doc = db.analysis.find_one({"_id": ObjectId(id)})
        if not doc:
            raise HTTPException(status_code=404, detail="Visual not found")
        doc["_id"] = str(doc["_id"])
        return doc
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid visual ID")


@router.post("/visuals/{id}/rename")
def rename_visual(id: str, new_name: str = Body(..., embed=True)):
    """Rename a visual document."""
    db = connect_db()
    try:
        res = db.analysis.update_one(
            {"_id": ObjectId(id)},
            {"$set": {"name": new_name}}
        )
        if res.matched_count == 0:
            raise HTTPException(status_code=404, detail="Visual not found")
        return {"message": "Visual renamed successfully", "new_name": new_name}
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid visual ID")


@router.delete("/visuals/{id}")
def delete_visual(id: str):
    """Delete a visual document."""
    db = connect_db()
    try:
        res = db.analysis.delete_one({"_id": ObjectId(id)})
        if res.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Visual not found")
        return {"message": "Visual deleted successfully"}
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid visual ID")


@router.get("/visuals/{id}/download")
def download_visual_report(id: str):
    """Return the stored base64 report for a visual."""
    db = connect_db()
    try:
        doc = db.analysis.find_one({"_id": ObjectId(id)})
        if not doc or "report_download" not in doc:
            raise HTTPException(status_code=404, detail="Report not found")

        csv_bytes = base64.b64decode(doc["report_download"])
        return StreamingResponse(
            io.BytesIO(csv_bytes),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=visual_report.csv"}
        )
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid visual ID")
