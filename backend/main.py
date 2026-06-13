from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import ollama
import json
import re

app = FastAPI()

# Allow React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request model
class ReceiptRequest(BaseModel):
    ocrText: str


@app.get("/")
def home():
    return {
        "message": "SnapVault AI Backend Running"
    }


@app.post("/analyze-receipt")
async def analyze_receipt(data: ReceiptRequest):

    prompt = f"""
You are a receipt analysis AI.

OCR TEXT:
{data.ocrText}

Extract the following:

1. Merchant Name
2. Final Amount Paid
3. Transaction Date
4. Expense Category

Available Categories:
- Food
- Transport
- Shopping
- Groceries
- Healthcare
- Bills
- Entertainment
- Education
- Others

IMPORTANT:
Return ONLY valid JSON.

Example:

{{
    "merchant": "KFC",
    "amount": 25.90,
    "date": "2026-06-06",
    "category": "Food"
}}
"""

    try:

        response = ollama.chat(
            model="llama3.2",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        content = response["message"]["content"]

        print("\n===== OLLAMA RESPONSE =====")
        print(content)
        print("===========================\n")

        # Extract JSON block if model adds extra text
        match = re.search(
            r"\{.*\}",
            content,
            re.DOTALL
        )

        if match:

            parsed = json.loads(
                match.group()
            )

            return parsed

        return {
            "merchant": "",
            "amount": 0,
            "date": "",
            "category": "Others",
            "raw": content
        }

    except Exception as e:

        return {
            "error": str(e)
        }