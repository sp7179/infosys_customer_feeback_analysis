# app/admin_routes.py
from fastapi import APIRouter, Depends, HTTPException, Body, status
from app.auth import admin_auth

from typing import List



import hashlib

from app.sqlite_config import (
    load_all,
    set_setting,
    set_issue_cluster,
    save_aspect_keywords,
    delete_issue_cluster
)

import hashlib

def hash_password(pw: str):
    return hashlib.sha256(pw.encode()).hexdigest()

from app.db import connect_db
router = APIRouter(prefix="/admin", tags=["Admin"])

# --- AUTH endpoints ---


@router.post("/login")
async def admin_login(payload: dict = Body(...)):
    db = connect_db()

    username = payload.get("username")
    admin_id = payload.get("admin_id")
    password = payload.get("password")

    if not password or (not username and not admin_id):
        raise HTTPException(400, "Username/admin_id and password required")

    # Build query dynamically
    query = {}
    if username:
        query["username"] = username
    if admin_id:
        query["admin_id"] = admin_id

    admin = db.admins.find_one(query)
    if not admin:
        raise HTTPException(401, "Admin not found")

    # SHA256 hash check
    hashed = hashlib.sha256(password.encode()).hexdigest()
    if admin["password"] != hashed:
        raise HTTPException(401, "Invalid password")

    # Return token used by admin_auth()
    return {"access_token": "admin", "token_type": "bearer"}


@router.get("/config", dependencies=[Depends(admin_auth)])
async def admin_list_config():
    return load_all()

@router.post("/config", dependencies=[Depends(admin_auth)])
async def admin_create_config(item: dict = Body(...)):
    # expect { "table": "settings"|"issue_clusters"|"aspect_keywords", "key": "...", "value": ... }
    table = item.get("table")
    key = item.get("key")
    value = item.get("value")
    if table == "settings":
        set_setting(key, value)
    elif table == "issue_clusters":
        set_issue_cluster(key, value)
    elif table == "aspect_keywords":
        save_aspect_keywords(key, value)
    else:
        raise HTTPException(status_code=400, detail="Unknown table")
    return {"ok": True}

@router.put("/config/{item_id}", dependencies=[Depends(admin_auth)])
async def admin_update_config(item_id: int, item: dict = Body(...)):
    # sqlite design here is key-based; treat item_id as unused and perform upsert via create endpoint
    return await admin_create_config(item)

@router.delete("/config/{item_id}", dependencies=[Depends(admin_auth)])
async def admin_delete_config(item_id: int):
    # expect item_id to be the key name (string) for deletion when called from frontend
    # if frontend sends numeric id, change accordingly — here we treat item_id as key string
    delete_issue_cluster(str(item_id))
    return {"ok": True}


# --- USERS endpoints (paste below config handlers) ---
@router.get("/users", dependencies=[Depends(admin_auth)])
async def admin_get_users(page: int = 1, per_page: int = 50):
    db = connect_db()
    skip = (page - 1) * per_page
    cursor = db.users.find().skip(skip).limit(per_page)
    users = [ {**u, "_id": str(u.get("_id"))} for u in cursor ]
    total = db.users.count_documents({})
    return {"users": users, "total": total}

@router.delete("/users/{user_id}", dependencies=[Depends(admin_auth)])
async def admin_delete_user(user_id: str):
    db = connect_db()
    res = db.users.delete_one({"_id": user_id})  # if you use ObjectId change accordingly
    return {"ok": True, "deleted": res.deleted_count}

@router.get("/users/count", dependencies=[Depends(admin_auth)])
async def admin_users_count():
    db = connect_db()
    count = db.users.count_documents({})
    return {"count": count}

@router.get("/users/history", dependencies=[Depends(admin_auth)])
async def admin_users_history(days: int = 30):
    db = connect_db()
    # simple daily counts for last `days` days (dummy if no timestamp)
    from datetime import datetime, timedelta
    history = []
    for i in range(days):
        day = datetime.utcnow() - timedelta(days=(days - 1 - i))
        # naive count: all users before that day (if createdAt exists)
        q = {"createdAt": {"$lte": day.isoformat()}}
        c = db.users.count_documents(q) if db.users.count_documents(q) else 0
        history.append({"date": day.date().isoformat(), "count": c})
    return {"history": history}



# --- MODELS endpoints (alias jobs) ---
@router.get("/models", dependencies=[Depends(admin_auth)])
async def admin_get_models():
    db = connect_db()
    # if your collection is "models" or "jobs", adapt below
    jobs_cursor = db.models.find()  # or db.jobs.find()
    jobs = [ {**j, "_id": str(j.get("_id"))} for j in jobs_cursor ]
    return {"jobs": jobs}

@router.get("/models/history", dependencies=[Depends(admin_auth)])
async def admin_models_history(limit: int = 50):
    db = connect_db()
    # return recent model versions / metrics (dummy if unavailable)
    cursor = db.model_history.find().sort("createdAt", -1).limit(limit)
    history = [ {**h, "_id": str(h.get("_id"))} for h in cursor ]
    return {"history": history}



# --- DATASETS & LOGS ---
@router.get("/datasets", dependencies=[Depends(admin_auth)])
async def admin_get_datasets():
    db = connect_db()
    cursor = db.datasets.find()
    datasets = [ {**d, "_id": str(d.get("_id"))} for d in cursor ]
    return {"datasets": datasets}

@router.get("/logs", dependencies=[Depends(admin_auth)])
async def admin_get_logs(limit: int = 100):
    db = connect_db()
    cursor = db.logs.find().sort("timestamp", -1).limit(limit)
    logs = [ {**l, "_id": str(l.get("_id"))} for l in cursor ]
    return {"logs": logs}


# --- CHANGE PASSWORD ---
@router.put("/admins/change-password", dependencies=[Depends(admin_auth)])
async def admin_change_password(payload: dict = Body(...)):
    db = connect_db()
    username = payload.get("username")
    old = payload.get("oldPassword") or payload.get("old_password")
    new = payload.get("newPassword") or payload.get("new_password")
    admin = db.admins.find_one({"username": username})
    if not admin or admin.get("password") != old:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    db.admins.update_one({"username": username}, {"$set": {"password": new}})
    return {"ok": True}


@router.get("/admins/change-password", dependencies=[Depends(admin_auth)])
async def admin_get_profile():
    db = connect_db()
    admin = db.admins.find_one({})
    return {
        "username": admin.get("username", ""),
        "admin_id": admin.get("admin_id", ""),
    }


@router.post("/admins", dependencies=[Depends(admin_auth)])
async def add_admin(payload: dict):
    db = connect_db()                         # ← REQUIRED LINE

    username = payload.get("username")
    password = payload.get("password")
    admin_id = payload.get("admin_id")

    if not username or not password:
        raise HTTPException(400, "Username & password required")

    hashed_pw = hash_password(password)

    db.admins.insert_one({
        "admin_id": admin_id,
        "username": username,
        "password": hashed_pw
    })

    return "Admin added successfully"


@router.delete("/admins", dependencies=[Depends(admin_auth)])
async def delete_admin(payload: dict):
    db = connect_db()                         # ← REQUIRED LINE

    username = payload.get("username")
    admin_id = payload.get("admin_id")

    query = {}
    if username:
        query["username"] = username
    if admin_id:
        query["admin_id"] = admin_id

    if not query:
        raise HTTPException(400, "Provide username or admin_id")

    result = db.admins.delete_one(query)

    if result.deleted_count == 0:
        raise HTTPException(404, "Admin not found")

    return "Admin deleted successfully"


@router.get("/models/jobs", dependencies=[Depends(admin_auth)])
async def admin_get_models_jobs():
    db = connect_db()
    jobs_cursor = db.models.find()
    jobs = [{**j, "_id": str(j.get("_id"))} for j in jobs_cursor]
    return {"jobs": jobs}


@router.get("/retrain_jobs", dependencies=[Depends(admin_auth)])
async def admin_get_retrain_jobs():
    db = connect_db()
    cursor = db.retrain_jobs.find().sort("_id", -1).limit(200)
    jobs = [{**j, "_id": str(j.get("_id"))} for j in cursor]
    return {"retrain_jobs": jobs}


@router.get("/models/growth", dependencies=[Depends(admin_auth)])
async def get_model_growth():
    db = connect_db()
    out = []
    for doc in db.model_growth.find({}).sort("version", 1):
        out.append({
            "version": doc.get("version"),
            "accuracy": float(doc.get("accuracy", 0))
        })
    return {"history": out}



@router.get("/users/growth", dependencies=[Depends(admin_auth)])
async def get_user_growth():
    db = connect_db()
    out = []
    for doc in db.user_growth.find({}).sort("date", 1):
        out.append({
            "date": doc.get("date"),
            "count": int(doc.get("count", 0))
        })
    return {"history": out}
