# data_api_service/main.py
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

# 라우터 임포트
from users.routes import router as user_router
from news.routes import router as news_router
from subscriptions.routes import router as subscription_router

# 로거 설정
logger = logging.getLogger(__name__)
# 로깅 설정
logging.basicConfig(level=logging.DEBUG,
                    format='%(asctime)s - %(levelname)s - %(message)s')


app = FastAPI()

# 간단한 로그 미들웨어 추가
class LogMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        logger = logging.getLogger("uvicorn")
        logger.debug(f"Request path: {request.url.path}")
        response = await call_next(request)
        logger.debug(f"Response status: {response.status_code}")
        return response

app.add_middleware(LogMiddleware)

# CORS 미들웨어 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 실제 배포에서는 출처를 제한하세요.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 각 모듈의 라우터 추가
app.include_router(user_router, prefix="/users", tags=["Users"])
app.include_router(news_router, prefix="/news", tags=["News"])
app.include_router(subscription_router, prefix="/subscriptions", tags=["Subscriptions"])

# 헬스 체크 엔드포인트
@app.get("/healthcheck")
def healthcheck():
    return {"status": "OK"}