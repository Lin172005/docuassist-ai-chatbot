def chunk_text(
    text: str,
    max_words: int = 180,
    overlap_words: int = 30,
) -> list[str]:
    if max_words <= 0:
        raise ValueError("max_words must be greater than zero.")

    if overlap_words < 0 or overlap_words >= max_words:
        raise ValueError(
            "overlap_words must be between zero and max_words."
        )

    words = text.split()

    if not words:
        return []

    chunks: list[str] = []
    start = 0

    while start < len(words):
        end = min(start + max_words, len(words))
        chunk = " ".join(words[start:end]).strip()

        if chunk:
            chunks.append(chunk)

        if end == len(words):
            break

        start = end - overlap_words

    return chunks