import json
from pathlib import Path
from typing import Any

from app.database import engine
from app.schemas.chat import ConversationMessage
from app.services.retrieval_service import (
    build_retrieval_query,
    retrieve_knowledge,
)


EVALUATION_FILE = (
    Path(__file__).resolve().parent.parent
    / "evaluation"
    / "retrieval_cases.json"
)


def load_cases() -> list[dict[str, Any]]:
    with EVALUATION_FILE.open(
        "r",
        encoding="utf-8",
    ) as file:
        return json.load(file)


def evaluate() -> None:
    cases = load_cases()
    passed = 0

    for index, case in enumerate(cases, start=1):
        history = [
            ConversationMessage(**message)
            for message in case.get("history", [])
        ]

        retrieval_query = build_retrieval_query(
            message=case["query"],
            conversation_history=history,
        )

        results = retrieve_knowledge(retrieval_query)

        actual_source = (
            results[0].source_title
            if results
            else None
        )

        expected_source = case["expected_top_source"]
        case_passed = actual_source == expected_source

        if case_passed:
            passed += 1

        status = "PASS" if case_passed else "FAIL"

        print(
            f"[{status}] {index}. {case['query']}"
        )
        print(f"  Expected: {expected_source}")
        print(f"  Actual:   {actual_source}")

        if results:
            print(
                "  Semantic similarity: "
                f"{results[0].similarity:.4f}"
            )

        print()

    total = len(cases)
    accuracy = passed / total if total else 0

    print(f"Passed: {passed}/{total}")
    print(f"Retrieval accuracy: {accuracy:.1%}")

    engine.dispose()

    if passed != total:
        raise SystemExit(1)


if __name__ == "__main__":
    evaluate()