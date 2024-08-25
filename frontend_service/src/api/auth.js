// frontend_service/src/api/auth.js

import axios from 'axios';

const API_ENDPOINT = `${process.env.REACT_APP_DOMAIN_ADDRESS}:8001`;

const api = axios.create({
  baseURL: API_ENDPOINT,
  headers: {
    'Content-Type': 'application/json',
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt');
    if (token) {
      console.log('Token being sent:', token);
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    console.log('Request config:', config);
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('Response received:', response);
    return response;
  },
  (error) => {
    console.error('Response error:', error.response);
    if (error.response && error.response.status === 401) {
      console.log('401 error detected. Current token:', localStorage.getItem('jwt'));
      // 여기에 토큰 갱신 로직을 추가할 수 있습니다.
    }
    return Promise.reject(error);
  }
);

export const checkTokenValidity = async () => {
  try {
    const response = await api.get('/check-token');
    console.log('Token check response:', response);
    return response.data;
  } catch (error) {
    console.error('Token check failed:', error);
    return { valid: false, error: error.response?.data?.detail || 'Token check failed' };
  }
};

// 이 함수를 컴포넌트나 페이지 로드 시 호출하여 토큰 유효성을 확인합니다.