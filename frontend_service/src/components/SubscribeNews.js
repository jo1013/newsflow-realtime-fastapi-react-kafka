//frontend_service/src/components/SubscribedNews.js
import axios from 'axios';

const API_ENDPOINT = `${process.env.REACT_APP_DOMAIN_ADDRESS}:8001`;

const api = axios.create({
  baseURL: API_ENDPOINT,
  headers: {
    'Content-Type': 'application/json',
  }
});

const refreshToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    throw new Error('No refresh token found');
  }
  try {
    const response = await api.post('/refresh-token', { refreshToken });
    const newToken = response.data.access_token;
    localStorage.setItem('jwt', newToken);
    return newToken;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    throw error;
  }
};

const apiRequest = async (method, url, data = null) => {
  const token = localStorage.getItem('jwt');
  
  try {
    const response = await api({
      method,
      url,
      data,
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      try {
        const newToken = await refreshToken();
        const retryResponse = await api({
          method,
          url,
          data,
          headers: { 'Authorization': `Bearer ${newToken}` }
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

export const fetchSubscribedNewsApi = async () => {
  try {
    const response = await apiRequest('get', '/subscriptions');
    console.log('Subscribed news sources fetched:', response);
    return response;
  } catch (error) {
    console.error('Failed to fetch subscribed news sources:', error);
    throw error;
  }
};

export const fetchSubscribedNews = async (page) => {
  try {
    const data = await apiRequest('get', `/news?page=${page}&page_size=10`);
    console.log('Subscribed news fetched:', data);
    return data;
  } catch (error) {
    console.error('Failed to fetch subscribed news:', error);
    throw error;
  }
};

export const fetchNewsSourcesApi = async () => {
  try {
    const response = await apiRequest('get', '/news/news_sources');
    console.log('News sources fetched:', response);
    return response;
  } catch (error) {
    console.error('Failed to fetch news sources:', error);
    throw error;
  }
};

export const initializeSourcesMap = async () => {
  try {
    const subscribedSources = await fetchSubscribedNewsApi();
    const sources = await fetchNewsSourcesApi();
    
    const sourcesMap = new Map(
      sources.map(source => [source.source, subscribedSources.includes(source.source)])
    );
    
    return sourcesMap;
  } catch (error) {
    console.error('Failed to initialize sources map:', error);
    throw error;
  }
};

// 이전에 주석 처리된 부분
const fetchSubscribedSourcesFromDB = async () => {
  // 데이터베이스에서 현재 구독 상태를 가져오는 함수
  // 이 함수의 실제 구현은 백엔드 API에 따라 다를 수 있습니다.
  try {
    const response = await apiRequest('get', '/subscribed-sources');
    return response;
  } catch (error) {
    console.error('Failed to fetch subscribed sources from DB:', error);
    throw error;
  }
};

// 토글 구독 함수
export const toggleNewsSubscription = async (newsId, action) => {
  try {
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

export default {
  fetchSubscribedNewsApi,
  fetchSubscribedNews,
  fetchNewsSourcesApi,
  initializeSourcesMap,
  toggleNewsSubscription
};