import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Sparkles, 
  Volume2, 
  Play, 
  Pause, 
  Upload, 
  Image as ImageIcon, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  Stethoscope,
  Clock,
  Trash2,
  FolderOpen
} from 'lucide-react';
import { podcastApi } from '../../api/endpoints';
import MedicalMarkdownEditor from '../common/MedicalMarkdownEditor';

const CATEGORIES = [
  { id: 'TIM_MACH', name: 'Tim Mạch & Huyết Áp' },
  { id: 'THAN_KINH', name: 'Thần Kinh & Đột Quỵ' },
  { id: 'TIEU_HOA', name: 'Tiêu Hóa & Dạ Dày' },
  { id: 'HO_HAP', name: 'Hô Hấp & Bệnh Theo Mùa' },
  { id: 'DINH_DUONG', name: 'Dinh Dưỡng & Lối Sống Lành Mạnh' },
  { id: 'DUOC_PHAM', name: 'Thuốc & Dược Liệu Hướng Dẫn' },
];

export default function CreatePodcastModal({ isOpen, onClose, onSuccess, initialData = null }) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [category, setCategory] = useState(initialData?.category || 'TIM_MACH');
  const [summary, setSummary] = useState(initialData?.summary || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [thumbnailUrl, setThumbnailUrl] = useState(initialData?.thumbnailUrl || '');
  const [defaultVoice, setDefaultVoice] = useState(initialData?.defaultVoice || 'banmai');
  
  // Trạng thái chọn file ảnh từ máy tính
  const [imagePreview, setImagePreview] = useState(initialData?.thumbnailUrl || null);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Trạng thái preview giọng đọc
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewAudioUrl, setPreviewAudioUrl] = useState(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const audioPreviewRef = useRef(null);

  // Trạng thái submit & tiến trình tổng hợp
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);

  // Đồng bộ toàn bộ dữ liệu bài viết (tiêu đề, chuyên khoa, ảnh bìa, tóm tắt, nội dung) khi mở modal hoặc chỉnh sửa
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title || '');
        setCategory(initialData.category || 'TIM_MACH');
        setSummary(initialData.summary || '');
        setContent(initialData.content || '');
        setThumbnailUrl(initialData.thumbnailUrl || '');
        setDefaultVoice(initialData.defaultVoice || 'banmai');
        setImagePreview(initialData.thumbnailUrl || null);
        setSelectedFileName(
          initialData.thumbnailUrl 
            ? (initialData.title ? `Ảnh bài viết: ${initialData.title.slice(0, 35)}...` : 'Ảnh bìa hiện tại')
            : ''
        );
        setPreviewAudioUrl(initialData.audioUrl || null);
      } else {
        setTitle('');
        setCategory('TIM_MACH');
        setSummary('');
        setContent('');
        setThumbnailUrl('');
        setDefaultVoice('banmai');
        setImagePreview(null);
        setSelectedFileName('');
        setPreviewAudioUrl(null);
      }
      setIsPlayingPreview(false);
      setErrorMsg(null);
      setIsSubmitting(false);
      setSubmitProgress('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
      }
    }
  }, [isOpen, initialData]);

  // Xử lý chọn file ảnh từ thư mục máy tính
  const processImageFile = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Vui lòng chọn file hình ảnh hợp lệ (JPG, PNG, WEBP, GIF).');
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setErrorMsg('Kích thước ảnh không được vượt quá 25MB.');
      return;
    }

    setErrorMsg(null);
    setSelectedFileName(file.name);

    // Hiển thị preview ngay lập tức
    const localUrl = URL.createObjectURL(file);
    setImagePreview(localUrl);

    // Tải ảnh lên máy chủ lưu trữ
    setUploadingImage(true);
    try {
      const res = await podcastApi.uploadImage(file);
      const data = res?.data || res;
      if (data?.url) {
        setThumbnailUrl(data.url);
      } else {
        // Fallback Base64 nếu máy chủ không trả url
        const reader = new FileReader();
        reader.onloadend = () => setThumbnailUrl(reader.result);
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.warn('Tải ảnh lên máy chủ gặp trục trặc, sử dụng base64 dự phòng:', err);
      const reader = new FileReader();
      reader.onloadend = () => setThumbnailUrl(reader.result);
      reader.readAsDataURL(file);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setThumbnailUrl('');
    setSelectedFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Xử lý nghe thử phát âm AI
  const handlePreviewVoice = async () => {
    const textToPreview = summary.trim() || title.trim();
    if (!textToPreview) {
      setErrorMsg('Vui lòng nhập Tiêu đề hoặc Tóm tắt để nghe thử phát âm AI.');
      return;
    }

    setErrorMsg(null);
    setPreviewLoading(true);
    try {
      const res = await podcastApi.previewVoice({
        text: textToPreview,
        voiceCode: defaultVoice,
      });
      const data = res?.data || res;
      if (data?.audioUrl) {
        setPreviewAudioUrl(data.audioUrl);
        if (audioPreviewRef.current) {
          audioPreviewRef.current.pause();
        }
        const audio = new Audio(data.audioUrl);
        audioPreviewRef.current = audio;
        audio.play();
        setIsPlayingPreview(true);
        audio.onended = () => setIsPlayingPreview(false);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Không thể nghe thử phát âm. Vui lòng kiểm tra kết nối microservice TTS.');
    } finally {
      setPreviewLoading(false);
    }
  };

  const togglePlayPreview = () => {
    if (!audioPreviewRef.current) return;
    if (isPlayingPreview) {
      audioPreviewRef.current.pause();
      setIsPlayingPreview(false);
    } else {
      audioPreviewRef.current.play();
      setIsPlayingPreview(true);
    }
  };

  // Lưu bản nháp hoặc Xuất bản bài viết
  const handleSubmit = async (publishStatus) => {
    if (!title.trim() || !summary.trim() || !content.trim()) {
      setErrorMsg('Vui lòng điền đầy đủ Tiêu đề, Tóm tắt và Nội dung bài viết.');
      return;
    }

    if (!thumbnailUrl && !imagePreview) {
      setErrorMsg('Vui lòng mở thư mục và chọn ảnh bìa cho bài viết từ máy tính.');
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);
    if (publishStatus === 'PUBLISHED') {
      setSubmitProgress(
        initialData?.id 
          ? 'Đang cập nhật bài viết lâm sàng và đồng bộ dữ liệu...' 
          : 'Hệ thống đang chuẩn hóa y khoa và tổng hợp giọng đọc y tế...'
      );
    } else {
      setSubmitProgress(initialData?.id ? 'Đang lưu cập nhật bản nháp...' : 'Đang lưu bản nháp...');
    }

    try {
      const payload = {
        title: title.trim(),
        category,
        summary: summary.trim(),
        content: content.trim(),
        thumbnailUrl: thumbnailUrl || imagePreview,
        defaultVoice,
        status: publishStatus,
      };

      if (initialData?.id) {
        await podcastApi.updatePodcast(initialData.id, payload);
      } else {
        await podcastApi.createPodcast(payload);
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Có lỗi xảy ra khi lưu bài viết.');
    } finally {
      setIsSubmitting(false);
      setSubmitProgress('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-teal-800 text-white flex items-center justify-center font-bold shadow-xs">
              <Stethoscope className="w-5 h-5 text-teal-200" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {initialData?.id ? 'Chỉnh Sửa Bài Viết Sức Khỏe' : 'Soạn Thảo Bài Viết & Xuất Bản Podcast Y Khoa'}
              </h3>
              <p className="text-xs text-slate-500">
                Tự động chuẩn hóa từ điển y tế và sinh file giọng đọc chuẩn cho bệnh nhân nghe
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Tiêu đề & Chuyên khoa */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Tiêu đề bài viết lâm sàng <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Ví dụ: Nhận diện sớm quy tắc FAST trong 4 giờ vàng cấp cứu đột quỵ não..."
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:border-teal-700"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Chuyên khoa y tế <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:border-teal-700"
              >
                {CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ============================================================== */}
          {/* Ảnh bìa bài viết: CHỌN TRỰC TIẾP TỪ THƯ MỤC MÁY TÍNH (NO LINK) */}
          {/* ============================================================== */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Ảnh bìa bài viết (Chọn trực tiếp từ máy tính) <span className="text-rose-500">*</span></span>
              {imagePreview && (
                <span className="text-[11px] text-teal-800 font-normal">
                  Đã chọn ảnh bìa
                </span>
              )}
            </label>

            {/* Hidden Input file */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/png, image/jpeg, image/jpg, image/webp"
              onChange={handleFileChange}
              className="hidden"
            />

            {!imagePreview ? (
              /* Khung bấm mở thư mục máy tính khi chưa có ảnh */
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`cursor-pointer border-2 border-dashed rounded-xl p-6 text-center transition flex flex-col items-center justify-center gap-2.5 ${
                  isDragging 
                    ? 'border-teal-700 bg-teal-50/60' 
                    : 'border-slate-300 hover:border-teal-700 hover:bg-slate-50/70 bg-slate-50/30'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center shadow-2xs">
                  <FolderOpen className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-800">
                    Nhấn vào đây để mở thư mục chọn ảnh từ máy tính
                  </p>
                  <p className="text-xs text-slate-500">
                    Hoặc kéo và thả file ảnh vào khung này • Hỗ trợ định dạng JPG, PNG, WEBP (tối đa 25MB)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="mt-1 px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs transition"
                >
                  <FolderOpen className="w-4 h-4 text-teal-200" />
                  <span>Mở thư mục chọn ảnh</span>
                </button>
              </div>
            ) : (
              /* Khung xem trước ảnh đã chọn kèm nút đổi ảnh và xóa */
              <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50 p-4 flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-full sm:w-48 h-32 rounded-lg overflow-hidden border border-slate-200 bg-slate-200 shrink-0 shadow-xs">
                  <img
                    src={imagePreview}
                    alt="Ảnh bìa đã chọn"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  {uploadingImage && (
                    <div className="absolute inset-0 bg-slate-900/50 flex flex-col items-center justify-center text-white text-xs gap-1">
                      <RefreshCw className="w-5 h-5 animate-spin text-teal-300" />
                      <span>Đang tải lên...</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 w-full space-y-2 text-left">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-xs font-bold text-slate-800 truncate">
                      {selectedFileName || 'Ảnh bìa y khoa'}
                    </span>
                  </div>

                  {uploadingImage ? (
                    <div className="space-y-1">
                      <p className="text-xs text-teal-800 font-medium flex items-center gap-1.5">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Đang đồng bộ ảnh vào hệ thống lưu trữ...
                      </p>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-teal-700 h-full w-2/3 animate-pulse"></div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">
                      Ảnh bìa đã được tải lên và sẵn sàng xuất bản cùng Podcast y khoa.
                    </p>
                  )}

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-md text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition shadow-2xs"
                    >
                      <FolderOpen className="w-3.5 h-3.5 text-teal-700" />
                      <span>Chọn ảnh khác từ máy</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md text-xs font-semibold text-rose-700 flex items-center gap-1.5 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xóa ảnh</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tóm tắt */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Tóm tắt ngắn (Phát âm mở đầu bản tin) <span className="text-rose-500">*</span>
              </label>
              <span className={`text-[11px] font-mono ${summary.length > 300 ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>
                {summary.length}/300 ký tự
              </span>
            </div>
            <textarea
              rows={2}
              value={summary}
              onChange={e => setSummary(e.target.value)}
              placeholder="Tóm tắt ngắn gọn dưới 300 ký tự giải thích lý do bài viết này quan trọng..."
              maxLength={300}
              className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:border-teal-700"
            />
          </div>

          {/* Giọng đọc chuẩn y khoa & Nút Nghe thử */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-800 text-white flex items-center justify-center font-bold text-xs">
                  <Volume2 className="w-4 h-4 text-teal-200" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800">
                    Giọng đọc y tế chuẩn: Nữ miền Bắc truyền cảm
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Phát âm chuẩn xác số đo lâm sàng, tên thuốc và từ viết tắt
                  </p>
                </div>
              </div>

              {/* Nút đặc biệt: Nghe thử phát âm AI */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePreviewVoice}
                  disabled={previewLoading}
                  className="inline-flex items-center gap-2 px-3.5 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-lg text-xs font-bold transition shadow-xs disabled:opacity-50"
                >
                  {previewLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Đang sinh âm mẫu...
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-teal-300" />
                      🎧 Nghe thử phát âm
                    </>
                  )}
                </button>

                {previewAudioUrl && (
                  <button
                    type="button"
                    onClick={togglePlayPreview}
                    className="p-2 rounded-lg bg-teal-100 text-teal-900 hover:bg-teal-200 transition"
                    title={isPlayingPreview ? 'Tạm dừng' : 'Phát lại'}
                  >
                    {isPlayingPreview ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Nội dung chi tiết bài viết */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Nội dung lâm sàng chi tiết (Hỗ trợ in đậm, in nghiêng, tiêu đề & chèn ảnh) <span className="text-rose-500">*</span>
              </label>
            </div>
            <MedicalMarkdownEditor
              value={content}
              onChange={setContent}
              placeholder="Nhập nội dung bài viết lâm sàng chi tiết... Nhấn B để in đậm, I để in nghiêng, Chèn ảnh hoặc nhấn tab 'Xem trước' để kiểm tra giao diện bài đọc."
              rows={9}
              minHeight="220px"
            />
          </div>
        </div>

        {/* Progress notification during synthesis */}
        {submitProgress && (
          <div className="px-6 py-2.5 bg-teal-50 border-t border-teal-100 flex items-center gap-3">
            <RefreshCw className="w-4 h-4 text-teal-700 animate-spin" />
            <span className="text-xs font-bold text-teal-900">{submitProgress}</span>
          </div>
        )}

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-white flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
          >
            Hủy Bỏ
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit('DRAFT')}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold transition disabled:opacity-50"
            >
              Lưu Bản Nháp
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit('PUBLISHED')}
              className="px-5 py-2.5 bg-teal-800 hover:bg-teal-900 text-white rounded-lg text-xs font-bold shadow-sm transition flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  {initialData?.id ? 'Đang Lưu...' : 'Đang Xuất Bản...'}
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-teal-300" />
                  {initialData?.id ? 'Lưu Thay Đổi & Cập Nhật' : 'Xuất Bản Bài Viết & Podcast'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
