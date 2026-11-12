-- ============================================================================
-- HEALTH PODCASTS SCHEMA & SEED DATA (PRODUCTION READY)
-- ============================================================================

CREATE TABLE IF NOT EXISTS `health_podcasts` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `author_id` BIGINT NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) UNIQUE NOT NULL,
    `category` VARCHAR(50) NOT NULL,
    `summary` TEXT NOT NULL,
    `content` LONGTEXT NOT NULL,
    `thumbnail_url` TEXT NOT NULL,
    `default_voice` VARCHAR(30) DEFAULT 'banmai',
    `audio_url` TEXT,
    `audio_duration_seconds` INT DEFAULT 0,
    `status` VARCHAR(20) DEFAULT 'PUBLISHED',
    `views_count` INT DEFAULT 0,
    `listen_count` INT DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_podcast_author` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Cập nhật danh tính các bác sĩ tác giả theo đúng chuẩn chuyên môn
UPDATE `users` SET `full_name` = 'BS. CKII Nguyễn Văn Hùng' WHERE `id` = 2;
UPDATE `users` SET `full_name` = 'ThS. BS Trần Thị Mai' WHERE `id` = 3;
UPDATE `users` SET `full_name` = 'BS. Lê Hoàng Nam' WHERE `id` = 4;

-- Xóa dữ liệu cũ nếu có để tránh trùng lặp slug khi re-run
DELETE FROM `health_podcasts` WHERE `slug` IN (
    'nhan-dien-som-quy-tac-fast-trong-4-gio-vang-cap-cuu-dot-quy-nao',
    'kiem-soat-chi-so-huyet-ap-140-90-mmhg-va-che-do-an-giam-muoi-o-nguoi-cao-tuoi',
    'huong-dan-so-cuu-bong-nhiet-va-nuoc-soi-dung-cach-tai-nha-tranh-hoai-tu'
);

-- Bài 1 (Thần kinh): Quy tắc FAST
INSERT INTO `health_podcasts` (
    `author_id`, `title`, `slug`, `category`, `summary`, `content`,
    `thumbnail_url`, `default_voice`, `audio_url`, `audio_duration_seconds`, `status`, `views_count`, `listen_count`
) VALUES (
    2,
    'Nhận diện sớm quy tắc FAST trong 4 giờ vàng cấp cứu đột quỵ não',
    'nhan-dien-som-quy-tac-fast-trong-4-gio-vang-cap-cuu-dot-quy-nao',
    'THAN_KINH',
    'Đột quỵ não là tình trạng cấp cứu y tế tối khẩn cấp. Nắm vững quy tắc FAST giúp người nhà phát hiện sớm và đưa bệnh nhân đến bệnh viện trong 4.5 giờ vàng để được can thiệp tiêu sợi huyết, cứu sống tính mạng và hạn chế tối đa di chứng tàn phế.',
    '### 1. Tầm quan trọng sống còn của "Thời gian vàng" trong đột quỵ não\n\nĐột quỵ não (tai biến mạch máu não) xảy ra khi dòng máu cung cấp cho một phần não bộ bị ngắt quãng do tắc nghẽn cục máu đông (nhồi máu não) hoặc vỡ mạch máu (xuất huyết não). Mỗi phút trôi qua kể từ khi khởi phát, có khoảng **2 triệu tế bào nơ-ron thần kinh** bị hoại tử vĩnh viễn. \n\nCửa sổ thời gian vàng để dùng thuốc tiêu sợi huyết đường tĩnh mạch (rtPA) là **dưới 4.5 giờ**, và can thiệp lấy huyết khối cơ học bằng dụng cụ là **dưới 6 giờ** (một số ca có thể mở rộng đến 24 giờ dựa trên hình ảnh MRI tưới máu não). Càng đến viện sớm, cơ hội hồi phục hoàn toàn không để lại di chứng liệt nửa người càng cao.\n\n---\n\n### 2. Quy tắc FAST quốc tế – 4 dấu hiệu nhận biết cấp tốc\n\nBất kỳ ai trong gia đình cũng cần ghi nhớ 4 chữ cái vàng **F - A - S - T**:\n\n*   **F - Face (Khuôn mặt):** Yêu cầu người bệnh cười hoặc nhe răng. Quan sát thấy một bên mặt bị xệ xuống, khóe miệng méo lệch, nếp nhăn mũi má một bên mờ đi rõ rệt.\n*   **A - Arms (Tay và chân):** Yêu cầu người bệnh giơ cả hai tay lên cao về phía trước trong 10 giây. Người bị đột quỵ sẽ không nâng được một bên tay, hoặc tay bên tổn thương bị rơi từ từ xuống do yếu liệt cơ.\n*   **S - Speech (Giọng nói & Ngôn ngữ):** Yêu cầu người bệnh lặp lại một câu nói đơn giản như "Hôm nay trời nắng đẹp". Người bệnh nói ngọng, đớ lưỡi, phát âm dính chữ, dùng sai từ hoặc không hiểu được lời người khác nói.\n*   **T - Time (Thời gian & Hành động khẩn cấp):** Khi xuất hiện dù chỉ MỘT trong ba dấu hiệu trên, hãy gọi ngay **Tổng đài Cấp cứu 115** hoặc đưa bệnh nhân đến cơ sở y tế có Đơn vị Đột quỵ gần nhất ngay lập tức. Ghi lại chính xác giờ khởi phát đầu tiên.\n\n---\n\n### 3. Những sai lầm chết người cần TUYỆT ĐỐI TRÁNH\n\nTrong thực tế lâm sàng, nhiều ca đột quỵ tử vong hoặc tàn tật nặng nề do người nhà áp dụng các phương pháp truyền miệng phản khoa học:\n\n1.  **TUYỆT ĐỐI KHÔNG cạo gió, giác hơi, bấm huyệt:** Làm tăng huyết áp đột ngột và làm chậm trễ thời gian vàng.\n2.  **TUYỆT ĐỐI KHÔNG chích máu đầu ngón tay hay dái tai:** Vừa gây đau đớn kích thích mạch máu, vừa có nguy cơ nhiễm trùng và hoàn toàn vô tác dụng với cục máu đông trong lòng mạch não.\n3.  **TUYỆT ĐỐI KHÔNG cho uống viên An Cung hay nước đường/chanh:** Khi đột quỵ, phản xạ nuốt của hầu họng bị liệt. Việc đổ nước hoặc viên thuốc lớn vào họng sẽ gây sặc thẳng vào đường thở dẫn đến suy hô hấp cấp và tử vong ngay tại chỗ.\n\n---\n\n### 4. Các bước sơ cứu tại chỗ chuẩn y khoa trong lúc chờ xe cấp cứu\n\n*   Đặt bệnh nhân nằm trên mặt phẳng thoáng khí, kê đầu cao 30 độ nếu bệnh nhân tỉnh táo.\n*   Nếu người bệnh hôn mê hoặc nôn ói: Lập tức đặt nằm nghiêng an toàn một bên (tư thế hồi sức), lau sạch đờm dãi trong miệng để đường thở thông thoáng.\n*   Nới lỏng cúc áo, thắt lưng, tháo răng giả (nếu có).\n*   Không tự ý cho dùng bất kỳ loại thuốc hạ áp nào khi chưa có chỉ định của bác sĩ chuyên khoa.',
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop',
    'banmai',
    '/audio/podcasts/podcast_stroke_fast.mp3',
    245,
    'PUBLISHED',
    342,
    188
);

-- Bài 2 (Tim mạch): Huyết áp & Muối
INSERT INTO `health_podcasts` (
    `author_id`, `title`, `slug`, `category`, `summary`, `content`,
    `thumbnail_url`, `default_voice`, `audio_url`, `audio_duration_seconds`, `status`, `views_count`, `listen_count`
) VALUES (
    3,
    'Kiểm soát chỉ số huyết áp 140/90 mmHg và chế độ ăn giảm muối ở người cao tuổi',
    'kiem-soat-chi-so-huyet-ap-140-90-mmhg-va-che-do-an-giam-muoi-o-nguoi-cao-tuoi',
    'TIM_MACH',
    'Tăng huyết áp được ví như "kẻ giết người thầm lặng". Việc duy trì chỉ số huyết áp dưới 140/90 mmHg kết hợp chế độ ăn giảm muối dưới 5g/ngày là chìa khóa then chốt ngăn ngừa đột quỵ và suy tim ở người cao tuổi.',
    '### 1. Vì sao huyết áp 140/90 mmHg là ngưỡng ranh giới đỏ?\n\nTheo khuyến cáo của Hội Tim mạch học Việt Nam và Phân hội Tăng huyết áp Quốc tế (ISH), một người được chẩn đoán Tăng huyết áp khi chỉ số đo tại phòng khám từ **140/90 mmHg trở lên** qua ít nhất 2 lần đo ở 2 buổi khác nhau.\n\n*   **Chỉ số huyết áp tâm thu (số trên):** Thể hiện áp lực máu lên thành động mạch khi tim co bóp tống máu.\n*   **Chỉ số huyết áp tâm trương (số dưới):** Thể hiện áp lực máu khi tim giãn ra nghỉ ngơi.\n\nỞ người cao tuổi, thành mạch xơ cứng khiến áp lực tăng cao. Mục tiêu điều trị tối ưu ở đa số người bệnh là đưa huyết áp về **dưới 130/80 mmHg** để bảo vệ tim, thận và mắt.\n\n---\n\n### 2. Kỹ thuật tự đo huyết áp chính xác tại nhà\n\nNhiều bệnh nhân gặp hội chứng "áo choàng trắng" (huyết áp vọt lên khi gặp bác sĩ). Do đó, đo huyết áp tại nhà có giá trị chẩn đoán và theo dõi rất thực tế:\n\n*   **Chuẩn bị:** Nghỉ ngơi yên tĩnh ít nhất 5 đến 10 phút trước khi đo. Không uống trà đặc, cà phê, rượu bia hoặc hút thuốc lá trong 30 phút trước đó.\n*   **Tư thế:** Ngồi trên ghế tựa có lưng thẳng, hai bàn chân đặt phẳng trên sàn nhà, không bắt chéo chân. Đặt cánh tay trên bàn sao cho bao cuốn bắp tay ngang tầm tim.\n*   **Loại máy:** Nên sử dụng máy đo huyết áp điện tử bắp tay tự động có nguồn gốc xuất xứ rõ ràng, đã kiểm định chuẩn y tế (tránh dùng máy đo cổ tay vì sai số lớn).\n*   **Thời điểm:** Đo 2 lần mỗi ngày: buổi sáng sau khi thức dậy (trước khi uống thuốc) và buổi tối trước khi đi ngủ. Ghi chép nhật ký đầy đủ.\n\n---\n\n### 3. Chế độ ăn giảm muối theo chuẩn Tổ chức Y tế Thế giới (WHO)\n\nLượng muối natri dư thừa làm giữ nước trong lòng mạch, tăng thể tích tuần hoàn và co thắt tiểu động mạch, đẩy huyết áp tăng vọt.\n\n*   **Khuyến cáo:** Giới hạn lượng muối dưới **5 gam NaCl mỗi ngày** (tương đương khoảng 1 muỗng cà phê gạt ngang).\n*   **Cách giảm muối thực tế:**\n    *   Chấm nhẹ hoặc bỏ thói quen dùng nước mắm nguyên chất, muối tiêu chanh trong bữa ăn.\n    *   Tuyệt đối hạn chế các loại thực phẩm chế biến sẵn: xúc xích, thịt xông khói, mì ăn liền, cá hộp, đồ kho mặn.\n    *   Không ăn dưa cà muối chua, mắm tôm, mắm tép vì hàm lượng muối cực kỳ cao.\n\n---\n\n### 4. Tăng cường Kali và Magie tự nhiên bảo vệ mạch máu\n\nKali giúp thận đào thải bớt natri qua đường nước tiểu và làm giãn cơ trơn mạch máu. Hãy bổ sung:\n*   Trái cây tươi: Chuối chín (1-2 quả/ngày), cam, quýt, bưởi, đu đủ, bơ.\n*   Rau củ giàu chất xơ: Rau bina (chân vịt), bông cải xanh, bí đỏ, cà chua.\n*   Các loại đậu hạt: Đậu đen, đậu nành, hạt óc chó, hạnh nhân.\n\n---\n\n### 5. Dấu hiệu cơn tăng huyết áp kịch phát cần nhập viện ngay\n\nKhi chỉ số huyết áp đột ngột vọt lên trên **180/120 mmHg**, đi kèm các dấu hiệu tổn thương cơ quan đích như: đau tức ngực dữ dội, khó thở cấp, đau đầu dữ dội vùng chẩm gáy, hoa mắt nhìn đôi, buồn nôn — hãy gọi cấp cứu ngay lập tức để phòng ngừa xuất huyết não và nhồi máu cơ tim.',
    'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&auto=format&fit=crop',
    'thuminh',
    '/audio/podcasts/podcast_hypertension_salt.mp3',
    210,
    'PUBLISHED',
    512,
    264
);

-- Bài 3 (Sơ cứu): Bỏng nhiệt & Nước sôi
INSERT INTO `health_podcasts` (
    `author_id`, `title`, `slug`, `category`, `summary`, `content`,
    `thumbnail_url`, `default_voice`, `audio_url`, `audio_duration_seconds`, `status`, `views_count`, `listen_count`
) VALUES (
    4,
    'Hướng dẫn sơ cứu bỏng nhiệt và nước sôi đúng cách tại nhà tránh hoại tử',
    'huong-dan-so-cuu-bong-nhiet-va-nuoc-soi-dung-cach-tai-nha-tranh-hoai-tu',
    'SO_CUU',
    'Bỏng nước sôi và bỏng nhiệt rất phổ biến trong sinh hoạt gia đình. Sơ cứu đúng cách bằng nước mát trong 15-20 phút đầu tiên quyết định đến 80% khả năng hồi phục của làn da và ngăn ngừa nhiễm trùng, sẹo co rút.',
    '### 1. Phân loại 3 mức độ bỏng nhiệt lâm sàng\n\nHiểu đúng mức độ bỏng giúp người chăm sóc có thái độ xử trí phù hợp:\n\n*   **Bỏng độ 1 (Bỏng nông bề mặt):** Da chỉ bị đỏ, sưng nhẹ, rát buốt nhưng không xuất hiện bọng nước (thường gặp khi chạm nhẹ vào nồi canh nóng hoặc cháy nắng). Lớp biểu bì sẽ tự lành sau 3 đến 5 ngày.\n*   **Bỏng độ 2 (Tổn thương lớp trung bì):** Da đỏ ửng kèm theo các nốt phỏng nước (bọngng nước chứa dịch trong), đau rát dữ dội. Rất dễ nhiễm trùng nếu nốt phỏng bị vỡ.\n*   **Bỏng độ 3 (Bỏng sâu toàn bộ lớp da):** Da chuyển màu trắng bệch như sáp, xám than hoặc cháy đen khô ráp. Vùng bỏng mất cảm giác đau do các đầu tận cùng dây thần kinh cảm giác đã bị phá hủy hoàn toàn. Cần phẫu thuật ghép da.\n\n---\n\n### 2. Quy trình 4 bước sơ cứu vàng tại chỗ\n\n*   **Bước 1: Loại bỏ nguồn nhiệt ngay lập tức**\n    Kéo nạn nhân ra khỏi khu vực nguy hiểm. Cởi bỏ quần áo dính nước sôi hoặc dầu mỡ một cách cẩn thận. Nếu quần áo dính chặt vào da thịt, dùng kéo cắt xung quanh mép vải, **tuyệt đối không giật mạnh** vì sẽ lột theo cả mảng da non.\n*   **Bước 2: Ngâm xả liên tục dưới vòi nước mát sạch**\n    Đây là bước QUAN TRỌNG NHẤT. Để vùng da bị bỏng dưới vòi nước mát chảy nhẹ (nhiệt độ nước từ 16 đến 20 độ C) trong thời gian liên tục từ **15 đến 20 phút**.\n    *Tác dụng:* Giúp hạ nhiệt độ mô sâu tức thì, chặn đứng quá trình hoại tử protein tế bào, giảm đau rát và giảm tối đa độ sâu của vết bỏng.\n*   **Bước 3: Che phủ và bảo vệ vết bỏng**\n    Dùng gạc vô khuẩn hoặc một miếng vải sạch ẩm, không có xơ vải đắp nhẹ lên vết bỏng. Băng lỏng tay để tránh cọ xát. Không băng quá chặt làm hạn chế lưu thông máu.\n*   **Bước 4: Bổ sung nước và chuyển đến cơ sở y tế**\n    Cho nạn nhân uống nước ấm pha chút muối hoặc dung dịch oresol từng ngụm nhỏ để bù lượng dịch thoát mạch.',
    'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop',
    'leminh',
    '/audio/podcasts/podcast_burn_firstaid.mp3',
    195,
    'PUBLISHED',
    278,
    145
);

