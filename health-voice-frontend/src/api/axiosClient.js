import axios from 'axios';

/**
 * Axios Client cấu hình kết nối Spring Boot Backend
 * Tự động gắn JWT Bearer Token & bắt mã lỗi 401 Unauthorized
 */
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60s timeout cho các tác vụ VoiceStudio TTS & Gemini Hybrid AI
});

// Request Interceptor: Tự động đính kèm JWT Bearer Token từ LocalStorage
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Xử lý dữ liệu trả về và bắt lỗi 401
axiosClient.interceptors.response.use(
  (response) => {
    // Trả về trực tiếp data từ backend Spring Boot
    return response.data;
  },
  (error) => {
    if (error.response) {
      const { status } = error.response;
      const requestUrl = error.config?.url || '';
      const isAuthEndpoint = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register');

      // Xử lý khi Token hết hạn hoặc không hợp lệ (không áp dụng khi đang thử đăng nhập/đăng ký)
      if (status === 401 && !isAuthEndpoint) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('currentUser');
        
        // Bắn sự kiện tùy biến để AuthContext cập nhật mà không reload cứng
        window.dispatchEvent(new CustomEvent('auth:expired'));

        // Chỉ điều hướng nếu không ở trang login để tránh lặp vô tận
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login?expired=true';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
