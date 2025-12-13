from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import joblib
import os

# ----------------- Global Model State -----------------
CURRENT_MODEL = "vader"

# ----------------- Model Holders -----------------
vader_analyzer = SentimentIntensityAnalyzer()  # Always available

ml_model = None
tfidf_vectorizer = None
transformer_model = None


# ----------------- ML Loader -----------------
def load_ml_model(model_path="models/tfidf_lr_joblib.pkl", vectorizer_path=None):
    """
    Safely load ML sentiment model + vectorizer.
    Returns (model, vectorizer)
    """
    global ml_model, tfidf_vectorizer

    if ml_model is not None:
        return ml_model, tfidf_vectorizer

    try:
        if not os.path.exists(model_path):
            print(f"[Warning] ML model not found at: {model_path}")
            return None, None

        ml_model = joblib.load(model_path)
        print(f"[OK] ML model loaded from: {model_path}")

        if vectorizer_path:
            if os.path.exists(vectorizer_path):
                tfidf_vectorizer = joblib.load(vectorizer_path)
                print(f"[OK] TF-IDF vectorizer loaded from: {vectorizer_path}")
            else:
                print(f"[Warning] Vectorizer not found: {vectorizer_path}")

    except Exception as e:
        print(f"[ERROR] Failed loading ML model: {e}")
        ml_model, tfidf_vectorizer = None, None

    return ml_model, tfidf_vectorizer


# ----------------- Transformer Loader -----------------
def load_transformer_model(model_name="distilbert-base-uncased"):
    """
    Future-proof transformer loader.
    """
    global transformer_model

    if transformer_model is not None:
        return transformer_model

    try:
        # Placeholder — change later to actual HF pipeline
        transformer_model = f"TransformerModel({model_name})"
        print(f"[OK] Transformer placeholder registered for: {model_name}")

    except Exception as e:
        print(f"[ERROR] Transformer load failed: {e}")
        transformer_model = None

    return transformer_model


# ----------------- Main Getter -----------------
def get_model(model_name=None):
    """
    Get appropriate model instance.
    """
    name = (model_name or CURRENT_MODEL).lower()

    if name == "vader":
        return vader_analyzer

    if name == "ml":
        m, v = load_ml_model()
        return {"model": m, "vectorizer": v}

    if name == "transformer":
        return load_transformer_model()

    raise ValueError(f"Unknown model type: {name}")


# ----------------- Set Active Model -----------------
def set_current_model(model_name: str):
    """
    Set active sentiment model.
    """
    global CURRENT_MODEL
    allowed = ["vader", "ml", "transformer"]

    if model_name not in allowed:
        raise ValueError(f"Invalid model '{model_name}'. Choose from {allowed}")

    CURRENT_MODEL = model_name
    print(f"[INFO] Active model set to: {CURRENT_MODEL}")

    return CURRENT_MODEL


# ----------------- Get Active Model Name -----------------
def get_current_model():
    return CURRENT_MODEL
