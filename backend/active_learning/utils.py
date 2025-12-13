# utils.py
import pandas as pd
import io
import uuid
import os
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score, confusion_matrix

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads", "active")
os.makedirs(UPLOAD_DIR, exist_ok=True)

def save_uploaded_file(file_obj, filename=None):
    if filename is None:
        filename = f"{uuid.uuid4().hex}.csv"
    path = os.path.join(UPLOAD_DIR, filename)
    # file_obj is a starlette UploadFile or in tests can be bytes
    if hasattr(file_obj, "read"):
        content = file_obj.read()
        if isinstance(content, bytes):
            with open(path, "wb") as f:
                f.write(content)
        else:
            with open(path, "w", encoding="utf-8") as f:
                f.write(content)
    else:
        # assume bytes or str
        with open(path, "wb") as f:
            f.write(file_obj)
    df = pd.read_csv(path)
    return path, df

def compute_basic_metrics(y_true, y_pred):
    return {
        "accuracy": float(accuracy_score(y_true, y_pred)),
        "f1": float(f1_score(y_true, y_pred, average="weighted")),
        "precision": float(precision_score(y_true, y_pred, average="weighted", zero_division=0)),
        "recall": float(recall_score(y_true, y_pred, average="weighted", zero_division=0)),
    }
