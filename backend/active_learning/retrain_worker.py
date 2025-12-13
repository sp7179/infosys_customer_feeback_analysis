# retrain_worker.py
import threading, queue, time
from typing import Dict, Any
from .model_manager import save_new_version, load_model
from .utils import compute_basic_metrics
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import confusion_matrix, precision_recall_curve, roc_auc_score
from sklearn.preprocessing import label_binarize
import numpy as np
from datetime import datetime

from sklearn.feature_extraction.text import TfidfVectorizer
import pandas as pd
from app.db import get_db
   # assumes you have get_db() in backend/db.py

_JOB_QUEUE = queue.Queue()
_JOBS = {}  # job_id -> status dict

def start_worker_thread():
    t = threading.Thread(target=_worker_loop, daemon=True)
    t.start()

def submit_retrain_job(job_id: str, dataset_path: str, include_feedbacks: bool = True, base_version: str = None):
    _JOBS[job_id] = {"status": "queued", "progress": 0}
    _JOB_QUEUE.put((job_id, dataset_path, include_feedbacks, base_version))
    return job_id

def _worker_loop():
    while True:
        job_id, dataset_path, include_feedbacks, base_version = _JOB_QUEUE.get()
        try:
            _JOBS[job_id]["status"] = "running"
            print(f"[RETRAIN] Job {job_id} started with dataset: {dataset_path}")
            _JOBS[job_id]["progress"] = 5
            
            # load dataset
            df = pd.read_csv(dataset_path)
            df.columns = df.columns.str.strip().str.lower()

                        # --- FIX: Normalize sentiment column ---
            print("[RETRAIN] COLUMNS BEFORE RENAME:", df.columns.tolist())

            rename_map = {
                "sentiment": "sentiment",
                "corrected": "sentiment",
                "label": "sentiment",
                "labels": "sentiment",
                "sentiments": "sentiment",
                "sentiment_label": "sentiment",
                "sentimentvalue": "sentiment",
                "sentiment ": "sentiment",
            }

            # rename any matching column to "sentiment"
            for col in list(df.columns):
                if col in rename_map:
                    df.rename(columns={col: "sentiment"}, inplace=True)

            print("[RETRAIN] COLUMNS AFTER RENAME:", df.columns.tolist())

            # if sentiment still missing → STOP with clear error
            if "sentiment" not in df.columns:
                raise ValueError(f"[RETRAIN ERROR] Missing 'sentiment' column. Found: {df.columns.tolist()}")

            # optionally include feedbacks from DB
            if include_feedbacks:
                db = get_db()
                feedbacks = list(db.feedbacks.find({"corrected": {"$ne": None}}))
                if feedbacks:
                    fb_df = pd.DataFrame(feedbacks)
                    # ensure columns text, corrected
                    if "text" in fb_df.columns and "corrected" in fb_df.columns:
                        fb_df = fb_df[["text", "corrected"]].rename(columns={"corrected": "sentiment"})
                        df = pd.concat([df, fb_df], ignore_index=True)
            _JOBS[job_id]["progress"] = 25
            # preprocess
            df['text'] = df['text'].astype(str).str.lower()
            print("[RETRAIN] CHECKPOINT 2: about to lowercase text")

            X = df['text']
            print("[RETRAIN] CHECKPOINT 3: before X = df['text']")


            y = df['sentiment']
            print("[RETRAIN] CHECKPOINT 4: before y = df['sentiment']")

            # vectorize & train new model
            vectorizer = TfidfVectorizer(max_features=3000, ngram_range=(1,2))

            print("[RETRAIN] CHECKPOINT 5: before vectorizer")



            Xv = vectorizer.fit_transform(X)

            print("[RETRAIN] CHECKPOINT 7: before calibration split")

            

            # Base model
            base_clf = LogisticRegression(max_iter=300, n_jobs=-1)
            base_clf.fit(Xv, y)

            # ---- CALIBRATION (robust) ----
            from sklearn.calibration import CalibratedClassifierCV
            from sklearn.model_selection import train_test_split
            from sklearn.base import clone
            import warnings
            warnings.filterwarnings("ignore", category=UserWarning, module="sklearn.calibration")

            print("[RETRAIN] CHECKPOINT 7.1: label counts for calibration split ->", df['sentiment'].value_counts().to_dict())

            # choose stratify only if every class has >=2 samples
            class_counts = df['sentiment'].value_counts()
            stratify_arg = df['sentiment'] if (class_counts >= 2).all() else None
            if stratify_arg is None:
                print("[RETRAIN] WARNING: small class counts detected -> skipping stratify for calibration split")

            try:
                X_train_c, X_cal, y_train_c, y_cal = train_test_split(
                    Xv, y, test_size=0.2, random_state=42, stratify=stratify_arg
                )
            except Exception as e:
                # fallback: non-stratified split on raw X/y
                print("[RETRAIN] train_test_split failed for calibration split:", str(e))
                X_train_c, X_cal, y_train_c, y_cal = train_test_split(
                    Xv, y, test_size=0.2, random_state=42
                )

            # if calibration data is too small or single-class, skip calibration
            unique_cal = np.unique(y_cal)
            if len(unique_cal) < 2 or len(y_cal) < 10:
                print(f"[RETRAIN] INFO: calibration skipped (unique_cal={unique_cal}, n_cal={len(y_cal)}) — using base classifier without calibration")
                clf = base_clf
            else:
                # pick method: isotonic needs more data; fallback to 'sigmoid' for small sets
                method = "isotonic" if len(y_cal) >= 200 else "sigmoid"
                print(f"[RETRAIN] INFO: running calibration with method={method}, n_cal={len(y_cal)}")
                try:
                    cal_clf = CalibratedClassifierCV(estimator=clone(base_clf), cv="prefit", method=method)
                    cal_clf.fit(X_cal, y_cal)
                    clf = cal_clf
                    print("[RETRAIN] Calibration completed successfully.")
                except Exception as e:
                    # on any calibration error, fallback to base classifier but continue
                    print("[RETRAIN] Calibration failed:", str(e))
                    clf = base_clf

            _JOBS[job_id]["progress"] = 70
            # evaluate on held-out split (simple split)
            from sklearn.model_selection import train_test_split
            Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
            Xte_v = vectorizer.transform(Xte)
            preds = clf.predict(Xte_v)
            metrics = compute_basic_metrics(yte, preds)


            _JOBS[job_id]["progress"] = 90

            # --- advanced evaluation: probs, confusion, PR-curves, confidence histogram, AUC ---
            probs = clf.predict_proba(Xte_v)  # shape (n_samples, n_classes)
            classes = list(clf.classes_)
            # confusion matrix
            cm = confusion_matrix(yte, preds, labels=classes).tolist()

            # confidence histogram (max prob per sample)
            max_probs = probs.max(axis=1)
            hist_counts, hist_bins = np.histogram(max_probs, bins=10, range=(0.0, 1.0))
            hist_bins = hist_bins.tolist()
            hist_counts = hist_counts.tolist()
            pct_below_0_5 = float((max_probs < 0.5).mean())

            # precision-recall curves per class
            pr_curves = {}
            auc_per_class = {}
            try:
                Y_test_bin = label_binarize(yte, classes=classes)
                for idx, cls in enumerate(classes):
                    y_true_bin = Y_test_bin[:, idx]
                    y_score = probs[:, idx]
                    precision, recall, thresholds = precision_recall_curve(y_true_bin, y_score)
                    pr_curves[cls] = {"precision": precision.tolist(), "recall": recall.tolist(), "thresholds": thresholds.tolist()}
                    # auc if possible
                    try:
                        auc_per_class[cls] = float(roc_auc_score(y_true_bin, y_score)) if len(np.unique(y_true_bin)) > 1 else None
                    except Exception:
                        auc_per_class[cls] = None
            except Exception:
                pr_curves = {}
                auc_per_class = {}

            # save new version
            new_version = save_new_version(clf, vectorizer, metrics, base_version=base_version)

            # persist metrics_history and model record in Mongo
            db = get_db()
            metrics_doc = {
                "version": new_version,
                "created_at": datetime.utcnow(),
                "metrics": metrics,
                "confusion": {"labels": classes, "matrix": cm},
                "confidence_dist": {"bins": hist_bins, "counts": hist_counts, "pct_below_0_5": pct_below_0_5},
                "pr_curve": pr_curves,
                "auc_per_class": auc_per_class,
                "n_samples": int(len(df))
            }
            db.metrics_history.insert_one(metrics_doc)

            db.models.insert_one({
                "version": new_version,
                "metrics": metrics,
                "created_at": metrics_doc["created_at"],
                "artifact_path": None
            })

            db.retrain_jobs.insert_one({
                "job_id": job_id,
                "status": "done",
                "result_metrics": metrics,
                "model_version": new_version
            })

            _JOBS[job_id]["status"] = "done"
            print(f"[RETRAIN] Job {job_id} finished. New version: {new_version}")

            _JOBS[job_id]["progress"] = 100
            _JOBS[job_id]["result"] = {"metrics": metrics, "version": new_version}

            



        except Exception as e:
            _JOBS[job_id]["status"] = "failed"
            _JOBS[job_id]["message"] = str(e)
        finally:
            _JOB_QUEUE.task_done()

# start worker on import
start_worker_thread()
