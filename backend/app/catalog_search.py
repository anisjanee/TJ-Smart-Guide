"""Local multilingual matching for the SAMT service catalog.

This module intentionally does not invent requirements, prices, deadlines or procedures.
It only maps a user's wording to catalog entries so the AI can use verified knowledge
articles as context.
"""

import re
from difflib import SequenceMatcher

RUSSIAN_NORMALIZATION = {
    "авто": "автомобиль",
    "машина": "автомобиль",
    "врач": "доктор",
    "больница": "медицинское учреждение",
    "универ": "университет",
    "вуз": "университет",
    "детсад": "детский сад",
    "паспортный": "паспорт",
    "кормильца": "кормилец",
    "пенсию": "пенсия",
    "пособие": "пособия",
    "доверенность": "доверенности",
}

TAJIK_NORMALIZATION = {
    "нафақа": "пенсия",
    "маош": "зарплата",
    "табобат": "лечение",
    "духтур": "врач",
    "беморхона": "больница",
    "ҳуҷҷат": "документ",
    "шиноснома": "паспорт",
    "кӯмакпулӣ": "пособие",
    "таҳсил": "образование",
    "донишгоҳ": "университет",
    "мактаб": "школа",
    "кӯдак": "ребёнок",
    "оила": "семья",
    "никоҳ": "брак",
    "мерос": "наследство",
    "ваколатнома": "доверенность",
}


def normalize(text: str) -> str:
    value = re.sub(r"[^\w\s-]", " ", text.lower(), flags=re.UNICODE)
    value = re.sub(r"\s+", " ", value).strip()
    for source, target in {**RUSSIAN_NORMALIZATION, **TAJIK_NORMALIZATION}.items():
        value = re.sub(rf"\b{re.escape(source)}\b", target, value)
    return value


def score(query: str, title: str, summary: str = "", content: str = "") -> float:
    q = normalize(query)
    target = normalize(" ".join([title, summary, content]))
    if not q or not target:
        return 0.0

    q_words = set(q.split())
    t_words = set(target.split())
    overlap = len(q_words & t_words) / max(1, len(q_words))
    phrase = SequenceMatcher(None, q, normalize(title)).ratio()

    # Exact phrase and title matches receive the highest weight.
    if q in normalize(title):
        phrase = max(phrase, 0.95)
    return min(1.0, overlap * 0.65 + phrase * 0.35)


def rank_catalog(query: str, entries: list[dict], limit: int = 8) -> list[dict]:
    """Return the most relevant catalog entries without changing their data."""
    ranked = []
    for entry in entries:
        value = score(
            query,
            str(entry.get("title", "")),
            str(entry.get("summary", "")),
            str(entry.get("content", "")),
        )
        if value >= 0.20:
            ranked.append({**entry, "match_score": round(value, 4)})
    ranked.sort(key=lambda item: item["match_score"], reverse=True)
    return ranked[:limit]
