import React, { useState, useEffect } from 'react';
import { 
  Stethoscope, 
  BookOpen, 
  Trash2, 
  Plus, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Headphones 
} from 'lucide-react';
import { doctorApi } from '../../api/endpoints';
import DoctorPodcastManagement from '../../components/doctor/DoctorPodcastManagement';

export default function DoctorPortal() {
  const [activeTab, setActiveTab] = useState('podcasts'); // 'podcasts' | 'lexicon'

  // Tab Từ điển phát âm state
  const [lexiconList, setLexiconList] = useState([]);
  const [loadingLexicon, setLoadingLexicon] = useState(false);
  const [syncingLexicon, setSyncingLexicon] = useState(false);
  const [newRawTerm, setNewRawTerm] = useState('');
  const [newPhonetic, setNewPhonetic] = useState('');
  const [newCategory, setNewCategory] = useState('THUAT_NGU');

  // Thông báo Toast
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  // Tải từ điển phát âm
  const loadLexicon = async () => {
    setLoadingLexicon(true);
    try {
      const res = await doctorApi.getLexicon();
      if (res?.data) {
        setLexiconList(res.data);
      }
    } catch (err) {
      console.warn('Lỗi tải từ điển:', err);
    } finally {
      setLoadingLexicon(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'lexicon') {
      loadLexicon();
    }
  }, [activeTab]);

  // Xử lý Thêm từ điển mới
  const handleAddLexicon = async (e) => {
    e.preventDefault();
    if (!newRawTerm.trim() || !newPhonetic.trim()) {
      showToast('error', 'Vui lòng nhập cả từ gốc và phát âm chuẩn');
      return;
    }
    try {
      await doctorApi.addLexicon({
        rawTerm: newRawTerm.trim(),
        phoneticReplacement: newPhonetic.trim(),
        category: newCategory,
      });
      showToast('success', `Đã thêm thuật ngữ "${newRawTerm}" vào từ điển`);
      setNewRawTerm('');
      setNewPhonetic('');
      loadLexicon();
    } catch (err) {
      const msg = err.response?.data?.message || 'Không thể thêm thuật ngữ mới. Vui lòng kiểm tra lại.';
      showToast('error', msg.includes('Internal') || msg.includes('Exception') ? 'Không thể thêm thuật ngữ mới. Vui lòng kiểm tra lại.' : msg);
    }
  };

  // Xử lý Xóa từ điển
  const handleDeleteLexicon = async (id) => {
    if (!window.confirm('Xác nhận xóa quy chuẩn phát âm này?')) return;
    try {
      await doctorApi.deleteLexicon(id);
      showToast('success', 'Đã xóa mục từ điển');
      loadLexicon();
    } catch (err) {
      showToast('error', 'Không thể xóa mục từ điển. Vui lòng thử lại.');
    }
  };

  // Xử lý Đồng bộ từ điển lên Python TTS
  const handleSyncLexicon = async () => {
    setSyncingLexicon(true);
    try {
      const res = await doctorApi.reloadLexicon();
      showToast('success', res?.message || 'Đồng bộ từ điển lên Python TTS Engine thành công!');
    } catch (err) {
      showToast('error', 'Lỗi đồng bộ từ điển: ' + (err.response?.data?.message || err.message));
    } finally {
      setSyncingLexicon(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-md text-xs font-semibold shadow-md transition-all ${
          toast.type === 'error' ? 'bg-rose-50 text-rose-800 border border-rose-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4 text-rose-600" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Phân Hệ Bác Sĩ */}
      <div className="bg-white border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-teal-800 text-white flex items-center justify-center shadow-xs">
                <Stethoscope className="w-5 h-5 text-teal-100" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  Doctor Studio &amp; Portal
                </h1>
                <p className="text-xs text-slate-500">
                  Quản trị podcast y khoa, kiểm thử giọng đọc AI và chuẩn hóa từ điển phát âm lâm sàng
                </p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setActiveTab('podcasts')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium transition ${
                  activeTab === 'podcasts' 
                    ? 'bg-white text-teal-900 shadow-xs font-semibold' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Headphones className="w-4 h-4 text-teal-700" />
                <span>Quản lý &amp; Xuất bản Podcast</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('lexicon')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium transition ${
                  activeTab === 'lexicon' 
                    ? 'bg-white text-teal-900 shadow-xs font-semibold' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-4 h-4 text-teal-700" />
                <span>Từ điển phát âm Y khoa</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-6">
        {/* ================================================================= */}
        {/* TAB 1: QUẢN LÝ THƯ VIỆN PODCAST & BÀI VIẾT Y KHOA */}
        {/* ================================================================= */}
        {activeTab === 'podcasts' && <DoctorPodcastManagement />}

        {/* ================================================================= */}
        {/* TAB 2: TỪ ĐIỂN PHÁT ÂM Y KHOA (MEDICAL LEXICON) */}
        {/* ================================================================= */}
        {activeTab === 'lexicon' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Từ điển Quy chuẩn Phát âm Y khoa (Lexicon)</h2>
                <p className="text-xs text-slate-500">
                  Định nghĩa cách đọc chuẩn xác cho từ viết tắt, thuốc và đơn vị sinh hiệu y khoa tiếng Việt
                </p>
              </div>

              <button
                type="button"
                onClick={handleSyncLexicon}
                disabled={syncingLexicon}
                className="px-3.5 py-2 rounded-md bg-teal-800 hover:bg-teal-900 text-white text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50 shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncingLexicon ? 'animate-spin' : ''}`} />
                <span>Đồng bộ lên Python TTS Engine</span>
              </button>
            </div>

            {/* Form thêm từ mới */}
            <form onSubmit={handleAddLexicon} className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Thuật ngữ / Viết tắt gốc:</label>
                <input
                  type="text"
                  required
                  value={newRawTerm}
                  onChange={(e) => setNewRawTerm(e.target.value)}
                  placeholder="Ví dụ: SpO2, THA, Paracetamol..."
                  className="w-full text-xs p-2.5 rounded-md border border-slate-300 focus:border-teal-700 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Phiên âm tiếng Việt chuẩn:</label>
                <input
                  type="text"
                  required
                  value={newPhonetic}
                  onChange={(e) => setNewPhonetic(e.target.value)}
                  placeholder="Ví dụ: ét pơ ô hai, tăng huyết áp..."
                  className="w-full text-xs p-2.5 rounded-md border border-slate-300 focus:border-teal-700 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Phân loại:</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-md border border-slate-300 focus:border-teal-700 outline-none bg-white"
                >
                  <option value="THUAT_NGU">Thuật ngữ lâm sàng (THUAT_NGU)</option>
                  <option value="THUOC">Dược phẩm / Thuốc (THUOC)</option>
                  <option value="DON_VI">Đơn vị đo lường (DON_VI)</option>
                </select>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-md bg-teal-800 hover:bg-teal-900 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-xs"
                >
                  <Plus className="w-4 h-4" /> Thêm quy chuẩn
                </button>
              </div>
            </form>

            {/* Bảng danh sách từ điển */}
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3 w-12 text-center">STT</th>
                    <th className="p-3">Thuật ngữ gốc</th>
                    <th className="p-3">Phiên âm máy đọc</th>
                    <th className="p-3">Phân loại</th>
                    <th className="p-3 text-center">Trạng thái</th>
                    <th className="p-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lexiconList.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                      <td className="p-3 font-bold text-slate-900 font-mono">{item.rawTerm}</td>
                      <td className="p-3 text-teal-800 font-medium">{item.phoneticReplacement}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          item.category === 'THUOC' ? 'bg-blue-50 text-blue-800 border border-blue-200' :
                          item.category === 'DON_VI' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                          'bg-purple-50 text-purple-800 border border-purple-200'
                        }`}>
                          {item.category}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                          Hoạt động
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteLexicon(item.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition rounded"
                          title="Xóa quy chuẩn này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {lexiconList.length === 0 && !loadingLexicon && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        Chưa có quy chuẩn từ điển nào trong cơ sở dữ liệu.
                      </td>
                    </tr>
                  )}
                  {loadingLexicon && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        Đang tải danh sách từ điển...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
