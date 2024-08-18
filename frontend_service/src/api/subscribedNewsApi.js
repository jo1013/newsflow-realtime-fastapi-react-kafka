//frontend_service/src/api/subscribedNewsApi.js
import axios from 'axios';

// FastAPI 서버의 `/news` 엔드포인트를 가리키도록 API_ENDPOINT 업데이트
const API_ENDPOINT = `${process.env.REACT_APP_DOMAIN_ADDRESS}:8001`


const api = axios.create({
  baseURL: API_ENDPOINT,
  headers: {
    'Content-Type': 'application/json',
  }
});

// 토큰 관련 에러를 처리하는 함수
const handleTokenError = (error) => {
  if (error.response && error.response.status === 401) {
    console.log('토큰이 유효하지 않습니다. 로그아웃 처리합니다.');
    localStorage.removeItem('jwt');
    // 로그인 페이지로 리다이렉트
    window.location.href = '/login';
  }
  throw error;
};

// 토큰 갱신 함수 (백엔드에 해당 엔드포인트가 구현되어 있다고 가정)
const refreshToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    throw new Error('No refresh token found');
  }
  try {
    const response = await api.post('/refresh-token', { refreshToken });
    const newToken = response.data.token;
    localStorage.setItem('jwt', newToken);
    return newToken;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    throw error;
  }
};
const initializeSourcesMap = async () => {
  // 데이터베이스에서 현재 구독 상태를 가져오는 함수
  const subscribedSources = await fetchSubscribedSourcesFromDB();
  
  // Map을 생성하고 데이터베이스의 구독 상태로 초기화
  const sourcesMap = new Map(
    sources.map(source => {
      const isSubscribed = subscribedSources.includes(source.source);
      return [source.source, isSubscribed];
    })
  );
  
  return sourcesMap;
};


useEffect(() => {
  const loadSourcesMap = async () => {
    const initialSourcesMap = await initializeSourcesMap();
    setSubscribedNews(initialSourcesMap);
  };
  
  loadSourcesMap();
}, []);

const apiRequest = async (method, url, data = null) => {
  const token = localStorage.getItem('jwt');
  if (!token) {
    throw new Error('No token found');
  }

  try {
    const response = await api({
      method,
      url,
      data,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      // 토큰 갱신 시도
      try {
        const newToken = await refreshToken();
        // 새 토큰으로 재시도
        const retryResponse = await api({
          method,
          url,
          data,
          headers: {
            'Authorization': `Bearer ${newToken}`
          }
        });
        return retryResponse.data;
      } catch (refreshError) {
        handleTokenError(refreshError);
      }
    }
    handleTokenError(error);
  }
};


export const fetchSubscribedNews = async (page) => {
  try {
    const data = await apiRequest('get', `/news?page=${page}&page_size=10`);
    console.log('Subscribed news fetched:', data);
    if (!Array.isArray(data)) {
      throw new Error('Invalid response format');
    }
    return data;
  } catch (error) {
    console.error('Failed to fetch subscribed news:', error);
    throw error;
  }
};


export const fetchNewsSourcesApi = async () => {
  try {
    const response = await api.get('/news/news_sources');
    console.log('News sources fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch news sources:', error);
    throw error;
  }
};


export const fetchSubscribedNewsApi = async () => {
  try {
    const token = localStorage.getItem('jwt');
    if (!token) {
      throw new Error('No token found');
    }
    const response = await api.get('/subscriptions', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('Subscribed news fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch subscribed news:', error);
    throw error;
  }
};


export const toggleNewsSubscription = async (newsId, action) => {
  try {
    const token = localStorage.getItem('jwt');
    if (!token) {
      throw new Error('No token found');
    }
    const response = await api.patch(`/subscriptions/${newsId}?action=${action}`, null, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log(`뉴스 ${action} 성공:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`뉴스 ${action} 실패:`, error.response ? error.response.data : error.message);
    throw error;
  }
};
