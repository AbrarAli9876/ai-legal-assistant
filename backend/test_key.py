import httpx
from app.core.config import GENAI_API_KEY

print("Key exists:", bool(GENAI_API_KEY))
print("Key length:", len(GENAI_API_KEY) if GENAI_API_KEY else 0)
print("Key starts with:", GENAI_API_KEY[:4] if GENAI_API_KEY else "None")

url = "https://generativelanguage.googleapis.com/v1beta/models"

response = httpx.get(
    url,
    headers={
        "x-goog-api-key": GENAI_API_KEY
    }
)

print("\nStatus Code:", response.status_code)
print("Response:")
print(response.text)