import requests
import json
import logging
import os
import time
from kafka import KafkaProducer

# 환경 변수 설정
kafka_server = os.environ.get('KAFKA_SERVER')
newsapi_key = os.environ.get('NEWS_API_KEY')
kafka_topics = os.environ.get('KAFKA_TOPICS', '').replace(' ', '').split(',')
last_call_file = 'last_call_timestamps.json'
retry_file = 'retry_calls.json'
min_interval = 3600
retry_interval = 600

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

producer = KafkaProducer(bootstrap_servers=kafka_server,
                         api_version=(0, 11, 5),
                         value_serializer=lambda v: json.dumps(v).encode('utf-8'))

def load_json_file(file_path):
    try:
        with open(file_path, 'r') as file:
            return json.load(file)
    except (FileNotFoundError, json.JSONDecodeError):
        logging.info(f"No data found or decode error in {file_path}, initializing with empty dictionary.")
        return {}

def save_json_file(data, file_path):
    with open(file_path, 'w') as file:
        json.dump(data, file)

def schedule_retry(topic):
    retries = load_json_file(retry_file)
    retries[topic] = time.time() + retry_interval
    save_json_file(retries, retry_file)

def retry_failed_calls():
    retries = load_json_file(retry_file)
    current_time = time.time()
    for topic, next_retry_time in list(retries.items()):
        if current_time >= next_retry_time:
            try:
                fetch_and_send_articles(topic)
                del retries[topic]
                save_json_file(retries, retry_file)
            except Exception as e:
                logging.error("Retry failed for %s: %s", topic, str(e))
                schedule_retry(topic)

def fetch_and_send_articles(topic):
    try:
        url = "https://newsapi.org/v2/everything"
        params = {
            'apiKey': newsapi_key,
            'q': topic,
            'language': 'en'
        }
        response = requests.get(url, params=params)
        if response.status_code == 200:
            news_data = response.json()['articles']
            for article in news_data:
                article['source'] = 'NewsAPI'  # 데이터 표준화 및 소스 정보 추가
                producer.send(topic, article)
            last_call_timestamps[topic] = time.time()
            save_json_file(last_call_timestamps, last_call_file)
            logging.info(f"Data collection complete for {topic}")
        else:
            logging.error(f"Failed to fetch data for {topic}, scheduling retry.")
            schedule_retry(topic)
    except Exception as e:
        logging.error("Error occurred: %s", str(e))
        schedule_retry(topic)

last_call_timestamps = load_json_file(last_call_file)

while True:
    retry_failed_calls()
    for topic in kafka_topics:
        current_time = time.time()
        if current_time - last_call_timestamps.get(topic, 0) < min_interval:
            continue

        fetch_and_send_articles(topic)

    time.sleep(min_interval)