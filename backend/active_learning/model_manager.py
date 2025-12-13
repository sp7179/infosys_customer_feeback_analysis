# model_manager.py
import os, glob, json, joblib
import numpy as np
from typing import Tuple, Dict

SUBMODELS_ROOT = os.path.join(os.path.dirname(os.path.dirname(__file__)), "submodels", "tlrl")

# ------------ initialize global model state ------------
_MODEL = None
_VECT = None
_VERSION = "v1"
# ------------------------------------------------------


def list_versions():
    paths = sorted(glob.glob(os.path.join(SUBMODELS_ROOT, "v*")))
    return [os.path.basename(p) for p in paths]

def load_model(version: str = None):
    """
    Load latest model if version=None. Sets global _MODEL, _VECT, _VERSION and returns (model, vectorizer, metadata)
    """
    global _MODEL, _VECT, _VERSION

    if version is None:
        versions = list_versions()
        if not versions:
            raise FileNotFoundError("No model versions found in submodels/tlrl")
        version = versions[-1]  # latest

    vpath = os.path.join(SUBMODELS_ROOT, version)
    model_path = os.path.join(vpath, "model.joblib")
    vec_path = os.path.join(vpath, "vectorizer.joblib")
    meta_path = os.path.join(vpath, "metadata.json")

    model = joblib.load(model_path)
    vectorizer = joblib.load(vec_path)

    metadata = {}
    if os.path.exists(meta_path):
        with open(meta_path, "r") as f:
            metadata = json.load(f)
    metadata.setdefault("version", version)

    # set globals so predict_text can use them
    _MODEL = model
    _VECT = vectorizer
    _VERSION = metadata.get("version", version)

    return _MODEL, _VECT, metadata

def predict_text(text: str) -> Tuple[str, dict, float, str]:
    """
    Returns: label, probs_dict, confidence (0..1 float), version
    """
    global _MODEL, _VECT, _VERSION
    if _MODEL is None or _VECT is None:
        load_model(_VERSION)

    x = _VECT.transform([text])
    # If model supports predict_proba
    if hasattr(_MODEL, "predict_proba"):
        probs_arr = _MODEL.predict_proba(x)[0]           # e.g. [0.1,0.8,0.1]
        classes = list(_MODEL.classes_)                  # e.g. ['neg','neu','pos']
        probs = {str(c): float(p) for c, p in zip(classes, probs_arr)}
        # Ensure probs scaled 0..1 (sometimes saved as percentages)
        # If values look >1, convert to 0..1
        if any(p > 1.0 for p in probs.values()):
            probs = {k: float(v)/100.0 for k,v in probs.items()}
        confidence = max(probs.values()) if probs else 0.0
        label = max(probs, key=probs.get) if probs else _MODEL.predict(x)[0]
    else:
        # fallback: predict only
        label = _MODEL.predict(x)[0]
        probs = {label: 1.0}
        confidence = 1.0

    # safety clamp
    confidence = float(max(0.0, min(1.0, confidence)))

    return label, probs, confidence, _VERSION
    
def save_new_version(model, vectorizer, metrics: dict, base_version: str = None) -> str:
    """
    Save model+vectorizer as new version (v{n+1}) and write metadata.json
    Returns new_version string (e.g., 'v2')
    """
    os.makedirs(SUBMODELS_ROOT, exist_ok=True)
    existing = list_versions()
    last_idx = 0
    for v in existing:
        try:
            idx = int(v.lstrip("v"))
            last_idx = max(last_idx, idx)
        except:
            pass
    new_idx = last_idx + 1
    new_version = f"v{new_idx}"
    vpath = os.path.join(SUBMODELS_ROOT, new_version)
    os.makedirs(vpath, exist_ok=True)
    joblib.dump(model, os.path.join(vpath, "model.joblib"))
    joblib.dump(vectorizer, os.path.join(vpath, "vectorizer.joblib"))
    meta = {
        "version": new_version,
        "base_version": base_version,
        "metrics": metrics
    }
    with open(os.path.join(vpath, "metadata.json"), "w") as f:
        json.dump(meta, f, indent=2)
    return new_version



# -------------------------
# Transformer (DistilBERT) loader + predictor
# -------------------------
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch

# path to transformer files (your folder: submodels/transformer)
_TRANS_ROOT = os.path.join(os.path.dirname(os.path.dirname(__file__)), "submodels", "transformer")
_TRANS_MODEL = None
_TRANS_TOKENIZER = None
_TRANS_ID2LABEL = None
_TRANS_LABEL2ID = None

def load_transformer():
    """
    Loads transformer artifacts from submodels/transformer into module globals.
    """
    global _TRANS_MODEL, _TRANS_TOKENIZER, _TRANS_ID2LABEL, _TRANS_LABEL2ID
    if _TRANS_MODEL is not None:
        return _TRANS_MODEL, _TRANS_TOKENIZER

    # required files should be in the folder (config.json, pytorch_model.bin, tokenizer files, id2label/label2id)
    _TRANS_TOKENIZER = AutoTokenizer.from_pretrained(_TRANS_ROOT)
    _TRANS_MODEL = AutoModelForSequenceClassification.from_pretrained(_TRANS_ROOT, local_files_only=True)

    # try to load id2label/label2id if present
    try:
        with open(os.path.join(_TRANS_ROOT, "id2label.json"), "r") as f:
            _TRANS_ID2LABEL = json.load(f)
    except:
        _TRANS_ID2LABEL = None
    try:
        with open(os.path.join(_TRANS_ROOT, "label2id.json"), "r") as f:
            _TRANS_LABEL2ID = json.load(f)
    except:
        _TRANS_LABEL2ID = None

    return _TRANS_MODEL, _TRANS_TOKENIZER

def predict_text_transformer(text: str) -> Tuple[str, dict, float, str]:
    """
    Predict with transformer model. Returns: label, probs_dict, confidence, version
    version returned as 'transformer'
    """
    load_transformer()
    global _TRANS_MODEL, _TRANS_TOKENIZER, _TRANS_ID2LABEL, _TRANS_LABEL2ID
    if _TRANS_MODEL is None or _TRANS_TOKENIZER is None:
        raise FileNotFoundError("Transformer model/tokenizer not found in submodels/transformer")

    # tokenize
    enc = _TRANS_TOKENIZER([text], padding=True, truncation=True, max_length=128, return_tensors="pt")
    # move inputs to model device if necessary
    device = next(_TRANS_MODEL.parameters()).device
    enc = {k: v.to(device) for k, v in enc.items()}

    _TRANS_MODEL.eval()
    with torch.no_grad():
        outputs = _TRANS_MODEL(**enc)
        logits = outputs.logits[0]
        probs = torch.softmax(logits, dim=-1).cpu().numpy().tolist()

    # build classes: if id2label exists use it, else use numeric ids
    if _TRANS_ID2LABEL:
        classes = [ _TRANS_ID2LABEL.get(str(i), str(i)) for i in range(len(probs)) ]
    else:
        # use model.config.id2label if available
        cfg_map = getattr(_TRANS_MODEL.config, "id2label", None)
        if cfg_map:
            classes = [ cfg_map.get(i, str(i)) for i in range(len(probs)) ]
        else:
            classes = [str(i) for i in range(len(probs))]

    probs_dict = {c: float(p) for c, p in zip(classes, probs)}
    if any(v > 1.0 for v in probs_dict.values()):
        probs_dict = {k: v/100.0 for k, v in probs_dict.items()}

    label = max(probs_dict, key=probs_dict.get)
    confidence = float(max(probs_dict.values()))
    confidence = float(max(0.0, min(1.0, confidence)))

    return label, probs_dict, confidence, "transformer"
