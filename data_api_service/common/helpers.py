# data_api_service/common/helpers.py
from bson import ObjectId
from typing import Any

def to_str_id(value: Any) -> str:
    """Convert ObjectId to string if it's an ObjectId instance"""
    if isinstance(value, ObjectId):
        return str(value)
    return value
