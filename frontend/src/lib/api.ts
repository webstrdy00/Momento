import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: JWT 토큰 자동 추가
api.interceptors.request.use(
  async (config) => {
    try {
      // AsyncStorage에서 Supabase 세션 가져오기
      const sessionStr = await AsyncStorage.getItem('supabase.auth.token');

      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        const accessToken = session.access_token;

        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
      }
    } catch (error) {
      console.error('토큰 가져오기 실패:', error);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: 에러 처리
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // 토큰 만료 또는 유효하지 않음
      console.log('인증 오류: 다시 로그인 필요');
      // TODO: 로그인 화면으로 이동
    }

    return Promise.reject(error);
  }
);

export default api;
