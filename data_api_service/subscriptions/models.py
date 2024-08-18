# data_api_service/subscriptions/models.py
import logging
from datetime import datetime
from pymongo import DESCENDING
from bson import ObjectId
from database import db
from common import to_str_id 
from .schemas import SubscriptionCreate

class SubscriptionModel:

    def __init__(self):
        self.collection = db.get_subscriptions_collection()
        self.news_collection = db.get_news_collection()
        self.news_source_collection = db.get_subscriptions_list_collection()

    def object_id_to_str(self, item):
        if isinstance(item, list):
            for i in item:
                i['_id'] = str(i['_id'])
                if 'user_id' in i:
                    i['user_id'] = str(i['user_id'])
        else:
            item['_id'] = str(item['_id'])
            if 'user_id' in item:
                item['user_id'] = str(item['user_id'])
        return item

    def get_subscribed_news(self, user_id, skip: int, limit: int):
        try:
            logging.info(f'Start fetching subscribed news for user: {user_id}')
            # Fetch subscribed news_ids for the user
            subscribed_ids_cursor = list(self.collection.find({"user_id": ObjectId(user_id), "is_subscribe": True}))
            subscribed_ids = self.object_id_to_str(subscribed_ids_cursor)
            logging.info(f'Subscribed IDs for user {user_id}: {subscribed_ids}')

            if not subscribed_ids:
                logging.info(f'No subscriptions found for user {user_id}')
                return [], 0

            news_ids = [sub['news_id'] for sub in subscribed_ids]
            logging.info(f'News IDs for user {user_id}: {news_ids}')

            # Fetch sources for the subscribed news_ids
            news_sources_cursor = self.news_source_collection.find({"_id": {"$in": [ObjectId(news_id) for news_id in news_ids]}})
            news_sources = list(news_sources_cursor)
            news_sources = self.object_id_to_str(news_sources)
            sources = [news_source['source'] for news_source in news_sources]
            logging.info(f'Sources for user {user_id}: {sources}')

            # Fetch news articles matching the subscribed sources
            news_cursor = self.news_collection.find({"source": {"$in": sources}}).sort("published_at", DESCENDING).skip(skip).limit(limit)
            news_list = list(news_cursor)
            news_list = self.object_id_to_str(news_list)
            logging.info(f'Fetched news articles for user {user_id}: {news_list}')

            total_items = self.news_collection.count_documents({"source": {"$in": sources}})
            logging.info(f'Total news articles count for user {user_id}: {total_items}')

            return news_list, total_items
        except Exception as e:
            logging.error(f'Error fetching subscribed news for user {user_id}: {str(e)}')
            return [], 0

    def find_subscriptions(self, user_id, sort):
        # 정렬 순서를 결정합니다.
        sort_order = -1 if sort.startswith('-') else 1
        sort_field = sort.lstrip('-+')  # '-' 또는 '+' 기호를 제거하여 순수 필드 이름을 추출합니다.

        query = {
            "user_id": ObjectId(user_id),
            "is_subscribe": True  # 구독 상태가 활성화된 뉴스만 조회
        }
        subscriptions = list(
            self.collection.find(query).sort(sort_field, sort_order)
        )
        subscriptions = self.object_id_to_str(subscriptions)
        return [
            {
                **sub,
                '_id': to_str_id(sub['_id']),
                'user_id': to_str_id(sub['user_id']),
                'news_id': sub['news_id'],
                'created_at': sub['created_at'].isoformat(),
                'updated_at': sub['updated_at'].isoformat()
            } for sub in subscriptions
        ]

    def toggle_subscription(self, subscription_id, is_subscribe):
        update_result = self.collection.update_one(
            {"_id": ObjectId(subscription_id)},
            {"$set": {"is_subscribe": is_subscribe, "updated_at": datetime.utcnow()}}
        )
        return update_result.modified_count > 0

    def find_one(self, query):
        if '_id' in query:
            query['_id'] = ObjectId(query['_id'])
        if 'user_id' in query:
            query['user_id'] = ObjectId(query['user_id'])        
        sub = self.collection.find_one(query)
        if sub:
            sub = self.object_id_to_str(sub)
            return {
                **sub,
                '_id': to_str_id(sub['_id']),
                'user_id': to_str_id(sub['user_id']),
                'news_id': sub['news_id'],
                'created_at': sub['created_at'].isoformat(),
                'updated_at': sub['updated_at'].isoformat()
            }
        return None

    def create_subscription(self, subscription_data: SubscriptionCreate):
        new_subscription = subscription_data.dict()
        new_subscription["created_at"] = new_subscription["updated_at"] = datetime.utcnow()
        new_subscription["user_id"] = ObjectId(new_subscription["user_id"])
        new_subscription_id = self.collection.insert_one(new_subscription).inserted_id
        return to_str_id(new_subscription_id)
    
    # def get_news_sources(self):
    #     try:
    #         # news 컬렉션에서 source 필드의 고유한 값들을 가져옵니다.
    #         sources = self.news_collection.distinct("source")
            
    #         # 결과를 원하는 형식으로 변환합니다.
    #         result = [{"source": source} for source in sources]
            
    #         # 결과 로깅
    #         logging.info(f"Retrieved {len(result)} unique news sources")
            
    #         return result
    #     except Exception as e:
    #         logging.error(f"Error retrieving news sources: {str(e)}")
    #         raise