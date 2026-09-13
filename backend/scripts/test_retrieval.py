import argparse

from app.database import engine
from app.services.retrieval_service import retrieve_knowledge


def test_retrieval(query: str) -> None:
    results = retrieve_knowledge(query)

    print(f"\nQuery: {query}")
    print(f"Matches: {len(results)}\n")

    for rank, result in enumerate(results, start=1):
        print(
            f"{rank}. {result.source_title} "
            f"(similarity: {result.similarity:.4f})"
        )

        if result.product_name:
            print(f"   Product: {result.product_name}")
            print(f"   SKU: {result.product_sku}")
            print(f"   Price: ₹{result.product_price_inr}")
            print(
                f"   Weight: {result.product_weight_grams} g"
            )

        print(f"   Content: {result.content}")
        print()

    engine.dispose()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("query")
    arguments = parser.parse_args()

    test_retrieval(arguments.query)