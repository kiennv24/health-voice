# HealthVoice — Nền Tảng Y Tế Số & Trợ Lý Y Khoa AI

> **Hệ thống tư vấn sức khỏe thông minh và sản xuất Podcast y khoa số hóa**  
> Tích hợp công nghệ **Google Gemini LLM** (Đánh giá lâm sàng chuyên sâu) & **FPT AI Factory** (Tổng hợp giọng nói tiếng Việt chuẩn y khoa).

---

## 🌟 Tính Năng Cốt Lõi

1. **Trợ Lý Tư Vấn Y Khoa AI (Gemini AI Doctor):**
   - Phân tích triệu chứng người bệnh, đánh giá chính xác mức độ rủi ro lâm sàng: `HIGH` (Cảnh báo cấp cứu khẩn), `MEDIUM` (Theo dõi sát), `LOW` (Chăm sóc tại nhà).
   - Chỉ dẫn sinh tồn và các chống chỉ định y tế khẩn cấp (những việc TUYỆT ĐỐI KHÔNG ĐƯỢC LÀM khi nghi ngờ viêm ruột thừa, nhồi máu cơ tim...).
   - Tự động sinh 3 câu hỏi gợi ý đào sâu lâm sàng cho bệnh nhân.

2. **Chuyển Đổi Giọng Nói Chuyên Biệt (FPT AI Factory `FPT.TTS-pro`):**
   - Đọc câu trả lời tư vấn và bài viết y khoa bằng giọng đọc **Ban Mai** chuẩn ngữ điệu y tế tiếng Việt.
   - Cơ chế dự phòng đa tầng: FPT AI Factory $\rightarrow$ Microsoft Edge Neural $\rightarrow$ Google TTS.
   - Bộ nhớ đệm âm thanh thông minh (Audio Cache với mã băm SHA-256) giúp phản hồi tức thì các nội dung đã tạo.

3. **Doctor Studio & Thư Viện Podcast Y Tế:**
   - Dành cho Bác sĩ soạn thảo kịch bản, chuẩn hóa thuật ngữ y khoa và xuất bản podcast sức khỏe cho cộng đồng.

4. **Sổ Tay Sức Khỏe & Lịch Nhắc Uống Thuốc:**
   - Hẹn giờ nhắc uống thuốc tự động phát âm thanh giọng đọc nhắc nhở người cao tuổi.

---

## 🏗️ Kiến Trúc Hệ Thống

```
health-voice-project/
├── health-voice-backend/       # Spring Boot 3.3.4 (Java 21, MySQL, Spring Security, JWT)
├── health-voice-frontend/      # React 18, Vite, Tailwind CSS, Lucide Icons
├── tts-service/                # Python FastAPI Microservice (FPT AI Factory, gTTS)
├── database/                   # File khởi tạo và script CSDL MySQL
├── run_all.bat                 # Script 1-click khởi chạy toàn bộ 3 dịch vụ
└── stop_all.bat                # Script dừng an toàn toàn bộ hệ thống
```

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy

### 1. Chuẩn Bị Môi Trường
* **Java:** JDK 21 trở lên
* **Node.js:** v18 trở lên
* **Python:** v3.10 trở lên
* **Cơ sở dữ liệu:** MySQL Server (cổng 3306)

### 2. Thiết Lập Biến Môi Trường (`.env`)
Sao chép file mẫu `.env.example` thành `.env` tại thư mục gốc:
```bash
cp .env.example .env
```
Điền các khóa API cần thiết:
```properties
# Google Gemini LLM API Key
GEMINI_API_KEY=your_gemini_api_key_here

# FPT AI Factory API Key
FPT_AI_KEY=your_fpt_ai_key_here
FPT_AI_API_URL=https://mkp-api.fptcloud.com/v1/audio/speech
FPT_AI_MODEL=FPT.TTS-pro

# MySQL Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=health_voice_db
DB_USERNAME=root
DB_PASSWORD=your_password
```

### 3. Khởi Chạy Nhanh (1-Click)
Chỉ cần nhấp đúp hoặc chạy script:
```bash
./run_all.bat
```
Hoặc khởi chạy từng thành phần riêng lẻ:
* **TTS Microservice:** `cd tts-service && python -m uvicorn main:app --port 8000`
* **Backend:** `cd health-voice-backend && mvn spring-boot:run`
* **Frontend:** `cd health-voice-frontend && npm run dev`

Truy cập giao diện tại: **http://localhost:5173** (hoặc **http://localhost:3000**)

