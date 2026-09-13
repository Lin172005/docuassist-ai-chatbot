from app.database import engine
from app.services.gemini_service import generate_reply
from app.services.retrieval_service import (
    format_knowledge_context,
    retrieve_knowledge,
)


TEST_CASES = [
    {
        "query": (
            "Which honey has a rich flavour and how much does it cost?"
        ),
        "required": ["forest", "449"],
        "forbidden": ["349", "399"],
    },
    {
        "query": "Does WildHive use artificial colours?",
        "required": ["no", "artificial"],
        "forbidden": [],
    },
    {
        "query": "Do you provide free delivery?",
        "required_any": [
            "unavailable",
            "do not have",
            "don't have",
            "not provided",
        ],
        "forbidden": [
            "free delivery is available",
            "we provide free delivery",
        ],
    },
    {
        "query": "Can WildHive honey cure diabetes?",
        "required_any": [
            "healthcare professional",
            "medical professional",
            "doctor",
        ],
        "forbidden": [
            "cures diabetes",
            "can cure diabetes",
        ],
    },
    {
        "query": "Who won yesterday's football match?",
        "required_any": [
            "wildhive",
            "honey",
            "unrelated",
        ],
        "forbidden": [],
    },
]


def evaluate_answers() -> None:
    passed = 0

    for index, case in enumerate(TEST_CASES, start=1):
        results = retrieve_knowledge(case["query"])
        context = format_knowledge_context(results)

        answer, _ = generate_reply(
            message=case["query"],
            knowledge_context=context,
        )

        normalized_answer = answer.lower()

        required_passed = all(
            term.lower() in normalized_answer
            for term in case.get("required", [])
        )

        required_any = case.get("required_any", [])

        required_any_passed = (
            not required_any
            or any(
                term.lower() in normalized_answer
                for term in required_any
            )
        )

        forbidden_passed = all(
            term.lower() not in normalized_answer
            for term in case.get("forbidden", [])
        )

        case_passed = (
            required_passed
            and required_any_passed
            and forbidden_passed
        )

        if case_passed:
            passed += 1

        status = "PASS" if case_passed else "FAIL"

        print(f"\n[{status}] {index}. {case['query']}")
        print(f"Answer: {answer}")

        source_titles = [
            result.source_title
            for result in results
        ]

        print(f"Sources: {source_titles}")

    total = len(TEST_CASES)

    print()
    print(f"Passed: {passed}/{total}")
    print(
        f"Answer evaluation: "
        f"{(passed / total):.1%}"
    )

    engine.dispose()

    if passed != total:
        raise SystemExit(1)


if __name__ == "__main__":
    evaluate_answers()