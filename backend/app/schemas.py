from pydantic import BaseModel, EmailStr

# --- User Schemas ---

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    gender: str
    phone_number: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    gender: str | None = None
    phone_number: str | None = None
    profile_pic: str | None = None # <--- Added

    class Config:
        from_attributes = True 

# --- Password Reset Schemas ---

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class UpdatePasswordRequest(BaseModel):
    email: EmailStr
    current_password: str
    new_password: str

# --- Profile Update Schema ---
class UserUpdateProfile(BaseModel):
    email: EmailStr
    name: str | None = None
    gender: str | None = None
    phone_number: str | None = None
    profile_pic: str | None = None # <--- Added