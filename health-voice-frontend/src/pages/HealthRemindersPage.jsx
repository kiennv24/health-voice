import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  Clock,
  Plus,
  Trash2,
  Volume2,
  CheckCircle2,
  AlertCircle,
  Pill,
  Sparkles,
  Play,
  Pause,
  AlertTriangle,
  RefreshCw,
  Info
} from 'lucide-react';
import { reminderApi } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';

const VOICES = [
  { id: 'banmai', name: 'Giọng Nữ Miền Bắc', gender: 'Nữ', region: 'Miền Bắc', engine: 'Y Khoa', desc: 'Chuẩn âm phổ thông, ân cần' },
];

const PRESETS = [
  {
    medicineName: 'Amlodipin 5mg',
    dosage: '1 viên sau khi ăn sáng',
    reminderTime: '08:00',
    note: 'Uống cùng nhiều nước ấm và nhớ kiểm tra lại huyết áp sau 30 phút.',
    voiceCode: 'banmai',
  },
  {
    medicineName: 'Omeprazole 20mg (Thuốc dạ dày)',
    dosage: '1 viên trước khi ăn sáng 30 phút',
    reminderTime: '06:30',
    note: 'Uống nguyên viên với nước ấm, không nhai hoặc nghiền thuốc.',
    voiceCode: 'banmai',
  },
  {
    medicineName: 'Paracetamol 500mg',
    dosage: '1 viên khi sốt trên 38.5 độ',
    reminderTime: '12:00',
    note: 'Chỉ uống khi cần thiết, mỗi lần uống cách nhau tối thiểu 4 đến 6 tiếng.',
    voiceCode: 'banmai',
  },
  {
    medicineName: 'Metformin 500mg (Tiểu đường)',
    dosage: '1 viên ngay trong bữa ăn tối',
    reminderTime: '18:30',
    note: 'Uống trong bữa ăn để tránh kích ứng dạ dày. Đừng quên ăn tối đúng giờ.',
    voiceCode: 'banmai',
  },
];

export const HealthRemindersPage = () => {
  const { user } = useAuth();
  const [reminders, setReminders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState(null);

  // Form state
  const [medicineName, setMedicineName] = useState('');
  const [dosage, setDosage] = useState('');
  const [reminderTime, setReminderTime] = useState('08:00');
  const [note, setNote] = useState('');
  const [voiceCode, setVoiceCode] = useState('banmai');

  // Preview Audio state
  const [playingId, setPlayingId] = useState(null);
  const audioRef = useRef(null);

  // Push notification permission state
  const [notifPermission, setNotifPermission] = useState(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );

  const showToast = (type, message) => {
    setNotice({ type, message });
    setTimeout(() => setNotice(null), 5000);
  };

  const fetchReminders = async () => {
    setIsLoading(true);
    try {
      const res = await reminderApi.getMySchedules();
      const data = res?.data || res;
      if (Array.isArray(data)) {
        setReminders(data);
      }
    } catch (err) {
      console.warn('Lỗi tải danh sách nhắc thuốc:', err);
      showToast('error', 'Không thể kết nối đến máy chủ để tải lịch nhắc thuốc.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleApplyPreset = (preset) => {
    setMedicineName(preset.medicineName);
    setDosage(preset.dosage);
    setReminderTime(preset.reminderTime);
    setNote(preset.note);
    setVoiceCode(preset.voiceCode);
  };

  const handleRequestNotification = async () => {
    if ('Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setNotifPermission(perm);
        if (perm === 'granted') {
          showToast('success', 'Đã cấp quyền thông báo màn hình thành công.');
        } else {
          showToast('error', 'Bạn đã chặn thông báo. Vui lòng bật lại trong cài đặt trình duyệt.');
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!medicineName.trim() || !dosage.trim() || !reminderTime) {
      showToast('error', 'Vui lòng nhập đầy đủ tên thuốc, liều lượng và giờ uống.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        medicineName: medicineName.trim(),
        dosage: dosage.trim(),
        reminderTime: reminderTime.length === 5 ? `${reminderTime}:00` : reminderTime,
        note: note.trim(),
        voiceCode,
      };

      const res = await reminderApi.create(payload);
      const created = res?.data || res;
      showToast('success', `Đã lên lịch uống thuốc "${medicineName}" và tổng hợp âm thanh nhắc nhở thành công!`);

      // Reset form
      setMedicineName('');
      setDosage('');
      setNote('');

      // Refresh list
      fetchReminders();
    } catch (err) {
      console.error('Lỗi tạo lịch nhắc thuốc:', err);
      const msg = err.response?.data?.message || 'Không thể tạo lịch nhắc. Vui lòng thử lại.';
      showToast('error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (reminder) => {
    try {
      await reminderApi.toggle(reminder.id);
      setReminders(prev =>
        prev.map(r => (r.id === reminder.id ? { ...r, isActive: !r.isActive } : r))
      );
      showToast('success', `Đã ${reminder.isActive ? 'tắt' : 'bật'} nhắc nhở "${reminder.medicineName}".`);
    } catch (err) {
      console.error(err);
      showToast('error', 'Không thể thay đổi trạng thái.');
    }
  };

  const handleDelete = async (reminder) => {
    if (!window.confirm(`Bạn có chắc muốn xóa lịch nhắc "${reminder.medicineName}"?`)) return;
    try {
      await reminderApi.delete(reminder.id);
      setReminders(prev => prev.filter(r => r.id !== reminder.id));
      showToast('success', `Đã xóa lịch nhắc "${reminder.medicineName}".`);
    } catch (err) {
      console.error(err);
      showToast('error', 'Không thể xóa lịch nhắc.');
    }
  };

  const handleMarkTaken = async (reminder) => {
    try {
      await reminderApi.markTaken(reminder.id);
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      setReminders(prev =>
        prev.map(r => (r.id === reminder.id ? { ...r, lastTriggeredDate: dateStr } : r))
      );
      showToast('success', `Tuyệt vời! Đã ghi nhận bạn uống "${reminder.medicineName}" ngày hôm nay.`);
    } catch (err) {
      console.error(err);
      showToast('error', 'Không thể ghi nhận trạng thái đã uống.');
    }
  };

  const handlePlayAudio = (reminder) => {
    if (!reminder.audioUrl) {
      showToast('error', 'Chưa có file giọng đọc cho lịch nhắc này.');
      return;
    }

    if (playingId === reminder.id) {
      if (audioRef.current) {
        audioRef.current.pause();
        setPlayingId(null);
      }
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(reminder.audioUrl);
    audioRef.current = audio;
    setPlayingId(reminder.id);

    audio.play().catch(e => {
      console.warn('Autoplay error:', e);
      showToast('error', 'Trình duyệt chặn phát âm thanh. Vui lòng tương tác với trang.');
      setPlayingId(null);
    });

    audio.onended = () => {
      setPlayingId(null);
    };

    audio.onerror = () => {
      showToast('error', 'Không thể phát file âm thanh từ máy chủ.');
      setPlayingId(null);
    };
  };

  const handleTestAlarm = (reminder) => {
    // Kích hoạt CustomEvent để MedicationAlarmTracker bắt và hiển thị popup chuông báo thức tức thì
    window.dispatchEvent(
      new CustomEvent('medication:test-alarm', { detail: reminder })
    );
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '--:--';
    return timeStr.slice(0, 5);
  };

  const isTodayTaken = (lastDate) => {
    if (!lastDate) return false;
    const today = new Date().toISOString().split('T')[0];
    return lastDate.startsWith(today);
  };

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20">
      {/* Toast Notice */}
      {notice && (
        <div className="fixed top-20 right-6 z-50 max-w-md animate-fade-in">
          <div
            className={`p-4 rounded-lg shadow-lg border flex items-start gap-3 ${notice.type === 'success'
                ? 'bg-teal-900 text-teal-50 border-teal-700'
                : 'bg-rose-900 text-rose-50 border-rose-700'
              }`}
          >
            {notice.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-teal-300 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-300 shrink-0 mt-0.5" />
            )}
            <div className="text-sm font-medium leading-relaxed">{notice.message}</div>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <section className="bg-white border-b border-slate-200/90 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-xs font-semibold uppercase tracking-wider mb-3">
                <Bell className="w-3.5 h-3.5" />
                Dịch Vụ Y Tế Thông Minh • Báo Thức Giọng Nói
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
                Lịch Nhắc Thuốc &amp; Cảnh Báo Âm Thanh Toàn Màn Hình
              </h1>
              <p className="text-sm text-slate-600 mt-2 max-w-3xl leading-relaxed">
                Tự động chuẩn bị trước giọng đọc y tế ân cần theo từng đơn thuốc. Khi đồng hồ điểm đúng giờ,
                trình duyệt sẽ tự động kích hoạt Popup cảnh báo và phát âm thanh nhắc nhở chuẩn xác.
              </p>
            </div>

            {/* Notification Permission Pill */}
            {notifPermission !== 'granted' && (
              <button
                onClick={handleRequestNotification}
                className="shrink-0 flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-xs transition t-btn-press"
              >
                <AlertTriangle className="w-4 h-4" />
                Bật Thông Báo Desktop
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Cột trái: Form tạo lịch nhắc mới (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 sm:p-7">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-800 text-white flex items-center justify-center font-bold shadow-xs">
                    <Pill className="w-4.5 h-4.5 text-teal-200" />
                  </div>
                  <h2 className="font-extrabold text-base text-slate-900 tracking-tight">Thiết Lập Lịch Uống Thuốc</h2>
                </div>
                <span className="text-[11px] text-teal-800 bg-teal-50 border border-teal-200/80 px-2.5 py-0.5 rounded-md font-mono font-semibold">
                  TTS Engine
                </span>
              </div>

              {/* Đơn thuốc mẫu thường gặp (Quick Presets) */}
              <div className="mb-5">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                  Đơn thuốc mẫu thường gặp (1 chạm điền nhanh):
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyPreset(p)}
                      className="text-left p-2.5 rounded-xl border border-slate-200/90 hover:border-teal-500 hover:bg-teal-50/60 transition-all text-xs group t-btn-press"
                    >
                      <div className="font-bold text-slate-800 group-hover:text-teal-900 truncate">
                        {p.medicineName}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3 text-slate-400" /> {p.reminderTime}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Tên thuốc hoặc thực phẩm bổ sung <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={medicineName}
                    onChange={e => setMedicineName(e.target.value)}
                    placeholder="Ví dụ: Amlodipin 5mg, Paracetamol 500mg..."
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Liều lượng &amp; Cách dùng <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={dosage}
                      onChange={e => setDosage(e.target.value)}
                      placeholder="Ví dụ: 1 viên sau khi ăn no"
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Giờ báo thức (Hằng ngày) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="time"
                        required
                        value={reminderTime}
                        onChange={e => setReminderTime(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 font-mono transition"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Lời dặn dò y tế bổ sung (Giọng đọc y tế phát âm)
                  </label>
                  <textarea
                    rows={2}
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    placeholder="Ví dụ: Uống cùng nhiều nước ấm và kiểm tra lại huyết áp sau 30 phút..."
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 resize-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Giọng đọc phát âm lời nhắc
                  </label>
                  <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/90 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
                        <Volume2 className="w-4 h-4 text-teal-700" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900">Giọng Nữ Chuẩn Y Khoa</span>
                        <p className="text-[10px] text-slate-500">Nữ miền Bắc chuẩn phổ thông, phát âm ân cần chuẩn y khoa</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white border border-slate-200 text-teal-800 font-bold">
                      Chuẩn hóa
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 py-3 px-4 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-xl text-sm shadow-xs transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed t-btn-press"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Đang chuẩn bị âm thanh nhắc nhở...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-teal-300" />
                      Lưu Lịch &amp; Tổng Hợp Giọng Nói
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Cột phải: Danh sách lịch nhắc và trình nghe thử (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-teal-700" />
                <h2 className="font-bold text-base text-slate-900 tracking-tight">
                  Danh Sách Lịch Uống Thuốc ({reminders.length})
                </h2>
              </div>
              <button
                onClick={fetchReminders}
                className="text-xs text-slate-600 hover:text-teal-800 flex items-center gap-1 font-semibold transition t-btn-press"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Làm mới
              </button>
            </div>

            {isLoading ? (
              <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center text-slate-500">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-teal-700" />
                Đang tải danh sách lịch uống thuốc...
              </div>
            ) : reminders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
                <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center mx-auto mb-3">
                  <Pill className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-800 text-base mb-1">Chưa có lịch uống thuốc nào</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto mb-4 leading-relaxed">
                  Hãy thiết lập lịch uống thuốc ở form bên trái để hệ thống tự động dặn dò bằng giọng nói khi đến giờ.
                </p>
                <button
                  type="button"
                  onClick={() => handleApplyPreset(PRESETS[0])}
                  className="inline-flex items-center gap-2 text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-4 py-2 rounded-xl transition t-btn-press"
                >
                  <Plus className="w-4 h-4" />
                  Điền nhanh đơn mẫu Amlodipin
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {reminders.map(reminder => {
                  const isTaken = isTodayTaken(reminder.lastTriggeredDate);
                  const isPlaying = playingId === reminder.id;

                  return (
                    <div
                      key={reminder.id}
                      className={`bg-white rounded-2xl border transition-all duration-200 p-5 shadow-xs ${reminder.isActive
                          ? 'border-slate-200/90 hover:border-teal-500/80 hover:shadow-md'
                          : 'border-slate-200/60 bg-slate-50/50 opacity-75'
                        }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        {/* Time & Info */}
                        <div className="flex items-start gap-4">
                          <div
                            className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl border font-mono shrink-0 shadow-2xs ${reminder.isActive
                                ? 'bg-teal-50 border-teal-200 text-teal-950'
                                : 'bg-slate-100 border-slate-200 text-slate-500'
                              }`}
                          >
                            <span className="text-xl font-extrabold leading-none tracking-tight">
                              {formatTime(reminder.reminderTime)}
                            </span>
                            <span className="text-[10px] uppercase font-semibold text-slate-500 mt-1">
                              Hằng ngày
                            </span>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold text-base text-slate-900">
                                {reminder.medicineName}
                              </h3>
                              {reminder.isActive ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-900 border border-teal-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-teal-700 animate-pulse" />
                                  Đang bật
                                </span>
                              ) : (
                                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-600">
                                  Đã tạm tắt
                                </span>
                              )}
                              {isTaken && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                                  Hôm nay đã uống
                                </span>
                              )}
                            </div>

                            <p className="text-sm font-medium text-slate-700">
                              <span className="text-slate-500">Liều dùng:</span> {reminder.dosage}
                            </p>

                            {reminder.note && (
                              <p className="text-xs text-slate-600 bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 mt-1 leading-relaxed">
                                <span className="font-semibold text-slate-700">Lời dặn:</span> {reminder.note}
                              </p>
                            )}

                            <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-500">
                              <span>
                                Giọng đọc: <strong className="text-slate-700">Nữ Miền Bắc</strong>
                              </span>
                              {reminder.audioUrl && (
                                <span className="text-teal-700 font-semibold">✓ Đã sẵn sàng âm thanh</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Top Action Toggle */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleToggle(reminder)}
                            title={reminder.isActive ? 'Tạm tắt nhắc nhở' : 'Bật nhắc nhở'}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border t-btn-press ${reminder.isActive
                                ? 'bg-teal-50 text-teal-900 border-teal-200/90 hover:bg-teal-100'
                                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                              }`}
                          >
                            {reminder.isActive ? 'Bật' : 'Tắt'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(reminder)}
                            title="Xóa lịch nhắc này"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition t-btn-press"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Bottom Action Bar */}
                      <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                        {/* Audio preview playback */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handlePlayAudio(reminder)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition t-btn-press ${isPlaying
                                ? 'bg-teal-800 text-white border-teal-900 shadow-2xs'
                                : 'bg-slate-50 hover:bg-teal-50 text-slate-700 hover:text-teal-900 border-slate-200/90'
                              }`}
                          >
                            {isPlaying ? (
                              <>
                                <Pause className="w-3.5 h-3.5 text-teal-200" />
                                Đang phát thử...
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3.5 h-3.5 text-teal-700" />
                                Nghe thử giọng đọc
                              </>
                            )}
                          </button>

                          {/* Quick test alarm button */}
                          <button
                            type="button"
                            onClick={() => handleTestAlarm(reminder)}
                            title="Thử nghiệm chuông báo thức toàn màn hình ngay bây giờ"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/90 transition t-btn-press"
                          >
                            <Bell className="w-3.5 h-3.5 text-amber-700" />
                            Thử chuông báo ngay
                          </button>
                        </div>

                        {/* Mark taken action */}
                        <div>
                          {!isTaken ? (
                            <button
                              type="button"
                              onClick={() => handleMarkTaken(reminder)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs transition t-btn-press"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Xác nhận đã uống
                            </button>
                          ) : (
                            <span className="text-xs text-emerald-800 font-bold flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              Đã hoàn thành hôm nay
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthRemindersPage;
