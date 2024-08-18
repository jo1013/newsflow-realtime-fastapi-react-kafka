FROM python:3.9

# # Java 설치 확인 (이미 Java가 설치되어 있다면 이 부분은 생략 가능)
# RUN apt-get update && \
#     apt-get install -y openjdk-11-jre-headless && \
#     apt-get clean;

# 필요한 추가 패키지 설치
# RUN apt-get update && \
#     apt-get install -y wget && \
#     apt-get clean;

# PySpark 및 기타 필요한 Python 패키지 설치
COPY requirements.txt /app/
WORKDIR /app
RUN pip3 install -r requirements.txt

# Spark 환경 변수 설정 (이미지에 따라 SPARK_HOME이 이미 설정되어 있을 수 있으므로 확인 필요)


# PySpark 스크립트 복사
COPY kafka_consumer.py /app/

CMD ["python3", "kafka_consumer.py"]
