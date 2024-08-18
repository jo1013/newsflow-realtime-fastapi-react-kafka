//userApi.js
import axios from 'axios';

// 사용자 관련 기능을 수행하는 서버의 기본 URL 설정
const USER_API_ENDPOINT = 'http://sawyer.cloudns.be:8001/users';



// 뉴스 클릭 이벤트를 기록하는 함수
export const recordNewsClick = async (userId, newsId) => {
  try {
    const response = await axios.post(`${USER_API_ENDPOINT}/click`, {
      user_id: userId,
      news_id: newsId,
      activity_type: 'click',
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('jwt')}` 
         }
    });

    if (!response.data) {
      throw new Error('Failed to record click');
    }

    return response.data;
  } catch (error) {
    console.error('Failed to record click:', error);
    throw error;
  }
};


// 사용자 회원가입
export const signupUser = async (email, password) => {
  try {
    const response = await axios.post(`${USER_API_ENDPOINT}/signup`, { email, password });
    return response.data;
  } catch (error) {
    console.error('회원가입 실패:', error);
    if (error.response) {
      // 서버가 2xx 범위를 벗어나는 상태 코드로 응답한 경우
      console.error('서버 응답:', error.response.data);
      console.error('상태 코드:', error.response.status);
      throw new Error(error.response.data.detail || '회원가입에 실패했습니다.');
    } else if (error.request) {
      // 요청이 전송되었지만 응답을 받지 못한 경우
      console.error('서버로부터 응답을 받지 못했습니다.');
      throw new Error('서버와의 통신 중 오류가 발생했습니다.');
    } else {
      // 요청 설정 중에 오류가 발생한 경우
      console.error('요청 설정 오류:', error.message);
      throw new Error('요청 설정 중 오류가 발생했습니다.');
    }
  }
};

export const loginUser = async (email, password) => {
  try {
    const response = await axios.post(`${USER_API_ENDPOINT}/login`, { email, password });
    // 로그인 성공 시 토큰을 로컬 스토리지에 저장
    localStorage.setItem('jwt', response.data.token);
    return response.data; // 로그인 성공 시 반환되는 데이터 (예: 사용자 정보, 토큰 등)
  } catch (error) {
    console.error('로그인 실패:', error);
    throw error; // 로그인 실패 시 예외를 발생시키기
  }
};


// 아이디 찾기
export const findUserId = async (email) => {
  try {
    const response = await axios.get(`${USER_API_ENDPOINT}/find-id?email=${email}`);
    return response.data; // 아이디 찾기 성공 시 반환되는 데이터 (예: 사용자 아이디)
  } catch (error) {
    console.error('아이디 찾기 실패:', error);
    throw error;
  }
};

// 비밀번호 찾기
export const resetUserPassword = async (email) => {
  try {
    const response = await axios.post(`${USER_API_ENDPOINT}/find-password`, { email });
    return response.data; // 비밀번호 찾기 성공 시 반환되는 데이터 (예: 새 비밀번호 또는 비밀번호 재설정 링크)
  } catch (error) {
    console.error('비밀번호 찾기 실패:', error);
    throw error;
  }
};
