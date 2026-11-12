import React, { useState } from 'react';
import { 
  X, 
  Search, 
  BookOpen, 
  Volume2, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight,
  Filter,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { useAudioPlayer } from '../../context/AudioContext';

export const MedicalLexiconModal = () => {
  const { isLexiconOpen, closeLexicon } = useAudioPlayer();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [testInput, setTestInput] = useState('Bệnh nhân HA 135/85 mmHg uống Paracetamol 500mg 1v sau khi ăn.');
  const [testOutput, setTestOutput] = useState('');

  if (!isLexiconOpen) return null;

  const dictionary = [
    {
      term: 'HA 140/90 mmHg',
      category: 'Tim Mạch',
      phonetic: 'Huyết áp một trăm bốn mươi trên chín mươi mi-li-mét thủy ngân',
      explanation: 'Chỉ số đo huyết áp tâm thu và tâm trương chuẩn quốc tế.',
      importance: 'Cao - Cần đọc đúng nhịp để bệnh nhân nghe rõ hai chỉ số.',
    },
    {
      term: 'SpO2 96%',
      category: 'Hô Hấp',
      phonetic: 'Nồng độ oxy trong máu Ét-pê-ô-hai chín mươi sáu phần trăm',
      explanation: 'Độ bão hòa oxy trong máu đo qua kẹp đầu ngón tay.',
      importance: 'Cao - Thường gặp trong tư vấn theo dõi COVID-19 và hen phế quản.',
    },
    {
      term: 'Paracetamol 500mg',
      category: 'Dược Lâm Sàng',
      phonetic: 'Pa-ra-xê-ta-mol năm trăm mi-li-gam',
      explanation: 'Thuốc giảm đau hạ sốt phổ biến nhất.',
      importance: 'Cực kỳ quan trọng - Tránh nhầm lẫn liều lượng người lớn và trẻ em.',
    },
    {
      term: 'Amoxicillin 500mg',
      category: 'Dược Lâm Sàng',
      phonetic: 'A-mốc-xi-xi-lin năm trăm mi-li-gam',
      explanation: 'Kháng sinh nhóm Penicillin điều trị nhiễm khuẩn.',
      importance: 'Quan trọng - Giúp người bệnh nhận biết đúng tên thuốc khi nghe.',
    },
    {
      term: '1v x 2 lần/ngày',
      category: 'Dược Lâm Sàng',
      phonetic: 'uống một viên nhân hai lần mỗi ngày',
      explanation: 'Ký hiệu kê đơn liều dùng hàng ngày của Bác sĩ.',
      importance: 'Cực kỳ quan trọng - Tránh phát âm sai thành chữ cái "vê".',
    },
    {
      term: 'HbA1c 7.2%',
      category: 'Nội Tiết',
      phonetic: 'Hát-bê-a-một-xê bảy phẩy hai phần trăm',
      explanation: 'Chỉ số đánh giá kiểm soát đường huyết trung bình trong 3 tháng.',
      importance: 'Cao - Thuật ngữ then chốt trong theo dõi đái tháo đường.',
    },
    {
      term: 'BMI 24.5 kg/m²',
      category: 'Dinh Dưỡng',
      phonetic: 'Bê-em-i hai mươi tư phẩy năm ki-lô-gam trên mét vuông',
      explanation: 'Chỉ số khối cơ thể đánh giá thể trạng dinh dưỡng.',
      importance: 'Trung bình - Hướng dẫn đánh giá thừa cân, béo phì.',
    },
    {
      term: '> 38.5°C',
      category: 'Nhi Khoa',
      phonetic: 'trên ba mươi tám phẩy năm độ C',
      explanation: 'Ngưỡng nhiệt độ cần can thiệp thuốc hạ sốt ở trẻ nhỏ.',
      importance: 'Cao - Giúp phụ huynh nhận diện mốc dùng thuốc.',
    },
    {
      term: 'mg/dL & mmol/L',
      category: 'Xét Nghiệm',
      phonetic: 'mi-li-gam trên đề-xi-lít và mi-li-mol trên lít',
      explanation: 'Đơn vị đo nồng độ đường huyết và sinh hóa máu.',
      importance: 'Cao - Bệnh nhân tiểu đường thường xuyên đọc máy đo tại nhà.',
    },
  ];

  const categories = ['ALL', 'Tim Mạch', 'Hô Hấp', 'Dược Lâm Sàng', 'Nội Tiết', 'Dinh Dưỡng', 'Nhi Khoa', 'Xét Nghiệm'];

  const filtered = dictionary.filter(item => {
    const matchCat = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchSearch = item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        item.phonetic.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        item.explanation.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleTestNormalize = () => {
    let out = testInput;
    dictionary.forEach(d => {
      // Simple regex test
      const reg = new RegExp(d.term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi');
      out = out.replace(reg, d.phonetic);
    });
    // Add generic patterns
    out = out.replace(/\bHA\s*(\d+)\/(\d+)\s*mmHg\b/gi, 'Huyết áp $1 trên $2 mi-li-mét thủy ngân');
    out = out.replace(/\b1v\b/gi, 'một viên');
    out = out.replace(/\b2v\b/gi, 'hai viên');
    setTestOutput(out);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-lg shadow-xl border border-slate-300 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-teal-800 flex items-center justify-center text-teal-200">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Từ Điển Thuật Ngữ Y Khoa & Quy Chuẩn Ngữ Âm VoiceStudio
              </h2>
              <p className="text-xs text-slate-300">
                Chuẩn hóa các ký hiệu viết tắt, đơn vị đo lường và tên dược phẩm theo ngữ âm tiếng Việt
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeLexicon}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Categories Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo thuật ngữ (HA, SpO2, Paracetamol...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-md border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-teal-700 focus:border-teal-700 transition"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-teal-800 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat === 'ALL' ? 'Tất cả' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Content list & Live Interactive Tester */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Interactive Tester Box */}
          <div className="bg-teal-50/50 p-4 rounded-md border border-teal-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-teal-700" />
                Kiểm Thử Chuẩn Hóa Ngữ Âm Trực Tiếp (Live Demo)
              </span>
              <button
                type="button"
                onClick={handleTestNormalize}
                className="px-3 py-1.5 bg-teal-800 hover:bg-teal-900 text-white rounded-md text-xs font-semibold transition flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Chuẩn hóa ngay
              </button>
            </div>
            <input
              type="text"
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              placeholder="Nhập câu chứa ký hiệu y khoa..."
              className="w-full px-3 py-2 bg-white rounded-md border border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-teal-700 focus:border-teal-700 font-mono"
            />
            {testOutput && (
              <div className="p-3 bg-white rounded-md border border-teal-300 text-xs text-slate-800 space-y-1 animate-in fade-in">
                <span className="font-semibold text-teal-900 block">Âm thanh phát ra sẽ đọc thành:</span>
                <p className="font-mono text-teal-950 font-medium leading-relaxed">{testOutput}</p>
              </div>
            )}
          </div>

          {/* Lexicon Table */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-md border border-slate-200 bg-white hover:border-teal-500 transition space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                    {item.term}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                    {item.category}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Phiên âm ngữ VoiceStudio:</span>
                  <p className="text-xs font-semibold text-teal-800 leading-snug">{item.phonetic}</p>
                </div>

                <p className="text-xs text-slate-500">{item.explanation}</p>

                <div className="pt-2 border-t border-slate-100 flex items-center gap-1 text-[11px] text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                  <span>Độ ưu tiên: {item.importance}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalLexiconModal;
