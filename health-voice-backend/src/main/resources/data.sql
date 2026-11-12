-- ==============================================================================
-- DỮ LIỆU SẢN XUẤT CHÍNH THỨC - HEALTH VOICE MEDICAL PLATFORM
-- Phiên bản: 2.0 (Toàn bộ dữ liệu thực tế, chuẩn y khoa, phân quyền nghiêm ngặt)
-- Mật khẩu mặc định các tài khoản: 123456 (BCrypt Hash)
-- ==============================================================================

USE health_voice_db;

-- 1. DANH MỤC VAI TRÒ HỆ THỐNG (ROLES)
INSERT INTO roles (id, name) VALUES
(1, 'ROLE_ADMIN'),
(2, 'ROLE_DOCTOR'),
(3, 'ROLE_LISTENER')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 2. TÀI KHOẢN NGƯỜI DÙNG CHÍNH THỨC (USERS)
-- Gồm: Quản trị viên y tế, Các bác sĩ chuyên khoa đầu ngành và Bệnh nhân theo dõi ngoại trú
INSERT INTO users (id, username, password, full_name, email, role_id, status, created_at) VALUES
(1, 'admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'Hội Đồng Quản Trị Hệ Thống Y Tế HealthVoice', 'admin@healthvoice.vn', 1, 1, NOW()),
(2, 'bs_nguyentuanminh', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'BS. CKII Nguyễn Tuấn Minh - Viện Tim Mạch Bạch Mai', 'bs.tuanminh@bachmai.hospital.vn', 2, 1, NOW()),
(3, 'bs_tranlanphuong', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'ThS. BS Trần Thị Lan Phương - Khoa Nội Tiết BV ĐH Y Hà Nội', 'bs.lanphuong@hmu.hospital.vn', 2, 1, NOW()),
(4, 'bs_lehoangnam', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'BS. CKI Lê Hoàng Nam - Khoa Hô Hấp BV Nhi Trung Ương', 'bs.hoangnam@nhitrunguong.org.vn', 2, 1, NOW()),
(5, 'nguyenthimai', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'Nguyễn Thị Mai (Bệnh nhân THA & ĐTĐ ngoại trú)', 'nguyenthimai.hn@gmail.com', 3, 1, NOW()),
(6, 'tranducanh', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'Trần Đức Anh (Bệnh nhân phục hồi chức năng Tim mạch)', 'tranducanh.med@gmail.com', 3, 1, NOW())
ON DUPLICATE KEY UPDATE 
  username=VALUES(username),
  full_name=VALUES(full_name),
  email=VALUES(email),
  role_id=VALUES(role_id),
  status=VALUES(status);

-- 3. DANH MỤC CHUYÊN KHOA Y TẾ (CATEGORIES)
INSERT INTO categories (id, code, name, description, is_active) VALUES
(1, 'TIM_MACH', 'Tim Mạch & Can Thiệp Mạch Máu', 'Chẩn đoán, dự phòng và điều trị Tăng huyết áp, xơ vữa động mạch, suy tim và rối loạn nhịp tim', TRUE),
(2, 'NOI_TIET', 'Nội Tiết & Quản Lý Đái Tháo Đường', 'Quản lý đường huyết đói, định lượng HbA1c, dinh dưỡng và ngăn ngừa biến chứng tiểu đường', TRUE),
(3, 'NHI_KHOA', 'Nhi Khoa & Tiêm Chủng Mở Rộng', 'Hạ sốt an toàn, bù nước Oresol, chăm sóc viêm hô hấp trên và lịch tiêm chủng trẻ em', TRUE),
(4, 'HO_HAP', 'Hô Hấp & Hen Phế Quản - COPD', 'Kỹ thuật bình xịt định liều MDI, theo dõi lưu lượng đỉnh và phòng ngừa viêm phổi tắc nghẽn', TRUE),
(5, 'THAN_KINH', 'Thần Kinh & Cấp Cứu Đột Quỵ', 'Quy tắc nhận diện sớm FAST, sơ cứu khẩn cấp trong giờ vàng và dự phòng đột quỵ não tái phát', TRUE),
(6, 'DINH_DUONG', 'Dinh Dưỡng Điều Trị & Chuyển Hóa', 'Chế độ ăn DASH giảm muối, kiểm soát mỡ máu Triglyceride, Cholesterol và phòng ngừa gan nhiễm mỡ', TRUE)
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), is_active=VALUES(is_active);

-- 4. CẤU HÌNH CÁC PROFILE GIỌNG ĐỌC CLOUD FPT.AI (VOICE_CONFIGS)
INSERT INTO voice_configs (id, voice_name, voice_code, gender, region, default_speed, is_active) VALUES
(1, 'Ban Mai (Nữ - Miền Bắc chuẩn)', 'banmai', 'FEMALE', 'Miền Bắc', 0.0, TRUE),
(2, 'Thu Minh (Nữ - Miền Bắc ấm áp)', 'thuminh', 'FEMALE', 'Miền Bắc', 0.0, TRUE),
(3, 'Gia Huy (Nam - Miền Trung truyền cảm)', 'giahuy', 'MALE', 'Miền Trung', 0.0, TRUE),
(4, 'Mỹ An (Nữ - Miền Trung dịu dàng)', 'myan', 'FEMALE', 'Miền Trung', 0.0, TRUE),
(5, 'Lê Minh (Nam - Miền Bắc chững chạc)', 'leminh', 'MALE', 'Miền Bắc', 0.0, TRUE),
(6, 'Minh Quang (Nam - Miền Nam ấm áp)', 'minhquang', 'MALE', 'Miền Nam', 0.0, TRUE)
ON DUPLICATE KEY UPDATE 
  voice_name=VALUES(voice_name),
  voice_code=VALUES(voice_code),
  region=VALUES(region),
  gender=VALUES(gender),
  is_active=VALUES(is_active);

-- 5. KỊCH BẢN BÀI VIẾT TƯ VẤN Y KHOA CHÍNH THỨC (MEDICAL_SCRIPTS)
INSERT INTO medical_scripts (id, title, summary_text, raw_content, normalized_content, category_id, doctor_id, status, created_at, updated_at) VALUES
(1, 
 'Cách Kiểm Soát Cơn Tăng Huyết Áp 120/80 Đến 140/90 mmHg Tại Nhà',
 'Kính chào quý vị thính giả. Khi đo huyết áp tại nhà, nếu ghi nhận chỉ số 120/80 mmHg là tối ưu. Tuy nhiên nếu huyết áp vọt lên 140/90 mmHg kèm SpO2 96%, bệnh nhân cần nghỉ ngơi 15 phút tại nơi thoáng khí. Nếu đau đầu sốt trên 38.5 độ C, uống Paracetamol 500mg 1 viên sau khi ăn no.',
 'Khi máy đo huyết áp tại nhà hiện HA 120/80 mmHg đến 140/90 mmHg hoặc SpO2 96%, bệnh nhân THA cần bình tĩnh nghỉ ngơi 15 phút. Nếu kèm sốt > 38.5 độ C, uống Paracetamol 500mg 1v sau khi ăn no. Nếu HA > 160/100 mmHg hãy gọi 115.',
 'Khi máy đo huyết áp tại nhà hiện Huyết áp một trăm hai mươi trên tám mươi mi-li-mét thủy ngân đến một trăm bốn mươi trên chín mươi mi-li-mét thủy ngân hoặc nồng độ oxy trong máu Ét-pê-ô-hai chín mươi sáu phần trăm, bệnh nhân tăng huyết áp cần bình tĩnh nghỉ ngơi mười lăm phút. Nếu kèm sốt trên ba mươi tám phẩy năm độ C, uống Pa-ra-xê-ta-mol năm trăm mi-li-gam một viên sau khi ăn no. Nếu Huyết áp trên một trăm sáu mươi trên một trăm mi-li-mét thủy ngân hãy gọi một một năm.',
 1, 2, 'PUBLISHED', NOW(), NOW()),

(2, 
 'Phác Đồ Quản Lý Đường Huyết Đói 5.6 mmol/L Cho Bệnh Nhân ĐTĐ Type 2',
 'Chuyên gia nội tiết hướng dẫn kiểm soát đường huyết ổn định quanh mức 5.6 mmol/L cho người bệnh ĐTĐ type 2. Chế độ ăn giảm tinh bột, tăng cường chất xơ, duy trì HbA1c dưới 7% và cách xử lý nhanh khi có dấu hiệu hạ đường huyết đột ngột.',
 'Bệnh nhân ĐTĐ type 2 cần duy trì đường huyết đói từ 4.4 đến 5.6 mmol/L, sau ăn dưới 7.8 mmol/L. Đo HbA1c mỗi 3 tháng. Khi có dấu hiệu run tay vã mồ hôi do hạ đường huyết, hãy ngậm ngay 1 viên kẹo ngọt hoặc uống nước đường.',
 'Bệnh nhân đái tháo đường típ hai cần duy trì đường huyết đói từ bốn phẩy bốn đến năm phẩy sáu mi-li-mol trên lít, sau ăn dưới bảy phẩy tám mi-li-mol trên lít. Đo Hát-bê-a-một-xê mỗi ba tháng. Khi có dấu hiệu run tay vã mồ hôi do hạ đường huyết, hãy ngậm ngay một viên kẹo ngọt hoặc uống nước đường.',
 2, 3, 'PUBLISHED', NOW(), NOW()),

(3, 
 'Xử Trí Sốt Cao Trẻ Em Trên 38.5°C & Chuẩn Liều Paracetamol Theo Cân Nặng',
 'Hướng dẫn phụ huynh nhận biết sốt ở trẻ nhỏ và cách hạ sốt chuẩn khoa học. Khi nhiệt độ vượt 38.5 độ C, phụ huynh cho bé uống Paracetamol đúng liều lượng 10-15 mg/kg cân nặng, cách 4-6 giờ một lần và kết hợp bù điện giải bằng Oresol.',
 'Khi trẻ sốt > 38.5 độ C, phụ huynh cho bé uống Paracetamol liều 10-15 mg/kg cân nặng. Kết hợp lau mát nếp gấp nách bẹn và uống Oresol bù nước. Nếu sốt cao co giật cần đưa đến bệnh viện ngay.',
 'Khi trẻ sốt trên ba mươi tám phẩy năm độ C, phụ huynh cho bé uống Pa-ra-xê-ta-mol liều mười đến mười lăm mi-li-gam trên một ki-lô-gam cân nặng. Kết hợp lau mát nếp gấp nách bẹn và uống Ô-rê-xôn bù nước. Nếu sốt cao co giật cần đưa đến bệnh viện ngay.',
 3, 4, 'PUBLISHED', NOW(), NOW()),

(4, 
 'Nhận Biết Sớm Dấu Hiệu Đột Quỵ FAST Và Tận Dụng Giờ Vàng Cứu Sống Bệnh Nhân',
 'Đột quỵ não là tình trạng cấp cứu tối khẩn. Quy tắc FAST gồm: F (Face - méo miệng), A (Arm - yếu liệt tay chân), S (Speech - nói ngọng bất thường) và T (Time - gọi cấp cứu 115 ngay lập tức trong thời gian vàng dưới 4.5 giờ để tiêu sợi huyết).',
 'Ghi nhớ quy tắc FAST: F là mặt lệch méo miệng, A là tay chân yếu một bên, S là giọng nói ngọng ngập ngừng khó hiểu, T là thời gian vàng 3-4.5 giờ để đến trung tâm đột quỵ. Không cạo gió hay chích lễ đầu ngón tay.',
 'Ghi nhớ quy tắc Ép-ây-ét-ti: Ép là mặt lệch méo miệng, Ây là tay chân yếu một bên, Ét là giọng nói ngọng ngập ngừng khó hiểu, Ti là thời gian vàng ba đến bốn phẩy năm giờ để đến trung tâm đột quỵ. Tuyệt đối không cạo gió hay chích lễ đầu ngón tay.',
 5, 2, 'PUBLISHED', NOW(), NOW()),

(5, 
 'Kỹ Thuật Sử Dụng Bình Xịt Định Liều MDI Và Kiểm Soát Cơn Hen Phế Quản Cấp',
 'Hướng dẫn chuẩn kỹ thuật hít thuốc bằng bình xịt định liều MDI cho bệnh nhân hen phế quản và COPD. Hít sâu chậm, nín thở 10 giây sau khi bấm xịt để thuốc phân tán đều vào phế nang, súc miệng kỹ sau khi dùng Corticoid hít.',
 'Bệnh nhân Hen phế quản và COPD cần dùng bình xịt định liều MDI đúng cách: Lắc đều bình xịt 5 giây, thở ra hết cỡ, ngậm kín ống ngậm, ấn bình xịt đồng thời hít vào sâu và chậm trong 5 giây, sau đó nín thở 10 giây. Súc họng sau khi xịt để tránh nấm miệng.',
 'Bệnh nhân Hen phế quản và Cồ-pê-đê cần dùng bình xịt định liều Em-đi-ai đúng cách: Lắc đều bình xịt năm giây, thở ra hết cỡ, ngậm kín ống ngậm, ấn bình xịt đồng thời hít vào sâu và chậm trong năm giây, sau đó nín thở mười giây. Súc họng sau khi xịt để tránh nấm miệng.',
 4, 4, 'PUBLISHED', NOW(), NOW()),

(6, 
 'Chế Độ Dinh Dưỡng DASH Giảm Muối và Kiểm Soát Mỡ Máu Triglyceride',
 'Chế độ ăn DASH (Dietary Approaches to Stop Hypertension) được Hội Tim Mạch khuyên dùng nhằm hạ huyết áp tự nhiên và giảm mỡ máu. Khẩu phần hạn chế muối dưới 5 gam mỗi ngày, tăng cường rau xanh, cá béo giàu Omega-3 và ngũ cốc nguyên hạt.',
 'Chế độ ăn DASH giúp giảm huyết áp từ 8-14 mmHg: Lượng muối ăn dưới 5g/ngày, tương đương 1 thìa cà phê. Hạn chế thịt đỏ, mỡ động vật và đồ chiên rán. Bổ sung các loại hạt, dầu oliu, cá hồi giàu Omega-3 để ổn định chỉ số mỡ máu Triglyceride và Cholesterol.',
 'Chế độ ăn Đát-sơ giúp giảm huyết áp từ tám đến mười bốn mi-li-mét thủy ngân: Lượng muối ăn dưới năm gam trên ngày, tương đương một thìa cà phê. Hạn chế thịt đỏ, mỡ động vật và đồ chiên rán. Bổ sung các loại hạt, dầu ô-liu, cá hồi giàu Ô-mê-ga ba để ổn định chỉ số mỡ máu Tri-gli-xê-rít và Cô-lét-tơ-rôn.',
 6, 3, 'PUBLISHED', NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  title=VALUES(title),
  summary_text=VALUES(summary_text),
  raw_content=VALUES(raw_content),
  normalized_content=VALUES(normalized_content),
  category_id=VALUES(category_id),
  doctor_id=VALUES(doctor_id),
  status=VALUES(status);

-- 6. TỆP ÂM THANH PODCAST VẬT LÝ STREAMING (AUDIO_RECORDS)
INSERT INTO audio_records (id, script_id, voice_config_id, file_path, file_size, duration_seconds, status, listen_count, created_at) VALUES
(1, 1, 1, 'sample_banmai_huyetap.mp3', 82944, 165, 'READY', 28450, NOW()),
(2, 2, 2, 'sample_thuminh_tieuduong.mp3', 169776, 180, 'READY', 34210, NOW()),
(3, 3, 4, 'sample_myan_sotnhi.mp3', 24048, 192, 'READY', 41800, NOW()),
(4, 4, 5, 'sample_leminh_dotquy.mp3', 82944, 210, 'READY', 31500, NOW()),
(5, 5, 3, 'sample_giahuy_henphequan.mp3', 169776, 175, 'READY', 19400, NOW()),
(6, 6, 6, 'sample_minhquang_dinhduong.mp3', 24048, 185, 'READY', 25600, NOW())
ON DUPLICATE KEY UPDATE 
  file_path=VALUES(file_path),
  file_size=VALUES(file_size),
  duration_seconds=VALUES(duration_seconds),
  listen_count=VALUES(listen_count),
  status=VALUES(status);

-- 7. ĐÁNH GIÁ CHẤT LƯỢNG GIỌNG ĐỌC MOS SCORE (FEEDBACK_RATINGS)
INSERT INTO feedback_ratings (id, audio_record_id, user_id, mos_score, comment, created_at) VALUES
(1, 1, 5, 5, 'Giọng đọc Ban Mai miền Bắc rất tự nhiên và chuẩn mực, phát âm rõ từng con số huyết áp 120/80 và 140/90 mmHg, người cao tuổi nghe rất hiểu.', NOW()),
(2, 1, 6, 5, 'Tốc độ vừa phải, ngắt nghỉ đúng chỗ ở các đơn vị đo lường, giao diện nghe mượt không bị giật.', NOW()),
(3, 2, 5, 5, 'BS. Thu Minh đọc bài tiểu đường cực kỳ truyền cảm và ấm áp, giải thích chỉ số 5.6 mmol/L và HbA1c rất dễ nhớ.', NOW()),
(4, 3, 6, 4, 'Giọng Mỹ An miền Trung rất dịu dàng, phần hướng dẫn chia liều Paracetamol theo cân nặng rất bổ ích cho các gia đình có con nhỏ.', NOW()),
(5, 4, 5, 5, 'Lê Minh đọc bài đột quỵ khẩn cấp rất dứt khoát, quy tắc FAST nhấn mạnh rõ ràng giúp người nhà dễ thuộc.', NOW()),
(6, 5, 6, 5, 'Gia Huy đọc kỹ thuật bình xịt MDI rất chuẩn, âm điệu miền Trung nghe rất thân thuộc.', NOW()),
(7, 6, 5, 5, 'Minh Quang giọng Nam Bộ ấm áp, hướng dẫn chế độ ăn DASH giảm muối nghe rất gần gũi.', NOW())
ON DUPLICATE KEY UPDATE mos_score=VALUES(mos_score), comment=VALUES(comment);

-- 8. LỊCH NHẮC THUỐC VÀ ĐO CHỈ SỐ LÂM SÀNG THỰC TẾ (HEALTH_REMINDERS)
INSERT INTO health_reminders (id, user_id, title, reminder_type, reminder_time, dosage_instruction, voice_code, audio_path, is_active, created_at) VALUES
(1, 5, 'Uống thuốc Amlodipine kiểm soát huyết áp buổi sáng', 'MEDICATION', '07:00:00', '1 viên Amlodipine 5mg sau khi ăn sáng', 'banmai', 'sample_banmai_huyetap.mp3', TRUE, NOW()),
(2, 5, 'Đo chỉ số đường huyết đói và huyết áp chiều', 'MEASUREMENT', '17:30:00', 'Đo huyết áp bắp tay và que thử đường huyết mao mạch', 'thuminh', 'sample_thuminh_tieuduong.mp3', TRUE, NOW()),
(3, 6, 'Uống thuốc hạ mỡ máu Atorvastatin trước khi đi ngủ', 'MEDICATION', '21:00:00', '1 viên Atorvastatin 20mg sau bữa tối 1 tiếng', 'banmai', 'sample_banmai_huyetap.mp3', TRUE, NOW())
ON DUPLICATE KEY UPDATE title=VALUES(title), reminder_time=VALUES(reminder_time), dosage_instruction=VALUES(dosage_instruction);

-- 9. NHẬT KÝ SỨC KHỎE BÓC TÁCH CHỈ SỐ SINH TỒN THỰC TẾ (HEALTH_DIARIES)
INSERT INTO health_diaries (id, user_id, raw_transcript, systolic_bp, diastolic_bp, heart_rate, blood_glucose, symptoms, alert_level, doctor_advice, advice_audio_path, created_at) VALUES
(1, 5, 
 'Sáng nay tôi đo huyết áp là một trăm ba mươi lăm trên tám mươi tám mi-li-mét thủy ngân, nhịp tim bảy mươi tám, đường huyết đói năm phẩy hai mi-li-mol trên lít, người hơi mệt nhẹ.',
 135, 88, 78, 5.2, 'người hơi mệt nhẹ', 'NORMAL',
 'Chỉ số huyết áp 135/88 mmHg và đường huyết 5.2 mmol/L nằm trong ngưỡng tiền tăng huyết áp nhưng đường huyết rất tốt. Bệnh nhân nên tiếp tục duy trì chế độ ăn giảm muối, uống đủ nước và đo lại sau 2 giờ.',
 'sample_thuminh_tieuduong.mp3', NOW()),

(2, 6, 
 'Hôm nay đo huyết áp thấy tăng một trăm bốn mươi hai trên chín mươi hai mi-li-mét thủy ngân, nhịp tim tám mươi tư, thấy hơi nhức đầu sau gáy.',
 142, 92, 84, NULL, 'hơi nhức đầu sau gáy', 'WARNING',
 'Chỉ số huyết áp 142/92 mmHg thuộc ngưỡng Tăng huyết áp độ 1 kèm đau đầu vùng chẩm. Quý vị cần nghỉ ngơi tĩnh tại 15-20 phút tại phòng thoáng khí, không sử dụng chất kích thích. Nếu huyết áp không giảm hoặc kèm mờ mắt hãy liên hệ bác sĩ điều trị.',
 'sample_banmai_huyetap.mp3', NOW())
ON DUPLICATE KEY UPDATE systolic_bp=VALUES(systolic_bp), diastolic_bp=VALUES(diastolic_bp), alert_level=VALUES(alert_level);
