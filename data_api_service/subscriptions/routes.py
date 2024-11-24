# data_api_service/subscriptions/routes.py
import logging
from typing import List
from fastapi import APIRouter, Query, HTTPException, Depends, Request
from fastapi.security import OAuth2PasswordBearer
from .models import SubscriptionModel
from .schemas import Subscription, SubscriptionCreate
from dependencies import decode_access_token
from .sources import router as sources_router

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger("uvicorn")

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/users/token")
router.include_router(sources_router)

@router.patch("/{news_id}", response_model=Subscription)
async def toggle_subscription(
    request: Request,
    news_id: str,
    action: str = Query(..., regex="^(subscribed|unsubscribed)$"),
    token: str = Depends(oauth2_scheme)
):
    logger.info(f"Received request to toggle subscription. News ID: {news_id}, Action: {action}")
    logger.debug(f"Request headers: {request.headers}")
    
    try:
        logger.info(f'{token}')
        user_id = decode_access_token(token)
        logger.info(f"Token decoded successfully. User ID: {user_id}")
    except Exception as e:
        logger.error(f"Token decoding failed: {str(e)}")
        raise HTTPException(status_code=401, detail=f"Invalid or expired token: {str(e)}")

    subscription_model = SubscriptionModel()

    try:
        # 사용자 ID와 뉴스 ID로 기존 구독 정보 확인
        existing_subscription = subscription_model.find_one({"news_id": news_id, "user_id": user_id})
        logger.info(f"Existing subscription: {existing_subscription}")

        # 새로운 구독 상태 설정
        new_is_subscribe = action == "subscribed"

        if existing_subscription:
            # 기존에 구독 중인 경우
            if existing_subscription["is_subscribe"] == new_is_subscribe:
                detail_msg = f"Already {'subscribed' if new_is_subscribe else 'unsubscribed'} to news ID {news_id}."
                logger.info(detail_msg)
                raise HTTPException(status_code=400, detail=detail_msg)
            else:
                # 구독 상태 변경
                successful_update = subscription_model.toggle_subscription(existing_subscription["_id"], new_is_subscribe)
                if successful_update:
                    updated_subscription = subscription_model.find_one({"_id": existing_subscription["_id"]})
                    if updated_subscription:
                        logger.info(f"Subscription updated successfully: {updated_subscription}")
                        return Subscription(**updated_subscription)
                    else:
                        logger.error("Failed to find updated subscription")
                        raise HTTPException(status_code=500, detail="Failed to find updated subscription")
                else:
                    logger.error("Failed to update subscription")
                    raise HTTPException(status_code=500, detail="Failed to update subscription")
        else:
            # 기존에 구독 중이지 않은 경우
            if action == "subscribed":
                new_subscription = SubscriptionCreate(user_id=user_id, news_id=news_id, is_subscribe=True)
                try:
                    created_subscription_id = subscription_model.create_subscription(new_subscription)
                    logger.info(f"Created subscription ID: {created_subscription_id}")
                    created_subscription = subscription_model.find_one({"_id": created_subscription_id})
                    if created_subscription:
                        logger.info(f"New subscription created: {created_subscription}")
                        return Subscription(**created_subscription)
                    else:
                        logger.error("Failed to find created subscription")
                        raise HTTPException(status_code=500, detail="Failed to find created subscription")
                except Exception as e:
                    logger.error(f"Error creating subscription: {str(e)}")
                    raise HTTPException(status_code=500, detail=str(e))
            else:
                detail_msg = f"This is News Id that has not already been subscribed. {news_id}."
                logger.info(detail_msg)
                raise HTTPException(status_code=404, detail=detail_msg)
    except Exception as e:
        logger.error(f"Unexpected error in toggle_subscription: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")