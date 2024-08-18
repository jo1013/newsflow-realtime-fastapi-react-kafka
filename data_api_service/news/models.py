from pymongo import DESCENDING
from bson import ObjectId
from database import db
import logging


class NewsModel:
    def __init__(self):
        self.news_collection = db.get_news_collection()
        self.news_list_collection = db.get_news_list_collection()

    def get_news(self, skip: int, limit: int):
        news_cursor = self.news_collection.find().sort([("published_at", DESCENDING)]).skip(skip).limit(limit)
        total_items = self.news_collection.count_documents({})
        return list(news_cursor), total_items

    def get_news_list(self):
        news_cursor = self.news_list_collection.find().sort([("published_at", DESCENDING)])
        total_items = self.news_list_collection.count_documents({})
        return list(news_cursor), total_items
        

    def find_by_id(self, news_id):
        return self.news_collection.find_one({"_id": ObjectId(news_id)})

    def insert_one(self, news_data):
        return self.news_collection.insert_one(news_data).inserted_id

    def update_one(self, news_id, news_data):
        return self.news_collection.update_one({"_id": ObjectId(news_id)}, {"$set": news_data})

    def delete_one(self, news_id):
        return self.news_collection.delete_one({"_id": ObjectId(news_id)})
    
    def get_news_sources(self):
        try:
            # news_collection에서 고유한 source 값들을 가져옵니다.
            sources = list(self.news_collection.distinct("source"))
            
            # 결과를 원하는 형식으로 변환합니다.
            result = [{"source": source} for source in sources]
            
            # 결과 로깅
            logging.info(f"Retrieved {len(result)} unique news sources")
            
            return result
        except Exception as e:
            logging.error(f"Error retrieving news sources: {str(e)}")
            raise
