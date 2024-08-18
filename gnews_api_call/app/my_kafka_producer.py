import json
import logging
import os
import time
from kafka import KafkaProducer
import urllib.request

# 환경 변수 또는 설정 파일에서 Kafka 서버 및 API 키 로드
kafka_server = os.getenv('KAFKA_SERVER')
gnews_api_key = os.getenv('GNEWS_API_KEY')
kafka_topics = os.getenv('KAFKA_TOPICS', '').replace(' ', '').split(',')
last_call_file = 'last_call_timestamps.json'
retry_file = 'retry_calls.json'
min_interval = 3600  # 최소 호출 간격 (초)
retry_interval = 600  # 재시도 간격 (초)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Kafka Producer 설정
try:
    producer = KafkaProducer(bootstrap_servers=kafka_server,
                             api_version=(0, 11, 5),
                             value_serializer=lambda v: json.dumps(v).encode('utf-8'))
except Exception as e:
    logging.error("Kafka connection failed: %s", str(e))
    producer = None

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

def load_last_call_timestamps():
    try:
        with open(last_call_file, 'r') as file:
            return json.load(file)
    except (FileNotFoundError, json.JSONDecodeError):
        logging.info(f"No data found or decode error in {last_call_file}, initializing with empty dictionary.")
        return {}



def standardize_article_data(article):
    # 데이터 표준화
    standardized_article = {
        'title': article.get('title'),
        'description': article.get('description'),
        'url': article.get('url'),
        'image': article.get('image'),
        'published_at': article.get('publishedAt'),
        'source': 'GNews',  # 소스 정보 추가
        'content': article.get('content'),  # 원본 API 응답에서 제공되는 경우
    }
    return standardized_article

def fetch_and_send_articles(topic):
    if not producer:
        raise Exception("Kafka Producer is not available")
    url = f"https://gnews.io/api/v4/search?q={topic}&lang=en&country=us&max=10&token={gnews_api_key}"
    try:
        with urllib.request.urlopen(url) as response:
            data = json.loads(response.read().decode("utf-8"))
            articles = data.get("articles", [])
            for article in articles:
                standardized_article = standardize_article_data(article)
                producer.send(topic, standardized_article)
        logging.info(f"Data collection complete for {topic}")
    except Exception as e:
        logging.error("API call failed for %s: %s", topic, str(e))
        schedule_retry(topic)


def main():
    last_call_timestamps = load_last_call_timestamps()

    while True:
        retry_failed_calls()
        for topic in kafka_topics:
            current_time = time.time()
            if current_time - last_call_timestamps.get(topic, 0) < min_interval:
                # logging.info(f"Skipping {topic} due to interval limit.")
                continue

            try:
                fetch_and_send_articles(topic)
                last_call_timestamps[topic] = current_time
            except Exception as e:
                logging.error("Initial call failed for %s: %s")

if __name__ == "__main__":
    main()
