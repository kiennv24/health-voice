import axiosClient from './axiosClient';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const authApi = {
  login: (credentials) => axiosClient.post('/auth/login', credentials),
  register: (data) => axiosClient.post('/auth/register', data),
  getCurrentUser: () => axiosClient.get('/auth/me'),
};

export const categoryApi = {
  getAll: () => axiosClient.get('/categories'),
  getById: (id) => axiosClient.get(`/categories/${id}`),
  create: (data) => axiosClient.post('/categories', data),
  update: (id, data) => axiosClient.put(`/categories/${id}`, data),
  delete: (id) => axiosClient.delete(`/categories/${id}`),
};

export const voiceApi = {
  getAll: () => axiosClient.get('/voices'),
  getActive: () => axiosClient.get('/voices/active'),
  update: (id, data) => axiosClient.put(`/voices/${id}`, data),
};

export const scriptApi = {
  getAll: (params) => axiosClient.get('/scripts', { params }),
  getPublished: () => axiosClient.get('/scripts/published'),
  getById: (id) => axiosClient.get(`/scripts/${id}`),
  create: (data) => axiosClient.post('/scripts', data),
  update: (id, data) => axiosClient.put(`/scripts/${id}`, data),
  delete: (id) => axiosClient.delete(`/scripts/${id}`),
  normalize: (data) => axiosClient.post('/scripts/normalize', data),
  synthesizeAudio: (scriptId, payload) => axiosClient.post(`/scripts/${scriptId}/tts`, payload),
  publish: (scriptId) => axiosClient.post(`/scripts/${scriptId}/publish`),
};

export const voiceStudioApi = {
  normalizeText: (rawText) => axiosClient.post('/voice-studio/normalize', { rawText }),
  generateAudio: (payload) => axiosClient.post('/voice-studio/tts', payload),
  getVoices: () => axiosClient.get('/voice-studio/voices'),
};

export const audioApi = {
  getAll: () => axiosClient.get('/audios'),
  getAudioStreamUrl: (audioIdOrFileName) => {
    if (!audioIdOrFileName) return '';
    if (typeof audioIdOrFileName === 'number' || !isNaN(Number(audioIdOrFileName))) {
      return `${BASE_URL}/audio/stream/${audioIdOrFileName}`;
    }
    return `${BASE_URL}/stream/${audioIdOrFileName}`;
  },
};

export const analyticsApi = {
  getDashboard: () => axiosClient.get('/analytics/dashboard'),
  getScriptRatings: (scriptId) => axiosClient.get(`/analytics/scripts/${scriptId}/ratings`),
};

// Module Lịch Nhắc Nhở Uống Thuốc Thông Minh (Smart Voice Alarm)
export const reminderApi = {
  getMySchedules: () => axiosClient.get('/reminders/my-schedules'),
  getAll: (userId) => axiosClient.get('/reminders/my-schedules'),
  create: (data) => axiosClient.post('/reminders', data),
  update: (id, data) => axiosClient.put(`/reminders/${id}`, data),
  toggle: (id) => axiosClient.patch(`/reminders/${id}/toggle`),
  markTaken: (id) => axiosClient.post(`/reminders/${id}/mark-taken`),
  delete: (id) => axiosClient.delete(`/reminders/${id}`),
};

// =========================================================================
// 1. Phân Hệ Tư Vấn Sức Khỏe & Hội Thoại Giọng Nói Trí Tuệ Nhân Tạo
// =========================================================================
export const consultationApi = {
  createSession: (data) => axiosClient.post('/consultation/sessions', data),
  getSessions: () => axiosClient.get('/consultation/sessions'),
  getMessages: (sessionId) => axiosClient.get(`/consultation/sessions/${sessionId}/messages`),
  sendMessage: (data) => axiosClient.post('/consultation/chat', data),
  closeSession: (sessionId) => axiosClient.put(`/consultation/sessions/${sessionId}/close`),
  deleteSession: (sessionId) => axiosClient.delete(`/consultation/sessions/${sessionId}`),
};

// =========================================================================
// 2. Phân Hệ Bác Sĩ & Chuyên Viên Y Tế (Doctor Portal)
// =========================================================================
export const doctorApi = {
  getTemplates: () => axiosClient.get('/doctor/templates'),
  getPublicTemplates: () => axiosClient.get('/doctor/templates/public'),
  createTemplate: (data) => axiosClient.post('/doctor/templates', data),
  updateTemplate: (id, data) => axiosClient.put(`/doctor/templates/${id}`, data),
  deleteTemplate: (id) => axiosClient.delete(`/doctor/templates/${id}`),
  previewTts: (data) => axiosClient.post('/doctor/tts/preview', data),
  getLexicon: () => axiosClient.get('/doctor/lexicon'),
  addLexicon: (data) => axiosClient.post('/doctor/lexicon', data),
  updateLexicon: (id, data) => axiosClient.put(`/doctor/lexicon/${id}`, data),
  deleteLexicon: (id) => axiosClient.delete(`/doctor/lexicon/${id}`),
  reloadLexicon: () => axiosClient.post('/doctor/lexicon/reload'),
};

// =========================================================================
// 4. Phân Hệ Quản Trị Viên Hệ Thống (Admin Control Panel)
// =========================================================================
export const adminApi = {
  getStats: () => axiosClient.get('/admin/stats'),
  getUsers: () => axiosClient.get('/admin/users'),
  updateUserRole: (id, role) => axiosClient.put(`/admin/users/${id}/role`, { role }),
  updateUserStatus: (id, status) => axiosClient.put(`/admin/users/${id}/status`, { status }),
  getCacheStats: () => axiosClient.get('/admin/cache/stats'),
  deleteCacheEntry: (id) => axiosClient.delete(`/admin/cache/${id}`),
  clearAllCache: () => axiosClient.delete('/admin/cache/clear'),
  getPodcasts: () => axiosClient.get('/admin/podcasts'),
  updatePodcastStatus: (id, status) => axiosClient.put(`/admin/podcasts/${id}/status`, { status }),
  deletePodcast: (id) => axiosClient.delete(`/admin/podcasts/${id}`),
  cleanupStorage: () => axiosClient.post('/admin/storage/cleanup'),
  getReminders: () => axiosClient.get('/admin/reminders'),
  getConsultations: () => axiosClient.get('/admin/consultations'),
};

// =========================================================================
// 5. Phân Hệ Thư Viện Podcast & Bản Tin Sức Khỏe Bác Sĩ Xuất Bản
// =========================================================================
export const podcastApi = {
  // Dành cho Bệnh nhân & Độc giả
  getPublic: (params) => axiosClient.get('/public/podcasts', { params }),
  getFeatured: () => axiosClient.get('/public/podcasts/featured'),
  getBySlug: (slug) => axiosClient.get(`/public/podcasts/${slug}`),
  trackListen: (id) => axiosClient.post(`/public/podcasts/${id}/track-listen`),
  changeVoice: (id, voiceCode) => axiosClient.post(`/public/podcasts/${id}/voice`, null, { params: { voiceCode } }),

  // Dành cho Bác sĩ (Doctor Studio)
  getMyPodcasts: (params) => axiosClient.get('/doctor/podcasts/my', { params }),
  createPodcast: (data) => axiosClient.post('/doctor/podcasts', data),
  updatePodcast: (id, data) => axiosClient.put(`/doctor/podcasts/${id}`, data),
  deletePodcast: (id) => axiosClient.delete(`/doctor/podcasts/${id}`),
  previewVoice: (data) => axiosClient.post('/doctor/podcasts/preview-voice', data),
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosClient.post('/doctor/podcasts/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
