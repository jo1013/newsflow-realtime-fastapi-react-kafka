# Node.js 이미지를 기반으로 설정
FROM node:14

# 작업 디렉토리 설정
WORKDIR /usr/src/app


COPY . .
# 앱 의존성 설치


RUN npm install
RUN npm install react-router-dom@6
RUN npm install typescript@latest ajv@^8 --save-dev
RUN npm install @mui/material @emotion/react @emotion/styled
RUN npm install date-fns
RUN npm install jwt-decode


RUN npm run build

# 환경변수 설정 추가
ENV HOST=0.0.0.0
ENV PORT=3000

EXPOSE 3000
# 앱 소스 추가


# 앱 실행
CMD ["npm", "start"]
