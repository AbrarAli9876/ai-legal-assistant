from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from datetime import date

from app.services.notice_generator import (
    generate_notice_files,
    sanitize_filename
)


# ============================================================
# Router
# ============================================================

router = APIRouter(
    prefix="/api/v1/notice",
    tags=["LegalNoticeGenerator"]
)


# ============================================================
# Unpaid Salary Notice Request
# ============================================================

class UnpaidSalaryNoticeRequest(BaseModel):

    recipient_name: str = Field(
        ...,
        min_length=1
    )

    recipient_designation: str = Field(
        ...,
        min_length=1
    )

    recipient_company_name: str = Field(
        ...,
        min_length=1
    )

    recipient_company_address: str = Field(
        ...,
        min_length=1
    )

    sender_name: str = Field(
        ...,
        min_length=1
    )

    employee_id: str = Field(
        ...,
        min_length=1
    )

    employee_company_name: str = Field(
        ...,
        min_length=1
    )

    employee_company_address: str = Field(
        ...,
        min_length=1
    )

    employment_start_date: str = Field(
        ...,
        min_length=1
    )

    employment_end_date: str = Field(
        ...,
        min_length=1
    )

    unpaid_salary_period: str = Field(
        ...,
        min_length=1
    )

    unpaid_salary_amount: int = Field(
        ...,
        gt=0
    )

    unpaid_salary_amount_words: str = Field(
        ...,
        min_length=1
    )

    response_time_days: int = Field(
        ...,
        gt=0
    )


# ============================================================
# Loan Repayment Notice Request
# ============================================================

class LoanRepaymentNoticeRequest(BaseModel):

    borrower_name: str = Field(
        ...,
        min_length=1
    )

    borrower_address: str = Field(
        ...,
        min_length=1
    )

    lender_name: str = Field(
        ...,
        min_length=1
    )

    lender_address: str = Field(
        ...,
        min_length=1
    )

    lender_contact: str = Field(
        ...,
        min_length=1
    )

    loan_amount: int = Field(
        ...,
        gt=0
    )

    loan_amount_words: str = Field(
        ...,
        min_length=1
    )

    loan_date: str = Field(
        ...,
        min_length=1
    )

    repayment_period: int = Field(
        ...,
        gt=0
    )

    loan_purpose: str = Field(
        ...,
        min_length=1
    )

    installment_amount: int = Field(
        ...,
        gt=0
    )

    outstanding_date: str = Field(
        ...,
        min_length=1
    )

    outstanding_amount: int = Field(
        ...,
        gt=0
    )

    outstanding_amount_words: str = Field(
        ...,
        min_length=1
    )

    response_time_days: int = Field(
        ...,
        gt=0
    )


# ============================================================
# Unpaid Salary Notice
# ============================================================

@router.post(
    "/generate-unpaid-salary-notice"
)
def handle_salary_notice_generation(
    request: UnpaidSalaryNoticeRequest
):
    """
    Generates DOCX and PDF versions of an
    unpaid salary legal notice.
    """

    try:

        print(
            "\n[notice] Generating unpaid salary notice"
        )

        # ----------------------------------------------------
        # Template context
        # ----------------------------------------------------

        context = request.model_dump()

        context["generation_date"] = (
            date.today().strftime(
                "%B %d, %Y"
            )
        )

        # ----------------------------------------------------
        # Filename
        # ----------------------------------------------------

        sender_safe = sanitize_filename(
            request.sender_name
        )

        recipient_safe = sanitize_filename(
            request.recipient_name
        )

        base_filename = (
            f"notice_{sender_safe}"
            f"_to_{recipient_safe}"
        )

        # ----------------------------------------------------
        # Generate files
        # ----------------------------------------------------

        result = generate_notice_files(
            template_name=(
                "unpaid_salary_notice_template.docx"
            ),
            context=context,
            base_filename=base_filename
        )

        print(
            "[notice] Unpaid salary notice generated."
        )

        return result


    except FileNotFoundError as e:

        print(
            "[notice] Template error:",
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Unpaid Salary Notice "
                "template file not found."
            )
        )


    except Exception as e:

        print(
            "\n===== SALARY NOTICE ERROR ====="
        )

        print(
            type(e).__name__
        )

        print(
            str(e)
        )

        print(
            "===============================\n"
        )

        raise HTTPException(
            status_code=500,
            detail=(
                f"Error generating legal notice: "
                f"{str(e)}"
            )
        )


# ============================================================
# Loan Repayment Notice
# ============================================================

@router.post(
    "/generate-loan-repayment-notice"
)
def handle_loan_notice_generation(
    request: LoanRepaymentNoticeRequest
):
    """
    Generates DOCX and PDF versions of a
    loan repayment legal notice.
    """

    try:

        print(
            "\n[notice] Generating loan repayment notice"
        )

        # ----------------------------------------------------
        # Template context
        # ----------------------------------------------------

        context = request.model_dump()

        context["generation_date"] = (
            date.today().strftime(
                "%B %d, %Y"
            )
        )

        # ----------------------------------------------------
        # Filename
        # ----------------------------------------------------

        lender_safe = sanitize_filename(
            request.lender_name
        )

        borrower_safe = sanitize_filename(
            request.borrower_name
        )

        base_filename = (
            f"notice_{lender_safe}"
            f"_to_{borrower_safe}"
        )

        # ----------------------------------------------------
        # Generate files
        # ----------------------------------------------------

        result = generate_notice_files(
            template_name=(
                "loan_repayment_notice_template.docx"
            ),
            context=context,
            base_filename=base_filename
        )

        print(
            "[notice] Loan repayment notice generated."
        )

        return result


    except FileNotFoundError as e:

        print(
            "[notice] Template error:",
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Loan Repayment Notice "
                "template file not found."
            )
        )


    except Exception as e:

        print(
            "\n===== LOAN NOTICE ERROR ====="
        )

        print(
            type(e).__name__
        )

        print(
            str(e)
        )

        print(
            "=============================\n"
        )

        raise HTTPException(
            status_code=500,
            detail=(
                f"Error generating legal notice: "
                f"{str(e)}"
            )
        )