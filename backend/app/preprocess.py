import re
import nltk
from nltk.corpus import stopwords
import emoji

# Download required resources
nltk.download('stopwords')
nltk.download('vader_lexicon')  # for sentiment models using VADER later

# Stopwords set
stop_words = set(stopwords.words('english'))

def clean_text(text: str) -> str:
    """
    Enhanced preprocessing pipeline for noisy/unstructured text.
    - Lowercase normalization
    - Remove emojis and special symbols
    - Remove non-alphanumeric characters (except spaces)
    - Remove stopwords
    - Normalize whitespace
    """
    if not text:
        return ""

    # Lowercase
    text = text.lower()

    # Remove emojis
    text = emoji.replace_emoji(text, replace='')

    # Remove URLs, mentions, hashtags
    text = re.sub(r"http\S+|www\S+|@\w+|#\w+", "", text)

    # Remove special characters and punctuation (keep alphanumeric and space)
    text = re.sub(r"[^a-z0-9\s]", " ", text)

    # Remove extra whitespace
    text = re.sub(r"\s+", " ", text).strip()

    # Remove stopwords
    words = [w for w in text.split() if w not in stop_words]

    return " ".join(words)
