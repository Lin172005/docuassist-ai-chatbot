import re


def _split_into_sentences(text: str) -> list[str]:
    """Split text into sentences while respecting common punctuation boundaries."""
    # Split on paragraph breaks first, then sentence endings
    paragraphs = [p.strip() for p in text.split("\n") if p.strip()]
    sentences: list[str] = []
    
    for para in paragraphs:
        # Match ending punctuation (. ! ?) followed by whitespace or end of string
        para_sentences = re.split(r'(?<=[.!?])\s+', para)
        for s in para_sentences:
            s_clean = s.strip()
            if s_clean:
                sentences.append(s_clean)
    return sentences


def chunk_text(
    text: str,
    max_words: int = 180,
    overlap_words: int = 30,
) -> list[str]:
    """
    Chunks text respecting sentence and paragraph boundaries when possible.
    Falls back to word splitting if a single sentence exceeds max_words.
    """
    if max_words <= 0:
        raise ValueError("max_words must be greater than zero.")

    if overlap_words < 0 or overlap_words >= max_words:
        raise ValueError(
            "overlap_words must be between zero and max_words."
        )

    clean_text = text.strip()
    if not clean_text:
        return []

    sentences = _split_into_sentences(clean_text)
    if not sentences:
        # Fallback to word split if no sentence boundaries found
        words = clean_text.split()
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

    chunks: list[str] = []
    current_sentences: list[str] = []
    current_word_count = 0

    for sentence in sentences:
        sentence_words = sentence.split()
        sentence_word_count = len(sentence_words)

        # Handle exceptionally long sentences that exceed max_words on their own
        if sentence_word_count > max_words:
            # First flush any accumulated sentences
            if current_sentences:
                chunks.append(" ".join(current_sentences))
                current_sentences = []
                current_word_count = 0
            
            # Sub-chunk the long sentence by words
            sub_start = 0
            while sub_start < sentence_word_count:
                sub_end = min(sub_start + max_words, sentence_word_count)
                sub_chunk = " ".join(sentence_words[sub_start:sub_end])
                chunks.append(sub_chunk)
                if sub_end == sentence_word_count:
                    break
                sub_start = sub_end - overlap_words
            continue

        if current_word_count + sentence_word_count <= max_words:
            current_sentences.append(sentence)
            current_word_count += sentence_word_count
        else:
            # Emit current chunk
            if current_sentences:
                chunks.append(" ".join(current_sentences))

            # Build overlap from the end of current_sentences without exceeding max_words
            overlap_sentences: list[str] = []
            overlap_count = 0
            for prev_s in reversed(current_sentences):
                s_len = len(prev_s.split())
                if (overlap_count + s_len <= overlap_words) and (overlap_count + s_len + sentence_word_count <= max_words):
                    overlap_sentences.insert(0, prev_s)
                    overlap_count += s_len
                else:
                    break

            current_sentences = overlap_sentences + [sentence]
            current_word_count = sum(len(s.split()) for s in current_sentences)

    if current_sentences:
        chunks.append(" ".join(current_sentences))

    return chunks