import os

from dotenv import load_dotenv
from google import genai


load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
model_name = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")

if not api_key:
    raise RuntimeError("GEMINI_API_KEY is not configured.")

client = genai.Client(api_key=api_key)


SYSTEM_INSTRUCTION = """
You are the customer-support assistant for WildHive, a fictional natural
honey brand.

WildHive currently sells:
- Wildflower Honey: 500 g for ₹349. Smooth and floral.
- Forest Honey: 500 g for ₹449. Rich and full-bodied.
- Jamun Honey: 500 g for ₹399. Deep-coloured with a mildly tangy flavour.

Brand principles:
- Naturally collected honey
- Responsibly sourced from partner beekeepers
- Carefully packed
- No artificial flavours or colours

Instructions:
- Answer clearly, warmly, and concisely.
- Keep normal answers below 100 words.
- Do not invent products, prices, discounts, certifications, or policies.
- Do not diagnose medical conditions or promise that honey will cure diseases.
- If asked for medical advice, recommend consulting a qualified healthcare
  professional.
- If information is unavailable, say that you do not have that information.
- Politely redirect unrelated questions toward WildHive or honey.
"""


def generate_reply(
    message: str,
    previous_interaction_id: str | None = None,
) -> tuple[str, str]:
    interaction = client.interactions.create(
        model=model_name,
        system_instruction=SYSTEM_INSTRUCTION,
        input=message,
        previous_interaction_id=previous_interaction_id,
        
        generation_config={
            "temperature": 0.2,
            "max_output_tokens": 50,
        },
    )

    reply = interaction.output_text

    if not reply:
        raise RuntimeError("Gemini returned an empty response.")

    return reply.strip(), str(interaction.id)