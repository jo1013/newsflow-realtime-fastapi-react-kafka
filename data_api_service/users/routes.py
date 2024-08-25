# data_api_service/users/routes.py
import os
from datetime import timedelta, datetime
from fastapi import APIRouter, status, HTTPException, Depends
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from .schemas import UserCreate, UserDisplay, UserLogin, LoginResponse, ClickEvent, UserSubscriptions
from .models import UserModel, SubscriptionModel, ClickEventModel
from .schemas import Token, User
from dependencies import create_access_token, decode_access_token
import logging
from bson import ObjectId
router = APIRouter()

ACCESS_TOKEN_EXPIRE_MINUTES = 30

user_model = UserModel()
subscription_model = SubscriptionModel()
click_model = ClickEventModel()

@router.post("/click", status_code=status.HTTP_201_CREATED)
def record_click(click_data: ClickEvent):
    result = click_model.record_click_event(click_data)
    return result

@router.post("/signup", response_model=UserDisplay, status_code=status.HTTP_201_CREATED)
def signup(user_data: UserCreate):
    try:
        user_dict = user_model.create_user(user_data)
        return UserDisplay(**user_dict)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    
@router.post("/login", response_model=LoginResponse)
async def login(user_credentials: UserLogin):
    logging.info(f"Login attempt for email: {user_credentials.email}")
    try:
        user_doc = user_model.authenticate_user(user_credentials.email, user_credentials.password)
        if user_doc:
            logging.info(f"User authenticated: {user_doc['_id']}")
            access_token = create_access_token(data={"sub": str(user_doc['_id'])})
            logging.info("Access token created successfully")
            return {"message": "Login successful", "token": access_token, "user_id": str(user_doc['_id'])}
        else:
            logging.warning(f"Authentication failed for email: {user_credentials.email}")
            raise HTTPException(status_code=401, detail="Invalid username or password")
    except Exception as e:
        logging.error(f"Error during login process: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")



@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = user_model.find_by_username(form_data.username)
    if not user or not user_model.verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"user_id": str(user["_id"])}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/register")
async def register_user(user: User):
    existing_user = user_model.find_by_username(user.username)
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already taken")
    user_id = user_model.create_user(user.username, user.password)
    return {"message": "User registered successfully", "user_id": user_id}

@router.get("/me", response_model=User)
async def read_users_me(token: str = Depends(decode_access_token)):
    user = user_model.find_by_id(token)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return User(**user)


@router.get("/user_subscriptions", response_model=UserSubscriptions)
async def get_user_subscriptions(token: str = Depends(decode_access_token)):
    user_id = token
    subscriptions = subscription_model.get_user_subscriptions(user_id)
    return {"subscriptions": [{"news_source_id": sub["news_source_id"]} for sub in subscriptions]}


@router.patch("/subscriptions/{news_source_id}")
async def toggle_subscription(
    news_source_id: str,
    action: str,
    token: str = Depends(decode_access_token)
):
    user_id = token  # token이 user_id를 포함한다고 가정
    result = subscription_model.update_user_subscription(user_id, news_source_id, action == 'subscribed')
    return {"message": f"Subscription {action} successful", "result": result}