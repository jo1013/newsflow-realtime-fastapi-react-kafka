# connection.py
from pymongo import MongoClient
import os
from fastapi import Depends

class Database:
    def __init__(self):
        # 일반 데이터베이스 연결
        self.client = MongoClient(os.getenv('MONGODB_URI'))
        self.db = self.client[os.getenv('MONGODB_DATABASE')]
        self.news_collection = self.db[os.getenv('MONGODB_COLLECTION')]
        self.news_list_collection = self.db[os.getenv('MONGODB_COLLECTION_NEWS_LIST')]

        # 사용자 정보 데이터베이스 연결
        self.user_client = MongoClient(os.getenv('MONGODB_USER_URI'))
        self.user_db = self.user_client[os.getenv('MONGODB_USER_DATABASE')]
        self.user_collection = self.user_db[os.getenv('MONGODB_USER_INFO_COLLECTION')]

        self.subscriptions_collection = self.user_db[os.getenv('MONGODB_SUBSCRIPTIONS_COLLECTION')]
        self.subscriptions_list_collection = self.db[os.getenv('MONGODB_SUBSCRIPTION_LIST_COLLECTION')]



    
    # Helper function to safely get collection names
        def get_collection_name(env_var, default):
            name = os.getenv(env_var)
            if name is None:
                print(f"Warning: {env_var} is not set. Using default value: {default}")
                return default
            if not isinstance(name, str):
                print(f"Warning: {env_var} is not a string. Using default value: {default}")
                return default
            return name

        # Set up collections
        self.news_list_collection = self.db[get_collection_name('MONGODB_COLLECTION_NEWS_LIST', 'news_list')]
        self.subscriptions_collection = self.user_db[get_collection_name('MONGODB_SUBSCRIPTIONS_COLLECTION', 'subscriptions')]
        self.user_collection = self.user_db[get_collection_name('MONGODB_USER_COLLECTION', 'users')]
        # Add other collections as needed

    def get_news_collection(self):
        return self.news_collection

    def get_news_list_collection(self):
        return self.news_list_collection

    def get_user_collection(self):
        return self.user_collection

    def get_subscriptions_collection(self):
        return self.subscriptions_collection

    def get_subscriptions_list_collection(self):
        return self.subscriptions_list_collection
    

# 데이터베이스 인스턴스 생성
db = Database()
