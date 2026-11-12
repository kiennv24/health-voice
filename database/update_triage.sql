USE health_voice_db;
SET NAMES utf8mb4;

DELETE FROM triage_rules;

INSERT INTO triage_rules (id, rule_code, category, trigger_keywords, risk_level, priority, advice_text)
VALUES
(
    1,
    'EMERGENCY_STROKE',
    'THAN_KINH',
    'méo miệng, liệt nửa người, nói ngọng, đột quỵ, tai biến, tê liệt nửa người, méo mặt, liệt mặt',
    'EMERGENCY',
    10,
    'CẢNH BÁO CẤP CỨU KHẨN CẤP: Dấu hiệu bạn vừa mô tả là triệu chứng điển hình của Đột quỵ hoặc Tai biến mạch máu não theo tiêu chuẩn FAST. Bạn hoặc người nhà cần gọi ngay tổng đài Cấp cứu 115 hoặc di chuyển ngay đến bệnh viện có đơn vị can thiệp đột quỵ gần nhất trong thời gian vàng 3 đến 4 giờ đầu. Tuyệt đối không tự ý cho uống nước, cạo gió hay dùng thuốc hạ áp tại nhà.'
),
(
    2,
    'EMERGENCY_MYOCARDIAL_INFARCTION',
    'TIM_MACH',
    'đau thắt ngực, khó thở, tức ngực trái, vã mồ hôi, nhồi máu cơ tim, ép chặt lồng ngực, đau lan ra tay trái, đau ngực',
    'EMERGENCY',
    10,
    'CẢNH BÁO CẤP CỨU KHẨN CẤP: Triệu chứng đau tức ngực trái dữ dội kèm khó thở và vã mồ hôi là dấu hiệu cảnh báo Cơn nhồi máu cơ tim cấp hoặc Hội chứng mạch vành cấp tính. Hãy gọi ngay cấp cứu 115 hoặc nhờ người nhà đưa đến cơ sở y tế gần nhất. Trong lúc chờ đợi, hãy ngồi nghỉ ngơi đầu cao 30 độ ở nơi thoáng mát, nới lỏng cổ áo, giữ bình tĩnh và tuyệt đối không gắng sức.'
),
(
    3,
    'HIGH_APPENDICITIS',
    'TIEU_HOA',
    'đau hố chậu phải, đau bụng dưới bên phải, đau ruột thừa, quặn bụng hố chậu phải, viêm ruột thừa',
    'HIGH',
    8,
    'CẢNH BÁO NGUY CƠ CAO: Tình trạng đau âm ỉ tăng dần ở vùng bụng dưới bên phải hoặc hố chậu phải có thể là biểu hiện của Viêm ruột thừa cấp. Bạn cần đến ngay khoa cấp cứu hoặc bệnh viện có chuyên khoa ngoại tiêu hóa trong vòng 24 giờ để được siêu âm ổ bụng và xét nghiệm máu. Tuyệt đối không tự ý chườm nóng, không uống thuốc giảm đau hay thuốc xổ vì có thể làm lu mờ triệu chứng hoặc gây vỡ ruột thừa.'
),
(
    4,
    'MEDIUM_FEVER_CARE',
    'SOT',
    'sốt cao, sốt 39 độ, uống hạ sốt, paracetamol, sốt 38.5, nhiệt độ cao, nóng sốt, sốt',
    'MEDIUM',
    5,
    'HƯỚNG DẪN CHĂM SÓC SỐT: Khi sốt từ 38.5 độ C trở lên, bạn có thể dùng Paracetamol với liều từ 10 đến 15 miligam trên một kilôgam thể trọng mỗi lần, uống cách nhau từ 4 đến 6 giờ nếu còn sốt, không quá 4 lần một ngày. Hãy mặc quần áo thoáng mát, lau người bằng nước ấm ở nách và bẹn, uống nhiều nước hoặc dung dịch Oresol pha đúng tỷ lệ để bù điện giải. Nếu sốt cao trên 39.5 độ C không hạ hoặc kéo dài quá 48 giờ, bạn hãy đi khám bác sĩ ngay.'
),
(
    5,
    'LOW_COMMON_COLD',
    'HO_HAP',
    'nghẹt mũi, hắt xì, đau họng nhẹ, cảm cúm, sổ mũi, hắt hơi, cảm lạnh, đau họng',
    'LOW',
    1,
    'HƯỚNG DẪN THEO DÕI TẠI NHÀ: Các triệu chứng nghẹt mũi, hắt xì và đau họng nhẹ thường gặp trong cảm cúm thông thường do nhiễm siêu vi đường hô hấp trên. Bạn nên nghỉ ngơi hợp lý, súc miệng nước muối sinh lý ấm từ 2 đến 3 lần mỗi ngày, uống nhiều nước ấm và bổ sung thêm vitamin C. Không nên tự ý mua kháng sinh uống khi chưa có chỉ định của bác sĩ. Hãy đi khám nếu xuất hiện sốt cao liên tục hoặc khó thở.'
);

