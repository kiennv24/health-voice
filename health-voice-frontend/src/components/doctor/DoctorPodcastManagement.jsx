import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Volume2, 
  Headphones, 
  Eye, 
  Play, 
  Pause, 
  CheckCircle2, 
  Clock, 
  RefreshCw,
  AlertCircle,
  Sparkles,
  FileText
} from 'lucide-react';
import { podcastApi } from '../../api/endpoints';
import CreatePodcastModal from './CreatePodcastModal';

const CATEGORY_NAMES = {
  TIM_MACH: 'Tim Mạch & Huyết Áp',
  THAN_KINH: 'Thần Kinh & Đột Quỵ',
  TIEU_HOA: 'Tiêu Hóa & Dạ Dày',
  HO_HAP: 'Hô Hấp & Bệnh Theo Mùa',
  DINH_DUONG: 'Dinh Dưỡng & Lối Sống Lành Mạnh',
  DUOC_PHAM: 'Thuốc & Dược Liệu Hướng Dẫn',
};

export default function DoctorPodcastManagement() {
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPodcast, setEditingPodcast] = useState(null);
  const [notice, setNotice] = useState(null);

  // Audio player preview
  const [playingId, setPlayingId] = useState(null);
  const [audioObj, setAudioObj] = useState(null);

  const showToast = (type, message) => {
    setNotice({ type, message });
    setTimeout(() => setNotice(null), 4000);
  };

  const fetchPodcasts = async () => {
    setLoading(true);
    try {
      const res = await podcastApi.getMyPodcasts({ page: 0, size: 20 });
      const data = res?.data?.content || res?.data || res || [];
      if (Array.isArray(data)) {
        setPodcasts(data);
      }
    } catch (err) {
      console.warn('Lỗi tải podcast của bác sĩ:', err);
      // Fallback lấy danh sách public nếu token khác
      try {
        const pubRes = await podcastApi.getPublic({ size: 20 });
        const pubData = pubRes?.data?.content || pubRes?.data || [];
        if (Array.isArray(pubData)) setPodcasts(pubData);
      } catch (e) {
        showToast('error', 'Không thể kết nối đến máy chủ lấy danh sách bài viết.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPodcasts();
    return () => {
      if (audioObj) audioObj.pause();
    };
  }, []);

  const handlePlayAudio = (podcast) => {
    if (!podcast.audioUrl) {
      showToast('error', 'Bài viết này chưa có file âm thanh.');
      return;
    }

    if (playingId === podcast.id) {
      if (audioObj) {
        audioObj.pause();
        setPlayingId(null);
      }
      return;
    }

    if (audioObj) {
      audioObj.pause();
    }

    const a = new Audio(podcast.audioUrl);
    setAudioObj(a);
    setPlayingId(podcast.id);
    a.play().catch(e => {
      console.warn('Autoplay error:', e);
      setPlayingId(null);
    });
    a.onended = () => setPlayingId(null);
    a.onerror = () => {
      showToast('error', 'Không thể phát file âm thanh từ máy chủ.');
      setPlayingId(null);
    };
  };

  const handleDelete = async (podcast) => {
    if (!window.confirm(`Bác sĩ có chắc chắn muốn xóa bài viết "${podcast.title}"?`)) return;
    try {
      await podcastApi.deletePodcast(podcast.id);
      setPodcasts(prev => prev.filter(p => p.id !== podcast.id));
      showToast('success', `Đã xóa bài viết "${podcast.title}".`);
    } catch (err) {
      console.error(err);
      showToast('error', 'Không thể xóa bài viết.');
    }
  };

  const handleEdit = (podcast) => {
    setEditingPodcast(podcast);
    setModalOpen(true);
  };

  const handleCreateNew = () => {
    setEditingPodcast(null);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notice */}
      {notice && (
        <div className="fixed top-20 right-6 z-50 max-w-md animate-fade-in">
          <div
            className={`p-3.5 rounded-lg shadow-lg border flex items-center gap-3 ${
              notice.type === 'success'
                ? 'bg-teal-900 text-teal-50 border-teal-700'
                : 'bg-rose-900 text-rose-50 border-rose-700'
            }`}
          >
            {notice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-teal-300 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" />
            )}
            <span className="text-xs font-medium">{notice.message}</span>
          </div>
        </div>
      )}

      {/* Header bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Headphones className="w-5 h-5 text-teal-700" />
            Quản Lý Thư Viện Podcast & Bản Tin Y Khoa Do Bác Sĩ Xuất Bản
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Soạn thảo bài viết lâm sàng, kiểm thử âm thanh y khoa và xuất bản trực tiếp cho bệnh nhân nghe
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-800 hover:bg-teal-900 text-white rounded-lg text-xs font-bold shadow-xs transition shrink-0"
        >
          <Plus className="w-4 h-4 text-teal-200" />
          Soạn Bài Viết Mới
        </button>
      </div>

      {/* Table List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-teal-700" />
            Đang tải danh sách bài viết...
          </div>
        ) : podcasts.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">Chưa có bài viết podcast nào</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Bác sĩ hãy nhấn nút "Soạn Bài Viết Mới" để xuất bản bài tin sức khỏe và giọng đọc y khoa đầu tiên.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 text-[11px] text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Bài Viết &amp; Chuyên Khoa</th>
                  <th className="py-3 px-4">Giọng Đọc Y Khoa</th>
                  <th className="py-3 px-4 text-center">Lượt Xem</th>
                  <th className="py-3 px-4 text-center">Lượt Nghe</th>
                  <th className="py-3 px-4 text-center">Trạng Thái</th>
                  <th className="py-3 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {podcasts.map(p => {
                  const isPlaying = playingId === p.id;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition">
                      {/* Tiêu đề & Thumbnail */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-start gap-3">
                          <img
                            src={p.thumbnailUrl}
                            alt=""
                            referrerPolicy="no-referrer"
                            className="w-14 h-14 rounded-lg object-cover shrink-0 border border-slate-200"
                          />
                          <div className="space-y-1 max-w-md">
                            <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                              {CATEGORY_NAMES[p.category] || p.category}
                            </span>
                            <div className="font-bold text-slate-900 text-sm line-clamp-1">
                              {p.title}
                            </div>
                            <div className="text-[11px] text-slate-500 line-clamp-1">
                              {p.summary}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Giọng đọc & Nghe thử */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span className="font-semibold text-slate-800 font-mono text-[11px] block">
                            {p.defaultVoice || 'banmai'}
                          </span>
                          {p.audioUrl && (
                            <button
                              onClick={() => handlePlayAudio(p)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold border transition ${
                                isPlaying
                                  ? 'bg-teal-800 text-white border-teal-900'
                                  : 'bg-slate-50 hover:bg-teal-50 text-slate-700 border-slate-200'
                              }`}
                            >
                              {isPlaying ? (
                                <>
                                  <Pause className="w-3 h-3 text-teal-200" />
                                  Đang phát...
                                </>
                              ) : (
                                <>
                                  <Play className="w-3 h-3 text-teal-700" />
                                  Nghe audio
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Lượt xem */}
                      <td className="py-3.5 px-4 text-center font-mono font-semibold text-slate-700">
                        <div className="flex items-center justify-center gap-1">
                          <Eye className="w-3.5 h-3.5 text-slate-400" />
                          {p.viewsCount || 0}
                        </div>
                      </td>

                      {/* Lượt nghe */}
                      <td className="py-3.5 px-4 text-center font-mono font-semibold text-teal-700">
                        <div className="flex items-center justify-center gap-1">
                          <Headphones className="w-3.5 h-3.5 text-teal-600" />
                          {p.listenCount || 0}
                        </div>
                      </td>

                      {/* Trạng thái */}
                      <td className="py-3.5 px-4 text-center">
                        {p.status === 'PUBLISHED' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            Đã xuất bản
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            Bản nháp
                          </span>
                        )}
                      </td>

                      {/* Thao tác */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEdit(p)}
                            title="Sửa bài viết"
                            className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded transition"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(p)}
                            title="Xóa bài viết"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Soạn thảo */}
      <CreatePodcastModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingPodcast(null);
        }}
        onSuccess={fetchPodcasts}
        initialData={editingPodcast}
      />
    </div>
  );
}

