# data_api_service/users/model.py
import secrets
import string
import bcrypt
from passlib.context import CryptContext
from datetime import datetime
import jwt
from fastapi import Depends, HTTPException, status
from .schemas import UserCreate, ClickEvent
from fastapi.security import OAuth2PasswordBearer
from database import db
from bson import ObjectId

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/users/token")

class UserModel:
    def __init__(self):
        self.collection = db.get_user_collection()

    def find_by_username(self, username: str):
        return self.collection.find_one({"username": username})

    def create_user(self, user_data: UserCreate):
        if self.collection.find_one({"email": user_data.email}):
            raise HTTPException(status_code=400, detail="Email already registered")

        hashed_password = bcrypt.hashpw(user_data.password.encode('utf-8'), bcrypt.gensalt())
        user_dict = user_data.dict(exclude={"password"})
        user_dict['password'] = hashed_password
        user_dict['created_at'] = user_dict['updated_at'] = datetime.utcnow()
        result = self.collection.insert_one(user_dict)
        user_dict['user_id'] = str(result.inserted_id)
        return user_dict

    def authenticate_user(self, email: str, password: str):
        user = self.collection.find_one({"email": email})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        if not bcrypt.checkpw(password.encode('utf-8'), user['password']):
            raise HTTPException(status_code=401, detail="Incorrect password")
        return user

    def reset_password(self, email: str):
        user = self.collection.find_one({"email": email})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        new_password = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(10))
        hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())
        self.collection.update_one({"_id": user['_id']}, {"$set": {"password": hashed_password}})
        return new_password

    async def get_current_user(self, token: str = Depends(oauth2_scheme)):
        credentials_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id: str = payload.get("sub")
            if user_id is None:
                raise credentials_exception
        except jwt.PyJWTError:
            raise credentials_exception

        user = await self.collection.find_one({"_id": ObjectId(user_id)})
        if user is None:
            raise credentials_exception
        return user

class SubscriptionModel:
    def __init__(self):
        self.collection = db.get_user_subscription()

    def get_user_subscriptions(self, user_id: ObjectId):
        subscriptions = self.collection.find({
            "user_id": user_id,
            "is_subscribe": True
        }, {"news_source_id": 1, "_id": 0})

        return list(subscriptions)

    def update_user_subscription(self, user_id: str, news_source_id: str, is_subscribe: bool):
        result = self.collection.update_one(
            {"user_id": ObjectId(user_id), "news_source_id": news_source_id},
            {"$set": {"is_subscribe": is_subscribe}},
            upsert=True
        )

        return {
            "matched_count": result.matched_count,
            "modified_count": result.modified_count,
            "upserted_id": str(result.upserted_id) if result.upserted_id else None
        }

class ClickEventModel:
    def __init__(self):
        self.collection = db.get_click_event_collection()

    def record_click_event(self, click_data: ClickEvent):
        click_dict = click_data.dict()
        result = self.collection.insert_one(click_dict)
        return {"status": "success", "inserted_id": str(result.inserted_id)}