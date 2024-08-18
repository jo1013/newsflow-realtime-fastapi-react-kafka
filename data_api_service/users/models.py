# data_api_service/users/model.py
import secrets
import string
import bcrypt
from passlib.context import CryptContext
from datetime import datetime
from fastapi import HTTPException, Depends, APIRouter, Query
from .schemas import UserCreate, ClickEvent
from fastapi.security import OAuth2PasswordBearer
from database import db


user_collection = db.get_user_collection()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/users/token")
def create_user(user_data: UserCreate):
    if user_collection.find_one({"email": user_data.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
        
    hashed_password = bcrypt.hashpw(user_data.password.encode('utf-8'), bcrypt.gensalt())
    user_dict = user_data.dict(exclude={"password"})
    user_dict['password'] = hashed_password
    user_dict['created_at'] = user_dict['updated_at'] = datetime.utcnow()
    result = user_collection.insert_one(user_dict)
    user_dict['user_id'] = str(result.inserted_id)
    return user_dict


def authenticate_user(email: str, password: str):
    user = user_collection.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not bcrypt.checkpw(password.encode('utf-8'), user['password']):
        raise HTTPException(status_code=401, detail="Incorrect password")
    return user

def reset_password(email: str):
    user = user_collection.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    new_password = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(10))
    hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())
    user_collection.update_one({"_id": user['_id']}, {"$set": {"password": hashed_password}})
    return new_password

def record_click_event(click_data: ClickEvent):
    click_dict = click_data.dict()
    result = click_collection.insert_one(click_dict)
    return {"status": "success", "inserted_id": str(result.inserted_id)}

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.get_user_collection().find_one({"username": username})
    if user is None:
        raise credentials_exception
    return user

class UserModel:
    def __init__(self):
        self.collection = db.get_user_collection()

    def find_by_username(self, username: str):
        return self.collection.find_one({"username": username})

    def create_user(self, username: str, password: str):
        hashed_password = pwd_context.hash(password)
        user_id = self.collection.insert_one({
            "username": username,
            "hashed_password": hashed_password
        }).inserted_id
        return str(user_id)

    def verify_password(self, plain_password: str, hashed_password: str):
        return pwd_context.verify(plain_password, hashed_password)