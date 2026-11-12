import React, { useState, useRef } from 'react';
import { 
  Bold, 
  Italic, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  Quote, 
  Minus, 
  Image as ImageIcon, 
  Eye, 
  Edit3, 
  Sparkles, 
  Plus, 
  X,
  CheckCircle2,
  AlertCircle,
  FolderOpen,
  Upload,
  RefreshCw
} from 'lucide-react';
import { podcastApi } from '../../api/endpoints';

const SAMPLE_MEDICAL_IMAGES = [
  { label: 'Thần kinh & Não bộ', url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop' },
  { label: 'Tim mạch & Ống nghe', url: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&auto=format&fit=crop' },
  { label: 'Sơ cứu khẩn cấp', url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop' },
  { label: 'Dược phẩm & Viên thuốc', url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop' },
  { label: 'Bác sĩ tư vấn', url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=800&auto=format&fit=crop' },
];

export function renderMedicalMarkdown(text) {
  if (!text) return null;
  const lines = text.split('\n');
  return lines.map((line, idx) => {
    const trimmed = line.trim();

    // H2 Heading
    if (trimmed.startsWith('## ')) {
      return (
        <h2 key={idx} className="text-xl font-bold text-slate-900 mt-6 mb-3 pb-1 border-b border-slate-200">
          {trimmed.replace('## ', '')}
        </h2>
      );
    }

    // H3 Heading
    if (trimmed.startsWith('### ')) {
      return (
        <h3 key={idx} className="text-base font-bold text-teal-900 mt-4 mb-2 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-700" />
          {trimmed.replace('### ', '')}
        </h3>
      );
    }

    // Image: ![alt](url)
    const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
    if (imgMatch) {
      const alt = imgMatch[1] || 'Ảnh minh họa y khoa';
      const src = imgMatch[2];
      return (
        <figure key={idx} className="my-4 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shadow-xs">
          <img src={src} alt={alt} className="w-full max-h-80 object-cover" />
          {alt && <figcaption className="p-2 text-center text-xs text-slate-500 italic bg-white border-t border-slate-100">{alt}</figcaption>}
        </figure>
      );
    }

    // Blockquote: > text
    if (trimmed.startsWith('> ')) {
      const q = trimmed.replace(/^>\s+/, '');
      return (
        <blockquote key={idx} className="my-3 p-3 border-l-4 border-teal-600 bg-teal-50/70 rounded-r-md text-slate-800 text-xs sm:text-sm italic">
          <span dangerouslySetInnerHTML={{ __html: highlightFormatting(q) }} />
        </blockquote>
      );
    }

    // Divider
    if (trimmed === '---') {
      return <hr key={idx} className="my-5 border-slate-200" />;
    }

    // Bullet list
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      const item = trimmed.replace(/^(\*|-)\s+/, '');
      return (
        <li key={idx} className="ml-5 list-disc text-slate-700 text-xs sm:text-sm my-1">
          <span dangerouslySetInnerHTML={{ __html: highlightFormatting(item) }} />
        </li>
      );
    }

    // Numbered list
    if (/^\d+\.\s+/.test(trimmed)) {
      const item = trimmed.replace(/^\d+\.\s+/, '');
      return (
        <li key={idx} className="ml-5 list-decimal text-slate-700 text-xs sm:text-sm my-1 font-medium">
          <span dangerouslySetInnerHTML={{ __html: highlightFormatting(item) }} />
        </li>
      );
    }

    // Empty line
    if (!trimmed) {
      return <div key={idx} className="h-2" />;
    }

    // Normal paragraph
    return (
      <p
        key={idx}
        className="text-slate-700 text-xs sm:text-sm leading-relaxed my-1.5"
        dangerouslySetInnerHTML={{ __html: highlightFormatting(line) }}
      />
    );
  });
}

function highlightFormatting(str) {
  if (!str) return '';
  return str
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="text-teal-900 font-medium">$1</em>')
    .replace(/(140\/90\s*mmHg|180\/120\s*mmHg|130\/80\s*mmHg)/g, '<span class="bg-rose-100 text-rose-900 font-bold px-1.5 py-0.5 rounded font-mono text-xs">$1</span>')
    .replace(/(115|Cấp cứu 115)/g, '<span class="bg-rose-700 text-white font-bold px-1.5 py-0.5 rounded font-mono text-xs">☎ $1</span>');
}

export default function MedicalMarkdownEditor({
  value,
  onChange,
  placeholder = 'Nhập nội dung bài viết lâm sàng (hỗ trợ in đậm, in nghiêng, tiêu đề, hình ảnh)...',
  rows = 10,
  minHeight = '240px'
}) {
  const [mode, setMode] = useState('write'); // 'write' | 'preview'
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [customImgUrl, setCustomImgUrl] = useState('');
  const [customImgAlt, setCustomImgAlt] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleUploadImageFromPC = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn một file hình ảnh hợp lệ (JPG, PNG, WEBP, GIF).');
      return;
    }

    setUploadingImage(true);
    try {
      const res = await podcastApi.uploadImage(file);
      const url = res?.data?.url || res?.url;
      if (url) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '');
        handleInsertImage(url, cleanName);
      }
    } catch (err) {
      console.warn('Lỗi tải ảnh lên backend, dùng base64 dự phòng:', err);
      const reader = new FileReader();
      reader.onloadend = () => {
        handleInsertImage(reader.result, file.name.replace(/\.[^/.]+$/, ''));
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Thao tác chèn cú pháp Markdown tại con trỏ
  const insertSyntax = (prefix, suffix = '', defaultText = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentVal = textarea.value;

    const selectedText = currentVal.substring(start, end) || defaultText;
    const replacement = `${prefix}${selectedText}${suffix}`;

    const newVal = currentVal.substring(0, start) + replacement + currentVal.substring(end);
    onChange(newVal);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 10);
  };

  const handleInsertImage = (url, altText) => {
    const alt = altText.trim() || 'Ảnh minh họa y khoa';
    insertSyntax(`\n![${alt}](`, ')\n', url);
    setShowImagePicker(false);
    setCustomImgUrl('');
    setCustomImgAlt('');
  };

  return (
    <div className="border border-slate-300 rounded-lg overflow-hidden bg-white shadow-xs focus-within:ring-2 focus-within:ring-teal-700 focus-within:border-teal-700">
      {/* ── Toolbar Header ── */}
      <div className="bg-slate-50 border-b border-slate-200 px-3 py-2 flex flex-wrap items-center justify-between gap-2">
        {/* Formatting Actions */}
        <div className="flex items-center gap-1 flex-wrap">
          <button
            type="button"
            onClick={() => insertSyntax('**', '**', 'văn bản in đậm')}
            title="In đậm (Bold: **text**)"
            className="p-1.5 rounded text-slate-700 hover:text-slate-900 hover:bg-slate-200 font-bold text-xs"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertSyntax('*', '*', 'văn bản in nghiêng')}
            title="In nghiêng (Italic: *text*)"
            className="p-1.5 rounded text-slate-700 hover:text-slate-900 hover:bg-slate-200 italic text-xs"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>

          <span className="h-4 w-px bg-slate-300 mx-1" />

          <button
            type="button"
            onClick={() => insertSyntax('\n## ', '', 'Tiêu đề chính H2')}
            title="Tiêu đề chính (## Tiêu đề)"
            className="p-1.5 rounded text-slate-700 hover:text-slate-900 hover:bg-slate-200 text-xs font-bold"
          >
            <Heading2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertSyntax('\n### ', '', 'Tiêu đề phụ H3')}
            title="Tiêu đề phụ (### Tiêu đề)"
            className="p-1.5 rounded text-slate-700 hover:text-slate-900 hover:bg-slate-200 text-xs font-semibold"
          >
            <Heading3 className="w-3.5 h-3.5" />
          </button>

          <span className="h-4 w-px bg-slate-300 mx-1" />

          <button
            type="button"
            onClick={() => insertSyntax('\n- ', '', 'Mục danh sách')}
            title="Danh sách gạch đầu dòng (- Mục)"
            className="p-1.5 rounded text-slate-700 hover:text-slate-900 hover:bg-slate-200 text-xs"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertSyntax('\n1. ', '', 'Mục bước 1')}
            title="Danh sách số (1. Mục)"
            className="p-1.5 rounded text-slate-700 hover:text-slate-900 hover:bg-slate-200 text-xs"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertSyntax('\n> ', '', 'Lời dặn lâm sàng quan trọng')}
            title="Khung trích dẫn lời dặn (> Lời dặn)"
            className="p-1.5 rounded text-slate-700 hover:text-slate-900 hover:bg-slate-200 text-xs"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertSyntax('\n---\n', '')}
            title="Đường phân cách (---)"
            className="p-1.5 rounded text-slate-700 hover:text-slate-900 hover:bg-slate-200 text-xs"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          <span className="h-4 w-px bg-slate-300 mx-1" />

          {/* Nút Chèn ảnh */}
          <button
            type="button"
            onClick={() => setShowImagePicker(p => !p)}
            title="Chèn ảnh minh họa y khoa"
            className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition ${
              showImagePicker ? 'bg-teal-700 text-white' : 'text-teal-800 bg-teal-50 hover:bg-teal-100'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Chèn ảnh</span>
          </button>
        </div>

        {/* View Switcher: Soạn thảo vs Xem trước */}
        <div className="flex items-center bg-white border border-slate-200 rounded p-0.5">
          <button
            type="button"
            onClick={() => setMode('write')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition flex items-center gap-1 ${
              mode === 'write' ? 'bg-teal-800 text-white font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Edit3 className="w-3 h-3" /> Soạn thảo
          </button>
          <button
            type="button"
            onClick={() => setMode('preview')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition flex items-center gap-1 ${
              mode === 'preview' ? 'bg-teal-800 text-white font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3 h-3" /> Xem trước
          </button>
        </div>
      </div>

      {/* ── Image Picker Popup Panel ── */}
      {showImagePicker && (
        <div className="p-3 bg-teal-50/80 border-b border-teal-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-teal-700" />
              Chèn ảnh minh họa y khoa vào bài viết:
            </span>
            <button
              type="button"
              onClick={() => setShowImagePicker(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chọn ảnh trực tiếp từ máy tính */}
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleUploadImageFromPC}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage}
              className="w-full sm:w-auto px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded text-xs font-bold flex items-center justify-center gap-2 transition shadow-xs disabled:opacity-50"
            >
              {uploadingImage ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang tải ảnh từ máy tính lên máy chủ...</span>
                </>
              ) : (
                <>
                  <FolderOpen className="w-4 h-4 text-teal-200" />
                  <span>Mở thư mục chọn ảnh từ máy tính</span>
                </>
              )}
            </button>
            <span className="text-[11px] text-slate-500 italic hidden sm:inline">
              (Ảnh sẽ được chèn tự động vào bài viết sau khi chọn)
            </span>
          </div>

          {/* Hoặc dán liên kết URL ảnh nếu cần */}
          <div className="pt-1 border-t border-teal-200/60">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={customImgUrl}
                onChange={e => setCustomImgUrl(e.target.value)}
                placeholder="Hoặc dán URL ảnh (https://...)"
                className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-700"
              />
              <input
                type="text"
                value={customImgAlt}
                onChange={e => setCustomImgAlt(e.target.value)}
                placeholder="Mô tả chú thích ảnh (tùy chọn)"
                className="sm:w-56 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-700"
              />
              <button
                type="button"
                onClick={() => customImgUrl.trim() && handleInsertImage(customImgUrl, customImgAlt)}
                disabled={!customImgUrl.trim()}
                className="px-3 py-1.5 bg-teal-800 text-white rounded text-xs font-bold hover:bg-teal-900 disabled:opacity-50 transition"
              >
                Chèn
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-[11px] font-semibold text-slate-500">Gợi ý ảnh y tế Unsplash 1 chạm:</span>
            {SAMPLE_MEDICAL_IMAGES.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleInsertImage(img.url, img.label)}
                className="text-[10px] px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 hover:border-teal-600 hover:text-teal-900 transition"
              >
                + {img.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Editor or Preview ── */}
      {mode === 'write' ? (
        <textarea
          ref={textareaRef}
          rows={rows}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ minHeight }}
          className="w-full p-3.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none resize-y leading-relaxed font-mono"
        />
      ) : (
        <div 
          style={{ minHeight }} 
          className="p-4 bg-white overflow-y-auto max-h-96 prose prose-slate max-w-none"
        >
          {value.trim() ? (
            renderMedicalMarkdown(value)
          ) : (
            <p className="text-xs text-slate-400 italic">Chưa có nội dung. Chuyển sang tab "Soạn thảo" để nhập văn bản bài viết.</p>
          )}
        </div>
      )}
    </div>
  );
}

