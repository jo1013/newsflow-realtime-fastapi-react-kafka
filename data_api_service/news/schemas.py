## data_api_service/news/schemas.py
from typing import List
from fastapi import APIRouter
from bson import ObjectId
from pydantic import BaseModel, Field, HttpUrl
from typing import List, Dict, Any, Optional
from datetime import datetime


router = APIRouter()

# Pydantic 모델에서 ObjectId를 처리하기 위한 클래스
class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, value, values, **kwargs):
        if not ObjectId.is_valid(value):
            raise ValueError(f"Not a valid ObjectId: {value}")
        return ObjectId(value)

class NewsData(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    author: Optional[str] = None
    title: Optional[str] = None  # Make title optional
    description: Optional[str] = None
    url: Optional[HttpUrl] = None  # Make URL optional
    source: str
    image: Optional[HttpUrl] = None
    category: Optional[str] = None  # 선택적으로 변경
    language: Optional[str] = None  # 선택적으로 변경
    country: Optional[str] = None  # 선택적으로 변경
    published_at: Optional[datetime] = None  # 선택적으로 변경

 
    class Config:
        from_attributes = True
        json_encoders = {ObjectId: str}

# 새로운 응답 모델 정의
class NewsResponse(BaseModel):
    newsList: List[NewsData]
    totalItems: int

class NewsCreate(NewsData):
    pass

class NewsUpdate(NewsData):
    pass


