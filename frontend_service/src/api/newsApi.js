import axios from 'axios';

// FastAPI 서버의 `/news` 엔드포인트를 가리키도록 API_ENDPOINT 업데이트
const API_ENDPOINT = 'http://sawyer.cloudns.be:8001/news'; // 포트번호 확인 필요


export const fetchNews = async (page = 1, page_size = 10) => {
  try {
    const response = await axios.get(`${API_ENDPOINT}?page=${page}&page_size=${page_size}&sort=-created_at`);
    console.log(response.data); // 로그로 응답 확인
    console.log(`${API_ENDPOINT}?page=${page}&page_size=${page_size}`); // 로그로 응답 확인
    return response.data;
  } catch (error) {
    console.error('뉴스를 가져오는데 실패했습니다:', error);
    throw error;
  }
};


export const fetchNewsDetail = async (id) => {
  try {
    const response = await axios.get(`${API_ENDPOINT}/details/${id}`);
    if (response.data) {
      return response.data;
    } else {
      console.error('No data returned from the API');
    }
  } catch (error) {
    console.error('Failed to fetch news details:', error);
    throw error;
  }
};

export const NewsList = async () => {
  try {
    const response = await axios.get(`${API_ENDPOINT}/list`);
    if (response.data) {
      return response.data;
    } else {
      console.error('No data returned from the API');
    }
  } catch (error) {
    console.error('Failed to fetch news details:', error);
    throw error;
  }
};