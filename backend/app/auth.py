from fastapi import Header, HTTPException

def admin_auth(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing token")

    token = authorization.replace("Bearer ", "").strip()
    if token != "admin":
        raise HTTPException(status_code=401, detail="Invalid admin token")

    return True
