# data_api_service/subscriptions/routes.py
import logging
from typing import List
from fastapi import APIRouter, Query, HTTPException, Depends
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

logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s', 
                    handlers=[
                        logging.FileHandler("app.log"),  # 로그 파일에 저장
                        logging.StreamHandler()  # 콘솔에 출력
                    ])

# 뉴스 ID가 알파벳과 숫자로만 이루어져 있는지 검사하는 함수
def is_valid_news_id(news_id: str) -> bool:
    return news_id.isalnum()

# 구독한 뉴스 목록을 조회하는 엔드포인트
@router.get("/", response_model=List[Subscription])
async def fetch_subscribed_news(token: str = Depends(oauth2_scheme)):
    user_id = decode_access_token(token)
    subscription_model = SubscriptionModel()
    subscriptions = subscription_model.find_subscriptions(user_id, 'updated_at')
    return subscriptions



# 구독한 뉴스들을 조회하는 엔드포인트
@router.get("/news", response_model=List[dict])  # 수정: response_model을 dict로 변경
async def fetch_subscribed_news(
    page: int = 1, 
    page_size: int = 10,
    token: str = Depends(oauth2_scheme)
):
    try:
        skip = (page - 1) * page_size
        # news_items, total_items = news_model.get_news(skip, page_size)
        user_id = decode_access_token(token)
        logging.info(f'user_id^^^^^^^^: {str(user_id)}')
        subscription_model = SubscriptionModel()
        subscriptions, total_items = subscription_model.get_subscribed_news(user_id, skip, page_size)
        logging.info(f'subscriptions~~~~~~~: {str(subscriptions)}')
        logging.info(f'total_items&^&&&&: {str(total_items)}')
        # news_list = [sub for sub in subscriptions]
        # return news_list
        return subscriptions
    except Exception as e:
        logging.error(f'Error fetching subscribed news: {str(e)}')
        raise HTTPException(status_code=401, detail="Invalid token")



# # 뉴스 구독 상태를 토글하는 엔드포인트
# @router.patch("/{news_id}", response_model=Subscription)
# async def toggle_subscription(
#     news_id: str,
#     action: str = Query(..., regex="^(subscribe|unsubscribe)$"),
#     token: str = Depends(oauth2_scheme)
# ):
#     user_id = decode_access_token(token)
#     subscription_model = SubscriptionModel()

#     existing_subscription = subscription_model.find_one({"news_id": news_id, "user_id": user_id})
#     #  action이 'subscribe' 경우 true action이 'unsubscribe' 겨우 false
#     new_is_subscribe = action == "subscribe"

#     # 해당 유저아이디와 뉴스아이디가 디비에 정보가 있는경우
#     if existing_subscription :
#         # 구독중일때 구독을 누른경우
#         if existing_subscription["is_subscribe"] == new_is_subscribe:
#             detail_msg = f"Already {'subscribed' if new_is_subscribe else 'unsubscribed'} to news ID {news_id}."
#             raise HTTPException(status_code=400, detail=detail_msg)
#         # 구독중일때 구독을 누른 경우 외의 모든 경우( 구독중일때 구독해제를 한경우, 비구독중일떄 비구독을 누른경우, 비구독을때 구독을 한경우)
#         else:
#             successful_update = subscription_model.toggle_subscription(existing_subscription["_id"], new_is_subscribe)
#             if successful_update:
#                 updated_subscription = subscription_model.find_one({"_id": existing_subscription["_id"]})
#                 if updated_subscription:
#                     return Subscription(**updated_subscription)
#                 else:
#                     raise HTTPException(status_code=500, detail="Failed to find updated subscription")
#             else:
#                 raise HTTPException(status_code=500, detail="Failed to update subscription")

#     # 해당 유저아이디와 뉴스아이디가 디비에 정보가 없는경우
#     else:
#         if action == "subscribe":
#             if is_valid_news_id(news_id):
#                 new_subscription = SubscriptionCreate(user_id=user_id, news_id=news_id, is_subscribe=True)
#                 try:
#                     created_subscription_id = subscription_model.create_subscription(new_subscription)
#                     logger.debug(f"Created subscription ID: {created_subscription_id}")
#                     created_subscription = subscription_model.find_one({"_id": created_subscription_id})
#                     if created_subscription:
#                         return Subscription(**created_subscription)
#                     else:
#                         raise HTTPException(status_code=500, detail="Failed to find created subscription")
#                 except Exception as e:
#                     logger.error(f"Error creating subscription: {str(e)}")  # 로깅 추가
#                     raise HTTPException(status_code=500, detail=str(e))  # 클라이언트에게 보다 명확한 에러 메시지 제공

#             else:
#                 raise HTTPException(status_code=404, detail="News ID not found")
#         else:
#             detail_msg = f"This is News Id that has not already been subscribed. {news_id}."
#             raise HTTPException(status_code=404, detail=detail_msg)



@router.patch("/{news_id}", response_model=Subscription)
async def toggle_subscription(
    news_id: str,
    action: str = Query(..., regex="^(subscribe|unsubscribe)$"),
    token: str = Depends(oauth2_scheme)
):
    user_id = decode_access_token(token)
    subscription_model = SubscriptionModel()

    # 사용자 ID와 뉴스 ID로 기존 구독 정보 확인
    existing_subscription = subscription_model.find_one({"news_id": news_id, "user_id": user_id})

    # 새로운 구독 상태 설정
    new_is_subscribe = action == "subscribe"

    if existing_subscription:
        # 기존에 구독 중인 경우
        if existing_subscription["is_subscribe"] == new_is_subscribe:
            detail_msg = f"Already {'subscribed' if new_is_subscribe else 'unsubscribed'} to news ID {news_id}."
            raise HTTPException(status_code=400, detail=detail_msg)
        else:
            # 구독 상태 변경
            successful_update = subscription_model.toggle_subscription(existing_subscription["_id"], new_is_subscribe)
            if successful_update:
                updated_subscription = subscription_model.find_one({"_id": existing_subscription["_id"]})
                if updated_subscription:
                    return Subscription(**updated_subscription)
                else:
                    raise HTTPException(status_code=500, detail="Failed to find updated subscription")
            else:
                raise HTTPException(status_code=500, detail="Failed to update subscription")
    else:
        # 기존에 구독 중이지 않은 경우
        if action == "subscribe":
            new_subscription = SubscriptionCreate(user_id=user_id, news_id=news_id, is_subscribe=True)
            try:
                created_subscription_id = subscription_model.create_subscription(new_subscription)
                logger.debug(f"Created subscription ID: {created_subscription_id}")
                created_subscription = subscription_model.find_one({"_id": created_subscription_id})
                if created_subscription:
                    return Subscription(**created_subscription)
                else:
                    raise HTTPException(status_code=500, detail="Failed to find created subscription")
            except Exception as e:
                logger.error(f"Error creating subscription: {str(e)}")
                raise HTTPException(status_code=500, detail=str(e))
        else:
            detail_msg = f"This is News Id that has not already been subscribed. {news_id}."
            raise HTTPException(status_code=404, detail=detail_msg)