import React, { useState, useEffect, useRef, useCallback } from 'react';
import { reminderApi } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import MedicationAlarmModal from './MedicationAlarmModal';

/**
 * Global Medication Alarm Tracker
 * Chạy ngầm trong Layout chính, kiểm tra định kỳ mỗi 10 giây đối chiếu giờ hẹn uống thuốc.
 */
export default function MedicationAlarmTracker() {
  const { isAuthenticated, user } = useAuth();
  const [activeAlarm, setActiveAlarm] = useState(null);
  const [reminders, setReminders] = useState([]);
  
  // Lưu danh sách id đã kích hoạt trong ngày hôm nay để tránh kích hoạt nhiều lần trong cùng 1 phút
  const triggeredTodayRef = useRef(new Set());
  const snoozeTimersRef = useRef({});

  // Xin quyền Notification của trình duyệt khi người dùng đã đăng nhập
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  // Tải danh sách lịch nhắc
  const fetchSchedules = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await reminderApi.getMySchedules();
      const list = Array.isArray(res) ? res : (res?.data || []);
      setReminders(list.filter(r => r.isActive !== false));
    } catch (err) {
      console.warn('Tracker: Chưa tải được lịch nhắc:', err);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchSchedules();
    // Tải lại danh sách lịch nhắc mỗi 60 giây
    const reloadInterval = setInterval(fetchSchedules, 60000);
    return () => clearInterval(reloadInterval);
  }, [fetchSchedules]);

  // Vòng lặp kiểm tra giờ hẹn mỗi 10 giây
  useEffect(() => {
    if (!isAuthenticated || reminders.length === 0) return;

    const checkInterval = setInterval(() => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const currentHHmm = `${hours}:${minutes}`;
      const todayDateStr = now.toISOString().split('T')[0];

      reminders.forEach((r) => {
        if (!r.isActive) return;

        // Chuẩn hóa giờ hẹn dạng HH:mm
        const scheduleHHmm = typeof r.reminderTime === 'string' ? r.reminderTime.substring(0, 5) : '';
        const triggerKey = `${r.id}_${todayDateStr}_${scheduleHHmm}`;

        if (scheduleHHmm === currentHHmm && !triggeredTodayRef.current.has(triggerKey)) {
          // Kiểm tra xem backend đã ghi nhận lastTriggeredDate là hôm nay chưa
          if (r.lastTriggeredDate === todayDateStr) {
            return;
          }

          triggeredTodayRef.current.add(triggerKey);
          console.info(`[ALARM TRACKER] Kích hoạt báo giờ uống thuốc: ${r.medicineName} (${scheduleHHmm})`);

          // 1. Mở Modal Popup toàn màn hình
          setActiveAlarm(r);

          // 2. Bắn thông báo đẩy Desktop HTML5 Web Notification
          if ('Notification' in window && Notification.permission === 'granted') {
            try {
              new Notification(`ĐÃ ĐẾN GIỜ UỐNG THUỐC: ${r.medicineName}`, {
                body: `Liều dùng: ${r.dosage}. ${r.note || 'Hãy uống thuốc đúng giờ!'}`,
                icon: '/favicon.ico',
                tag: triggerKey,
              });
            } catch (notifErr) {
              console.warn('Lỗi hiển thị Notification:', notifErr);
            }
          }
        }
      });
    }, 10000); // 10 giây mỗi chu kỳ

    return () => clearInterval(checkInterval);
  }, [isAuthenticated, reminders]);

  // Hành động: Xác nhận đã uống thuốc
  const handleConfirmTaken = async () => {
    if (!activeAlarm) return;
    const currentId = activeAlarm.id;
    try {
      await reminderApi.markTaken(currentId);
      console.info(`Đã xác nhận uống thuốc ID ${currentId}`);
    } catch (err) {
      console.warn('Lỗi cập nhật trạng thái đã uống thuốc:', err);
    } finally {
      setActiveAlarm(null);
      fetchSchedules();
    }
  };

  // Hành động: Nhắc lại sau 5 phút
  const handleSnooze = () => {
    if (!activeAlarm) return;
    const snoozedReminder = activeAlarm;
    setActiveAlarm(null);

    // Xóa timer cũ nếu có
    if (snoozeTimersRef.current[snoozedReminder.id]) {
      clearTimeout(snoozeTimersRef.current[snoozedReminder.id]);
    }

    // Đặt hẹn giờ kích hoạt lại sau 5 phút (300,000ms)
    console.info(`Đã hẹn nhắc lại sau 5 phút cho thuốc ${snoozedReminder.medicineName}`);
    snoozeTimersRef.current[snoozedReminder.id] = setTimeout(() => {
      console.info(`Hết thời gian báo trễ 5 phút, kích hoạt lại: ${snoozedReminder.medicineName}`);
      setActiveAlarm(snoozedReminder);
    }, 300000); // 5 phút
  };

  // Lắng nghe sự kiện thử nghiệm chuông báo thủ công từ trang quản lý lịch
  useEffect(() => {
    const handleTestAlarmEvent = (e) => {
      if (e.detail) {
        setActiveAlarm(e.detail);
      }
    };
    window.addEventListener('medication:test-alarm', handleTestAlarmEvent);
    return () => window.removeEventListener('medication:test-alarm', handleTestAlarmEvent);
  }, []);

  if (!activeAlarm) return null;

  return (
    <MedicationAlarmModal
      reminder={activeAlarm}
      onConfirmTaken={handleConfirmTaken}
      onSnooze={handleSnooze}
      onClose={() => setActiveAlarm(null)}
    />
  );
}

