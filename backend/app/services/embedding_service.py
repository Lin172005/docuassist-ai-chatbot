import os

from dotenv import load_dotenv
from google import genai
from google.genai import types


load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
embedding_model = os.getenv(
    "EMBEDDING_MODEL",
    "gemini-embedding-2",
)
embedding_dimensions = int(
    os.getenv("EMBEDDING_DIMENSIONS", "768")
)

if not api_key:
    raise RuntimeError("GEMINI_API_KEY is not configured.")

client = genai.Client(api_key=api_key)


def _create_embedding(text: str) -> list[float]:
    result = client.models.embed_content(
        model=embedding_model,
        contents=text,
        config=types.EmbedContentConfig(
            output_dimensionality=embedding_dimensions,
        ),
    )

    if not result.embeddings:
        raise RuntimeError("Gemini returned no embeddings.")

    values = result.embeddings[0].values

    if not values:
        raise RuntimeError("Gemini returned an empty embedding.")

    if len(values) != embedding_dimensions:
        raise RuntimeError(
            "Unexpected embedding dimensions: "
            f"expected {embedding_dimensions}, received {len(values)}."
        )

    return [float(value) for value in values]


def create_document_embedding(
    title: str,
    content: str,
) -> list[float]:
    prepared_document = f"title: {title} | text: {content}"
    return _create_embedding(prepared_document)


def create_query_embedding(query: str) -> list[float]:
    prepared_query = (
        f"task: question answering | query: {query}"
    )
    return _create_embedding(prepared_query)

def serialize_embedding(values: list[float]) -> str:
    return "[" + ",".join(
        f"{value:.10g}" for value in values
    ) + "]"