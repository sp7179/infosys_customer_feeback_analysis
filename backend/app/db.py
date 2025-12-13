import os
import pymongo
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGODB_URI")
if not MONGO_URI:
    raise RuntimeError("❌ MONGODB_URI is missing in environment variables")

# Create one global Mongo client (best practice)
_client = None

REQUIRED_COLLECTIONS = ["feedbacks","datasets","models","metrics_history","retrain_jobs"]


def connect_db():
    global _client

    # Lazy initialize client once
    if _client is None:
        _client = pymongo.MongoClient(
            MONGO_URI,
            serverSelectionTimeoutMS=5000,   # prevents infinite hang
            maxPoolSize=20,                  # stable connection pool
            connectTimeoutMS=5000
        )
        try:
            # Attempt to ping server (quick health check)
            _client.admin.command("ping")
            print("✅ MongoDB connected successfully")
        except Exception as e:
            print("❌ MongoDB connection failed:", e)

    return _client["Infosys"]



def get_db():
    return connect_db()
