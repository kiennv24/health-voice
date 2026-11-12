SET NAMES utf8mb4;

-- TIM_MACH
INSERT INTO health_podcasts (author_id, title, slug, category, summary, content, thumbnail_url, default_voice, audio_url, audio_duration_seconds, status, views_count, listen_count)
VALUES 
(2, 'Nhận biết cơn đau thắt ngực ổn định và dấu hiệu cảnh báo nhồi máu cơ tim cấp tính', 'nhan-biet-con-dau-that-nguc-va-nhoi-mau-co-tim', 'TIM_MACH', 
'Phân biệt cơn đau ngực do gắng sức với nhồi máu cơ tim cấp. Bác sĩ khuyến cáo thời gian vàng 2 giờ đầu và các bước sơ cứu bất động tại chỗ.',
'## Cơn Đau Thắt Ngực: Dấu Hiệu Sớm Của Bệnh Mạch Vành

Cơn đau thắt ngực là tín hiệu cảnh báo cơ tim đang bị thiếu máu và oxy nuôi dưỡng do lòng động mạch vành bị thu hẹp bởi mảng xơ vữa.

### 1. Phân Biệt Đau Ngực Ổn Định Và Nhồi Máu Cơ Tim
* **Đau thắt ngực ổn định:** Thường xuất hiện khi gắng sức (leo cầu thang, mang vác nặng, thời tiết quá lạnh). Cơn đau kéo dài từ 3 đến 5 phút và giảm hẳn khi ngồi nghỉ ngơi hoặc ngậm thuốc Nitroglycerin dưới lưỡi.
* **Nhồi máu cơ tim cấp:** Cơn đau xuất hiện đột ngột ngay cả lúc nghỉ ngơi, kéo dài **trên 15 - 20 phút**, cảm giác đè nặng như đá tảng đè lên ngực trái, lan lên cằm, vai trái và cánh tay trái. Kèm theo vã mồ hôi lạnh, khó thở, buồn nôn.

### 2. Xử Trí Khẩn Cấp Tại Chỗ
1. Cho người bệnh **ngồi nghỉ tựa lưng** hoặc nằm đầu cao 30 độ, nới lỏng cổ áo và thắt lưng.
2. Tuyệt đối **không để bệnh nhân tự đi bộ** hay cố gắng vận động.
3. Nếu có sẵn thuốc giãn mạch Nitrate do bác sĩ kê đơn trước đó, cho ngậm 1 viên dưới lưỡi.
4. Gọi ngay tổng đài **Cấp Cứu 115** hoặc chuyển viện bằng xe cứu thương có nhân viên y tế hỗ trợ.',
'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop', 'banmai', '/audio/tts_8c1a4fafdcc3d079_1794337603.mp3', 215, 'PUBLISHED', 342, 189)
ON DUPLICATE KEY UPDATE title=VALUES(title), summary=VALUES(summary), content=VALUES(content);

INSERT INTO health_podcasts (author_id, title, slug, category, summary, content, thumbnail_url, default_voice, audio_url, audio_duration_seconds, status, views_count, listen_count)
VALUES 
(3, 'Chỉ số mỡ máu Triglyceride và Cholesterol LDL: Cách đọc kết quả xét nghiệm chuẩn', 'chi-so-mo-mau-triglyceride-va-cholesterol-ldl', 'TIM_MACH',
'Giải mã 4 chỉ số lipid máu cơ bản, phân biệt mỡ máu tốt HDL và mỡ máu xấu LDL. Lời khuyên dinh dưỡng giảm mỡ máu an toàn không tác dụng phụ.',
'## Đọc Hiểu Bảng Xét Nghiệm Mỡ Máu (Lipid Panel)

Rối loạn lipid máu là "kẻ giết người thầm lặng" không gây triệu chứng báo trước cho đến khi xảy ra biến cố đột quỵ hoặc nhồi máu cơ tim.

### 1. 4 Chỉ Số Mỡ Máu Trọng Yếu
* **Cholesterol toàn phần:** Mức an toàn là dưới **5.2 mmol/L** (200 mg/dL).
* **LDL-Cholesterol (Mỡ máu "xấu"):** Đây là thủ phạm chính gây lắng đọng mảng xơ vữa. Ngưỡng tối ưu nên dưới **2.6 mmol/L** (với người có bệnh tim mạch cần dưới 1.4 - 1.8 mmol/L).
* **HDL-Cholesterol (Mỡ máu "tốt"):** Đóng vai trò thu gom mỡ thừa về gan thoái giáng. Chỉ số này càng cao càng tốt, chuẩn nên trên **1.0 mmol/L** ở nam và trên **1.2 mmol/L** ở nữ.
* **Triglyceride:** Chất béo trung tính từ tinh bột và rượu bia dư thừa. Ngưỡng an toàn là dưới **1.7 mmol/L**.

### 2. Thực Đơn Hạ Mỡ Máu Khoa Học
* Cắt giảm nội tạng động vật, da gà vịt, mỡ heo và lòng đỏ trứng (tối đa 3 quả/tuần).
* Tăng cường dầu ô liu, cá béo giàu Omega-3 (cá hồi, cá trích, cá thu) và yến mạch giàu chất xơ beta-glucan.',
'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop', 'banmai', '/audio/tts_b64ad57a3efd4813_1794338490.mp3', 190, 'PUBLISHED', 285, 140)
ON DUPLICATE KEY UPDATE title=VALUES(title), summary=VALUES(summary), content=VALUES(content);

INSERT INTO health_podcasts (author_id, title, slug, category, summary, content, thumbnail_url, default_voice, audio_url, audio_duration_seconds, status, views_count, listen_count)
VALUES 
(2, 'Rối loạn nhịp tim: Khi nào hồi hộp, đánh trống ngực là dấu hiệu nguy hiểm?', 'roi-loan-nhip-tim-khi-nao-la-nguy-hiem', 'TIM_MACH',
'Phân biệt nhịp nhanh xoang lành tính với rung nhĩ hoặc ngoại tâm thu thất. Hướng dẫn đo mạch quay tại nhà và các xét nghiệm chuyên sâu Holter ECG 24h.',
'## Lắng Nghe Nhịp Đập Trái Tim

Nhịp tim bình thường của người trưởng thành khi nghỉ ngơi dao động từ **60 đến 100 chu kỳ mỗi phút**.

### 1. Khi Nào Đánh Trống Ngực Là Lành Tính?
* Sau khi uống cà phê đậm đặc, trà đặc hoặc nước tăng lực chứa caffeine cao.
* Căng thẳng tâm lý trước kỳ thi, thuyết trình hoặc tức giận đột ngột.
* Sau các bài tập thể lực cường độ cao hoặc sốt cao.

### 2. Dấu Hiệu Cảnh Báo Nguy Hiểm Cần Đến Bệnh Viện
* Cơn tim đập nhanh vọt trên **140 - 160 lần/phút** kèm chóng mặt, choáng váng hoặc ngất xỉu.
* Cảm giác tim đập "bỏ nhịp", hẫng hụt lồng ngực liên tục kéo dài.
* Đánh trống ngực kèm khó thở, vã mồ hôi và tụt huyết áp. Đây có thể là biểu hiện của **cơn rung nhĩ**, có nguy cơ hình thành cục máu đông gây nhồi máu não.',
'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=800&auto=format&fit=crop', 'banmai', '/audio/tts_2e7c44765fd6f973_1794324334.mp3', 175, 'PUBLISHED', 198, 112)
ON DUPLICATE KEY UPDATE title=VALUES(title), summary=VALUES(summary), content=VALUES(content);

INSERT INTO health_podcasts (author_id, title, slug, category, summary, content, thumbnail_url, default_voice, audio_url, audio_duration_seconds, status, views_count, listen_count)
VALUES 
(4, 'Suy tim ứ huyết: 5 dấu hiệu giữ nước, phù chân và khó thở khi nằm', 'suy-tim-u-huyet-5-dau-hieu-canh-bao', 'TIM_MACH',
'Nhận diện các giai đoạn suy tim qua dấu hiệu tăng cân nhanh, phù 2 mắt cá chân và khó thở kịch phát về đêm. Phác đồ theo dõi cân nặng mỗi sáng.',
'## Nhận Diện Sớm Hội Chứng Suy Tim

Suy tim không có nghĩa là tim đã ngừng đập, mà là khả năng co bóp tống máu của tâm thất không còn đủ đáp ứng nhu cầu tưới máu cho các mô và cơ quan.

### 1. 5 Triệu Chứng Ứ Trệ Tuần Hoàn Điển Hình
1. **Khó thở khi nằm ngang (Orthopnea):** Người bệnh phải kê 2 - 3 chiếc gối cao hoặc phải ngồi dậy để thở dễ hơn.
2. **Khó thở kịch phát về đêm:** Đang ngủ say phải bật dậy do cảm giác ngạt thở, ho khan.
3. **Phù hai chi dưới:** Phù mắt cá chân, ấn vào mu bàn chân thấy lõm và lâu đàn hồi trở lại.
4. **Tăng cân bất thường:** Tăng trên 1.5 - 2 kg chỉ trong 2 đến 3 ngày do ứ đọng dịch trong khoang gian bào.
5. **Mệt mỏi kiệt sức:** Giảm khả năng lao động, ngay cả việc quét nhà hay thay quần áo cũng khiến người bệnh hụt hơi.

### 2. Nguyên Tắc Sống Khỏe Cùng Suy Tim
* Theo dõi và ghi nhật ký cân nặng vào mỗi buổi sáng sau khi đi tiểu và trước khi ăn sáng.
* Giới hạn lượng nước uống hàng ngày (thường từ 1.2 đến 1.5 lít bao gồm cả canh và nước canh).',
'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&auto=format&fit=crop', 'banmai', '/audio/tts_2e7c44765fd6f973_1794324335.mp3', 205, 'PUBLISHED', 220, 134)
ON DUPLICATE KEY UPDATE title=VALUES(title), summary=VALUES(summary), content=VALUES(content);

-- THAN_KINH
INSERT INTO health_podcasts (author_id, title, slug, category, summary, content, thumbnail_url, default_voice, audio_url, audio_duration_seconds, status, views_count, listen_count)
VALUES 
(2, 'Cơn thiếu máu não thoáng qua (TIA): Dấu hiệu cảnh báo sớm trước cơn tai biến thực sự', 'con-thieu-mau-nao-thoang-qua-tia', 'THAN_KINH',
'Cơn TIA biến mất sau vài phút nhưng có đến 30% bệnh nhân sẽ bị đột quỵ thật sự trong vòng 48 giờ sau đó. Bác sĩ hướng dẫn khám thần kinh cấp cứu.',
'## Cơn Thiếu Máu Não Thoảng Qua: "Đòn Cảnh Cáo" Khẩn Cấp

Cơn thiếu máu não thoáng qua (TIA - Transient Ischemic Attack) xảy ra khi mạch máu nuôi một vùng não bị tắc nghẽn tạm thời, sau đó dòng máu tự tái thông hoặc cục máu đông tự tan.

### 1. Dấu Hiệu Đặc Trưng Của Cơn TIA
* Đột ngột nói ngọng, líu lưỡi hoặc không hiểu lời người khác nói trong 2 - 5 phút.
* Tê bì nửa mặt, yếu thoáng qua một bên tay hoặc cầm đũa, cốc nước bị rơi.
* Mờ mắt đột ngột một bên mắt (như có tấm rèm che phủ) rồi hồi phục lại.
* Mất thăng bằng, lảo đảo khi đang bước đi.

### 2. Vì Sao Tuyệt Đối Không Được Chủ Quan?
Mặc dù triệu chứng tự biến mất sau 10 - 30 phút và người bệnh cảm thấy hoàn toàn bình thường, nhưng các nghiên cứu lâm sàng chỉ ra: **Khoảng 10% sẽ bị đột quỵ thực sự trong 48 giờ và 20% trong 3 tháng đầu**. 
Cần đưa người bệnh đến ngay Trung tâm Đột quỵ để chụp MRI mạch máu não và dùng thuốc chống ngưng tập tiểu cầu dự phòng.',
'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&auto=format&fit=crop', 'banmai', '/audio/tts_2e7c44765fd6f973_1794324356.mp3', 230, 'PUBLISHED', 412, 260)
ON DUPLICATE KEY UPDATE title=VALUES(title), summary=VALUES(summary), content=VALUES(content);

INSERT INTO health_podcasts (author_id, title, slug, category, summary, content, thumbnail_url, default_voice, audio_url, audio_duration_seconds, status, views_count, listen_count)
VALUES 
(3, 'Phân biệt đau nửa đầu Migraine và đau đầu do căng thẳng thần kinh', 'phan-biet-dau-nua-dau-migraine-va-dau-dau-cang-thang', 'THAN_KINH',
'Cách nhận biết đau đầu căng cơ và đau nửa đầu vận mạch Migraine có tiền triệu. Lời khuyên cắt cơn đau và phòng ngừa cơn đau mạn tính.',
'## Tiếp Cận Chẩn Đoán Đau Đầu Lâm Sàng

Đau đầu là một trong những lý do khám bệnh phổ biến nhất tại chuyên khoa Thần kinh. Việc nhận biết đúng dạng đau đầu quyết định trực tiếp đến phác đồ dùng thuốc.

### 1. Đau Đầu Do Căng Thẳng (Tension Headache)
* **Cảm giác đau:** Như có dải băng thắt chặt quanh trán, đỉnh đầu hoặc sau gáy. Đau âm ỉ liên tục cả hai bên đầu.
* **Nguyên nhân:** Căng thẳng cảm xúc, ngồi sai tư thế trước máy tính, co thắt các cơ vùng cổ gáy.
* **Mức độ:** Nhẹ đến trung bình, không tăng lên khi hoạt động thể lực thông thường.

### 2. Đau Nửa Đầu Migraine
* **Cảm giác đau:** Đau giật theo nhịp mạch đập, thường khu trú ở một bên thái dương hoặc hốc mắt.
* **Triệu chứng đi kèm:** Sợ ánh sáng, sợ tiếng ồn lớn, buồn nôn hoặc nôn mửa.
* **Tiền triệu (Aura):** Một số bệnh nhân nhìn thấy vệt sáng nhấp nháy, điểm mù thị giác trước khi cơn đau ập đến 20 - 30 phút.',
'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop', 'banmai', '/audio/tts_111c4eae2ea99d08_1794322875.mp3', 180, 'PUBLISHED', 290, 165)
ON DUPLICATE KEY UPDATE title=VALUES(title), summary=VALUES(summary), content=VALUES(content);

INSERT INTO health_podcasts (author_id, title, slug, category, summary, content, thumbnail_url, default_voice, audio_url, audio_duration_seconds, status, views_count, listen_count)
VALUES 
(2, 'Rối loạn tiền đình: Cách phân biệt chóng mặt ngoại biên và tổn thương thần kinh trung ương', 'roi-loan-tien-dinh-cach-phan-biet-chong-mat', 'THAN_KINH',
'Phân biệt chóng mặt do ốc tai và tổn thương tiểu não nguy hiểm. Bài tập phục hồi chức năng tiền đình Epley và lối sống giảm tái phát.',
'## Xử Trí Cơn Chóng Mặt Và Rối Loạn Tiền Đình

Hệ thống tiền đình nằm ở tai trong kết nối với tiểu não đóng vai trò điều hòa thăng bằng cơ thể trong không gian.

### 1. Chóng Mặt Ngoại Biên (Lành Tính)
* Người bệnh cảm thấy nhà cửa, đồ vật quay cuồng tròn xung quanh hoặc bản thân mình bị chao đảo.
* Thường khởi phát khi thay đổi tư thế đột ngột (nghiêng đầu, trở mình trên giường - Chóng mặt kịch phát lành tính BPPV).
* Có thể kèm ù tai, giảm thính lực tạm thời, buồn nôn nhiều nhưng **không có dấu hiệu liệt vận động**.

### 2. Chóng Mặt Trung Ương (Dấu Hiệu Nguy Kịch)
* Chóng mặt kèm nhìn đôi (thấy 2 hình ảnh), nói khó, nuốt nghẹn hoặc tê yếu tay chân.
* Không thể tự đứng vững hoặc đi theo một đường thẳng (thất điều tiểu não).
* Cần chụp CT hoặc MRI sọ não khẩn cấp để loại trừ nhồi máu tiểu não hoặc xuất huyết cuống não.',
'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop', 'banmai', '/audio/tts_2e7c44765fd6f973_1794324334.mp3', 210, 'PUBLISHED', 315, 178)
ON DUPLICATE KEY UPDATE title=VALUES(title), summary=VALUES(summary), content=VALUES(content);

INSERT INTO health_podcasts (author_id, title, slug, category, summary, content, thumbnail_url, default_voice, audio_url, audio_duration_seconds, status, views_count, listen_count)
VALUES 
(4, 'Dấu hiệu suy giảm trí nhớ sớm và bệnh thoái hóa thần kinh Alzheimer', 'dau-hieu-suy-giam-tri-nho-som-alzheimer', 'THAN_KINH',
'Phân biệt đãng trí tuổi già thông thường với sa sút trí tuệ Alzheimer. 10 dấu hiệu cảnh báo sớm và các phương pháp rèn luyện trí não cho người cao tuổi.',
'## Nhận Diện Sớm Sa Sút Trí Tuệ

Quên tên một người quen cũ hay để quên chìa khóa là hiện tượng lão hóa thông thường. Tuy nhiên, sa sút trí tuệ Alzheimer là một bệnh lý thoái hóa tế bào thần kinh tiến triển mạn tính.

### 1. Các Dấu Hiệu Cảnh Báo Lâm Sàng
* **Quên các sự kiện vừa diễn ra:** Hỏi đi hỏi lại cùng một câu hỏi dù vừa được giải thích 5 phút trước.
* **Gặp khó khăn khi lập kế hoạch:** Không còn nhớ các bước nấu một món ăn quen thuộc hay quản lý chi tiêu trong gia đình.
* **Lạc đường ở nơi quen thuộc:** Quên đường đi về ngôi nhà mình đã sinh sống hàng chục năm.
* **Rối loạn ngôn ngữ:** Dừng lại giữa câu không biết dùng từ gì để diễn đạt hoặc gọi sai tên đồ vật thông dụng.

### 2. Biện Pháp Phòng Ngừa Và Chăm Sóc
* Thường xuyên đọc sách, học ngoại ngữ mới, chơi cờ tướng hoặc giải ô chữ.
* Ngủ đủ 7 - 8 tiếng mỗi ngày để hệ thống glymphatic của não đào thải mảng bám protein amyloid-beta.',
'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&auto=format&fit=crop', 'banmai', '/audio/tts_2e7c44765fd6f973_1794324334.mp3', 195, 'PUBLISHED', 240, 130)
ON DUPLICATE KEY UPDATE title=VALUES(title), summary=VALUES(summary), content=VALUES(content);

-- TIEU_HOA
INSERT INTO health_podcasts (author_id, title, slug, category, summary, content, thumbnail_url, default_voice, audio_url, audio_duration_seconds, status, views_count, listen_count)
VALUES 
(2, 'Nhiễm vi khuẩn Helicobacter Pylori (HP): Khi nào cần làm kháng sinh đồ tiêu trừ?', 'nhiem-vi-khuan-hp-da-day-khi-nao-can-tieu-tru', 'TIEU_HOA',
'Có đến 70% người Việt mang vi khuẩn HP nhưng không phải ai cũng cần diệt trừ. Bác sĩ giải thích chỉ định diệt HP và cách phòng ngừa lây nhiễm qua đường ăn uống.',
'## Hiểu Đúng Về Vi Khuẩn HP Dạ Dày

Helicobacter Pylori (HP) là loại xoắn khuẩn gram âm duy nhất có khả năng sinh sống trong môi trường acid đậm đặc của dịch dạ dày nhờ tiết enzym urease trung hòa pH.

### 1. Khi Nào Bắt Buộc Phải Diệt Trừ HP?
Hội đồng Tiêu hóa Quốc tế khuyến cáo chỉ định điều trị tiệt trừ HP trong các trường hợp sau:
* Đang có ổ **loét dạ dày hoặc loét tá tràng** hoạt động.
* Bệnh nhân có tiền sử gia đình (bố, mẹ, anh chị em ruột) mắc **ung thư dạ dày**.
* Tổn thương niêm mạc dạ dày dạng viêm teo nặng hoặc dị sản ruột.
* Bệnh nhân có chỉ định dùng thuốc giảm đau chống viêm NSAID hoặc Aspirin kéo dài.

### 2. Phòng Ngừa Tái Nhiễm Sau Khi Diệt Thành Công
* Dùng đũa riêng, muỗng múc thức ăn riêng trên bàn ăn gia đình.
* Rửa tay bằng xà phòng trước khi ăn và sau khi đi vệ sinh.
* Ăn chín uống sôi, hạn chế ăn rau sống tại các hàng quán không đảm bảo vệ sinh nguồn nước.',
'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop', 'banmai', '/audio/tts_8c1a4fafdcc3d079_1794337603.mp3', 210, 'PUBLISHED', 380, 220)
ON DUPLICATE KEY UPDATE title=VALUES(title), summary=VALUES(summary), content=VALUES(content);

INSERT INTO health_podcasts (author_id, title, slug, category, summary, content, thumbnail_url, default_voice, audio_url, audio_duration_seconds, status, views_count, listen_count)
VALUES 
(3, 'Hội chứng ruột kích thích (IBS): Chế độ ăn kiêng FODMAP giúp giảm đầy hơi chướng bụng', 'hoi-chung-ruot-kich-thich-ibs-che-do-an-fodmap', 'TIEU_HOA',
'Giải thích cơ chế nhạy cảm của trục não - ruột ở bệnh nhân IBS. Thực đơn kiêng đường lên men ngắn hạn giúp bụng êm và ổn định phân rõ rệt.',
'## Kiểm Soát Hội Chứng Ruột Kích Thích (IBS)

Hội chứng ruột kích thích (IBS) là rối loạn chức năng tiêu hóa mạn tính, đặc trưng bởi đau quặn bụng liên quan đến việc đi đại tiện và thay đổi thói quen đi ngoài mà không có tổn thương thực thể.

### 1. Phân Biệt Các Thể Lâm Sàng Của IBS
* **IBS-D (Thể tiêu chảy):** Phân lỏng, nát, đi ngoài nhiều lần vào buổi sáng hoặc sau khi ăn sáng.
* **IBS-C (Thể táo bón):** Phân khô cứng, đi ngoài ít hơn 3 lần/tuần kèm cảm giác rặn khó và đi không hết phân.
* **IBS-M (Thể hỗn hợp):** Xen kẽ giữa từng đợt tiêu chảy và táo bón.

### 2. Ứng Dụng Chế Độ Ăn Low-FODMAP
FODMAP là nhóm các carbohydrate chuỗi ngắn và rượu đường dễ bị vi khuẩn đại tràng lên men sinh khí:
* **Hạn chế:** Tỏi, hành tây, lúa mì, sữa bò (lactose), táo, lê, dưa hấu, nấm và các loại đậu.
* **Thay thế an toàn:** Gạo tẻ, chuối chín, cam quýt, cà rốt, thịt nạc, trứng và sữa chua không đường lên men tự nhiên.',
'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&auto=format&fit=crop', 'banmai', '/audio/tts_b64ad57a3efd4813_1794338490.mp3', 195, 'PUBLISHED', 265, 150)
ON DUPLICATE KEY UPDATE title=VALUES(title), summary=VALUES(summary), content=VALUES(content);

INSERT INTO health_podcasts (author_id, title, slug, category, summary, content, thumbnail_url, default_voice, audio_url, audio_duration_seconds, status, views_count, listen_count)
VALUES 
(2, 'Gan nhiễm mỡ không do rượu: 4 giai đoạn tiến triển và cách phục hồi tế bào gan', 'gan-nhiem-mo-khong-do-ruou-4-giai-doan', 'TIEU_HOA',
'Gan thoái hóa mỡ (NAFLD) có thể âm thầm tiến triển sang xơ gan. Bác sĩ hướng dẫn giảm 7-10% trọng lượng cơ thể để đào thải mỡ thừa trong nhu mô gan.',
'## Đảo Ngược Gan Nhiễm Mỡ Không Do Rượu

Bệnh gan nhiễm mỡ không do rượu (NAFLD) xuất hiện khi lượng mỡ tích tụ vượt quá **5% trọng lượng của lá gan** ở những người không uống rượu hoặc uống rất ít rượu.

### 1. 4 Giai Đoạn Tiến Triển Của Bệnh
1. **Gan nhiễm mỡ đơn thuần (Steatosis):** Mỡ ứ đọng nhưng chưa có viêm hay tổn thương tế bào gan. Giai đoạn này hoàn toàn có thể đảo ngược 100%.
2. **Viêm gan nhiễm mỡ (NASH):** Tế bào gan bắt đầu bị phồng to, thâm nhiễm tế bào viêm, men gan AST và ALT tăng cao.
3. **Xơ hóa gan (Fibrosis):** Các dải sẹo mô liên kết hình thành thay thế nhu mô gan lành.
4. **Xơ gan (Cirrhosis):** Gan teo xơ, suy giảm chức năng tổng hợp protein và nguy cơ cao ung thư biểu mô tế bào gan (HCC).

### 2. Liệu Pháp Vàng: Giảm Cân Khoa Học
* Các thử nghiệm lâm sàng chứng minh: Chỉ cần **giảm từ 7% đến 10% trọng lượng cơ thể** sau 6 tháng, lượng mỡ trong gan sẽ giảm trên 80% và các ổ viêm NASH sẽ thoái lui.',
'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop', 'banmai', '/audio/tts_2e7c44765fd6f973_1794324334.mp3', 225, 'PUBLISHED', 310, 185)
ON DUPLICATE KEY UPDATE title=VALUES(title), summary=VALUES(summary), content=VALUES(content);

INSERT INTO health_podcasts (author_id, title, slug, category, summary, content, thumbnail_url, default_voice, audio_url, audio_duration_seconds, status, views_count, listen_count)
VALUES 
(4, 'Xuất huyết tiêu hóa trên: Dấu hiệu nôn ra máu, đi ngoài phân đen cần cấp cứu ngay', 'xuat-huyet-tieu-hoa-tren-dau-hieu-can-cap-cuu', 'TIEU_HOA',
'Nhận biết triệu chứng đi ngoài phân đen mùi khắm tanh như bã cà phê do vỡ tĩnh mạch thực quản hoặc loét thủng dạ dày. Quy trình cấp cứu cầm máu nội soi.',
'## Cấp Cứu Xuất Huyết Đường Tiêu Hóa

Xuất huyết tiêu hóa trên là tình trạng chảy máu bắt nguồn từ đoạn thực quản, dạ dày hoặc tá tràng (phía trên góc Treitz). Đây là một cấp cứu nội khoa nguy hiểm có tỷ lệ tử vong cao nếu không bù thể tích tuần hoàn kịp thời.

### 1. Các Dấu Hiệu Lâm Sàng Điển Hình
* **Nôn ra máu:** Nôn ra máu tươi có cục máu đông hoặc dịch nôn màu nâu đen lợn cợn như bã cà phê.
* **Đi ngoài phân đen:** Phân mềm nhão, đen bóng như nhựa đường (hắc ín) và có mùi khắm tanh nồng nặc rất đặc trưng.
* **Dấu hiệu sốc mất máu:** Mạch đập nhanh trên 100 lần/phút, huyết áp tụt dưới 90/60 mmHg, hoa mắt chóng mặt khi đứng dậy, da xanh xao và vã mồ hôi lạnh.

### 2. Thái Độ Xử Trí Khẩn Cấp
* Đặt bệnh nhân nằm nghiêng an toàn sang một bên để tránh dịch nôn sặc vào đường thở.
* Tuyệt đối **không cho ăn uống bất cứ thứ gì**, không uống sữa hay nước gừng.
* Gọi cấp cứu 115 để chuyển ngay đến bệnh viện có trung tâm nội soi tiêu hóa can thiệp cầm máu.',
'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=800&auto=format&fit=crop', 'banmai', '/audio/tts_2e7c44765fd6f973_1794324334.mp3', 200, 'PUBLISHED', 270, 145)
ON DUPLICATE KEY UPDATE title=VALUES(title), summary=VALUES(summary), content=VALUES(content);

-- HO_HAP
INSERT INTO health_podcasts (author_id, title, slug, category, summary, content, thumbnail_url, default_voice, audio_url, audio_duration_seconds, status, views_count, listen_count)
VALUES 
(2, 'Bệnh phổi tắc nghẽn mạn tính (COPD): Hướng dẫn tập thở chúm môi và thở cơ hoành', 'benh-phoi-tac-nghen-man-tinh-copd-tap-tho', 'HO_HAP',
'Phương pháp phục hồi chức năng thông khí phổi cho bệnh nhân COPD. Kỹ thuật thở chúm môi giúp tống khí cặn và giảm khó thở khi vận động.',
'## Phục Hồi Chức Năng Hô Hấp Cho Bệnh Nhân COPD

Bệnh phổi tắc nghẽn mạn tính (COPD) gây hẹp đường dẫn khí và phá hủy phế nang (khí phế thũng), khiến không khí bị bẫy lại trong phổi và gây khó thở tiến triển nặng dần.

### 1. Kỹ Thuật Thở Chúm Môi (Pursed-Lip Breathing)
* **Mục đích:** Giúp đường thở mở lâu hơn khi thở ra, tống bớt khí CO2 tồn dư ra ngoài cơ thể.
* **Bước 1:** Hít vào từ từ bằng mũi trong vòng 2 nhịp đếm (miệng ngậm lại tự nhiên).
* **Bước 2:** Chúm môi lại như đang chuẩn bị thổi sáo hoặc huýt sáo.
* **Bước 3:** Thở ra thật chậm rãi qua kẽ môi chúm trong vòng 4 nhịp đếm (thời gian thở ra gấp đôi thời gian hít vào).

### 2. Kỹ Thuật Thở Cơ Hoành (Diaphragmatic Breathing)
* Đặt 1 tay lên ngực và 1 tay lên bụng ngay dưới bờ sườn.
* Hít vào sâu qua mũi để bàn tay trên bụng phồng lên (tay trên ngực giữ yên tối đa).
* Hóp nhẹ bụng lại khi thở ra từ từ qua miệng chúm.',
'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop', 'banmai', '/audio/tts_8c1a4fafdcc3d079_1794337603.mp3', 215, 'PUBLISHED', 295, 170)
ON DUPLICATE KEY UPDATE title=VALUES(title), summary=VALUES(summary), content=VALUES(content);

INSERT INTO health_podcasts (author_id, title, slug, category, summary, content, thumbnail_url, default_voice, audio_url, audio_duration_seconds, status, views_count, listen_count)
VALUES 
(3, 'Chỉ số oxy trong máu SpO2: Bao nhiêu là bình thường và khi nào cần thở oxy tại nhà?', 'chi-so-oxy-trong-mau-spo2-bao-nhieu-la-binh-thuong', 'HO_HAP',
'Độ bão hòa oxy mao mạch SpO2 là chỉ số sinh tồn then chốt. Hướng dẫn kẹp ngón tay đúng cách và các mức cảnh báo suy hô hấp cần đi viện.',
'## Cách Đo Và Theo Dõi Chỉ Số SpO2 Chuẩn Y Khoa

SpO2 (Saturation of Peripheral Oxygen) thể hiện tỷ lệ phần trăm phân tử hemoglobin trong máu ngoại vi gắn kết với oxy.

### 1. Thang Phân Loại Mức SpO2
* **Từ 97% đến 100%:** Chỉ số oxy tối ưu, chức năng trao đổi khí tại phế nang bình thường.
* **Từ 94% đến 96%:** Mức oxy trung bình cần theo dõi sát (có thể chấp nhận được ở người bệnh phổi mạn tính giai đoạn ổn định).
* **Từ 90% đến 93%:** Dấu hiệu thiếu oxy máu mức độ nhẹ đến trung bình. Cần ngồi dậy, mở rộng lồng ngực và liên hệ tư vấn y tế.
* **Dưới 90%:** **Cấp cứu suy hô hấp!** Cơ quan đích (não, tim, thận) đang thiếu oxy trầm trọng, cần chuyển ngay đến bệnh viện có hệ thống oxy dòng cao.

### 2. Lưu Ý Để Kết Quả Đo Không Bị Sai Lệch
* Làm ấm bàn tay trước khi kẹp máy (tay quá lạnh mạch máu co lại khiến máy đọc sai).
* Tẩy sạch sơn móng tay (đặc biệt là sơn màu đỏ, tím hoặc móng giả).
* Giữ ngón tay yên tĩnh trong 10 - 15 giây cho đến khi đồ thị sóng nhịp tim trên màn hình hiển thị đều đặn.',
'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop', 'banmai', '/audio/tts_b64ad57a3efd4813_1794338490.mp3', 185, 'PUBLISHED', 340, 195)
ON DUPLICATE KEY UPDATE title=VALUES(title), summary=VALUES(summary), content=VALUES(content);

INSERT INTO health_podcasts (author_id, title, slug, category, summary, content, thumbnail_url, default_voice, audio_url, audio_duration_seconds, status, views_count, listen_count)
VALUES 
(4, 'Viêm xoang mũi dị ứng theo mùa: Cách rửa mũi bằng dung dịch nước muối sinh lý 0.9% an toàn', 'viem-xoang-mui-di-ung-cach-rua-mui-dung-cach', 'HO_HAP',
'Quy trình rửa mũi bằng bình rửa áp lực nhẹ chuẩn tai mũi họng. Tránh biến chứng viêm tai giữa do xì mũi quá mạnh hoặc dùng nước muối pha sai nồng độ.',
'## Vệ Sinh Mũi Xoang Đúng Kỹ Thuật

Rửa mũi bằng dung dịch muối đẳng trương (NaCl 0.9%) là phương pháp vật lý hiệu quả hàng đầu giúp làm sạch chất nhầy, phấn hoa, bụi mịn và các kháng nguyên gây dị ứng bám trên niêm mạc xoang.

### 1. 4 Bước Rửa Mũi An Toàn
1. Sử dụng nước muối sinh lý 0.9% đóng chai vô khuẩn hoặc pha gói muối y tế chuyên dụng với nước đun sôi để nguội (nhiệt độ nước ấm khoảng 36 - 37 độ C).
2. Đứng trước bồn rửa mặt, hơi cúi đầu về phía trước và nghiêng đầu sang một bên khoảng 45 độ.
3. Há miệng to để thở bằng miệng (tuyệt đối không hít thở bằng mũi khi đang bơm nước để tránh sặc vào thanh quản).
4. Đặt vòi bình rửa vào lỗ mũi bên trên, bóp nhẹ nhàng để dòng nước chảy qua hốc mũi và thoát ra ngoài qua lỗ mũi bên dưới.

### 2. Các Lỗi Nguy Hiểm Cần Tuyệt Đối Tránh
* Không xì mũi thật mạnh bằng cả 2 bên cùng lúc (áp lực nước và vi khuẩn sẽ bị đẩy ngược qua vòi Eustache gây viêm tai giữa ứ mủ).
* Không tự ý dùng muối ăn chưa qua tiệt trùng để pha nước rửa mũi.',
'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop', 'banmai', '/audio/tts_2e7c44765fd6f973_1794324334.mp3', 170, 'PUBLISHED', 225, 120)
ON DUPLICATE KEY UPDATE title=VALUES(title), summary=VALUES(summary), content=VALUES(content);

-- DINH_DUONG
INSERT INTO health_podcasts (author_id, title, slug, category, summary, content, thumbnail_url, default_voice, audio_url, audio_duration_seconds, status, views_count, listen_count)
VALUES 
(3, 'Chế độ ăn Địa Trung Hải: Thực đơn vàng bảo vệ tim mạch và kéo dài tuổi thọ', 'che-do-an-dia-trung-hai-bao-ve-tim-mach', 'DINH_DUONG',
'Khám phá mô hình ăn uống Địa Trung Hải giàu dầu ô liu, cá béo và các loại hạt. Bác sĩ hướng dẫn biến tấu nguyên liệu thuần Việt phù hợp bữa cơm gia đình.',
'## Bí Quyết Trường Thọ Của Vùng Địa Trung Hải

Nhiều nghiên cứu dịch tễ học quy mô lớn (như thử nghiệm PREDIMED) chứng minh chế độ ăn Địa Trung Hải giúp giảm đến 30% nguy cơ biến cố tim mạch và giảm rõ rệt tỷ lệ mắc ung thư đại trực tràng.

### 1. Kim Tự Tháp Dinh Dưỡng Địa Trung Hải
* **Nền tảng mỗi bữa ăn:** Rau củ tươi đa sắc màu, trái cây tươi nguyên quả, ngũ cốc nguyên hạt (gạo lứt, ngô, khoai), các loại đậu và dầu thực vật nguyên chất (dầu ô liu extra virgin).
* **Tối thiểu 2 lần/tuần:** Cá và các loại hải sản giàu Omega-3 (cá hồi, cá nục, cá trích, hàu).
* **Hạn chế tối đa:** Thịt đỏ (thịt bò, thịt cừu chỉ ăn 1-2 lần/tháng), thịt chế biến sẵn (xúc xích, thịt nguội) và nước ngọt có ga.

### 2. Biến Tấu Thuần Việt Tiết Kiệm
* Thay thế dầu ô liu đắt tiền bằng dầu đậu nành hoặc dầu hạt cải chất lượng cao khi xào nhẹ.
* Tăng cường rau bản địa như rau muống luộc, rau khoai lang, rau dền và các loại hạt sen, hạt đậu phụng, đậu đen.',
'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop', 'banmai', '/audio/tts_8c1a4fafdcc3d079_1794337603.mp3', 210, 'PUBLISHED', 330, 190)
ON DUPLICATE KEY UPDATE title=VALUES(title), summary=VALUES(summary), content=VALUES(content);

INSERT INTO health_podcasts (author_id, title, slug, category, summary, content, thumbnail_url, default_voice, audio_url, audio_duration_seconds, status, views_count, listen_count)
VALUES 
(2, 'Thiếu máu thiếu sắt: Các loại thực phẩm giàu sắt heme và lưu ý không uống cùng trà sữa', 'thieu-mau-thieu-sat-thuc-pham-giau-sat', 'DINH_DUONG',
'Phân biệt sắt hữu cơ Heme và Non-Heme. Hướng dẫn phối hợp vitamin C để tăng hấp thu sắt và các thực phẩm gây ức chế gắn kết vi chất.',
'## Phòng Chống Thiếu Máu Do Thiếu Sắt

Sắt là nguyên tố vi lượng cấu tạo nên hemoglobin - sắc tố trong hồng cầu đảm nhiệm vận chuyển oxy từ phổi đến toàn bộ tế bào cơ thể.

### 1. Phân Biệt 2 Nguồn Sắt Dinh Dưỡng
* **Sắt Heme (Nguồn động vật):** Có trong tiết heo, thịt nạc bò, gan gà, lòng đỏ trứng. Dạng sắt này có tỷ lệ hấp thu sinh học rất cao (từ 15% đến 35%) và ít bị ảnh hưởng bởi thức ăn kèm theo.
* **Sắt Non-Heme (Nguồn thực vật):** Có trong rau bina (chân vịt), nấm mộc nhĩ, đậu lăng, hạt mè. Tỷ lệ hấp thu thấp hơn (chỉ từ 2% đến 10%).

### 2. Nguyên Tắc Hấp Thu Sắt Tối Đa
* **Bạn đồng hành:** Luôn ăn kèm thực phẩm giàu **Vitamin C** (nước cam tươi, ổi, kiwi, ớt chuông) trong bữa ăn vì vitamin C chuyển sắt 3 sang sắt 2 dễ hấp thu qua niêm mạc ruột non.
* **Kẻ cản trở:** Tránh uống trà đặc, cà phê, trà sữa hoặc bổ sung canxi liều cao trong vòng 2 giờ sau bữa ăn giàu sắt, vì tanin và polyphenol sẽ kết tủa sắt thành hợp chất không tan.',
'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&auto=format&fit=crop', 'banmai', '/audio/tts_b64ad57a3efd4813_1794338490.mp3', 190, 'PUBLISHED', 260, 145)
ON DUPLICATE KEY UPDATE title=VALUES(title), summary=VALUES(summary), content=VALUES(content);

INSERT INTO health_podcasts (author_id, title, slug, category, summary, content, thumbnail_url, default_voice, audio_url, audio_duration_seconds, status, views_count, listen_count)
VALUES 
(4, 'Phương pháp nhịn ăn gián đoạn 16:8: Ai nên áp dụng và ai tuyệt đối chống chỉ định?', 'phuong-phap-nhin-an-gian-doan-16-8', 'DINH_DUONG',
'Cơ chế tự thực bào Autophagy và tăng nhạy cảm insulin của nhịn ăn 16 tiếng. Cảnh báo những đối tượng tuyệt đối không được tự ý nhịn ăn.',
'## Giải Mã Khoa Học Về Nhịn Ăn Gián Đoạn (16/8)

Nhịn ăn gián đoạn (Intermittent Fasting - IF) 16:8 là mô hình ăn uống trong đó bạn nạp toàn bộ lượng calo cần thiết trong khung giờ **8 tiếng**, và nhịn ăn hoàn toàn trong **16 tiếng** còn lại của ngày.

### 1. Cơ Chế Sinh Học Diễn Ra Khi Nhịn 16 Tiếng
* **Sau 12 tiếng:** Lượng glycogen dự trữ trong gan bắt đầu cạn kiệt, cơ thể chuyển sang trạng thái ketosis - đốt cháy mỡ thừa để tạo năng lượng hoạt động.
* **Sau 14 - 16 tiếng:** Kích hoạt quá trình **tự thực bào (Autophagy)** - tế bào tự dọn dẹp các bào quan già cỗi, protein bất thường, góp phần chống lão hóa và giảm viêm mạn tính.

### 2. Các Đối Tượng Chống Chỉ Định Tuyệt Đối
* Phụ nữ mang thai hoặc đang trong thời kỳ cho con bú.
* Bệnh nhân đái tháo đường đang tiêm Insulin hoặc uống thuốc hạ đường nhóm sulfonylurea (nguy cơ hạ đường huyết nguy kịch).
* Người có tiền sử rối loạn ăn uống (chán ăn tâm thần hoặc cuồng ăn vô độ).
* Trẻ em và thanh thiếu niên đang trong giai đoạn phát triển chiều cao.',
'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop', 'banmai', '/audio/tts_2e7c44765fd6f973_1794324334.mp3', 200, 'PUBLISHED', 310, 180)
ON DUPLICATE KEY UPDATE title=VALUES(title), summary=VALUES(summary), content=VALUES(content);

-- DUOC_PHAM
INSERT INTO health_podcasts (author_id, title, slug, category, summary, content, thumbnail_url, default_voice, audio_url, audio_duration_seconds, status, views_count, listen_count)
VALUES 
(2, 'Kháng sinh không phải kẹo: Vì sao tự ý uống kháng sinh trị cảm cúm gây kháng thuốc toàn cầu?', 'khang-sinh-khong-phai-keo-hiem-hoa-khang-khang-sinh', 'DUOC_PHAM',
'Kháng sinh chỉ tiêu diệt vi khuẩn, hoàn toàn vô tác dụng với virus cảm lạnh. Tự ý mua kháng sinh uống 2-3 ngày rồi dừng gây đột biến gen vi khuẩn kháng thuốc.',
'## Cảnh Báo Lạm Dụng Kháng Sinh Tại Cộng Đồng

Tổ chức Y tế Thế giới (WHO) xếp tình trạng đề kháng kháng sinh (AMR) vào top 10 mối đe dọa sức khỏe cộng đồng toàn cầu nghiêm trọng nhất của thế kỷ 21.

### 1. Bản Chất Khoa Học Của Kháng Sinh
* Kháng sinh là các hợp chất có tác dụng ức chế sự sinh trưởng hoặc tiêu diệt **vi khuẩn** (thông qua phá hủy thành tế bào, ức chế màng sinh chất hoặc ngừng tổng hợp protein).
* **Kháng sinh hoàn toàn không có tác dụng với Virus.** Trong khi đó, hơn 90% các đợt sốt, ho, sổ mũi, đau rát họng thông thường trong cộng đồng là do virus (như Rhinovirus, Adenovirus, Coronavirus cảm cúm).

### 2. Hậu Quả Của Việc "Uống 2 Ngày Thấy Đỡ Liền Bỏ Thuốc"
* Khi uống thuốc không đủ liều và không đủ thời gian quy định (thường từ 5 đến 7 ngày), những vi khuẩn mạnh nhất chưa bị tiêu diệt hết sẽ học được cơ chế đề kháng, truyền gen kháng thuốc cho thế hệ sau.
* Lần nhiễm trùng tiếp theo, kháng sinh thông thường sẽ mất tác dụng hoàn toàn, người bệnh phải dùng kháng sinh phổ rộng thế hệ mới đắt đỏ và độc tính cao cho gan thận.',
'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop', 'banmai', '/audio/tts_8c1a4fafdcc3d079_1794337603.mp3', 220, 'PUBLISHED', 450, 275)
ON DUPLICATE KEY UPDATE title=VALUES(title), summary=VALUES(summary), content=VALUES(content);

INSERT INTO health_podcasts (author_id, title, slug, category, summary, content, thumbnail_url, default_voice, audio_url, audio_duration_seconds, status, views_count, listen_count)
VALUES 
(3, 'Tương tác nguy hiểm giữa bưởi chùm và nhóm thuốc hạ huyết áp, hạ mỡ máu Statin', 'tuong-tac-nguy-hiem-giua-buoi-va-thuoc-statin', 'DUOC_PHAM',
'Chất furanocoumarins trong bưởi ức chế men gan CYP3A4, làm nồng độ thuốc Statin tăng vọt gấp 5-10 lần gây độc cơ vân và suy thận cấp tính.',
'## Tương Tác Giữa Thực Phẩm Và Thuốc Điều Trị

Bưởi và nước ép bưởi là loại trái cây giàu vitamin C và chất chống oxy hóa. Tuy nhiên, đối với người đang dùng thuốc tim mạch mạn tính, đây lại là một "chất độc ngầm" nguy hiểm.

### 1. Cơ Chế Ức Chế Men Chuyển Hóa Gan
* Trong ruột non và gan có một loại enzym quan trọng là **CYP3A4**, có nhiệm vụ chuyển hóa và phân hủy nhiều loại thuốc trước khi thuốc vào tuần hoàn chung.
* Chất **furanocoumarins** tự nhiên có trong bưởi gắn chặt và vô hiệu hóa enzym CYP3A4. Hậu quả là thuốc không được phân hủy, dẫn đến nồng độ thuốc trong máu tăng vọt bất thường giống như người bệnh uống quá liều gấp 5 đến 10 lần.

### 2. Các Thuốc Tuyệt Đối Không Uống Kèm Nước Bưởi
* **Thuốc hạ mỡ máu Statin (Atorvastatin, Simvastatin):** Làm tăng nguy cơ tiêu cơ vân cấp tính, giải phóng myoglobin gây suy thận cấp.
* **Thuốc hạ huyết áp chẹn kênh canxi (Amlodipine, Nifedipine):** Gây tụt huyết áp quá mức, nhịp tim nhanh phản xạ và choáng ngất.',
'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop', 'banmai', '/audio/tts_b64ad57a3efd4813_1794338490.mp3', 195, 'PUBLISHED', 320, 180)
ON DUPLICATE KEY UPDATE title=VALUES(title), summary=VALUES(summary), content=VALUES(content);

INSERT INTO health_podcasts (author_id, title, slug, category, summary, content, thumbnail_url, default_voice, audio_url, audio_duration_seconds, status, views_count, listen_count)
VALUES 
(4, 'Uống men vi sinh Probiotics đúng thời điểm: Trước ăn hay sau ăn để lợi khuẩn sống sót?', 'uong-men-vi-sinh-probiotics-dung-thoi-diem', 'DUOC_PHAM',
'Acid dạ dày pH 1.5 - 2.0 có thể tiêu diệt đến 95% bào tử lợi khuẩn. Dược sĩ hướng dẫn uống men vi sinh cùng bữa ăn nhẹ và cách chọn dạng viên bao tan trong ruột.',
'## Tối Ưu Hóa Hiệu Quả Men Vi Sinh (Probiotics)

Men vi sinh là các chế phẩm sinh học chứa vi sinh vật sống có lợi (chủ yếu thuộc chủng Lactobacillus và Bifidobacterium), giúp cân bằng hệ vi sinh đường ruột và cải thiện tiêu hóa.

### 1. Rào Cản Acid Dịch Vị Dạ Dày
* Thách thức lớn nhất đối với men vi sinh là phải sống sót đi qua "bể acid" dạ dày với độ pH từ 1.5 đến 2.0 để đến được ruột non và đại tràng.
* Khi bụng đói hoàn toàn, nồng độ acid dịch vị rất đậm đặc, có thể tiêu diệt phần lớn lợi khuẩn tự do trước khi chúng kịp đi qua môn vị.

### 2. Thời Điểm Vàng Để Bổ Sung Men Vi Sinh
* **Uống ngay trước bữa ăn hoặc trong bữa ăn có chứa một lượng chất béo nhỏ:** Thức ăn sẽ làm loãng nồng độ acid dạ dày (tăng pH lên khoảng 3.5 - 4.5), tạo lớp đệm bảo vệ lợi khuẩn an toàn.
* **Cách uống kháng sinh:** Nếu đang điều trị bằng kháng sinh, **phải uống men vi sinh cách xa kháng sinh ít nhất 2 đến 3 tiếng**, tránh để kháng sinh vừa uống tiêu diệt luôn men vi sinh.',
'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&auto=format&fit=crop', 'banmai', '/audio/tts_2e7c44765fd6f973_1794324334.mp3', 180, 'PUBLISHED', 280, 160)
ON DUPLICATE KEY UPDATE title=VALUES(title), summary=VALUES(summary), content=VALUES(content);

INSERT INTO health_podcasts (author_id, title, slug, category, summary, content, thumbnail_url, default_voice, audio_url, audio_duration_seconds, status, views_count, listen_count)
VALUES 
(2, 'Dược liệu dân gian: Phân biệt nhân sâm, tam thất và những sai lầm khi tự ý ngâm rượu thuốc', 'duoc-lieu-dan-gian-sai-lam-khi-ngam-ruou-thuoc', 'DUOC_PHAM',
'Không phải vị thuốc bổ nào cũng lành tính. Cảnh báo nguy cơ tăng huyết áp kích phát khi uống sâm sai chỉ định và ngộ độc rượu ngâm rễ cây rừng chứa độc tố.',
'## Thận Trọng Với Thảo Dược Và Rượu Thuốc Dân Gian

Quan niệm "thuốc tây có hại dạ dày, thuốc bắc thuốc nam bổ dưỡng vô hại" là một sai lầm phổ biến khiến nhiều bệnh nhân phải nhập viện vì suy gan suy thận cấp.

### 1. Phân Biệt Tác Dụng Dược Lý
* **Nhân sâm:** Đại bổ nguyên khí, có tác dụng trợ dương kích thích thần kinh giao cảm. Bệnh nhân đang bị **tăng huyết áp kịch phát, sốt cao, xuất huyết hoặc tiêu chảy cấp tuyệt đối không được dùng sâm** vì có thể gây vỡ mạch máu não.
* **Tam thất bắc:** Tán ứ chỉ huyết, tiêu sưng giảm đau. Thường dùng trong chấn thương bầm tím, sau phẫu thuật hoặc phụ nữ sau sinh.

### 2. Những Tai Họa Từ Rượu Ngâm Tự Chế
* Ngâm củ quả rừng không rõ nguồn gốc: Nhầm lẫn củ ấu tàu (chứa độc chất aconitin cực mạnh gây ngừng tim), cây mã tiền hoặc rễ cây lá ngón.
* Dùng rượu có nồng độ methanol công nghiệp cao để ngâm thuốc.',
'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop', 'banmai', '/audio/tts_2e7c44765fd6f973_1794324334.mp3', 205, 'PUBLISHED', 360, 210)
ON DUPLICATE KEY UPDATE title=VALUES(title), summary=VALUES(summary), content=VALUES(content);

