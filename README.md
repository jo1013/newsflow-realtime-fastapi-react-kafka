# 실시간 뉴스 피드 시스템

## 개요

이 프로젝트는 사용자에게 실시간으로 뉴스 기사를 수집, 처리, 제공하는 시스템을 구축하는 것을 목표로 합니다. 데이터 스트리밍을 위한 Kafka, 컨테이너화를 위한 Docker, 데이터 저장을 위한 MongoDB를 활용합니다.

## 시스템 구성 요소

- **API 호출 컨테이너**: 외부 API에서 데이터를 가져와 Kafka로 전송합니다.
- **주키퍼 서비스**: Kafka의 상태를 관리합니다.
- **카프카 서비스**: 메시지 스트리밍을 처리합니다.
- **컨슈머 서비스**: Kafka에서 데이터를 소비하여 MongoDB에 저장합니다.
- **데이터 API 서비스**: 처리된 데이터를 FAST-API를 통해 프론트엔드에 제공합니다.
- **프론트엔드 서비스**: React로 구축된 사용자 인터페이스를 통해 뉴스 데이터를 사용자에게 표시합니다.
- **몽고디비 서비스**: Kafka에서 소비된 데이터를 저장합니다.

## 특징

- **실시간 데이터 수집**: MediaStack API를 사용하여 뉴스 기사를 수집합니다.
- **데이터 처리**: 데이터 정제 및 분류를 포함한 처리 작업을 Python 또는 Spark를 사용하여 수행합니다.
- **확장 가능한 아키텍처**: Kafka 클러스터를 사용하여 시스템의 확장성을 보장합니다.
- **보안**: Kafka 및 데이터베이스의 보안 설정을 구현합니다.
- **모니터링**: 시스템 모니터링을 위해 Kibana 또는 Grafana를 사용합니다.
- **구독 및 트렌딩 기능**: 사용자가 주제를 구독하거나 사용자 참여에 따라 트렌딩 뉴스를 볼 수 있습니다.
- **검색 기능**: 사용자가 뉴스 기사를 검색할 수 있습니다.

## 설정 지침

### 사전 요구 사항

- Docker 및 Docker Compose 설치.
- [MediaStack](https://mediastack.com/) 계정 및 API 키.

### 환경 설정

1. **환경 변수 설정**: 프로젝트 루트에 다음 내용을 포함한 `.env` 파일을 생성합니다:

    ```env
    # Kafka
    KAFKA_SERVER=kafka_service:29092

    # MediaStack
    MEDIASTACK_API_KEY=<your_mediastack_api_key>

    # MongoDB
    MONGODB_ROOT_USERNAME=admin
    MONGODB_ROOT_PASSWORD=<your_mongodb_root_password>
    MONGODB_DATABASE=news
    MONGODB_URI=mongodb://admin:<your_mongodb_root_password>@mongodb_service:27017/news
    ```

2. **`.gitignore` 설정**: 민감한 파일을 제외하도록 설정합니다:

    ```
    .env
    mongodb_service/mongodb_data/
    *.log
    ```

### 시스템 실행

터미널에서 다음 명령어를 실행하여 모든 서비스를 시작합니다:

```bash
docker-compose up
```

## MongoDB 설정

### 초기 설정

MongoDB 컨테이너를 초기화 한 후 데이터베이스와 사용자를 설정합니다:

```bash
docker exec -it mongodb_service bash
mongosh
```

MongoDB 쉘에서:

```javascript
use admin
db.createUser({
    user: "news_admin",
    pwd: "myUserPassword",
    roles: [{ role: "readWrite", db: "news" }]
})
db.createCollection("newsArticles")
```

### MongoDB 계정 이해

- **다

중 데이터베이스 관리**: 단일 MongoDB 서버에서 각 데이터베이스는 자체 사용자 세트를 가질 수 있습니다. 이 프로젝트에서는 `user_data` 및 `news_data` 두 개의 데이터베이스를 관리합니다. 보안을 강화하고 권한을 효율적으로 관리하기 위해 각 데이터베이스에 대해 별도의 사용자 계정을 생성하는 것이 중요합니다.

```bash
use user_data
db.createUser({
    user: "user_admin",
    pwd: "userPassword",
    roles: [{ role: "readWrite", db: "user_data" }]
})

use news_data
db.createUser({
    user: "news_admin",
    pwd: "newsPassword",
    roles: [{ role: "readWrite", db: "news_data" }]
})
```

### 무중단 배포시 수정 도커만 빌드 

docker-compose build frontend_service


#### 무중단 배포시 수정 도커만 up

docker-compose up -d --no-deps --build frontend_service


(이 방법은 Docker Compose V2 이상에서 잘 작동합니다.)
* -d: 백그라운드에서 실행
* --no-deps: 의존성 서비스를 시작하지 않음
*  --build: 컨테이너를 시작하기 전에 이미지를 빌드
*  frontend_service: 업데이트할 특정 서비스 이름


## ARM64 호환성 참고

M1 Mac 사용자는 ARM64 호환 Docker 이미지를 사용해야 합니다. Kafka 설정을 위해서는 [ARM64 호환 Confluent Platform](https://github.com/arm64-compat/confluent-platform)을 참조하세요.

## 프로젝트 성과

참여자들은 실시간 데이터 처리, 시스템 아키텍처 설계, 프론트엔드 개발, 배포 전략을 포함하여 실시간 뉴스 피드 시스템을 구축하고 관리하는 데 필요한 포괄적인 이해를 얻게 됩니다.

---

---------
---------

# Real-time News Feed System

## Overview

This project aims to build a system that collects, processes, and delivers news articles to users in real-time, leveraging Kafka for data streaming, Docker for containerization, and MongoDB for data storage.

## System Components

- **API Call Container**: Fetches data from external APIs and sends it to Kafka.
- **Zookeeper Service**: Manages Kafka's state.
- **Kafka Service**: Handles message streaming.
- **Consumer Service**: Consumes data from Kafka and stores it in MongoDB.
- **Data API Service**: Provides processed data to the frontend via FAST-API.
- **Frontend Service**: Displays news data to users, built with React.
- **MongoDB Service**: Stores data consumed from Kafka.

## Features

- **Real-time Data Collection**: Utilizes the MediaStack API for gathering news articles.
- **Data Processing**: Involves data cleaning and categorization using Python or Spark.
- **Scalable Architecture**: Utilizes a Kafka cluster to ensure system scalability.
- **Security**: Implements security configurations for Kafka and databases.
- **Monitoring**: Employs Kibana or Grafana for system monitoring.
- **Subscription and Trending Features**: Allows users to subscribe to topics or view trending news based on user engagement.
- **Search Functionality**: Enables users to search for news articles.

## Setup Instructions

### Prerequisites

- Docker and Docker Compose installed.
- An account and API key from [MediaStack](https://mediastack.com/).

### Configuration

1. **Environment Variables**: Create a `.env` file in the project root with essential configurations:

    ```env
    # Kafka
    KAFKA_SERVER=kafka_service:29092

    # MediaStack
    MEDIASTACK_API_KEY=<your_mediastack_api_key>

    # MongoDB
    MONGODB_ROOT_USERNAME=admin
    MONGODB_ROOT_PASSWORD=<your_mongodb_root_password>
    MONGODB_DATABASE=news
    MONGODB_URI=mongodb://admin:<your_mongodb_root_password>@mongodb_service:27017/news
    ```

2. **`.gitignore` Configuration**: Ensure sensitive files are excluded:

    ```
    .env
    mongodb_service/mongodb_data/
    *.log
    ```

### Running the System

Execute the following command in your terminal to start all services:

```bash
docker-compose up
```

## MongoDB Setup

### Initial Setup

After initializing the MongoDB container, configure the database and user:

```bash
docker exec -it mongodb_service bash
mongosh
```

Then in the MongoDB shell:

```javascript
use admin
db.createUser({
    user: "news_admin",
    pwd: "myUserPassword",
    roles: [{ role: "readWrite", db: "news" }]
})
db.createCollection("newsArticles")
```

### Understanding MongoDB Accounts

- **Multiple Database Management**: On a single MongoDB server, each database can have its own set of users. In this project, we manage two databases: `user_data` and `news_data`. It's important to create separate user accounts for each database to enhance security and manage privileges efficiently.

```bash
use user_data
db.createUser({
    user: "user_admin",
    pwd: "userPassword",
    roles: [{ role: "readWrite", db: "user_data" }]
})

use news_data
db.createUser({
    user: "news_admin",
    pwd: "newsPassword",
    roles: [{ role: "readWrite", db: "news_data" }]
})
```

## ARM64 Compatibility Note

#### For M1 Mac users, ensure to use ARM64-compatible Docker images. For Kafka setup, refer to [ARM64 Compatible Confluent Platform](https://github.com/arm64-compat/confluent-platform).

## Project Outcomes

#### Participants will develop skills in real-time data processing, system architecture design, front-end development, and deployment strategies, gaining a comprehensive understanding of how to build and manage a real-time news feed system.


## 시스템 아키텍처

```mermaid
flowchart LR
    subgraph External["External News APIs"]
        M[MediaStack API]
        G[GNews API]
        N[News API]
    end

    subgraph Producers["API Call Services"]
        MS[MediaStack Service]
        GN[GNews Service]
        NS[News Service]
    end

    subgraph MessageBroker["Message Broker"]
        ZK[Zookeeper]
        K[Kafka]
        KU[Kafka UI]
    end

    subgraph Storage["Data Storage"]
        C[Consumer Service]
        MD[(MongoDB)]
    end

    subgraph Backend["Backend Services"]
        API[FastAPI Service]
    end

    subgraph Frontend["User Interface"]
        R[React Frontend]
    end

    M --> MS
    G --> GN
    N --> NS
    
    MS --> K
    GN --> K
    NS --> K
    
    ZK <--> K
    K <--> KU
    
    K --> C
    C --> MD
    MD --> API
    API --> R

    classDef external fill:#f9f,stroke:#333,stroke-width:2px
    classDef producer fill:#bbf,stroke:#333,stroke-width:2px
    classDef broker fill:#bfb,stroke:#333,stroke-width:2px
    classDef storage fill:#fbb,stroke:#333,stroke-width:2px
    classDef backend fill:#fbf,stroke:#333,stroke-width:2px
    classDef frontend fill:#bff,stroke:#333,stroke-width:2px

    class M,G,N external
    class MS,GN,NS producer
    class ZK,K,KU broker
    class C,MD storage
    class API backend
    class R frontend