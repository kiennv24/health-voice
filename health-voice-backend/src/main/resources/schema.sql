-- ========================================================
-- HEALTH VOICE DATABASE - 7 BẢNG CHUẨN QUY ĐỊNH
-- Hệ thống xuất bản tư vấn sức khỏe & Podcast giọng đọc AI FPT.AI
-- ========================================================

CREATE DATABASE IF NOT EXISTS health_voice_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE health_voice_db;

-- 1. Bảng Roles (Vai trò người dùng)
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Bảng Users (Tài khoản người dùng)
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(150),
    email VARCHAR(150) NOT NULL UNIQUE,
    role_id INT NOT NULL,
    status TINYINT NOT NULL DEFAULT 1, -- 1: ACTIVE, 0: LOCKED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_roles FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Bảng Categories (Chuyên khoa / Chuyên mục sức khỏe)
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Bảng Voice Configs (Cấu hình mẫu giọng đọc AI FPT.AI Cloud TTS)
CREATE TABLE IF NOT EXISTS voice_configs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    voice_name VARCHAR(100) NOT NULL,
    voice_code VARCHAR(100) NOT NULL UNIQUE,
    gender VARCHAR(10) NOT NULL, -- MALE, FEMALE
    region VARCHAR(50) NOT NULL, -- Miền Bắc, Miền Trung, Miền Nam
    default_speed FLOAT DEFAULT 0.0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Bảng Medical Scripts (Bài viết kịch bản y khoa)
CREATE TABLE IF NOT EXISTS medical_scripts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    summary_text TEXT,
    raw_content LONGTEXT NOT NULL,
    normalized_content LONGTEXT,
    category_id INT NOT NULL,
    doctor_id BIGINT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT', -- DRAFT, PROCESSED, PUBLISHED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_scripts_categories FOREIGN KEY (category_id) REFERENCES categories (id),
    CONSTRAINT fk_scripts_doctors FOREIGN KEY (doctor_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Bảng Audio Records (Bản ghi âm thanh tổng hợp từ FPT.AI)
CREATE TABLE IF NOT EXISTS audio_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    script_id BIGINT NOT NULL,
    voice_config_id INT NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    duration_seconds INT DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'READY', -- READY, FAILED
    listen_count BIGINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audios_scripts FOREIGN KEY (script_id) REFERENCES medical_scripts (id) ON DELETE CASCADE,
    CONSTRAINT fk_audios_voices FOREIGN KEY (voice_config_id) REFERENCES voice_configs (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Bảng Feedback Ratings (Đánh giá chất lượng âm thanh MOS 1-5 sao)
CREATE TABLE IF NOT EXISTS feedback_ratings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    audio_record_id BIGINT NOT NULL,
    user_id BIGINT NULL,
    mos_score TINYINT NOT NULL CHECK (mos_score BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_feedback_audios FOREIGN KEY (audio_record_id) REFERENCES audio_records (id) ON DELETE CASCADE,
    CONSTRAINT fk_feedback_users FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Bảng Health Reminders (Lịch nhắc nhở uống thuốc & đo chỉ số kèm audio giọng đọc AI)
CREATE TABLE IF NOT EXISTS health_reminders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NULL,
    title VARCHAR(255) NOT NULL,
    reminder_type VARCHAR(50) NOT NULL DEFAULT 'MEDICATION', -- MEDICATION, VITAL_SIGN, APPOINTMENT
    reminder_time VARCHAR(10) NOT NULL, -- Ví dụ: '08:00'
    dosage_instruction VARCHAR(255),
    audio_path VARCHAR(500),
    voice_code VARCHAR(50) DEFAULT 'banmai',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reminders_users FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Bảng Health Diaries (Nhật ký sức khỏe bằng giọng nói & bóc tách chỉ số sinh tồn)
CREATE TABLE IF NOT EXISTS health_diaries (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NULL,
    log_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    raw_transcript TEXT NOT NULL,
    audio_path VARCHAR(500),
    systolic_bp INT,
    diastolic_bp INT,
    heart_rate INT,
    blood_glucose FLOAT,
    symptoms TEXT,
    alert_level VARCHAR(20) DEFAULT 'NORMAL', -- NORMAL, WARNING, DANGER
    doctor_advice TEXT,
    advice_audio_path VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_diaries_users FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
