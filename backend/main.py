from fastapi import FastAPI
from app.routes import router

from app.admin_routes import router as admin_router

app = FastAPI(title="Customer Feedback Analysis API", version="0.1")
app.include_router(router)
app.include_router(admin_router)                      


@app.get("/")
def root():
    return {"message": "Backend is running. Visit /docs for API docs"}
