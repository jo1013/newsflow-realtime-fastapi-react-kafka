# ## data_api_service/news/routes.py
from fastapi import APIRouter, HTTPException
from .models import NewsModel
from .schemas import NewsResponse, NewsData
from fastapi.encoders import jsonable_encoder
from typing import List
from bson import ObjectId
import logging
from subscriptions.sources import router as sources_router


router = APIRouter()


news_model = NewsModel()


@router.get("/", response_model=NewsResponse)
async def get_news(page: int = 1, page_size: int = 10):
    skip = (page - 1) * page_size
    news_items, total_items = news_model.get_news(skip, page_size)
    news_list = [NewsData(**jsonable_encoder(news, custom_encoder={ObjectId: str})) for news in news_items]
    return NewsResponse(newsList=news_list, totalItems=total_items)

@router.get("/list", response_model=NewsResponse)
async def get_news_list() :
    news_items, total_items = news_model.get_news_list()
    news_list = [NewsData(**news) for news in news_items]
    return {"newsList": news_list, "totalItems": total_items}


@router.get("/details/{news_id}", response_model=NewsData)
async def get_news_by_id(news_id: str):
    news_item = news_model.find_by_id(news_id)
    if not news_item:
        raise HTTPException(status_code=404, detail="News not found")
    return NewsData(**jsonable_encoder(news_item, custom_encoder={ObjectId: str}))



@router.get("/news_sources", response_model=List[dict])
async def get_news_sources():
    try:
        sources = news_model.get_news_sources()
        return sources
    except Exception as e:
        logging.error(f'Error fetching news sources: {str(e)}')
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")