from fastapi import (
    APIRouter,
    HTTPException
)

from pydantic import (
    BaseModel,
    Field
)


# ============================================================
# Learning Service
# ============================================================

from app.services.learning_module import (
    simplify_bare_act,
    evaluate_answer,
    research_legal_topic
)


# ============================================================
# Router
# ============================================================

router = APIRouter(
    prefix="/api/v1/learning",
    tags=["LearningHub"]
)


# ============================================================
# Request Models
# ============================================================

class BareActRequest(BaseModel):

    section: str = Field(
        ...,
        min_length=3,
        description=(
            "Legal section to simplify, "
            "for example IPC Section 304"
        )
    )


class AnswerEvaluationRequest(BaseModel):

    question: str = Field(
        ...,
        min_length=10,
        description="Law examination question"
    )

    answer: str = Field(
        ...,
        min_length=20,
        description="Student's answer"
    )


class ResearchRequest(BaseModel):

    topic: str = Field(
        ...,
        min_length=5,
        description="Indian legal topic to research"
    )


# ============================================================
# Tool 1 - Bare Act Simplifier
# ============================================================

@router.post(
    "/simplify-bare-act"
)
async def handle_simplify_bare_act(
    request: BareActRequest
):

    try:

        print(
            "\n[learning] simplify request"
        )

        result = await simplify_bare_act(
            request.section
        )

        print(
            "[learning] simplification successful"
        )

        return result


    except ValueError as e:

        print(
            "[learning] simplifier error:",
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


    except Exception as e:

        print(
            "[learning] unexpected error:",
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "An unexpected error occurred while "
                "simplifying the legal provision."
            )
        )


# ============================================================
# Tool 2 - Answer Evaluator
# ============================================================

@router.post(
    "/evaluate-answer"
)
async def handle_evaluate_answer(
    request: AnswerEvaluationRequest
):

    try:

        print(
            "\n[learning] evaluation request"
        )

        result = await evaluate_answer(
            question=request.question,
            answer=request.answer
        )

        print(
            "[learning] evaluation successful"
        )

        return result


    except ValueError as e:

        print(
            "[learning] evaluator error:",
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


    except Exception as e:

        print(
            "[learning] unexpected evaluator error:",
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "An unexpected error occurred while "
                "evaluating the answer."
            )
        )


# ============================================================
# Tool 3 - Legal Research Assistant
# ============================================================

@router.post(
    "/research-topic"
)
async def handle_research_topic(
    request: ResearchRequest
):

    try:

        print(
            "\n[learning] research request"
        )

        result = await research_legal_topic(
            request.topic
        )

        print(
            "[learning] research successful"
        )

        return result


    except ValueError as e:

        print(
            "[learning] research error:",
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


    except Exception as e:

        print(
            "[learning] unexpected research error:",
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "An unexpected error occurred while "
                "researching the legal topic."
            )
        )