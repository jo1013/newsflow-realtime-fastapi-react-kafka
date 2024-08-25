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


// 디버깅을 위한 인터셉터
api.interceptors.request.use(request => {
  console.log('Starting Request', JSON.stringify(request, null, 2))
  return request
})

api.interceptors.response.use(response => {
  console.log('Response:', JSON.stringify(response, null, 2))
  return response
})

// 토큰을 포함시키는 인터셉터
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


// 토큰 갱신 함수 (백엔드에 해당 엔드포인트가 구현되어 있다고 가정)
const refreshToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    throw new Error('No refresh token found');
  }
  try {
    const response = await api.post('/refresh-token', { refreshToken });
    const newToken = response.data.access_token;  // 수정: token -> access_token
    localStorage.setItem('jwt', newToken);
    return newToken;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    throw error;
  }
};

export const initializeSourcesMap = async () => {
  try {
  const subscribedSources = await fetchSubscribedSourcesFromDB();
  const sources = await fetchNewsSourcesApi();

  const sourcesMap = new Map(
    sources.map(source => {
      const isSubscribed = subscribedSources.includes(source.source);
      return [source.source, isSubscribed];
    })
  );
  
  return sourcesMap;
  } catch (error) {
    console.error('Failed to initialize sources map:', error);
    throw error;
  }
};





const apiRequest = async (method, url, data = null) => {
  const token = localStorage.getItem('jwt');
  console.log('Current token:', token);  // 디버깅을 위한 로그 추가

  if (!token) {
    console.error('No token found in localStorage');
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
    console.error('API request failed:', error.response || error);  // 에러 로깅 개선
    if (error.response && error.response.status === 401) {
      console.log('Token expired, attempting to refresh...');
      try {
        const newToken = await refreshToken();
        console.log('Token refreshed successfully. New token:', newToken);

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
        console.error('Token refresh failed:', refreshError);
        localStorage.removeItem('jwt');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        throw new Error('Authentication failed. Please log in again.');
      }
    }
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


export const toggleNewsSubscriptionApi = async (newsId, action) => {
  try {
    console.log(`Attempting to ${action} news source: ${newsId}`);  
    const response = await apiRequest('patch', `/subscriptions/${newsId}?action=${action}`);
    console.log(`News ${action} successful:`, response);
    return response;
  } catch (error) {
    console.error(`News ${action} failed:`, error);
    if (error.response) {
      throw new Error(`${error.response.status}: ${error.response.data.detail || error.message}`);
    } else {
      throw error;
    }
  }
};

