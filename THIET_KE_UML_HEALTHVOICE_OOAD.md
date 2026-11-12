# 🏛️ TÀI LIỆU PHÂN TÍCH THIẾT KẾ HỆ THỐNG HƯỚNG ĐỐI TƯỢNG (OOAD) - UML 2.5
## DỰ ÁN: HEALTHVOICE - NỀN TẢNG XUẤT BẢN NỘI DUNG TƯ VẤN SỨC KHỎE & PODCAST GIỌNG ĐỌC AI
*(Chuẩn hóa theo mã nguồn thực tế: Java 21, Spring Boot 3.3.4, React 18, FPT.AI TTS Cloud API, MySQL 8.0)*

---

## MỤC LỤC TỔNG QUAN

1. [PHẦN 1: KẾ HOẠCH BỘ SƠ ĐỒ UML (UML IMPLEMENTATION PLAN)](#phần-1-kế-hoạch-bộ-sơ-đồ-uml-uml-implementation-plan)
2. [PHẦN 2: SƠ ĐỒ USE CASE (USE CASE DIAGRAMS)](#phần-2-sơ-đồ-use-case-use-case-diagrams)
   - 2.1. Sơ đồ Use Case Tổng Quát (General Use Case Diagram)
   - 2.2. Sơ đồ Use Case Phân Rã Nghiệp Vụ Bác Sĩ (Doctor Subsystem)
3. [PHẦN 3: SƠ ĐỒ TUẦN TỰ (SEQUENCE DIAGRAMS - TRUY VẾT LỜI GỌI HÀM)](#phần-3-sơ-đồ-tuần-tự-sequence-diagrams)
   - 3.1. Sequence Diagram: Chuẩn hóa Thuật ngữ & Tổng hợp FPT.AI Async Polling (UC05 & UC06)
   - 3.2. Sequence Diagram: Phát Âm thanh Podcast Streaming HTTP 206 Partial Content (UC08)
   - 3.3. Sequence Diagram: Đánh giá Chất lượng Âm thanh MOS Rating (UC09)
   - 3.4. Sequence Diagram: Xác thực Stateless JWT & Phân quyền RBAC (UC01)
4. [PHẦN 4: SƠ ĐỒ HOẠT ĐỘNG (ACTIVITY DIAGRAMS - PHÂN LÀN SWIMLANES)](#phần-4-sơ-đồ-hoạt-động-activity-diagrams)
   - 4.1. Activity Diagram: Quy trình Soạn thảo, Chuẩn hóa & Xuất bản Podcast Y khoa
   - 4.2. Activity Diagram: Luồng Trải nghiệm Người nghe (Khám phá -> Streaming -> Đánh giá MOS)
5. [PHẦN 5: SƠ ĐỒ LỚP THIẾT KẾ & CƠ SỞ DỮ LIỆU (DESIGN CLASS DIAGRAM & ERD)](#phần-5-sơ-đồ-lớp-thiết-kế--cơ-sở-dữ-liệu)
   - 5.1. Design Class Diagram (Sơ đồ Lớp mức Thiết kế 3 lớp)
   - 5.2. Entity Relationship Diagram (ERD chuẩn 7 bảng CSDL MySQL)

---

# PHẦN 1: KẾ HOẠCH BỘ SƠ ĐỒ UML (UML IMPLEMENTATION PLAN)

| STT | Tên Sơ Đồ | Loại Biểu Đồ (UML Type) | Mục Đích & Phạm Vi Nghiệp Vụ | Tác Nhân Liên Quan | Mã Nguồn Đối Chiếu Trong Codebase |
| :---: | :--- | :---: | :--- | :--- | :--- |
| **01** | **Use Case Tổng Quát** | Use Case Diagram | Mô tả bức tranh tổng thể 10 Use Case cốt lõi của hệ thống và phạm vi tác động của 4 Actor. | `Listener`, `Doctor`, `Admin`, `FPT.AI Cloud` | Toàn bộ các API endpoints trong hệ thống. |
| **02** | **Use Case Bác Sĩ Phân Rã** | Use Case Diagram | Đặc tả chi tiết chu trình nghiệp vụ biên tập bài viết, chuẩn hóa y khoa, thử nghiệm giọng đọc và phát hành podcast. | `Doctor`, `FPT.AI Cloud` | `DoctorStudio.jsx`, `MedicalScriptService`, `TextNormalizationService`. |
| **03** | **Xác Thực Stateless JWT** | Sequence Diagram | Mô tả luồng gửi credentials, mã hóa BCrypt, cấp phát token JWT hạn 24h và lưu giữ tại React Client. | `User`, `ReactFrontend`, `AuthController`, `AuthService`, `JwtTokenProvider` | `AuthController.java`, `AuthServiceImpl.java`, `JwtTokenProvider.java`. |
| **04** | **Chuẩn Hóa & FPT.AI TTS** | Sequence Diagram | **Luồng nghiệp vụ cốt lõi nhất**: Bác sĩ soạn bài -> regex chuẩn hóa số đo/viết tắt -> gửi POST FPT.AI -> vòng lặp Polling tải file MP3 -> lưu ổ cứng -> cập nhật CSDL. | `Doctor`, `ScriptController`, `MedicalScriptService`, `FptAiTtsService`, `FPT.AI Cloud` | `MedicalScriptServiceImpl.java`, `FptAiTtsService.java`, `TextNormalizationService.java`. |
| **05** | **Streaming HTTP 206** | Sequence Diagram | Mô tả cơ chế Web Audio Player gửi Header `Range: bytes=start-end` để nghe podcast mượt mà, hỗ trợ tua nhanh tức thì. | `Listener`, `GlobalAudioPlayer`, `StreamingController`, `FileSystem` | `StreamingController.java`, `GlobalAudioPlayer.jsx`. |
| **06** | **Chấm Điểm MOS Rating** | Sequence Diagram | Mô tả luồng người nghe gửi đánh giá chất lượng giọng đọc (1-5 sao) và hệ thống tính lại điểm trung bình của bài viết. | `Listener`, `AnalyticsController`, `RatingAnalyticsService`, `FeedbackRatingRepository` | `AnalyticsController.java`, `RatingAnalyticsService.java`, `FeedbackRating.java`. |
| **07** | **Quy Trình Xuất Bản Podcast** | Activity Diagram | Sơ đồ phân làn (Swimlanes: Bác sĩ, Backend, FPT.AI Cloud) thể hiện các quyết định (Decision), xử lý lỗi rate-limit 429 và chuyển đổi trạng thái `DRAFT` -> `PROCESSED` -> `PUBLISHED`. | `Doctor`, `Backend Core`, `FPT.AI Cloud` | `MedicalScriptServiceImpl.java`, `FptAiTtsService.java`. |
| **08** | **Trải Nghiệm Độc Giả** | Activity Diagram | Sơ đồ hoạt động thể hiện luồng người nghe tìm kiếm chuyên khoa, streaming podcast và gửi phản hồi trải nghiệm. | `Listener`, `ReactFrontend`, `Backend Core` | `PodcastFeedPage.jsx`, `PodcastDetailPage.jsx`. |
| **09** | **Design Class Diagram** | Class Diagram | Mô hình hướng đối tượng chi tiết bao gồm 7 Entities, Controller, Service, Repository, DTO và các mối quan hệ đa hình. | Hệ thống Backend | Toàn bộ package `entity`, `service`, `controller`, `repository`. |
| **10** | **ERD 7 Bảng CSDL** | Entity Relationship | Mô hình thực thể liên kết chuẩn xác 7 bảng CSDL MySQL với khóa chính (PK), khóa ngoại (FK) và bản số (Cardinality). | Database MySQL | `schema.sql`, `data.sql`, các JPA Annotations. |

---

# PHẦN 2: SƠ ĐỒ USE CASE (USE CASE DIAGRAMS)

## 2.1. Sơ đồ Use Case Tổng Quát (Usecase tổng quát)
*(Chuẩn hóa theo bố cục đối xứng 4 tác nhân: Khách vãng lai & Người dùng ở bên trái, Bác sĩ & Admin ở bên phải, Đăng nhập ở trung tâm, toàn bộ chức năng bảo mật đều có quan hệ `include` trỏ vào Đăng nhập)*

### A. Định dạng PlantUML

```plantuml
@startuml
left to right direction
skinparam packageStyle rectangle
skinparam roundcorner 10
skinparam actorStyle awesome
skinparam defaultFontName "Segoe UI"

' ==========================================
' CÁC TÁC NHÂN (ACTORS)
' ==========================================
actor "KHÁCH VÃNG LAI" as Guest
actor "NGƯỜI DÙNG" as User
actor "BÁC SĨ" as Doctor
actor "ADMIN" as Admin

' Quan hệ kế thừa: Người dùng kế thừa từ Khách vãng lai
Guest <|-- User

rectangle "Usecase tổng quát" {
    ' ==========================================
    ' CỘT TRÁI - PHÍA TRÊN: KHÁCH VÃNG LAI (4 UC)
    ' ==========================================
    usecase "Đăng kí" as UC_Register
    usecase "Xem bài viết y khoa" as UC_ViewArticle
    usecase "Xem chuyên khoa y tế" as UC_ViewCategory
    usecase "Tìm kiếm podcast" as UC_SearchPodcast

    ' ==========================================
    ' CỘT TRÁI - PHÍA DƯỚI: NGƯỜI DÙNG / BỆNH NHÂN (4 UC)
    ' ==========================================
    usecase "Nghe Podcast y tế" as UC_ListenPodcast
    usecase "Đánh giá giọng đọc MOS" as UC_RateMOS
    usecase "Tư vấn sức khỏe AI" as UC_Consult
    usecase "Lịch nhắc uống thuốc" as UC_Reminders

    ' ==========================================
    ' CỘT GIỮA: USECASE TRUNG TÂM (DÙNG CHUNG)
    ' ==========================================
    usecase "Đăng nhập" as UC_Login
    usecase "Quản lí thông tin cá nhân" as UC_Profile

    ' ==========================================
    ' CỘT PHẢI - PHÍA TRÊN: BÁC SĨ (4 UC)
    ' ==========================================
    usecase "Soạn thảo kịch bản" as UC_WriteScript
    usecase "Chuẩn hóa thuật ngữ" as UC_Normalize
    usecase "Tổng hợp giọng nói AI" as UC_Synthesize
    usecase "Xuất bản Podcast" as UC_PublishPodcast

    ' ==========================================
    ' CỘT PHẢI - PHÍA DƯỚI: QUẢN TRỊ VIÊN (4 UC - Khớp thực tế Admin Panel)
    ' ==========================================
    usecase "Quản lí chuyên khoa" as UC_ManageCategory
    usecase "Quản lí tài khoản" as UC_ManageUsers
    usecase "Quản lý Audio Cache" as UC_ManageCache
    usecase "Giám sát & Báo cáo" as UC_Analytics
}

' ==========================================
' ĐƯỜNG KẾT NỐI ACTOR BÊN TRÁI (SOLID LINES)
' ==========================================
Guest -- UC_Register
Guest -- UC_ViewArticle
Guest -- UC_ViewCategory
Guest -- UC_SearchPodcast

User -- UC_ListenPodcast
User -- UC_RateMOS
User -- UC_Consult
User -- UC_Reminders
User -- UC_Profile

' ==========================================
' ĐƯỜNG KẾT NỐI ACTOR BÊN PHẢI (SOLID LINES)
' ==========================================
Doctor -- UC_WriteScript
Doctor -- UC_Normalize
Doctor -- UC_Synthesize
Doctor -- UC_PublishPodcast
Doctor -- UC_Profile

Admin -- UC_ManageCategory
Admin -- UC_ManageUsers
Admin -- UC_ManageCache
Admin -- UC_Analytics
Admin -- UC_Profile

' ==========================================
' QUAN HỆ INCLUDE TRỎ VÀO ĐĂNG NHẬP (DASHED)
' ==========================================
' 1. Từ phía Người dùng trỏ vào Đăng nhập
UC_ListenPodcast ..> UC_Login : include
UC_RateMOS ..> UC_Login : include
UC_Consult ..> UC_Login : include
UC_Reminders ..> UC_Login : include
UC_Profile ..> UC_Login : include

' 2. Từ phía Bác sĩ trỏ vào Đăng nhập
UC_WriteScript ..> UC_Login : include
UC_Normalize ..> UC_Login : include
UC_Synthesize ..> UC_Login : include
UC_PublishPodcast ..> UC_Login : include

' 3. Từ phía Admin trỏ vào Đăng nhập
UC_ManageCategory ..> UC_Login : include
UC_ManageUsers ..> UC_Login : include
UC_ManageCache ..> UC_Login : include
UC_Analytics ..> UC_Login : include
@enduml
```

### B. Định dạng Mermaid.js

```mermaid
flowchart LR
    %% Actors
    Guest["fa:fa-user KHÁCH VÃNG LAI"]
    User["fa:fa-user-check NGƯỜI DÙNG"]
    Doctor["fa:fa-user-md BÁC SĨ"]
    Admin["fa:fa-user-shield ADMIN"]

    %% Kế thừa Actor
    User -.->|kế thừa| Guest

    subgraph System ["Usecase tổng quát"]
        direction TB

        %% Cột trái - Khách vãng lai
        subgraph ColLeftGuest ["Khách vãng lai"]
            direction TB
            UC_Register(["Đăng kí"])
            UC_ViewArticle(["Xem bài viết y khoa"])
            UC_ViewCategory(["Xem chuyên khoa y tế"])
            UC_SearchPodcast(["Tìm kiếm podcast"])
        end

        %% Cột trái - Người dùng
        subgraph ColLeftUser ["Người dùng"]
            direction TB
            UC_ListenPodcast(["Nghe Podcast y tế"])
            UC_RateMOS(["Đánh giá giọng đọc MOS"])
            UC_Consult(["Tư vấn sức khỏe AI"])
            UC_Reminders(["Lịch nhắc uống thuốc"])
        end

        %% Cột giữa - Usecase trung tâm
        subgraph ColCenter ["Dùng chung"]
            direction TB
            UC_Login(["fa:fa-key Đăng nhập"]):::centerNode
            UC_Profile(["Quản lí thông tin cá nhân"])
        end

        %% Cột phải - Bác sĩ
        subgraph ColRightDoctor ["Bác sĩ"]
            direction TB
            UC_WriteScript(["Soạn thảo kịch bản"])
            UC_Normalize(["Chuẩn hóa thuật ngữ"])
            UC_Synthesize(["Tổng hợp giọng nói AI"])
            UC_PublishPodcast(["Xuất bản Podcast"])
        end

        %% Cột phải - Admin
        subgraph ColRightAdmin ["Quản trị viên"]
            direction TB
            UC_ManageCategory(["Quản lí chuyên khoa"])
            UC_ManageUsers(["Quản lí tài khoản"])
            UC_ManageCache(["Quản lý Audio Cache"])
            UC_Analytics(["Giám sát & Báo cáo"])
        end
    end

    %% Liên kết Khách vãng lai
    Guest --- UC_Register
    Guest --- UC_ViewArticle
    Guest --- UC_ViewCategory
    Guest --- UC_SearchPodcast

    %% Liên kết Người dùng
    User --- UC_ListenPodcast
    User --- UC_RateMOS
    User --- UC_Consult
    User --- UC_Reminders
    User --- UC_Profile

    %% Liên kết Bác sĩ
    Doctor --- UC_WriteScript
    Doctor --- UC_Normalize
    Doctor --- UC_Synthesize
    Doctor --- UC_PublishPodcast
    Doctor --- UC_Profile

    %% Liên kết Admin
    Admin --- UC_ManageCategory
    Admin --- UC_ManageUsers
    Admin --- UC_ManageCache
    Admin --- UC_Analytics
    Admin --- UC_Profile

    %% Quan hệ include từ Người dùng vào Đăng nhập
    UC_ListenPodcast -.->|include| UC_Login
    UC_RateMOS -.->|include| UC_Login
    UC_Consult -.->|include| UC_Login
    UC_Reminders -.->|include| UC_Login
    UC_Profile -.->|include| UC_Login

    %% Quan hệ include từ Bác sĩ vào Đăng nhập
    UC_WriteScript -.->|include| UC_Login
    UC_Normalize -.->|include| UC_Login
    UC_Synthesize -.->|include| UC_Login
    UC_PublishPodcast -.->|include| UC_Login

    %% Quan hệ include từ Admin vào Đăng nhập
    UC_ManageCategory -.->|include| UC_Login
    UC_ManageUsers -.->|include| UC_Login
    UC_ManageCache -.->|include| UC_Login
    UC_Analytics -.->|include| UC_Login

    classDef centerNode fill:#0d9488,stroke:#042f2e,stroke-width:2px,color:#ffffff,font-weight:bold
```

---

## 2.2. Sơ đồ Use Case Phân Rã Nghiệp Vụ Bác Sĩ (Doctor Subsystem)

### A. Định dạng PlantUML

```plantuml
@startuml
left to right direction
skinparam packageStyle rectangle
skinparam roundcorner 10
skinparam actorStyle awesome

actor "Bác Sĩ Chuyên Khoa\n(Doctor)" as Doctor
actor "FPT.AI Cloud TTS" as FptAi <<External System>>

rectangle "Phân Hệ Bác Sĩ - Doctor Studio & Xuất Bản Podcast" {
    usecase "Đăng nhập Bác sĩ (ROLE_DOCTOR)" as UC_Login
    usecase "Soạn thảo kịch bản tư vấn y tế" as UC_Write
    usecase "Biên tập định dạng Medical Markdown" as UC_Markdown
    usecase "Xem trước văn bản chuẩn hóa (Preview)" as UC_PreviewText
    usecase "Chọn cấu hình giọng đọc AI (Bắc/Trung/Nam)" as UC_SelectVoice
    usecase "Tổng hợp âm thanh kịch bản (FPT.AI TTS)" as UC_Synthesize
    usecase "Nghe thử file Podcast đã tổng hợp" as UC_ListenPreview
    usecase "Xuất bản Podcast ra Thư viện công cộng" as UC_Publish
}

Doctor --> UC_Write
Doctor --> UC_SelectVoice
Doctor --> UC_Publish

UC_Write ..> UC_Login : <<include>>
UC_Write ..> UC_Markdown : <<include>>
UC_Write ..> UC_PreviewText : <<extend>>

UC_Synthesize ..> UC_SelectVoice : <<include>>
UC_Synthesize ..> UC_PreviewText : <<include>>
UC_Synthesize --> FptAi : <<calls API>>

UC_Publish ..> UC_Synthesize : <<include>>
UC_Publish ..> UC_ListenPreview : <<extend>>
@enduml
```

### B. Định dạng Mermaid.js

```mermaid
flowchart LR
    Doctor(["Bác Sĩ Chuyên Khoa (ROLE_DOCTOR)"])
    FptAi["FPT.AI Cloud TTS API"]

    subgraph DoctorStudio ["Doctor Studio - Soạn Thảo & Xuất Bản"]
        UC_Login(["Đăng nhập (ROLE_DOCTOR)"])
        UC_Write(["Soạn thảo kịch bản y khoa"])
        UC_Markdown(["Biên tập Medical Markdown"])
        UC_PreviewText(["Chuẩn hóa & Xem trước Regex"])
        UC_SelectVoice(["Chọn Giọng đọc AI"])
        UC_Synthesize(["Tổng hợp Audio qua FPT.AI"])
        UC_ListenPreview(["Nghe thử âm thanh"])
        UC_Publish(["Xuất bản Podcast ra Thư viện"])
    end

    Doctor --> UC_Write
    Doctor --> UC_SelectVoice
    Doctor --> UC_Publish

    UC_Write -.->|<<include>>| UC_Login
    UC_Write -.->|<<include>>| UC_Markdown
    UC_Write -.->|<<extend>>| UC_PreviewText
    UC_Synthesize -.->|<<include>>| UC_SelectVoice
    UC_Synthesize -.->|<<include>>| UC_PreviewText
    UC_Synthesize ==> FptAi
    UC_Publish -.->|<<include>>| UC_Synthesize
    UC_Publish -.->|<<extend>>| UC_ListenPreview
```

---

# PHẦN 3: SƠ ĐỒ TUẦN TỰ (SEQUENCE DIAGRAMS)

## 3.1. Sequence Diagram: Chuẩn hóa Thuật ngữ & Tổng hợp FPT.AI Async Polling (UC05 & UC06)

> [!IMPORTANT]
> **Điểm đột phá kỹ thuật**: FPT.AI TTS xử lý dạng **Bất Đồng Bộ (Asynchronous)**. Backend gửi văn bản qua POST, nhận lại JSON `{"async": "https://..."}`. Sau đó, `FptAiTtsService` thiết lập vòng lặp Polling (mỗi 1 giây gọi kiểm tra 1 lần, timeout 45 giây) cho đến khi file MP3 render xong thì tải binary stream về lưu đĩa vật lý `./uploads/audios/` và lưu bản ghi `AudioRecord` với trạng thái `READY`.

### A. Định dạng PlantUML

```plantuml
@startuml
autonumber
skinparam roundcorner 5
skinparam BoxPadding 10
skinparam ParticipantPadding 10

actor "Bác Sĩ\n(Doctor)" as Doctor
participant "React Frontend\n(DoctorStudio.jsx)" as Frontend
participant "ScriptController" as Controller
participant "MedicalScriptService\n(Impl)" as ScriptService
participant "TextNormalizationService" as Normalizer
participant "AudioRecordService" as AudioService
participant "FptAiTtsService" as FptService
participant "FPT.AI Cloud TTS\n(https://api.fpt.ai)" as FptCloud
database "MySQL Database" as DB
entity "FileSystem\n(./uploads/audios)" as Disk

Doctor -> Frontend: 1. Nhập kịch bản y khoa & bấm "Tổng hợp giọng nói"
activate Frontend

Frontend -> Controller: 2. POST /api/scripts/{id}/tts\n{voiceConfigId: 1, speed: 1.0}
activate Controller

Controller -> ScriptService: 3. generatePodcastAudio(scriptId, voiceConfigId, speed)
activate ScriptService

ScriptService -> AudioService: 4. generateAudioForScript(scriptId, voiceConfigId, speed)
activate AudioService

AudioService -> Normalizer: 5. normalizeMedicalText(rawContent)
activate Normalizer
note right of Normalizer
  Regex chuyển đổi:
  - 120/80 mmHg -> một trăm hai mươi trên tám mươi mi-li-mét thủy ngân
  - 500mg -> năm trăm mi-li-gam
  - THA, ĐTĐ -> tăng huyết áp, đái tháo đường
end note
Normalizer --> AudioService: 6. normalizedText
deactivate Normalizer

AudioService -> FptService: 7. synthesizeAndSaveAudio(normalizedText, voiceCode="banmai", speed=1.0)
activate FptService

FptService -> FptCloud: 8. POST /hmi/tts/v5 (Header: api-key, Body: text)
activate FptCloud
FptCloud --> FptService: 9. HTTP 200 OK {"async": "https://fpt.ai/async/abc.mp3", "error": 0}
deactivate FptCloud

loop Vòng lặp Polling (chu kỳ 1 giây, tối đa 45 giây)
    FptService -> FptCloud: 10. GET https://fpt.ai/async/abc.mp3
    activate FptCloud
    alt File chưa sẵn sàng
        FptCloud --> FptService: 11. HTTP 404 Not Found (Rendering in progress...)
    else File đã tạo xong
        FptCloud --> FptService: 12. HTTP 200 OK (Content-Type: audio/mpeg, Binary Stream)
    end
    deactivate FptCloud
end

FptService -> Disk: 13. Ghi file nhị phân vào ./uploads/audios/{uuid}.mp3
activate Disk
Disk --> FptService: 14. File lưu thành công (fileSize, durationSeconds)
deactivate Disk

FptService --> AudioService: 15. TtsResult(fileName, filePath, fileSize, duration)
deactivate FptService

AudioService -> DB: 16. INSERT INTO audio_records (script_id, voice_id, file_path, status='READY')
activate DB
DB --> AudioService: 17. AudioRecord Entity (id=105)
deactivate DB

AudioService -> DB: 18. UPDATE medical_scripts SET status='PROCESSED', normalized_content=...
activate DB
DB --> AudioService: 19. Updated
deactivate DB

AudioService --> ScriptService: 20. AudioRecord
deactivate AudioService

ScriptService --> Controller: 21. ScriptResponse (audioId, audioUrl, status='PROCESSED')
deactivate ScriptService

Controller --> Frontend: 22. HTTP 200 OK + JSON
deactivate Controller

Frontend --> Doctor: 23. Hiển thị Trình phát Audio Player cho Bác sĩ nghe thử
deactivate Frontend
@enduml
```

### B. Định dạng Mermaid.js

```mermaid
sequenceDiagram
    autonumber
    actor Doctor as Bác Sĩ (Doctor)
    participant UI as React Frontend (DoctorStudio)
    participant Ctrl as ScriptController
    participant Svc as MedicalScriptService
    participant Norm as TextNormalizationService
    participant AudioSvc as AudioRecordService
    participant FptSvc as FptAiTtsService
    participant FptAPI as FPT.AI Cloud TTS
    participant Disk as FileSystem (./uploads/audios)
    participant DB as MySQL Database

    Doctor->>UI: Bấm "Tổng Hợp Giọng Nói"
    UI->>Ctrl: POST /api/scripts/{id}/tts {voiceConfigId, speed}
    Ctrl->>Svc: generatePodcastAudio(scriptId, voiceConfigId, speed)
    Svc->>AudioSvc: generateAudioForScript(...)
    AudioSvc->>Norm: normalizeMedicalText(rawContent)
    Note over Norm: Regex chuẩn hóa: 120/80 mmHg -> số chữ, mg -> mi-li-gam
    Norm-->>AudioSvc: normalizedText
    AudioSvc->>FptSvc: synthesizeAndSaveAudio(normalizedText, voiceCode)
    
    FptSvc->>FptAPI: POST /hmi/tts/v5 (Header: api-key, text)
    FptAPI-->>FptSvc: HTTP 200 OK {"async": "https://fpt.ai/async/xxx.mp3"}

    loop Polling (1s/lần, tối đa 45s)
        FptSvc->>FptAPI: GET asyncUrl
        FptAPI-->>FptSvc: HTTP 200 OK (Binary MP3 Stream)
    end

    FptSvc->>Disk: Lưu file ./uploads/audios/{uuid}.mp3
    Disk-->>FptSvc: File Saved (fileSize, durationSeconds)
    FptSvc-->>AudioSvc: TtsResult(fileName, filePath, fileSize)

    AudioSvc->>DB: INSERT INTO audio_records (status='READY')
    AudioSvc->>DB: UPDATE medical_scripts SET status='PROCESSED'
    AudioSvc-->>Svc: AudioRecord Entity
    Svc-->>Ctrl: ScriptResponse
    Ctrl-->>UI: HTTP 200 OK (audioUrl)
    UI-->>Doctor: Kích hoạt Audio Player nghe thử
```

---

## 3.2. Sequence Diagram: Phát Âm thanh Podcast Streaming HTTP 206 Partial Content (UC08)

> [!NOTE]
> Chuẩn **HTTP 206 Partial Content** cho phép chia nhỏ file âm thanh thành các byte-range chunks. Khi người nghe bấm phát, trình duyệt gửi header `Range: bytes=0-1048575`. Khi người nghe tua (seek) đến giữa bài, trình duyệt gửi `Range: bytes=5242880-...`. Máy chủ phản hồi ngay lập tức chunk tương ứng mà không phải tải toàn bộ file từ đầu.

### A. Định dạng PlantUML

```plantuml
@startuml
autonumber
skinparam roundcorner 5

actor "Người Nghe\n(Listener)" as User
participant "GlobalAudioPlayer\n(HTML5 Audio / React)" as Player
participant "StreamingController\n(/api/audio/stream)" as StreamCtrl
participant "AudioRecordRepository" as AudioRepo
database "MySQL Database" as DB
entity "Ổ Đĩa Máy Chủ\n(./uploads/audios)" as Disk

User -> Player: 1. Bấm nút "Phát Podcast"
activate Player

Player -> StreamCtrl: 2. GET /api/audio/stream/{recordId}\nHeader: Range: bytes=0-1048575
activate StreamCtrl

StreamCtrl -> AudioRepo: 3. findById(recordId)
activate AudioRepo
AudioRepo -> DB: 4. SELECT * FROM audio_records WHERE id = recordId
activate DB
DB --> AudioRepo: 5. Trả về AudioRecord (filePath="uuid.mp3", fileSize=5242880)
deactivate DB
AudioRepo --> StreamCtrl: 6. AudioRecord Entity
deactivate AudioRepo

StreamCtrl -> Disk: 7. Mở luồng FileInputStream (uuid.mp3)
activate Disk
Disk --> StreamCtrl: 8. Đọc 1MB byte chunk đầu tiên (offset 0 -> 1048575)
deactivate Disk

StreamCtrl --> Player: 9. HTTP 206 Partial Content\nContent-Range: bytes 0-1048575/5242880\nContent-Length: 1048576\nContent-Type: audio/mpeg
deactivate StreamCtrl

Player -> User: 10. Âm thanh bắt đầu phát tức thì (0.1 giây)

... Người nghe kéo thanh tua (seek) đến phút 02:30 (50% bài) ...

User -> Player: 11. Tua thanh tiến trình đến 50%
Player -> StreamCtrl: 12. GET /api/audio/stream/{recordId}\nHeader: Range: bytes=2621440-3669999
activate StreamCtrl

StreamCtrl -> Disk: 13. File Channel skip(2621440) & đọc 1MB tiếp theo
activate Disk
Disk --> StreamCtrl: 14. Byte stream từ vị trí tua
deactivate Disk

StreamCtrl --> Player: 15. HTTP 206 Partial Content\nContent-Range: bytes 2621440-3669999/5242880
deactivate StreamCtrl

Player -> User: 16. Tiếp tục phát đoạn tua mượt mà không ngắt quãng
deactivate Player
@enduml
```

### B. Định dạng Mermaid.js

```mermaid
sequenceDiagram
    autonumber
    actor User as Người Nghe (Listener)
    participant Player as GlobalAudioPlayer (React)
    participant Ctrl as StreamingController
    participant Repo as AudioRecordRepository
    participant Disk as Ổ Đĩa (./uploads/audios)

    User->>Player: Bấm "Phát Podcast"
    Player->>Ctrl: GET /api/audio/stream/{id} (Range: bytes=0-1048575)
    Ctrl->>Repo: findById(recordId)
    Repo-->>Ctrl: AudioRecord (filePath="xxx.mp3", fileSize)
    Ctrl->>Disk: Đọc 1MB byte chunk đầu tiên
    Disk-->>Ctrl: Byte Array
    Ctrl-->>Player: HTTP 206 Partial Content (Content-Range: bytes 0-1048575/Total)
    Player-->>User: Phát âm thanh ngay lập tức (không trễ)

    Note over User,Player: Người nghe tua nhanh (Seek) đến 50%
    User->>Player: Kéo thanh thời gian đến phút 02:30
    Player->>Ctrl: GET /api/audio/stream/{id} (Range: bytes=2621440-3669999)
    Ctrl->>Disk: Seek đến byte 2621440 & đọc chunk mới
    Disk-->>Ctrl: Byte Array tiếp theo
    Ctrl-->>Player: HTTP 206 Partial Content (Content-Range: 2621440-3669999/Total)
    Player-->>User: Phát mượt mà tại điểm tua
```

---

## 3.3. Sequence Diagram: Đánh giá Chất lượng Âm thanh MOS Rating (UC09)

### A. Định dạng PlantUML

```plantuml
@startuml
autonumber
skinparam roundcorner 5

actor "Người Nghe\n(Listener)" as User
participant "React Rating Modal" as UI
participant "AnalyticsController\n(/api/analytics/ratings)" as Controller
participant "RatingAnalyticsService" as RatingService
participant "FeedbackRatingRepository" as RatingRepo
database "MySQL Database" as DB

User -> UI: 1. Chọn 5 sao MOS & nhập nhận xét "Giọng đọc truyền cảm, rõ ràng"
activate UI

UI -> Controller: 2. POST /api/analytics/ratings\n{audioRecordId: 105, mosScore: 5, comment: "..."}
activate Controller

Controller -> RatingService: 3. submitRating(audioRecordId, userId, mosScore=5, comment)
activate RatingService

RatingService -> RatingService: 4. Giới hạn điểm hợp lệ: Math.max(1, Math.min(5, mosScore))

RatingService -> DB: 5. INSERT INTO feedback_ratings (audio_record_id, user_id, mos_score, comment, created_at)
activate DB
DB --> RatingService: 6. Bản ghi đã lưu (id=42)
deactivate DB

RatingService -> RatingRepo: 7. getAverageMosScoreByScriptId(scriptId)
activate RatingRepo
RatingRepo -> DB: 8. SELECT AVG(mos_score) FROM feedback_ratings WHERE audio_record_id = ...
activate DB
DB --> RatingRepo: 9. avgMos = 4.8
deactivate DB
RatingRepo --> RatingService: 10. Điểm trung bình mới
deactivate RatingRepo

RatingService --> Controller: 11. FeedbackRating Entity
deactivate RatingService

Controller --> UI: 12. HTTP 201 Created\n{"code": 201, "message": "Đánh giá MOS thành công", "data": {...}}
deactivate Controller

UI --> User: 13. Hiển thị thông báo Toast "Cảm ơn bạn đã đánh giá chất lượng giọng đọc!"
deactivate UI
@enduml
```

### B. Định dạng Mermaid.js

```mermaid
sequenceDiagram
    autonumber
    actor User as Người Nghe (Listener)
    participant UI as React Rating Modal
    participant Ctrl as AnalyticsController
    participant Svc as RatingAnalyticsService
    participant Repo as FeedbackRatingRepository
    participant DB as MySQL Database

    User->>UI: Chọn 5 sao MOS & nhập bình luận
    UI->>Ctrl: POST /api/analytics/ratings {audioRecordId, mosScore: 5, comment}
    Ctrl->>Svc: submitRating(audioRecordId, userId, score, comment)
    Svc->>Svc: Kiểm tra hợp lệ (1 <= score <= 5)
    Svc->>DB: INSERT INTO feedback_ratings (...)
    DB-->>Svc: Saved FeedbackRating
    Svc->>Repo: getAverageMosScoreByScriptId(scriptId)
    Repo->>DB: SELECT AVG(mos_score) FROM feedback_ratings ...
    DB-->>Repo: avgScore = 4.8
    Repo-->>Svc: 4.8
    Svc-->>Ctrl: FeedbackRating
    Ctrl-->>UI: HTTP 201 Created
    UI-->>User: Cập nhật sao trung bình & Thông báo thành công
```

---

## 3.4. Sequence Diagram: Xác thực Stateless JWT & Phân quyền RBAC (UC01)

### A. Định dạng PlantUML

```plantuml
@startuml
autonumber
skinparam roundcorner 5

actor "Người Dùng / Bác Sĩ" as User
participant "React LoginPage" as UI
participant "AuthController" as AuthCtrl
participant "AuthService" as AuthSvc
participant "UserRepository" as UserRepo
participant "PasswordEncoder (BCrypt)" as BCrypt
participant "JwtTokenProvider" as JwtProv
database "MySQL Database" as DB

User -> UI: 1. Nhập username ("bs_tuanminh") & password ("123456")
activate UI

UI -> AuthCtrl: 2. POST /api/auth/login {username, password}
activate AuthCtrl

AuthCtrl -> AuthSvc: 3. login(username, password)
activate AuthSvc

AuthSvc -> UserRepo: 4. findByUsername("bs_tuanminh")
activate UserRepo
UserRepo -> DB: 5. SELECT * FROM users WHERE username = 'bs_tuanminh'
activate DB
DB --> UserRepo: 6. User Entity (BCrypt hash, role=ROLE_DOCTOR, status=1)
deactivate DB
UserRepo --> AuthSvc: 7. User Entity
deactivate UserRepo

AuthSvc -> BCrypt: 8. matches("123456", user.getPassword())
activate BCrypt
BCrypt --> AuthSvc: 9. true (Mật khẩu chính xác)
deactivate BCrypt

AuthSvc -> JwtProv: 10. generateToken(username, role="ROLE_DOCTOR")
activate JwtProv
JwtProv --> AuthSvc: 11. Chuỗi JWT Bearer Token (Ký thuật toán HS512, hạn 24h)
deactivate JwtProv

AuthSvc --> AuthCtrl: 12. AuthResponse(accessToken, username, role="ROLE_DOCTOR")
deactivate AuthSvc

AuthCtrl --> UI: 13. HTTP 200 OK + JSON Token
deactivate AuthCtrl

UI -> UI: 14. Lưu token vào localStorage & cập nhật AuthContext
UI --> User: 15. Điều hướng tự động vào Doctor Studio (/doctor)
deactivate UI
@enduml
```

### B. Định dạng Mermaid.js

```mermaid
sequenceDiagram
    autonumber
    actor User as Bác Sĩ / Người Dùng
    participant UI as React LoginPage
    participant Ctrl as AuthController
    participant Svc as AuthService
    participant Repo as UserRepository
    participant BCrypt as BCryptPasswordEncoder
    participant Jwt as JwtTokenProvider

    User->>UI: Nhập tài khoản & mật khẩu
    UI->>Ctrl: POST /api/auth/login {username, password}
    Ctrl->>Svc: login(username, password)
    Svc->>Repo: findByUsername(username)
    Repo-->>Svc: User Entity (BCrypt hash, role)
    Svc->>BCrypt: matches(rawPassword, encodedPassword)
    BCrypt-->>Svc: true (Mật khẩu đúng)
    Svc->>Jwt: generateToken(username, role)
    Jwt-->>Svc: accessToken (JWT HS512)
    Svc-->>Ctrl: AuthResponse(accessToken, role)
    Ctrl-->>UI: HTTP 200 OK
    UI->>UI: Lưu Token vào LocalStorage
    UI-->>User: Điều hướng vào Dashboard tương ứng
```

---

# PHẦN 4: SƠ ĐỒ HOẠT ĐỘNG (ACTIVITY DIAGRAMS)

## 4.1. Activity Diagram: Quy trình Soạn thảo, Chuẩn hóa & Xuất bản Podcast Y khoa

### A. Định dạng PlantUML

```plantuml
@startuml
skinparam roundcorner 10
skinparam defaultFontName "Segoe UI"

|Bác Sĩ (Doctor)|
start
:Truy cập phân hệ Doctor Studio (/doctor);
:Tạo kịch bản y tế mới;
:Nhập tiêu đề, chọn chuyên khoa & soạn thảo nội dung (Markdown);

|Hệ Thống Backend (Spring Boot)|
:Lưu kịch bản vào CSDL với trạng thái **DRAFT**;
:Kích hoạt TextNormalizationService;
:Chạy bộ quy tắc Regex y học:
- Quy đổi huyết áp (mmHg) sang chữ
- Quy đổi liều dùng (mg, ml, mmol/L)
- Phiên âm thuật ngữ viết tắt (THA, ĐTĐ, SpO2);
:Cập nhật trường normalized_content;

|Bác Sĩ (Doctor)|
:Xem bản đối chiếu văn bản gốc và văn bản chuẩn hóa;
:Chọn giọng đọc AI (Ban Mai, Thu Minh...) và tốc độ phát âm;
:Bấm nút "Tổng hợp giọng nói";

|Hệ Thống Backend (Spring Boot)|
:Gửi yêu cầu POST chứa văn bản sang FPT.AI API;

|FPT.AI Cloud TTS|
:Tiếp nhận văn bản & khởi tạo luồng render bất đồng bộ;
:Trả về URL Async {"async": "https://fpt.ai/async/..."};

|Hệ Thống Backend (Spring Boot)|
while (File MP3 đã sẵn sàng?) is (Chưa / Đang xử lý)
    :Chờ 1 giây (Thread.sleep);
    :Gửi GET request kiểm tra URL Async;
endwhile (Đã hoàn tất / HTTP 200)

:Tải luồng nhị phân MP3;
:Lưu file vào ổ đĩa máy chủ (./uploads/audios/{uuid}.mp3);
:Tạo bản ghi mới trong bảng **audio_records** (status = 'READY');
:Cập nhật trạng thái kịch bản thành **PROCESSED**;

|Bác Sĩ (Doctor)|
:Audio Player hiển thị trên giao diện;
:Nghe thử toàn bộ kịch bản phát âm;

if (Chất lượng âm thanh đạt yêu cầu?) then (Chưa đạt)
    :Chỉnh sửa lại nội dung văn bản hoặc đổi giọng đọc;
    detach
else (Đạt chuẩn y khoa)
    :Bấm nút "Xuất bản Podcast";
endif

|Hệ Thống Backend (Spring Boot)|
:Cập nhật trạng thái kịch bản thành **PUBLISHED**;

|Người Nghe (Listener)|
:Bài viết & Podcast xuất hiện công khai trên Thư viện công cộng;
stop
@enduml
```

### B. Định dạng Mermaid.js

```mermaid
flowchart TD
    subgraph DoctorLane [Bác Sĩ - Doctor Studio]
        A([Bắt đầu]) --> B[Soạn thảo kịch bản y khoa Markdown]
        B --> C[Xem trước văn bản đối soát]
        C --> D[Chọn Giọng đọc AI & Bấm Tổng Hợp]
        D --> E{Nghe thử đạt chuẩn?}
        E -- Không đạt --> B
        E -- Đạt chuẩn --> F[Bấm Xuất Bản Podcast]
    end

    subgraph BackendLane [Hệ Thống Backend Core]
        B --> G[Lưu DB với trạng thái DRAFT]
        G --> H[Chạy TextNormalizationService Regex]
        H --> C
        D --> I[Gửi POST sang FPT.AI Cloud]
        J[Nhận Link Async] --> K{Polling Async URL}
        K -- Đang render --> L[Đợi 1 giây] --> K
        K -- Hoàn tất HTTP 200 --> M[Tải MP3 lưu ./uploads/audios]
        M --> N[Tạo audio_records READY]
        N --> O[Cập nhật script PROCESSED]
        O --> E
        F --> P[Cập nhật script PUBLISHED]
    end

    subgraph CloudLane [FPT.AI Cloud TTS]
        I --> Q[Xử lý tổng hợp bất đồng bộ]
        Q --> J
    end

    subgraph PublicLane [Thư Viện Công Cộng]
        P --> R([Podcast phát hành công khai cho Độc giả])
    end
```

---

## 4.2. Activity Diagram: Luồng Trải nghiệm Người nghe

### A. Định dạng PlantUML

```plantuml
@startuml
skinparam roundcorner 10

|Người Nghe / Bệnh Nhân|
start
:Truy cập Thư viện Podcast Sức khỏe (/podcasts);
:Tìm kiếm theo từ khóa hoặc lọc theo Chuyên khoa (Tim mạch, Nội tiết...);
:Bấm vào bài viết muốn tìm hiểu;

|Hệ Thống Backend|
:Truy vấn bài viết có trạng thái PUBLISHED;
:Trả về nội dung bài viết định dạng Medical Markdown;
:Trả về thông tin bản ghi âm thanh AudioRecord đi kèm;

|Người Nghe / Bệnh Nhân|
:Đọc nội dung bài viết và hướng dẫn lâm sàng;
:Bấm nút "Nghe Podcast" trên thanh Player ghim đáy màn hình;

|Hệ Thống Backend|
:Nhận request GET /api/audio/stream/{recordId};
:Đọc tệp MP3 theo chuẩn HTTP 206 Partial Content Byte-range;
:Tăng biến đếm lượt nghe (listen_count = listen_count + 1);

|Người Nghe / Bệnh Nhân|
:Lắng nghe giọng đọc AI phát âm chuẩn xác các chỉ số y tế;
:Có thể tua nhanh, điều chỉnh tốc độ đọc (1.0x, 1.25x, 1.5x);

if (Người nghe muốn đánh giá chất lượng?) then (Có)
    :Mở hộp thoại đánh giá MOS;
    :Chọn số sao (1 đến 5 sao) và để lại bình luận góp ý;
    |Hệ Thống Backend|
    :Lưu đánh giá vào bảng feedback_ratings;
    :Tính toán lại điểm MOS trung bình cho bài viết;
else (Không)
endif

|Người Nghe / Bệnh Nhân|
stop
@enduml
```

### B. Định dạng Mermaid.js

```mermaid
flowchart TD
    Start([Bắt đầu]) --> Browse[Duyệt Thư viện & Lọc theo Chuyên khoa]
    Browse --> SelectArticle[Chọn bài viết y khoa]
    SelectArticle --> ReadArticle[Đọc nội dung & Xem hướng dẫn điều trị]
    ReadArticle --> PlayAudio[Bấm Phát Podcast trên Player nổi]
    
    subgraph StreamingEngine [Cơ chế Phát Streaming]
        PlayAudio --> RequestByte[Gửi Header Range: bytes=0-1MB]
        RequestByte --> Stream206[Backend trả về HTTP 206 Partial Content]
        Stream206 --> Listen[Người bệnh nghe audio không trễ]
        Listen --> Seek[Tua âm thanh mượt mà]
    end

    Seek --> RateDecision{Đánh giá giọng đọc?}
    RateDecision -- Có --> SubmitMOS[Chấm 1-5 sao MOS & Nhận xét]
    SubmitMOS --> SaveRating[Lưu feedback_ratings & Tính lại điểm TB]
    SaveRating --> End([Kết thúc])
    RateDecision -- Không --> End
```

---

# PHẦN 5: SƠ ĐỒ LỚP THIẾT KẾ & CƠ SỞ DỮ LIỆU

## 5.1. Design Class Diagram (Sơ đồ Lớp mức Thiết kế 3 lớp)

Ánh xạ chính xác 100% các Class, Entity, Service và Controller có trong codebase Spring Boot:

### A. Định dạng PlantUML

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam roundcorner 5
skinparam defaultFontName "Consolas"

package "com.healthvoice.entity" {
    class Role {
        - id: Integer
        - name: String
        + getId(): Integer
        + getName(): String
    }

    class User {
        - id: Long
        - username: String
        - password: String
        - fullName: String
        - email: String
        - status: Integer
        - createdAt: LocalDateTime
        + getId(): Long
        + getUsername(): String
        + getRole(): Role
    }

    class Category {
        - id: Integer
        - code: String
        - name: String
        - description: String
        - isActive: Boolean
        + getId(): Integer
        + getCode(): String
    }

    class MedicalScript {
        - id: Long
        - title: String
        - summaryText: String
        - rawContent: String
        - normalizedContent: String
        - status: String
        - createdAt: LocalDateTime
        - updatedAt: LocalDateTime
        + getId(): Long
        + getTitle(): String
        + getStatus(): String
        + setStatus(status: String): void
    }

    class VoiceConfig {
        - id: Integer
        - voiceName: String
        - voiceCode: String
        - gender: String
        - region: String
        - defaultSpeed: Float
        - isActive: Boolean
        + getId(): Integer
        + getVoiceCode(): String
    }

    class AudioRecord {
        - id: Long
        - filePath: String
        - fileSize: Long
        - durationSeconds: Integer
        - status: String
        - listenCount: Long
        - createdAt: LocalDateTime
        + getId(): Long
        + getFilePath(): String
        + getListenCount(): Long
    }

    class FeedbackRating {
        - id: Long
        - mosScore: Integer
        - comment: String
        - createdAt: LocalDateTime
        + getId(): Long
        + getMosScore(): Integer
    }
}

package "com.healthvoice.service" {
    class FptAiTtsService {
        - apiUrl: String
        - apiKey: String
        - uploadDir: String
        - httpClient: HttpClient
        + synthesizeAndSaveAudio(text: String, voice: String, speed: Double): TtsResult
        - sendTtsRequest(text: String, voice: String, speed: Double): String
        - pollAndDownloadAudio(asyncUrl: String, dest: Path): Long
    }

    class TextNormalizationService {
        - DIGITS: String[]
        + normalizeMedicalText(rawText: String): String
        + convertNumberToWords(number: int): String
    }

    class AudioRecordService {
        + generateAudioForScript(scriptId: Long, voiceId: Integer, speed: Double): AudioRecord
        + incrementListenCount(id: Long): void
    }

    class MedicalScriptService {
        + createScript(request: ScriptCreateRequest): ScriptResponse
        + normalizeScriptContent(id: Long): ScriptResponse
        + generatePodcastAudio(scriptId: Long, voiceId: Integer, speed: Double): AudioRecord
        + publishScript(scriptId: Long): ScriptResponse
    }

    class RatingAnalyticsService {
        + submitRating(audioId: Long, userId: Long, score: int, comment: String): FeedbackRating
        + getScriptRatingDetails(scriptId: Long): Map<String, Object>
    }
}

package "com.healthvoice.controller" {
    class ScriptController {
        + createScript(request: ScriptCreateRequest): ResponseEntity
        + normalizeScript(id: Long): ResponseEntity
        + synthesizeAudio(id: Long, payload: Map): ResponseEntity
        + publishScript(id: Long): ResponseEntity
    }

    class StreamingController {
        + streamAudioByRecordId(recordId: Long, rangeHeader: String): ResponseEntity
        + streamAudioByFileName(fileName: String, rangeHeader: String): ResponseEntity
    }

    class AnalyticsController {
        + submitMosRating(audioId: Long, payload: Map): ResponseEntity
        + getScriptRatings(scriptId: Long): ResponseEntity
    }
}

' Mối quan hệ giữa các Entity
User "n" --> "1" Role : role_id
MedicalScript "n" --> "1" Category : category_id
MedicalScript "n" --> "1" User : doctor_id
AudioRecord "n" --> "1" MedicalScript : script_id
AudioRecord "n" --> "1" VoiceConfig : voice_config_id
FeedbackRating "n" --> "1" AudioRecord : audio_record_id
FeedbackRating "n" --> "0..1" User : user_id

' Mối quan hệ giữa Service và Entity / Controller
MedicalScriptService ..> MedicalScript
MedicalScriptService --> TextNormalizationService
MedicalScriptService --> AudioRecordService
AudioRecordService --> FptAiTtsService
AudioRecordService ..> AudioRecord
ScriptController --> MedicalScriptService
StreamingController --> AudioRecord
AnalyticsController --> RatingAnalyticsService
RatingAnalyticsService ..> FeedbackRating
@enduml
```

### B. Định dạng Mermaid.js

```mermaid
classDiagram
    class Role {
        +Integer id
        +String name
    }

    class User {
        +Long id
        +String username
        +String fullName
        +String email
        +Integer status
    }

    class Category {
        +Integer id
        +String code
        +String name
        +Boolean isActive
    }

    class MedicalScript {
        +Long id
        +String title
        +String rawContent
        +String normalizedContent
        +String status
    }

    class VoiceConfig {
        +Integer id
        +String voiceName
        +String voiceCode
        +String region
        +Float defaultSpeed
    }

    class AudioRecord {
        +Long id
        +String filePath
        +Long fileSize
        +Integer durationSeconds
        +String status
        +Long listenCount
    }

    class FeedbackRating {
        +Long id
        +Integer mosScore
        +String comment
        +LocalDateTime createdAt
    }

    User --> Role : role_id
    MedicalScript --> Category : category_id
    MedicalScript --> User : doctor_id
    AudioRecord --> MedicalScript : script_id
    AudioRecord --> VoiceConfig : voice_config_id
    FeedbackRating --> AudioRecord : audio_record_id
    FeedbackRating --> User : user_id
```

---

## 5.2. Entity Relationship Diagram (ERD chuẩn 7 bảng CSDL MySQL)

### A. Định dạng PlantUML

```plantuml
@startuml
skinparam roundcorner 5
skinparam defaultFontName "Consolas"

entity "roles" as roles {
    * id : INT <<PK, AI>>
    --
    * name : VARCHAR(50) <<UNIQUE>>
}

entity "users" as users {
    * id : BIGINT <<PK, AI>>
    --
    * username : VARCHAR(100) <<UNIQUE>>
    * password : VARCHAR(255)
    * full_name : VARCHAR(150)
    * email : VARCHAR(150) <<UNIQUE>>
    * role_id : INT <<FK>>
    * status : INT [1: ACTIVE, 0: LOCKED]
    * created_at : DATETIME
}

entity "categories" as categories {
    * id : INT <<PK, AI>>
    --
    * code : VARCHAR(50) <<UNIQUE>>
    * name : VARCHAR(150)
    description : TEXT
    * is_active : BOOLEAN
}

entity "medical_scripts" as medical_scripts {
    * id : BIGINT <<PK, AI>>
    --
    * title : VARCHAR(255)
    summary_text : TEXT
    * raw_content : LONGTEXT
    normalized_content : LONGTEXT
    * category_id : INT <<FK>>
    * doctor_id : BIGINT <<FK>>
    * status : VARCHAR(30) [DRAFT, PROCESSED, PUBLISHED]
    * created_at : DATETIME
    updated_at : DATETIME
}

entity "voice_configs" as voice_configs {
    * id : INT <<PK, AI>>
    --
    * voice_name : VARCHAR(100)
    * voice_code : VARCHAR(100) <<UNIQUE>>
    * gender : VARCHAR(10)
    * region : VARCHAR(50)
    default_speed : FLOAT
    * is_active : BOOLEAN
}

entity "audio_records" as audio_records {
    * id : BIGINT <<PK, AI>>
    --
    * script_id : BIGINT <<FK>>
    * voice_config_id : INT <<FK>>
    * file_path : VARCHAR(500)
    file_size : BIGINT
    duration_seconds : INT
    * status : VARCHAR(30) [READY, FAILED]
    * listen_count : BIGINT
    * created_at : DATETIME
}

entity "feedback_ratings" as feedback_ratings {
    * id : BIGINT <<PK, AI>>
    --
    * audio_record_id : BIGINT <<FK>>
    user_id : BIGINT <<FK, NULLABLE>>
    * mos_score : INT [1 -> 5]
    comment : TEXT
    * created_at : DATETIME
}

' Các mối quan hệ chuẩn 1 - N
roles ||--o{ users : "role_id"
categories ||--o{ medical_scripts : "category_id"
users ||--o{ medical_scripts : "doctor_id"
medical_scripts ||--o{ audio_records : "script_id"
voice_configs ||--o{ audio_records : "voice_config_id"
audio_records ||--o{ feedback_ratings : "audio_record_id"
users ||--o{ feedback_ratings : "user_id"
@enduml
```

### B. Định dạng Mermaid.js

```mermaid
erDiagram
    roles ||--o{ users : "has"
    categories ||--o{ medical_scripts : "categorizes"
    users ||--o{ medical_scripts : "authors"
    medical_scripts ||--o{ audio_records : "generates"
    voice_configs ||--o{ audio_records : "configures"
    audio_records ||--o{ feedback_ratings : "receives"
    users ||--o{ feedback_ratings : "rates"

    roles {
        int id PK
        string name UK
    }

    users {
        bigint id PK
        string username UK
        string password
        string full_name
        string email UK
        int role_id FK
        int status
        datetime created_at
    }

    categories {
        int id PK
        string code UK
        string name
        string description
        boolean is_active
    }

    medical_scripts {
        bigint id PK
        string title
        text summary_text
        longtext raw_content
        longtext normalized_content
        int category_id FK
        bigint doctor_id FK
        string status
        datetime created_at
        datetime updated_at
    }

    voice_configs {
        int id PK
        string voice_name
        string voice_code UK
        string gender
        string region
        float default_speed
        boolean is_active
    }

    audio_records {
        bigint id PK
        bigint script_id FK
        int voice_config_id FK
        string file_path
        bigint file_size
        int duration_seconds
        string status
        bigint listen_count
        datetime created_at
    }

    feedback_ratings {
        bigint id PK
        bigint audio_record_id FK
        bigint user_id FK
        int mos_score
        text comment
        datetime created_at
    }
```

---
*Tài liệu phân tích thiết kế OOAD & UML 2.5 được xây dựng tự động dựa trên quét toàn diện mã nguồn dự án HealthVoice 2.0.*

