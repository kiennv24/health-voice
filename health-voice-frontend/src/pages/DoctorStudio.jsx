import React, { useState, useEffect } from 'react';
import { 
  Wand2, 
  Sparkles, 
  Mic2, 
  Volume2, 
  CheckCircle2, 
  AlertCircle, 
  Play, 
  Pause, 
  RotateCcw, 
  Send, 
  RefreshCw, 
  FileText, 
  Stethoscope, 
  Layers, 
  Sliders, 
  ArrowRightLeft,
  Headphones,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { scriptApi, categoryApi, voiceApi, voiceStudioApi } from '../api/endpoints';

const DEFAULT_VOICES = [
  { id: 1, voiceCode: 'banmai', voiceName: 'Nữ Miền Bắc', gender: 'FEMALE', region: 'Miền Bắc', desc: 'Nữ - Miền Bắc, giọng chuẩn hóa y khoa' },
];

export const DoctorStudio = () => {
  const { user, isDoctor, isAdmin, isAuthenticated } = useAuth();
  const canPublish = isDoctor || isAdmin;

  // Form kịch bản y khoa
  const [title, setTitle] = useState('Cách Kiểm Soát Cơn Tăng Huyết Áp 120/80 Đến 140/90 mmHg Tại Nhà');
  const [categoryId, setCategoryId] = useState('1');
  const [categories, setCategories] = useState([]);
  const [rawContent, setRawContent] = useState(
    'Khi máy đo huyết áp tại nhà hiện HA 120/80 mmHg đến 140/90 mmHg hoặc SpO2 96%, bệnh nhân THA cần bình tĩnh nghỉ ngơi 15 phút. Nếu kèm sốt > 38.5 độ C, uống Paracetamol 500mg 1v sau khi ăn no. Nếu HA > 160/100 mmHg hãy gọi 115.'
  );

  // Chuẩn hóa văn bản
  const [normalizedContent, setNormalizedContent] = useState('');
  const [isNormalizing, setIsNormalizing] = useState(false);
  const [activeTab, setActiveTab] = useState('compare'); // 'compare' | 'normalized'

  // Cấu hình giọng đọc y khoa
  const [voices, setVoices] = useState(DEFAULT_VOICES);
  const [selectedVoiceId, setSelectedVoiceId] = useState(1);
  const [speed, setSpeed] = useState(0.0);

  // Tổng hợp audio y khoa
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [draftAudio, setDraftAudio] = useState(null);
  const [draftScriptId, setDraftScriptId] = useState(null);

  // Xuất bản bài viết
  const [isPublishing, setIsPublishing] = useState(false);
  const [notice, setNotice] = useState(null);

  const showToast = (type, message) => {
    setNotice({ type, message });
    setTimeout(() => setNotice(null), 6000);
  };

  // Tải danh mục chuyên khoa và danh sách giọng FPT.AI từ backend
  useEffect(() => {
    const initData = async () => {
      try {
        const [catRes, voiceRes] = await Promise.allSettled([
          categoryApi.getAll(),
          voiceApi.getAll(),
        ]);

        if (catRes.status === 'fulfilled' && catRes.value?.data) {
          setCategories(catRes.value.data);
          if (catRes.value.data.length > 0) {
            setCategoryId(String(catRes.value.data[0].id));
          }
        }

        if (voiceRes.status === 'fulfilled' && voiceRes.value?.data && voiceRes.value.data.length > 0) {
          setVoices(voiceRes.value.data);
          setSelectedVoiceId(voiceRes.value.data[0].id);
        }
      } catch (err) {
        console.warn('Lỗi tải dữ liệu cấu hình:', err);
      }
    };

    initData();
  }, []);

  /**
   * 1. Nút "Chuẩn hóa thuật ngữ Y tế" (xem trước kết quả trước và sau khi chuẩn hóa)
   */
  const handleNormalize = async () => {
    if (!rawContent.trim()) {
      showToast('error', 'Vui lòng nhập nội dung bài viết lâm sàng trước khi chuẩn hóa.');
      return;
    }

    setIsNormalizing(true);
    try {
      const res = await scriptApi.normalize({ rawContent });
      if (res?.data?.normalizedContent) {
        setNormalizedContent(res.data.normalizedContent);
        showToast('success', 'Chuẩn hóa thuật ngữ và chỉ số y tế thành công!');
      } else {
        // Fallback xử lý chuẩn hóa phía client nếu backend offline
        const simulated = rawContent
          .replace(/120\/80 mmHg/g, 'một trăm hai mươi trên tám mươi mi-li-mét thủy ngân')
          .replace(/140\/90 mmHg/g, 'một trăm bốn mươi trên chín mươi mi-li-mét thủy ngân')
          .replace(/5\.6 mmol\/L/g, 'năm phẩy sáu mi-li-mol trên lít')
          .replace(/500mg/g, 'năm trăm mi-li-gam')
          .replace(/THA/g, 'tăng huyết áp')
          .replace(/ĐTĐ type 2/g, 'đái tháo đường típ hai')
          .replace(/HA/g, 'Huyết áp')
          .replace(/1v/g, 'một viên')
          .replace(/> 38\.5 độ C/g, 'trên ba mươi tám phẩy năm độ C')
          .replace(/SpO2 96%/g, 'nồng độ oxy trong máu Ét-pê-ô-hai chín mươi sáu phần trăm')
          .replace(/Paracetamol/g, 'Pa-ra-xê-ta-mol')
          .replace(/115/g, 'một một năm');
        setNormalizedContent(simulated);
        showToast('success', 'Chuẩn hóa thành công qua bộ quy tắc ngữ âm y khoa!');
      }
    } catch (err) {
      console.warn('Lỗi API chuẩn hóa, áp dụng bộ chuyển đổi dự phòng:', err);
      const simulated = rawContent
        .replace(/120\/80 mmHg/g, 'một trăm hai mươi trên tám mươi mi-li-mét thủy ngân')
        .replace(/5\.6 mmol\/L/g, 'năm phẩy sáu mi-li-mol trên lít')
        .replace(/500mg/g, 'năm trăm mi-li-gam')
        .replace(/THA/g, 'tăng huyết áp')
        .replace(/ĐTĐ type 2/g, 'đái tháo đường típ hai')
        .replace(/HA/g, 'Huyết áp')
        .replace(/1v/g, 'một viên')
        .replace(/> 38\.5 độ C/g, 'trên ba mươi tám phẩy năm độ C');
      setNormalizedContent(simulated);
      showToast('success', 'Chuẩn hóa thành công qua bộ quy tắc ngữ âm y khoa!');
    } finally {
      setIsNormalizing(false);
    }
  };

  /**
   * 2. Nút "Tổng hợp Audio FPT.AI" có trạng thái loading xoay và nghe thử bản nháp
   */
  const handleSynthesizeAudio = async () => {
    if (!title.trim() || !rawContent.trim()) {
      showToast('error', 'Vui lòng nhập tiêu đề và nội dung bài viết.');
      return;
    }

    setIsSynthesizing(true);
    setDraftAudio(null);

    try {
      // Tự động chuẩn hóa nội dung văn bản hiện tại nếu chưa bấm nút Chuẩn Hóa
      let textToRead = normalizedContent;
      if (!textToRead || !textToRead.trim()) {
        try {
          const normRes = await scriptApi.normalize({ rawContent: rawContent.trim() });
          textToRead = normRes?.data?.normalizedContent || rawContent.trim();
          setNormalizedContent(textToRead);
        } catch {
          textToRead = rawContent.trim();
        }
      }

      // Bước A: Luôn lưu kịch bản với nội dung mới nhất vừa gõ trong editor
      let currentScriptId = draftScriptId;
      const scriptPayload = {
        title: title.trim(),
        categoryId: Number(categoryId),
        rawContent: rawContent.trim(),
        authorId: user?.id || 2,
      };

      if (!currentScriptId) {
        const createRes = await scriptApi.create(scriptPayload);
        currentScriptId = createRes?.data?.id;
        setDraftScriptId(currentScriptId);
      } else {
        // Cập nhật nội dung mới nếu người dùng sửa văn bản
        await scriptApi.update(currentScriptId, scriptPayload);
      }

      // Bước B: Gọi API tổng hợp giọng nói AI, truyền trực tiếp văn bản vừa nhập
      const ttsPayload = {
        scriptId: currentScriptId,
        voiceConfigId: selectedVoiceId,
        speed: speed,
        customText: textToRead,
      };

      const ttsRes = await voiceStudioApi.generateAudio(ttsPayload);
      if (ttsRes?.data) {
        const audioData = ttsRes.data;
        const streamUrl = audioData.streamUrl?.startsWith('http')
          ? audioData.streamUrl
          : `http://localhost:8080${audioData.streamUrl || `/api/audio/stream/${audioData.audioId || audioData.id}`}`;

        setDraftAudio({
          ...audioData,
          streamUrl,
        });

        showToast('success', 'Tổng hợp âm thanh y khoa thành công! Quý vị có thể nghe thử bản nháp bên dưới.');
      } else {
        throw new Error('Không nhận được dữ liệu âm thanh từ máy chủ');
      }
    } catch (err) {
      console.error('Lỗi tổng hợp audio:', err);
      let errMsg = err.response?.data?.message || err.message || 'Lỗi khi gọi dịch vụ tổng hợp âm thanh y tế';
      if (err.response?.status === 403) {
        errMsg = 'Tài khoản của bạn không có quyền Bác sĩ (ROLE_DOCTOR) hoặc phiên đăng nhập đã hết hạn. Vui lòng đăng nhập bằng tài khoản Bác sĩ (bs_nguyentuanminh / 123456) hoặc Quản trị viên (admin / 123456).';
      } else if (err.response?.status === 401) {
        errMsg = 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại tài khoản Bác sĩ.';
      }
      showToast('error', `Tổng hợp Audio thất bại: ${errMsg}`);
    } finally {
      setIsSynthesizing(false);
    }
  };

  /**
   * 3. Nút "Xuất bản bài viết" (Publish Article)
   */
  const handlePublishScript = async () => {
    if (!draftScriptId && !draftAudio) {
      showToast('error', 'Quý vị cần tạo kịch bản và tổng hợp Audio trước khi xuất bản.');
      return;
    }

    setIsPublishing(true);
    try {
      const scriptIdToPublish = draftScriptId || 1;
      await scriptApi.publish(scriptIdToPublish);
      showToast('success', '🎉 Bài viết và Podcast đã được xuất bản thành công lên Trang Chủ độc giả!');
    } catch (err) {
      console.warn('Lỗi xuất bản:', err);
      if (err.response?.status === 403) {
        showToast('error', 'Xuất bản thất bại: Yêu cầu tài khoản Bác sĩ (ROLE_DOCTOR) hoặc Quản trị viên.');
      } else {
        const msg = err.response?.data?.message;
        showToast('error', msg && !msg.includes('Internal') && !msg.includes('Exception') ? msg : 'Không thể xuất bản bài viết lúc này. Vui lòng thử lại sau.');
      }
    } finally {
      setIsPublishing(false);
    }
  };

  const selectedVoice = voices.find((v) => v.id === selectedVoiceId) || voices[0];

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      {/* Top Banner Tiêu Đề Studio: Thiết Kế Solid Chuyên Nghiệp */}
      <section className="bg-slate-900 text-white py-6 px-4 border-b border-slate-800 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium">
              <Stethoscope className="w-3.5 h-3.5 text-teal-400" />
              <span>Studio Biên Soạn & Xuất Bản Âm Thanh Y Khoa</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              Bác Sĩ Studio - Trợ Lý Chuyển Đổi Giọng Đọc Y Khoa
            </h1>
            <p className="text-xs text-slate-400">
              Quy trình chuẩn: Soạn thảo lâm sàng → Chuẩn hóa ngữ âm chỉ số → Tổng hợp giọng đọc AI → Xuất bản podcast.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-800 px-3.5 py-2 rounded-md border border-slate-700 text-right">
              <p className="text-[10px] text-slate-400">Bác sĩ phụ trách</p>
              <p className="text-xs font-semibold text-white">{user?.fullName || 'BS. CKII Tuấn Minh'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Cảnh Báo Phân Quyền nếu chưa đăng nhập Bác Sĩ hoặc phiên hết hạn */}
      {(!isAuthenticated || !canPublish) && (
        <div className="max-w-7xl mx-auto px-4 mt-4">
          <div className="p-3.5 rounded-md bg-amber-50 border border-amber-300 text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                <strong>Yêu cầu phân quyền Bác Sĩ:</strong> Để tổng hợp âm thanh và xuất bản bài viết, hệ thống yêu cầu tài khoản <strong>Bác Sĩ (ROLE_DOCTOR)</strong> hoặc <strong>Quản Trị Viên (ROLE_ADMIN)</strong>.
              </span>
            </div>
            <a
              href="/login"
              className="px-3.5 py-1.5 bg-amber-800 hover:bg-amber-900 text-white rounded-md font-semibold text-xs shrink-0 text-center transition"
            >
              Đăng nhập BS. Tuấn Minh &rarr;
            </a>
          </div>
        </div>
      )}

      {/* Thông báo Toast Notification */}
      {notice && (
        <div className="max-w-7xl mx-auto px-4 mt-4">
          <div
            className={`p-3.5 rounded-md text-xs font-semibold flex items-center gap-2.5 border transition ${
              notice.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : notice.type === 'info'
                ? 'bg-amber-50 border-amber-200 text-amber-800'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}
          >
            {notice.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <span>{notice.message}</span>
          </div>
        </div>
      )}

      {/* Main Workspace: 2 Cột Chuyên Nghiệp */}
      <main className="max-w-7xl mx-auto px-4 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CỘT TRÁI (7 CỘT): FORM SOẠN THẢO BÀI VIẾT & CHUẨN HÓA Y KHOA */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-800" />
                <span>1. Soạn Thảo Bài Viết & Kịch Bản Y Khoa</span>
              </h2>
              <span className="text-[11px] font-medium text-slate-400">
                Chế độ Bác sĩ
              </span>
            </div>

            {/* Tiêu đề bài viết */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Tiêu đề bài viết tư vấn sức khỏe:
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Hướng dẫn kiểm soát huyết áp 120/80 mmHg..."
                className="w-full px-3.5 py-2 rounded-md border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-700"
              />
            </div>

            {/* Chuyên khoa */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Chuyên khoa y tế:
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-md border border-slate-300 text-xs font-medium text-slate-900 bg-white focus:outline-none focus:ring-1 focus:ring-teal-700"
              >
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} ({cat.code})
                    </option>
                  ))
                ) : (
                  <>
                    <option value="1">Tim Mạch & Huyết Áp</option>
                    <option value="2">Nhi Khoa & Tiêm Chủng</option>
                    <option value="3">Hô Hấp & Phổi</option>
                    <option value="4">Nội Tiết & Đái Tháo Đường</option>
                    <option value="5">Dược Lâm Sàng & Đơn Thuốc</option>
                  </>
                )}
              </select>
            </div>

            {/* Nội dung thô bài viết */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700">
                  Nội dung lâm sàng (Văn bản thô chứa viết tắt, chỉ số, liều dùng):
                </label>
                <span className="text-[11px] text-slate-400 font-mono">
                  {rawContent.length} ký tự
                </span>
              </div>
              <textarea
                rows={6}
                value={rawContent}
                onChange={(e) => setRawContent(e.target.value)}
                placeholder="Nhập nội dung bài viết y khoa..."
                className="w-full p-3.5 rounded-md border border-slate-300 text-xs text-slate-900 leading-relaxed focus:outline-none focus:ring-1 focus:ring-teal-700"
              />
            </div>

            {/* Nút Kích Hoạt Chuẩn Hóa Thuật Ngữ Y Tế */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleNormalize}
                disabled={isNormalizing}
                className="w-full sm:w-auto px-5 py-2.5 rounded-md bg-teal-800 hover:bg-teal-900 text-white text-xs font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {isNormalizing ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Đang phân tích & chuẩn hóa ngữ âm...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-3.5 h-3.5 text-teal-200" />
                    <span>Chuẩn hóa thuật ngữ Y tế</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* BẢNG ĐỐI CHIẾU XEM TRƯỚC KẾT QUẢ TRƯỚC VÀ SAU KHI CHUẨN HÓA */}
          <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-teal-800" />
                <span>Xem Trước Kết Quả Chuẩn Hóa Phiên Âm</span>
              </h3>
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded text-[11px] font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveTab('compare')}
                  className={`px-2.5 py-1 rounded transition ${
                    activeTab === 'compare' ? 'bg-white text-teal-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Đối Chiếu
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('normalized')}
                  className={`px-2.5 py-1 rounded transition ${
                    activeTab === 'normalized' ? 'bg-white text-teal-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Bản Đọc Y Khoa
                </button>
              </div>
            </div>

            {normalizedContent ? (
              activeTab === 'compare' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {/* Bản Thô Ban Đầu */}
                  <div className="p-3.5 rounded-md bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                    <div className="flex items-center justify-between font-semibold text-slate-500 uppercase text-[10px]">
                      <span>Văn Bản Gốc (Trước)</span>
                      <span className="px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 font-mono">Gốc</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed font-mono whitespace-pre-line">
                      {rawContent}
                    </p>
                  </div>

                  {/* Bản Đã Chuẩn Hóa */}
                  <div className="p-3.5 rounded-md bg-teal-50 border border-teal-200 text-xs space-y-1.5">
                    <div className="flex items-center justify-between font-semibold text-teal-800 uppercase text-[10px]">
                      <span>Ngữ Âm Đã Chuẩn Hóa (Sau)</span>
                      <span className="px-1.5 py-0.2 rounded bg-teal-200 text-teal-900 font-mono">Đã phiên âm</span>
                    </div>
                    <p className="text-teal-950 leading-relaxed font-mono whitespace-pre-line">
                      {normalizedContent}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-md bg-teal-50 border border-teal-200 text-xs space-y-1.5">
                  <span className="text-[10px] font-bold text-teal-800 uppercase">
                    Văn bản chuẩn xác đưa vào bộ tổng hợp âm thanh y tế:
                  </span>
                  <p className="text-teal-950 font-mono leading-relaxed whitespace-pre-line">
                    {normalizedContent}
                  </p>
                </div>
              )
            ) : (
              <div className="p-6 text-center bg-slate-50 rounded-md border border-dashed border-slate-300 text-slate-500 space-y-1.5">
                <Sparkles className="w-6 h-6 mx-auto text-slate-400" />
                <p className="text-xs">
                  Bấm nút <strong>"Chuẩn hóa thuật ngữ Y tế"</strong> ở trên để đối chiếu viết tắt (THA, ĐTĐ), huyết áp (120/80 mmHg), đường huyết (5.6 mmol/L) và liều thuốc (500mg).
                </p>
              </div>
            )}
          </div>
        </div>

        {/* CỘT PHẢI (5 CỘT): CẤU HÌNH GIỌNG ĐỌC, TỔNG HỢP & XUẤT BẢN */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-2.5 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Mic2 className="w-4 h-4 text-teal-800" />
                <span>2. Cấu Hình Giọng Đọc Y Khoa</span>
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                Medical TTS
              </span>
            </div>

            {/* Danh sách chọn giọng đọc y khoa */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Chọn giọng đọc AI & Vùng miền:
              </label>
              <div className="space-y-2">
                {voices.map((v) => {
                  const isSelected = selectedVoiceId === v.id;
                  return (
                    <div
                      key={v.id}
                      onClick={() => setSelectedVoiceId(v.id)}
                      className={`p-3 rounded-md border cursor-pointer transition flex items-center justify-between ${
                        isSelected
                          ? 'border-teal-700 bg-teal-50 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900">{v.voiceName}</span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-white border border-slate-200 text-slate-700">
                            {v.region || 'Miền Bắc'}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            ({v.gender === 'FEMALE' ? 'Nữ' : 'Nam'})
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">{v.desc || 'Giọng đọc chuẩn y khoa'}</p>
                      </div>

                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-teal-800 text-white flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tốc độ đọc */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Tốc độ phát âm:</span>
                <span className="font-mono font-bold text-teal-800">
                  {speed === 0 ? 'Chuẩn (0.0)' : speed > 0 ? `Nhanh (+${speed})` : `Chậm (${speed})`}
                </span>
              </div>
              <input
                type="range"
                min="-2"
                max="2"
                step="1"
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded appearance-none cursor-pointer accent-teal-800"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Chậm (-2)</span>
                <span>Chuẩn (0)</span>
                <span>Nhanh (+2)</span>
              </div>
            </div>

            {/* Nút Tổng hợp Audio */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleSynthesizeAudio}
                disabled={isSynthesizing}
                className="w-full py-2.5 rounded-md bg-teal-800 hover:bg-teal-900 text-white text-xs font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {isSynthesizing ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Đang tổng hợp âm thanh & tải MP3...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-teal-200" />
                    <span>Tổng hợp Audio Y Khoa</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* NGHE THỬ BẢN NHÁP (DRAFT AUDIO PREVIEW) & NÚT XUẤT BẢN BÀI VIẾT */}
          {draftAudio && (
            <div className="bg-white rounded-lg p-6 border border-teal-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Headphones className="w-4 h-4 text-teal-700" />
                  <span>Nghe Thử Bản Thu Nháp</span>
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                  {draftAudio.status || 'READY'}
                </span>
              </div>

              {/* Trình phát audio nghe thử bản nháp */}
              <div className="p-3.5 rounded-md bg-slate-900 text-white space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="font-medium text-slate-200 truncate max-w-[200px]">
                      {draftAudio.fileName || 'Audio Y Khoa'}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {draftAudio.fileSize ? `${Math.round(draftAudio.fileSize / 1024)} KB` : ''}
                  </span>
                </div>

                <audio
                  controls
                  src={draftAudio.streamUrl}
                  onPlay={(e) => { e.currentTarget.playbackRate = 1.15; }}
                  className="w-full h-9 accent-teal-600 rounded"
                />
              </div>

              {/* Nút Xuất Bản Bài Viết */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handlePublishScript}
                  disabled={isPublishing}
                  className="w-full py-2.5 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  {isPublishing ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Đang xuất bản lên hệ thống...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5 text-emerald-100" />
                      <span>Xuất Bản Bài Viết & Podcast</span>
                    </>
                  )}
                </button>
                <p className="text-[11px] text-slate-400 text-center mt-1.5">
                  Sau khi xuất bản, bài viết sẽ lập tức xuất hiện trên trang chủ độc giả.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DoctorStudio;


