from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional

from app.services.chatbot_service import get_chatbot_response


# ============================================================
# Router
# ============================================================

router = APIRouter(
    prefix="/api/v1/chatbot",
    tags=["Chatbot"]
)


# ============================================================
# Request Models
# ============================================================

class ChatMessage(BaseModel):
    role: str
    parts: list[dict]


class ChatQuery(BaseModel):
    query: str = Field(
        ...,
        min_length=1,
        description="User's legal question"
    )

    chat_history: Optional[List[ChatMessage]] = Field(
        default_factory=list,
        description="Previous chatbot conversation"
    )


# ============================================================
# Chatbot Endpoint
# ============================================================

@router.post("/query")
async def handle_chat_query(
    chat_query: ChatQuery
):
    """
    Receives a legal question and sends it to the
    KanoonAI Gemini chatbot service.
    """

    try:

        print("\n[chatbot] request received")
        print("[chatbot] query:", chat_query.query)

        # Convert Pydantic objects into normal dictionaries
        history = [
            message.model_dump()
            for message in chat_query.chat_history
        ]

        # ----------------------------------------------------
        # Call Chatbot Service
        # ----------------------------------------------------

        result = await get_chatbot_response(
            user_query=chat_query.query,
            chat_history=history
        )

        # ----------------------------------------------------
        # Service Error
        # ----------------------------------------------------

        if "error" in result:

            print(
                "[chatbot] service error:",
                result["error"]
            )

            raise HTTPException(
                status_code=500,
                detail=result["error"]
            )

        # ----------------------------------------------------
        # Successful Response
        # ----------------------------------------------------

        print(
            "[chatbot] response successful"
        )

        return {
            "user_query": chat_query.query,
            "ai_response": result["text"],
            "sources": result.get(
                "sources",
                []
            )
        }


    except HTTPException:
        raise


    except Exception as e:

        print(
            "[chatbot] unexpected error:",
            type(e).__name__,
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "An unexpected error occurred while "
                "communicating with the chatbot."
            )
        )