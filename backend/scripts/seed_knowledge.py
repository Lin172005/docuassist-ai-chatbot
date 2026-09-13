import hashlib
import json

from sqlalchemy import text

from app.database import engine


PRODUCTS = [
    {
        "sku": "WH-WILDFLOWER-500",
        "slug": "wildflower-honey",
        "name": "Wildflower Honey",
        "short_description": "Smooth, floral honey from seasonal wildflowers.",
        "full_description": (
            "Wildflower Honey is collected from bees foraging across seasonal "
            "wildflowers. It has a smooth and floral flavour."
        ),
        "price_inr": 349,
        "weight_grams": 500,
        "flavour_profile": "Smooth and floral",
        "source_description": "Seasonal wildflowers",
    },
    {
        "sku": "WH-FOREST-500",
        "slug": "forest-honey",
        "name": "Forest Honey",
        "short_description": "Rich, full-bodied honey from forest regions.",
        "full_description": (
            "Forest Honey is sourced from flowering trees in natural forest "
            "regions. It has a rich and full-bodied flavour."
        ),
        "price_inr": 449,
        "weight_grams": 500,
        "flavour_profile": "Rich and full-bodied",
        "source_description": (
            "Flowering trees in natural forest regions"
        ),
    },
    {
        "sku": "WH-JAMUN-500",
        "slug": "jamun-honey",
        "name": "Jamun Honey",
        "short_description": "Deep-coloured honey with a mildly tangy flavour.",
        "full_description": (
            "Jamun Honey is sourced from Jamun blossoms. It has a deep colour "
            "and a mildly tangy flavour."
        ),
        "price_inr": 399,
        "weight_grams": 500,
        "flavour_profile": "Deep and mildly tangy",
        "source_description": "Jamun blossoms",
    },
]


GENERAL_SOURCES = [
    {
        "source_type": "faq",
        "source_key": "faq:artificial-ingredients",
        "title": "Artificial flavours and colours",
        "content": (
            "WildHive honey contains no artificial flavours or artificial "
            "colours."
        ),
        "metadata": {
            "category": "ingredients",
        },
    },
    {
        "source_type": "page",
        "source_key": "page:responsible-sourcing",
        "title": "WildHive responsible sourcing",
        "content": (
            "WildHive works with partner beekeepers. Its honey is responsibly "
            "sourced and carefully packed."
        ),
        "metadata": {
            "category": "brand",
        },
    },
]


def create_hash(content: str) -> str:
    return hashlib.sha256(content.encode("utf-8")).hexdigest()


def seed_products() -> None:
    with engine.begin() as connection:
        for product in PRODUCTS:
            product_id = connection.execute(
                text(
                    """
                    insert into public.products (
                        sku,
                        slug,
                        name,
                        short_description,
                        full_description,
                        price_inr,
                        weight_grams,
                        flavour_profile,
                        source_description
                    )
                    values (
                        :sku,
                        :slug,
                        :name,
                        :short_description,
                        :full_description,
                        :price_inr,
                        :weight_grams,
                        :flavour_profile,
                        :source_description
                    )
                    on conflict (sku)
                    do update set
                        slug = excluded.slug,
                        name = excluded.name,
                        short_description =
                            excluded.short_description,
                        full_description =
                            excluded.full_description,
                        price_inr = excluded.price_inr,
                        weight_grams = excluded.weight_grams,
                        flavour_profile =
                            excluded.flavour_profile,
                        source_description =
                            excluded.source_description,
                        is_active = true
                    returning id
                    """
                ),
                product,
            ).scalar_one()

            knowledge_content = (
                f"{product['name']} is a {product['weight_grams']} gram "
                f"WildHive honey product. "
                f"{product['full_description']} "
                "WildHive honey contains no artificial flavours or colours."
            )

            source_values = {
                "product_id": product_id,
                "source_type": "product",
                "source_key": f"product:{product['slug']}",
                "title": product["name"],
                "content": knowledge_content,
                "content_hash": create_hash(knowledge_content),
                "metadata": json.dumps(
                    {
                        "sku": product["sku"],
                        "slug": product["slug"],
                        "category": "natural_honey",
                    }
                ),
            }

            connection.execute(
                text(
                    """
                    insert into public.knowledge_sources (
                        product_id,
                        source_type,
                        source_key,
                        title,
                        content,
                        content_hash,
                        metadata
                    )
                    values (
                        :product_id,
                        :source_type,
                        :source_key,
                        :title,
                        :content,
                        :content_hash,
                        cast(:metadata as jsonb)
                    )
                    on conflict (source_type, source_key)
                    do update set
                        product_id = excluded.product_id,
                        title = excluded.title,
                        content = excluded.content,
                        content_hash = excluded.content_hash,
                        metadata = excluded.metadata,
                        is_active = true
                    """
                ),
                source_values,
            )

        for source in GENERAL_SOURCES:
            source_values = {
                **source,
                "content_hash": create_hash(source["content"]),
                "metadata": json.dumps(source["metadata"]),
            }

            connection.execute(
                text(
                    """
                    insert into public.knowledge_sources (
                        source_type,
                        source_key,
                        title,
                        content,
                        content_hash,
                        metadata
                    )
                    values (
                        :source_type,
                        :source_key,
                        :title,
                        :content,
                        :content_hash,
                        cast(:metadata as jsonb)
                    )
                    on conflict (source_type, source_key)
                    do update set
                        title = excluded.title,
                        content = excluded.content,
                        content_hash = excluded.content_hash,
                        metadata = excluded.metadata,
                        is_active = true
                    """
                ),
                source_values,
            )

    engine.dispose()
    print("Knowledge sources seeded successfully.")


if __name__ == "__main__":
    seed_products()