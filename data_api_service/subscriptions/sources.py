from fastapi import APIRouter, Depends, HTTPException

from users.models import get_current_user

router = APIRouter()

@router.get("/news_sources")
async def get_news_sources(db=Depends(), current_user=Depends(get_current_user)):
    logger.info(f"Attempting to fetch news sources for user: {current_user}")
    try:
        news_sources = await db.news_source_list.find().to_list(length=None)
        logger.info(f"Found {len(news_sources)} news sources")
        return [
            {
                "_id": str(source["_id"]),
                "source": source["source"],
                "description": source.get("description", "No description available")
            } 
            for source in news_sources
        ]
    except Exception as e:
        logger.error(f"Error fetching news sources: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))