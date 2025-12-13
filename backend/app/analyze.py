from app.model_loader import vader_analyzer
from app.preprocess import clean_text
from collections import Counter
import numpy as np
from datetime import datetime
import csv
import io


# try to load config from sqlite; fallback to hardcoded below
try:
    from app.sqlite_config import init_db, load_all
    init_db()                # ensures file + tables exist
    _cfg = load_all()
except Exception:
    _cfg = {}

# use DB values if present, else keep existing definitions
TOP_N_ISSUES = _cfg.get("TOP_N_ISSUES", 5)
ISSUE_CLUSTERS = _cfg.get("ISSUE_CLUSTERS", None)  # if None, your hardcoded dict should follow
ASPECT_KEYWORDS = _cfg.get("ASPECT_KEYWORDS", None)
SUGGESTION_MAP = _cfg.get("SUGGESTION_MAP", None)
ADVANCED_SUGGESTION_DATA = _cfg.get("ADVANCED_SUGGESTION_DATA", None)


# print("Loaded config from DB:", {
#     "TOP_N_ISSUES": TOP_N_ISSUES,
#     "ISSUE_CLUSTERS": "from DB" if ISSUE_CLUSTERS else "hardcoded",
#     "ASPECT_KEYWORDS": "from DB" if ASPECT_KEYWORDS else "hardcoded",
#     "SUGGESTION_MAP": "from DB" if SUGGESTION_MAP else "hardcoded",
#     "ADVANCED_SUGGESTION_DATA": "from DB" if ADVANCED_SUGGESTION_DATA else "hardcoded"
# })
   
# ----------------- Helpers for suggestion ranking & AI-weighting -----------------
def _safe_mean_abs(compound_scores):
    try:
        return float(np.mean(np.abs(np.array(compound_scores)))) if compound_scores else 0.0
    except Exception:
        return 0.0

def _ai_weight_for_issue(issue_item, sentiment_distribution=None, compound_scores=None, aspect_sentiment=None):
    """
    Lightweight heuristic "AI-weight" combining:
      - global negative intensity (neg_percent)
      - volatility/strength of sentiment (avg abs compound)
      - raw occurrence count
      - aspect-specific severity if available
    Returns a normalized 0-100 score.
    """
    neg_percent = 0.0
    if sentiment_distribution:
        neg_percent = float(sentiment_distribution.get("neg_percent", 0))
    avg_abs = _safe_mean_abs(compound_scores)
    count = float(issue_item.get("count", 0))

    # Try to find aspect severity if aspect_sentiment contains a matching aspect key
    aspect_severity = 0.0
    key = issue_item.get("keyword", "").lower().replace(" ", "_")
    if aspect_sentiment and key in aspect_sentiment:
        asp = aspect_sentiment[key]
        total = asp.get("pos", 0) + asp.get("neu", 0) + asp.get("neg", 0)
        if total > 0:
            aspect_severity = (asp.get("neg", 0) / total) * 100

    # Heuristic combination
    score = (neg_percent * 0.5) + (avg_abs * 50 * 0.4) + (min(50, count) * 0.6) + (aspect_severity * 0.3)
    # normalize into 0-100
    normalized = max(0.0, min(100.0, score))
    return round(normalized, 2)


# ----------------- Impact Scoring -----------------
def compute_impact_score(sentiment_distribution, top_issues):
    neg_percent = sentiment_distribution.get("neg_percent", 0)
    issue_weight = len(top_issues) * 5
    impact_score = min(100, round(neg_percent * 0.8 + issue_weight, 2))
    return impact_score

# ----------------- Suggestion Generator -----------------
def generate_suggestions(top_issues, sentiment_distribution=None, compound_scores=None, aspect_sentiment=None, top_k=5):
    """
    Enhanced suggestion generator:
      - enriches suggestions with root cause, action steps (from ADVANCED_SUGGESTION_DATA)
      - computes dynamic impact_gain (base + data-driven adjustments)
      - computes a lightweight AI-weight (heuristic)
      - ranks suggestions by combined priority and impact
      - returns top_k suggestions (default 5)
    """
    suggestions = []

    # defensive
    if not top_issues:
        return [{
            "aspect": "general",
            "suggestion": "Maintain current performance.",
            "priority": "low",
            "weight_percent": 0,
            "root_cause": "No major issues detected.",
            "action_steps": [],
            "impact_gain": 5,
            "ai_weight": 0.0
        }]

    # compute denom for relative weighting
    denom = float(sum([it.get("count", 0) for it in top_issues]) or 1)

    for issue_item in top_issues:
        kw = issue_item.get("keyword") or issue_item.get("issue") or "general"
        percent = float(issue_item.get("percent", 0))
        count = float(issue_item.get("count", 0))

        # Base static suggestion text
        base_sugg = SUGGESTION_MAP.get(kw, SUGGESTION_MAP.get(kw.lower(), "Investigate and improve this area."))

        # find ADVANCED metadata by matching keys loosely (try exact then lower/underscore)
        adv = ADVANCED_SUGGESTION_DATA.get(kw) \
              or ADVANCED_SUGGESTION_DATA.get(kw.lower()) \
              or ADVANCED_SUGGESTION_DATA.get(kw.replace(" ", "_").lower()) \
              or {}

        # base impact from advance data
        base_gain = adv.get("impact_gain", 10)

        # compute dynamic impact: base + severity contribution + frequency contribution
        dynamic_gain = base_gain + (percent * 0.35) + (min(50, count) * 0.9)

        # incorporate AI-weight heuristic (uses global context if provided)
        ai_w = _ai_weight_for_issue(issue_item, sentiment_distribution=sentiment_distribution,
                                    compound_scores=compound_scores, aspect_sentiment=aspect_sentiment)

        # blend AI weight into final gain (tunable blend)
        blended_gain = dynamic_gain * 0.6 + ai_w * 0.4

        # cap
        final_impact = int(max(0, min(100, round(blended_gain))))

        # priority rule (tunable)
        if percent >= 50 or final_impact >= 50 or count >= max(3, denom * 0.2):
            priority = "high"
        elif percent >= 25 or final_impact >= 30:
            priority = "medium"
        else:
            priority = "low"

        suggestion_obj = {
            "aspect": kw,
            "suggestion": base_sugg,
            "priority": priority,
            "weight_percent": percent,
            "root_cause": adv.get("root_cause", "Not enough data."),
            "action_steps": adv.get("action_steps", []),
            "impact_gain": final_impact,
            "ai_weight": ai_w,
            # keep original metadata for UI if present
            "count": count,
            "keywords": issue_item.get("keywords", []),
            "example": issue_item.get("example", "")
        }

        suggestions.append(suggestion_obj)

    # ranking: primary by impact_gain desc, secondary by ai_weight desc, tertiary by percent desc
    suggestions_sorted = sorted(suggestions, key=lambda s: (s["impact_gain"], s["ai_weight"], s.get("weight_percent", 0)), reverse=True)

    # return top_k (keeps compatibility)
    return suggestions_sorted[:top_k]


# ----------------- Confidence Stats -----------------
def compute_confidence_stats(compound_scores):
    arr = np.array(compound_scores)
    avg = round(np.mean(arr), 4)
    median = round(np.median(arr), 4)
    hist, bins = np.histogram(arr, bins=[-1, -0.5, 0, 0.5, 1])
    histogram = [{"range": f"{round(bins[i],2)} to {round(bins[i+1],2)}", "count": int(hist[i])} for i in range(len(hist))]
    return {"average": avg, "median": median, "histogram": histogram}

# ----------------- Wordcloud -----------------
def generate_wordcloud_data(reviews, sentiments):
    pos_words, neg_words = [], []
    all_keywords = set(sum(ASPECT_KEYWORDS.values(), []))
    for review, sentiment in zip(reviews, sentiments):
        words = set(clean_text(review).split())
        matched = [w for w in words if w in all_keywords]
        if sentiment == "pos":
            pos_words.extend(matched)
        elif sentiment == "neg":
            neg_words.extend(matched)
    pos_wc = [{"word": w, "count": c} for w, c in Counter(pos_words).items()]
    neg_wc = [{"word": w, "count": c} for w, c in Counter(neg_words).items()]
    return {"positive": pos_wc, "negative": neg_wc}

# ----------------- Trend Analysis -----------------
def compute_trends(reviews, timestamps=None, sentiments=None):
    if timestamps is None:
        return []

    trend_counter = {}
    if sentiments is None:
        sentiments = ["neu"] * len(timestamps)

    for ts, sentiment in zip(timestamps, sentiments):
        ts = ts.strip().replace('"', '')
        date = None
        for fmt in ("%Y-%m-%d", "%d-%m-%Y"):
            try:
                date = datetime.strptime(ts, fmt).date()
                break
            except ValueError:
                continue
        if not date:
            continue
        if date not in trend_counter:
            trend_counter[date] = {"pos": 0, "neg": 0, "neu": 0}
        if sentiment not in ["pos", "neg", "neu"]:
            sentiment = "neu"
        trend_counter[date][sentiment] += 1


    return [{"date": str(d), **counts} for d, counts in sorted(trend_counter.items())]


# ----------------- VADER + Ensemble Analysis (uses raw review text) -----------------
def analyze_reviews_vader(reviews, timestamps=None, cleaned_reviews=None, feedback_ids=None):
    per_review_summary = []
    sentiment_counts = {"pos": 0, "neu": 0, "neg": 0}
    aspect_sentiment = {
        aspect: {
            "pos": 0,
            "neu": 0,
            "neg": 0,
            "confidence": 0.0,
            "severity_score": 0
        } for aspect in ASPECT_KEYWORDS
    }
    negative_words = []
    compound_scores = []
    sentiments_list = []

    # lazy-load transformers
    try:
        from transformers import AutoTokenizer, AutoModelForSequenceClassification
        import torch
        _TF_AVAILABLE = True
    except Exception:
        _TF_AVAILABLE = False

    if _TF_AVAILABLE and not hasattr(analyze_reviews_vader, "_tf_inited"):
        try:
            analyze_reviews_vader._distil_tokenizer = AutoTokenizer.from_pretrained(
                "distilbert-base-uncased-finetuned-sst-2-english"
            )
            analyze_reviews_vader._distil_model = AutoModelForSequenceClassification.from_pretrained(
                "distilbert-base-uncased-finetuned-sst-2-english"
            )
            analyze_reviews_vader._distil_model.eval()
        except Exception:
            analyze_reviews_vader._distil_tokenizer = analyze_reviews_vader._distil_model = None

        try:
            analyze_reviews_vader._roberta_tokenizer = AutoTokenizer.from_pretrained(
                "cardiffnlp/twitter-roberta-base-sentiment"
            )
            analyze_reviews_vader._roberta_model = AutoModelForSequenceClassification.from_pretrained(
                "cardiffnlp/twitter-roberta-base-sentiment"
            )
            analyze_reviews_vader._roberta_model.eval()
        except Exception:
            analyze_reviews_vader._roberta_tokenizer = analyze_reviews_vader._roberta_model = None

        analyze_reviews_vader._tf_inited = True

    def _tf_probs(tokenizer, model, txt):
        if not tokenizer or not model:
            return {"pos": 0.5, "neg": 0.5, "neu": 0.0}
        try:
            inputs = tokenizer(txt, return_tensors="pt", truncation=True, max_length=256)
            with torch.no_grad():
                logits = model(**inputs).logits.squeeze()
                probs = torch.softmax(logits, dim=0).tolist()
            if len(probs) == 2:
                return {"neg": float(probs[0]), "pos": float(probs[1]), "neu": 0.0}
            elif len(probs) == 3:
                return {"neg": float(probs[0]), "neu": float(probs[1]), "pos": float(probs[2])}
            else:
                pos = float(probs[-1]); neg = float(probs[0])
                return {"pos": pos, "neg": neg, "neu": max(0.0, 1.0 - pos - neg)}
        except Exception:
            return {"pos": 0.5, "neg": 0.5, "neu": 0.0}

    def _ensemble_probs(vader_pos, vader_neg, distil_probs, roberta_probs, w_v=0.2, w_d=0.4, w_r=0.4):
        vpos = float(vader_pos); vneg = float(vader_neg)
        total_v = vpos + vneg
        if total_v > 0:
            vpos_p, vneg_p = vpos / total_v, vneg / total_v
        else:
            vpos_p, vneg_p = 0.5, 0.5
        pos = (w_v * vpos_p) + (w_d * distil_probs.get("pos", 0.0)) + (w_r * roberta_probs.get("pos", 0.0))
        neg = (w_v * vneg_p) + (w_d * distil_probs.get("neg", 0.0)) + (w_r * roberta_probs.get("neg", 0.0))
        neu = (w_d * distil_probs.get("neu", 0.0)) + (w_r * roberta_probs.get("neu", 0.0))
        s = pos + neg + neu
        if s <= 0:
            return {"pos": 0.5, "neg": 0.5, "neu": 0.0}
        return {"pos": pos / s, "neg": neg / s, "neu": neu / s}

    def _ensemble_label_and_conf(final_probs, pos_thresh=0.55):
        p = final_probs["pos"]; n = final_probs["neg"]; ne = final_probs["neu"]
        if p >= pos_thresh and p > n:
            label = "pos"; conf = p
        elif n >= pos_thresh and n > p:
            label = "neg"; conf = n
        else:
            label = "neu"
            closeness = 1.0 - abs(p - 0.5) * 2.0
            conf = max(ne, 0.25 * closeness)
        conf_pct = int(round(max(0.0, min(1.0, conf)) * 100))
        return label, conf_pct

    if feedback_ids is None:
        feedback_ids = [None] * len(reviews)

    for idx, review in enumerate(reviews):
        feedback_id = feedback_ids[idx] if idx < len(feedback_ids) else None

        # <<< USE RAW REVIEW TEXT HERE >>>
        text = review

        # VADER
        scores = vader_analyzer.polarity_scores(text)
        compound = scores["compound"]
        compound_scores.append(compound)

        # pseudo VADER probs normalized
        vpos = scores.get("pos", 0.0)
        vneg = scores.get("neg", 0.0)
        vneu = max(0.0, 1.0 - (vpos + vneg))
        s_v = vpos + vneg + vneu or 1.0
        vpos_n, vneg_n, vneu_n = vpos / s_v, vneg / s_v, vneu / s_v

        # transformer probs (safe fallbacks)
        if _TF_AVAILABLE:
            distil_probs = _tf_probs(getattr(analyze_reviews_vader, "_distil_tokenizer", None),
                                     getattr(analyze_reviews_vader, "_distil_model", None),
                                     text)
            roberta_probs = _tf_probs(getattr(analyze_reviews_vader, "_roberta_tokenizer", None),
                                      getattr(analyze_reviews_vader, "_roberta_model", None),
                                      text)
        else:
            distil_probs = {"pos": vpos_n, "neg": vneg_n, "neu": vneu_n}
            roberta_probs = {"pos": vpos_n, "neg": vneg_n, "neu": vneu_n}

        # ensemble blend -> final probs, label, confidence
        final_probs = _ensemble_probs(vpos, vneg, distil_probs, roberta_probs)
        sentiment, confidence_pct = _ensemble_label_and_conf(final_probs)

        sentiments_list.append(sentiment)
        sentiment_counts[sentiment] += 1
        # --- Aspect detection (restore logic) ---
        tokens = clean_text(review).split()
        for asp, kws in ASPECT_KEYWORDS.items():
            if any(w in tokens for w in kws):
                aspect_sentiment[asp][sentiment] += 1



        from nltk.corpus import stopwords
        STOPWORDS = set(stopwords.words("english"))

        import re

        # collect negative words (simple heuristic)
        if sentiment == "neg":
            toks = [t for t in re.findall(r"[a-zA-Z]{2,}", text.lower()) if t not in STOPWORDS]
            negative_words.extend(toks[:4])

        per_review_summary.append({
            "id": idx + 1,
            "feedback_id": feedback_id,
            "text": review[:50] + ("..." if len(review) > 50 else ""),
            "sentiment": sentiment,
            "compound": compound,
            "confidence": confidence_pct,
            "vader_pos_pct": round(vpos_n * 100, 2),
            "vader_neg_pct": round(vneg_n * 100, 2),
            "vader_neu_pct": round(vneu_n * 100, 2),
            "ensemble_pos": round(final_probs["pos"] * 100, 2),
            "ensemble_neg": round(final_probs["neg"] * 100, 2),
            "ensemble_neu": round(final_probs["neu"] * 100, 2)
        })

    total = len(reviews) if reviews else 1
    sentiment_distribution = {
        "pos": sentiment_counts["pos"],
        "neg": sentiment_counts["neg"],
        "neu": sentiment_counts["neu"],
        "pos_percent": round(sentiment_counts["pos"] / total * 100, 2),
        "neg_percent": round(sentiment_counts["neg"] / total * 100, 2),
        "neu_percent": round(sentiment_counts["neu"] / total * 100, 2)
    }

    for asp, stats in aspect_sentiment.items():
        total_a = stats["pos"] + stats["neu"] + stats["neg"]
        stats["severity_score"] = int((stats["neg"] / total_a) * 100) if total_a > 0 else 0

    avg_abs_comp = float(np.mean(np.abs(np.array(compound_scores)))) if compound_scores else 0
    for asp, stats in aspect_sentiment.items():
        total_a = stats["pos"] + stats["neu"] + stats["neg"]
        mention_factor = min(1.0, total_a / 3)
        stats["confidence"] = round(0.5 * mention_factor + 0.5 * avg_abs_comp, 4)

    top_issues_counter = Counter(negative_words)
    total_negatives = sum(top_issues_counter.values()) or 1
    top_issues = [
        {"keyword": kw, "count": cnt, "percent": round((cnt / total_negatives) * 100, 2)}
        for kw, cnt in top_issues_counter.most_common(TOP_N_ISSUES)
    ]

    denom = sum([it["count"] for it in top_issues]) or 1
    for it in top_issues:
        it["label"] = it.get("keyword", it.get("issue", "")).replace("_", " ").title()
        it["severity"] = int(round(it.get("percent", 0)))
        it["impact"] = round(it.get("percent", 0) * (1 + (it.get("count", 0) / max(1, denom))), 2)
        it["keywords"] = []
        for cluster, kws in ISSUE_CLUSTERS.items():
            if cluster == it["keyword"]:
                it["keywords"] = kws[:4]
                break
        it["example"] = "No sample available."
        for rv in reviews:
            rv_low = rv.lower()
            for kw in it["keywords"]:
                if kw in rv_low:
                    it["example"] = (rv[:140] + "...") if len(rv) > 140 else rv
                    break
            if it["example"] != "No sample available.":
                break
        it["trend"] = [max(0, round(it["percent"] * f, 2)) for f in [0.6, 0.9, 1.0]]

    suggestions = generate_suggestions(top_issues,
                                       sentiment_distribution=sentiment_distribution,
                                       compound_scores=compound_scores,
                                       aspect_sentiment=aspect_sentiment,
                                       top_k=5)
    impact_score = compute_impact_score(sentiment_distribution, top_issues)
    confidence_overview = compute_confidence_stats(compound_scores)
    wordcloud_data = generate_wordcloud_data(reviews, sentiments_list)
    trend_over_time = compute_trends(reviews, timestamps, sentiments_list)

    output_csv = io.StringIO()
    writer = csv.writer(output_csv)
    writer.writerow([
        "Review ID", "FeedbackID", "Text", "Sentiment", "Compound", "Confidence(%)",
        "Pos% (per-review)", "Neg% (per-review)", "Neu% (per-review)",
        "Pos% (global)", "Neg% (global)", "Neu% (global)"
    ])

    cleaned_iter = cleaned_reviews if cleaned_reviews is not None else [r for r in reviews]

    for rev, clean_text_value in zip(per_review_summary, cleaned_iter):
        conf_pct = rev.get("confidence", 0)
        writer.writerow([
            rev.get("id"),
            rev.get("feedback_id"),
            (clean_text_value[:140] + "...") if len(clean_text_value) > 140 else clean_text_value,
            rev.get("sentiment"),
            rev.get("compound"),
            conf_pct,
            rev.get("ensemble_pos", rev.get("vader_pos_pct", sentiment_distribution.get("pos_percent", 0))),
            rev.get("ensemble_neg", rev.get("vader_neg_pct", sentiment_distribution.get("neg_percent", 0))),
            rev.get("ensemble_neu", rev.get("vader_neu_pct", sentiment_distribution.get("neu_percent", 0))),
            sentiment_distribution.get("pos_percent", 0),
            sentiment_distribution.get("neg_percent", 0),
            sentiment_distribution.get("neu_percent", 0)
        ])

    report_csv_base64 = output_csv.getvalue()

    return {
        "sentiment_distribution": sentiment_distribution,
        "per_review_summary": per_review_summary,
        "aspect_sentiment": aspect_sentiment,
        "top_issues": top_issues,
        "suggestions": suggestions,
        "impact_score": impact_score,
        "confidence_overview": confidence_overview,
        "wordcloud_data": wordcloud_data,
        "trend_over_time": trend_over_time,
        "report_download": report_csv_base64
    }


# ----------------- Hugging Face Placeholder -----------------
def analyze_reviews_huggingface(reviews, timestamps=None, cleaned_reviews=None, feedback_ids=None):
    return analyze_reviews_vader(reviews, timestamps=timestamps, cleaned_reviews=cleaned_reviews, feedback_ids=feedback_ids)

# ----------------- Transfer Learning Placeholder -----------------
def analyze_reviews_tl_model(reviews, timestamps=None, cleaned_reviews=None, feedback_ids=None):
    return analyze_reviews_vader(reviews, timestamps=timestamps, cleaned_reviews=cleaned_reviews, feedback_ids=feedback_ids)

# ----------------- Dispatcher / Model Switch -----------------
def analyze_reviews(reviews, model="vader", timestamps=None, cleaned_reviews=None, feedback_ids=None):
    model = model.lower().strip()
    if model == "vader":
        return analyze_reviews_vader(reviews, timestamps=timestamps, cleaned_reviews=cleaned_reviews, feedback_ids=feedback_ids)
    elif model == "huggingface":
        return analyze_reviews_huggingface(reviews, timestamps=timestamps, cleaned_reviews=cleaned_reviews, feedback_ids=feedback_ids)
    elif model == "tl_model":
        return analyze_reviews_tl_model(reviews, timestamps=timestamps, cleaned_reviews=cleaned_reviews, feedback_ids=feedback_ids)
    else:
        raise ValueError("Unsupported model. Use 'vader', 'huggingface', or 'tl_model'.")

