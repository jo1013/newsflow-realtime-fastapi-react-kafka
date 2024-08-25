# data_api_service/users/schemas.py
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import List, Optional
from bson import ObjectId
from common import to_str_id

class UserBase(BaseModel):
    email: EmailStr
    password: str

class UserCreate(UserBase):
    password: str
    subscriptions: List[str] = []

class LoginResponse(BaseModel):
    message : str
    user_id : Optional[str] = None
    token: str

class Token(BaseModel):
    access_token: str
    token_type: str
       
class UserDisplay(UserBase):
    user_id: str
    created_at: datetime
    updated_at: datetime
    subscriptions: List[str]

class UserLogin(UserBase):
    password: str

class UserPasswordReset(BaseModel):
    email: EmailStr

class User(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(ObjectId()), alias='_id')
    email: str
    password: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        json_encoders = {ObjectId: to_str_id}
        from_attributes = True  # 'from_attributes'를 'from_attributes'로 변경


class ClickEvent(BaseModel):
    user_id: str
    news_id: str
    activity_type: str = "click"
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class Subscription(BaseModel):
    news_source_id: str

class UserSubscriptions(BaseModel):
    subscriptions: List[Subscription]

class SubscriptionCheck(BaseModel):
    is_subscribe: bool
