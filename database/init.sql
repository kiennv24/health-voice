-- ============================================================
-- HealthVoice 2.0 — Database Init Script
-- MySQL 8.0 | UTF-8mb4
-- ============================================================

CREATE DATABASE IF NOT EXISTS health_voice_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE health_voice_db;

-- ============================================================
-- Bảng: roles
-- ============================================================
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO roles (name) VALUES
  ('ROLE_ADMIN'),
  ('ROLE_DOCTOR'),
  ('ROLE_LISTENER');

-- ============================================================
-- Bảng: users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(150),
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(20),
    role_id INT NOT NULL,
    status INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Bảng: voice_configs
-- ============================================================
CREATE TABLE IF NOT EXISTS voice_configs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    voice_name VARCHAR(150),
    voice_code VARCHAR(50) NOT NULL UNIQUE,
    gender VARCHAR(10),
    region VARCHAR(50),
    description TEXT,
    default_speed FLOAT DEFAULT 0.0,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Bảng: categories
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    is_active TINYINT(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Bảng: medical_scripts (Kịch bản y khoa từ Doctor Studio)
-- ============================================================
CREATE TABLE IF NOT EXISTS medical_scripts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    summary_text TEXT,
    raw_content MEDIUMTEXT,
    normalized_content MEDIUMTEXT,
    status VARCHAR(30) DEFAULT 'DRAFT',
    author_id BIGINT,
    category_id BIGINT,
    is_published TINYINT(1) DEFAULT 0,
    view_count BIGINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Bảng: audio_records (File âm thanh từ Doctor Studio)
-- ============================================================
CREATE TABLE IF NOT EXISTS audio_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    script_id BIGINT,
    voice_config_id INT,
    file_path VARCHAR(500),
    file_size BIGINT,
    duration_seconds INT,
    status VARCHAR(30) DEFAULT 'READY',
    listen_count BIGINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (script_id) REFERENCES medical_scripts(id) ON DELETE SET NULL,
    FOREIGN KEY (voice_config_id) REFERENCES voice_configs(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Bảng: consultation_sessions (Phiên tư vấn sức khỏe)
-- ============================================================
CREATE TABLE IF NOT EXISTS consultation_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Bảng: chat_messages (Tin nhắn trong phiên tư vấn)
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id BIGINT NOT NULL,
    sender_type VARCHAR(20) NOT NULL,  -- PATIENT, BOT, DOCTOR
    raw_content MEDIUMTEXT,
    normalized_content MEDIUMTEXT,
    audio_url VARCHAR(500),
    voice_code VARCHAR(50),
    latency_ms INT DEFAULT 0,
    is_cached TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES consultation_sessions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Bảng: audio_cache (Cache SHA-256 cho TTS)
-- ============================================================
CREATE TABLE IF NOT EXISTS audio_cache (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    text_hash VARCHAR(64) NOT NULL UNIQUE,
    audio_url VARCHAR(500) NOT NULL,
    voice_code VARCHAR(50),
    speed DOUBLE DEFAULT 0.0,
    file_size BIGINT,
    duration_seconds DOUBLE,
    engine_used VARCHAR(50),
    hit_count BIGINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Bảng: medical_lexicon (Từ điển phát âm y khoa)
-- ============================================================
CREATE TABLE IF NOT EXISTS medical_lexicon (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    raw_term VARCHAR(200) NOT NULL,
    phonetic_replacement TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'THUAT_NGU',
    created_by BIGINT,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Bảng: advice_templates (Phác đồ dặn dò của Bác sĩ)
-- ============================================================
CREATE TABLE IF NOT EXISTS advice_templates (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    doctor_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    content MEDIUMTEXT,
    audio_url VARCHAR(500),
    voice_code VARCHAR(50),
    is_public TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Bảng: feedback_ratings (tương thích cũ)
-- ============================================================
CREATE TABLE IF NOT EXISTS feedback_ratings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    target_type VARCHAR(50),
    target_id BIGINT,
    user_id BIGINT,
    mos_score INT CHECK (mos_score BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Bảng: health_diaries (Nhật ký sức khỏe)
-- ============================================================

CREATE TABLE IF NOT EXISTS health_diaries (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    entry_date DATE,
    raw_input TEXT,
    systolic_pressure INT,
    diastolic_pressure INT,
    blood_sugar DOUBLE,
    temperature DOUBLE,
    weight DOUBLE,
    spo2 INT,
    heart_rate INT,
    risk_level VARCHAR(20) DEFAULT 'NORMAL',
    advice_text TEXT,
    advice_audio_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Bảng: triage_rules (Hệ thống Cây quyết định phân loại rủi ro y tế)
-- ============================================================
CREATE TABLE IF NOT EXISTS triage_rules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rule_code VARCHAR(50) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL,
    trigger_keywords TEXT NOT NULL,
    risk_level VARCHAR(20) NOT NULL,
    priority INT DEFAULT 1,
    advice_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Bảng: medication_reminders (Lịch nhắc uống thuốc thông minh)
-- ============================================================
CREATE TABLE IF NOT EXISTS medication_reminders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    medicine_name VARCHAR(100) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    reminder_time TIME NOT NULL,
    note TEXT,
    voice_code VARCHAR(30) DEFAULT 'banmai',
    audio_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    last_triggered_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_med_reminder_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Dữ liệu khởi tạo — Seed Data
-- ============================================================

-- Bảng luật phân loại rủi ro y tế (Medical Triage Engine)
INSERT INTO triage_rules (rule_code, category, trigger_keywords, risk_level, priority, advice_text)
VALUES
(
    'EMERGENCY_STROKE',
    'THAN_KINH',
    'méo miệng, liệt nửa người, nói ngọng, đột quỵ, tai biến, tê liệt nửa người, méo mặt',
    'EMERGENCY',
    10,
    'CẢNH BÁO CẤP CỨU KHẨN CẤP: Dấu hiệu bạn vừa mô tả là triệu chứng điển hình của Đột quỵ hoặc Tai biến mạch máu não theo tiêu chuẩn FAST. Bạn hoặc người nhà cần gọi ngay tổng đài Cấp cứu 115 hoặc di chuyển ngay đến bệnh viện có đơn vị can thiệp đột quỵ gần nhất trong thời gian vàng 3 đến 4 giờ đầu. Tuyệt đối không tự ý cho uống nước, cạo gió hay dùng thuốc hạ áp tại nhà.'
),
(
    'EMERGENCY_MYOCARDIAL_INFARCTION',
    'TIM_MACH',
    'đau thắt ngực, khó thở, tức ngực trái, vã mồ hôi, nhồi máu cơ tim, ép chặt lồng ngực, đau lan ra tay trái',
    'EMERGENCY',
    10,
    'CẢNH BÁO CẤP CỨU KHẨN CẤP: Triệu chứng đau tức ngực trái dữ dội kèm khó thở và vã mồ hôi là dấu hiệu cảnh báo Cơn nhồi máu cơ tim cấp hoặc Hội chứng mạch vành cấp tính. Hãy gọi ngay cấp cứu 115 hoặc nhờ người nhà đưa đến cơ sở y tế gần nhất. Trong lúc chờ đợi, hãy ngồi nghỉ ngơi đầu cao 30 độ ở nơi thoáng mát, nới lỏng cổ áo, giữ bình tĩnh và tuyệt đối không gắng sức.'
),
(
    'HIGH_APPENDICITIS',
    'TIEU_HOA',
    'đau hố chậu phải, đau bụng dưới bên phải, đau ruột thừa, quặn bụng hố chậu phải, viêm ruột thừa',
    'HIGH',
    8,
    'CẢNH BÁO NGUY CƠ CAO: Tình trạng đau âm ỉ tăng dần ở vùng bụng dưới bên phải hoặc hố chậu phải có thể là biểu hiện của Viêm ruột thừa cấp. Bạn cần đến ngay khoa cấp cứu hoặc bệnh viện có chuyên khoa ngoại tiêu hóa trong vòng 24 giờ để được siêu âm ổ bụng và xét nghiệm máu. Tuyệt đối không tự ý chườm nóng, không uống thuốc giảm đau hay thuốc xổ vì có thể làm lu mờ triệu chứng hoặc gây vỡ ruột thừa.'
),
(
    'MEDIUM_FEVER_CARE',
    'SOT',
    'sốt cao, sốt 39 độ, uống hạ sốt, paracetamol, sốt 38.5, nhiệt độ cao, nóng sốt',
    'MEDIUM',
    5,
    'HƯỚNG DẪN CHĂM SÓC SỐT: Khi sốt từ 38.5 độ C trở lên, bạn có thể dùng Paracetamol với liều từ 10 đến 15 miligam trên một kilôgam thể trọng mỗi lần, uống cách nhau từ 4 đến 6 giờ nếu còn sốt, không quá 4 lần một ngày. Hãy mặc quần áo thoáng mát, lau người bằng nước ấm ở nách và bẹn, uống nhiều nước hoặc dung dịch Oresol pha đúng tỷ lệ để bù điện giải. Nếu sốt cao trên 39.5 độ C không hạ hoặc kéo dài quá 48 giờ, bạn hãy đi khám bác sĩ ngay.'
),
(
    'LOW_COMMON_COLD',
    'HO_HAP',
    'nghẹt mũi, hắt xì, đau họng nhẹ, cảm cúm, sổ mũi, hắt hơi, cảm lạnh',
    'LOW',
    1,
    'HƯỚNG DẪN THEO DÕI TẠI NHÀ: Các triệu chứng nghẹt mũi, hắt xì và đau họng nhẹ thường gặp trong cảm cúm thông thường do nhiễm siêu vi đường hô hấp trên. Bạn nên nghỉ ngơi hợp lý, súc miệng nước muối sinh lý ấm từ 2 đến 3 lần mỗi ngày, uống nhiều nước ấm và bổ sung thêm vitamin C. Không nên tự ý mua kháng sinh uống khi chưa có chỉ định của bác sĩ. Hãy đi khám nếu xuất hiện sốt cao liên tục hoặc khó thở.'
)
ON DUPLICATE KEY UPDATE
    category = VALUES(category),
    trigger_keywords = VALUES(trigger_keywords),
    risk_level = VALUES(risk_level),
    priority = VALUES(priority),
    advice_text = VALUES(advice_text);

-- Giọng đọc FPT.AI
INSERT IGNORE INTO voice_configs (voice_name, voice_code, gender, region, description, default_speed, is_active) VALUES
  ('Ban Mai (Nữ - Miền Bắc chuẩn)', 'banmai', 'FEMALE', 'Miền Bắc', 'Giọng nữ Bắc chuẩn truyền thông, rõ ràng, dễ nghe', 0.0, 1),
  ('Thu Minh (Nữ - Miền Bắc ấm áp)', 'thuminh', 'FEMALE', 'Miền Bắc', 'Giọng nữ Bắc nhẹ nhàng, ấm áp, phù hợp tư vấn y tế', 0.0, 1),
  ('Gia Huy (Nam - Miền Trung)', 'giahuy', 'MALE', 'Miền Trung', 'Giọng nam Trung trầm ấm, truyền cảm', 0.0, 1),
  ('Mỹ An (Nữ - Miền Trung dịu dàng)', 'myan', 'FEMALE', 'Miền Trung', 'Giọng nữ Trung dịu dàng, tự nhiên', 0.0, 1),
  ('Lê Minh (Nam - Miền Bắc chững chạc)', 'leminh', 'MALE', 'Miền Bắc', 'Giọng nam Bắc rõ ràng, dứt khoát', 0.0, 1),
  ('Minh Quang (Nam - Miền Nam ấm áp)', 'minhquang', 'MALE', 'Miền Nam', 'Giọng nam Nam thân thiện, dễ nghe', 0.0, 1);

-- Chuyên khoa y tế
INSERT IGNORE INTO categories (code, name, description, is_active) VALUES
  ('TIM_MACH', 'Tim Mạch & Huyết Áp', 'Tư vấn kiểm soát huyết áp, suy tim, bệnh mạch vành', 1),
  ('NHI_KHOA', 'Nhi Khoa & Tiêm Chủng', 'Chăm sóc sốt, tiêm vắc-xin và dinh dưỡng trẻ nhỏ', 1),
  ('HO_HAP', 'Hô Hấp & Phổi', 'Hen phế quản, viêm phổi, COPD và kỹ thuật hít định liều', 1),
  ('NOI_TIET', 'Nội Tiết & Đái Tháo Đường', 'Theo dõi đường huyết sau ăn, chỉ số HbA1c và biến chứng', 1),
  ('DUOC_LAM_SANG', 'Dược Lâm Sàng & Đơn Thuốc', 'Hướng dẫn dùng kháng sinh, giảm đau hạ sốt an toàn', 1);

-- Từ điển phát âm y khoa ban đầu (sẽ được đồng bộ lên Python TTS)
-- (Sẽ được seed qua DataInitializer.java khi hệ thống khởi động)

