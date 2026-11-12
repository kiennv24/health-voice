package com.healthvoice.config;

import com.healthvoice.entity.Category;
import com.healthvoice.entity.Role;
import com.healthvoice.entity.User;
import com.healthvoice.entity.VoiceConfig;
import com.healthvoice.repository.CategoryRepository;
import com.healthvoice.repository.RoleRepository;
import com.healthvoice.repository.UserRepository;
import com.healthvoice.repository.VoiceConfigRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

/**
 * Khởi tạo dữ liệu mẫu ban đầu (Seed Data) nếu database trống.
 */
@Slf4j
@Configuration
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private VoiceConfigRepository voiceConfigRepository;

    @Autowired
    private com.healthvoice.repository.MedicalLexiconRepository medicalLexiconRepository;

    @Autowired
    private com.healthvoice.repository.AdviceTemplateRepository adviceTemplateRepository;

    @Autowired
    private com.healthvoice.repository.TriageRuleRepository triageRuleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        initRoles();
        initUsers();
        initCategories();
        initVoiceConfigs();
        initMedicalLexicon();
        initAdviceTemplates();
        initTriageRules();
    }

    private void initRoles() {
        if (roleRepository.count() == 0) {
            log.info("Khởi tạo danh sách vai trò (Roles)...");
            roleRepository.saveAll(List.of(
                    Role.builder().name("ROLE_ADMIN").build(),
                    Role.builder().name("ROLE_DOCTOR").build(),
                    Role.builder().name("ROLE_LISTENER").build()
            ));
        }
    }

    private void initUsers() {
        if (userRepository.count() == 0) {
            log.info("Khởi tạo tài khoản mẫu (Users)...");
            Role adminRole = roleRepository.findByName("ROLE_ADMIN").orElse(null);
            Role doctorRole = roleRepository.findByName("ROLE_DOCTOR").orElse(null);
            Role listenerRole = roleRepository.findByName("ROLE_LISTENER").orElse(null);

            userRepository.saveAll(List.of(
                    User.builder()
                            .username("admin")
                            .email("admin@healthvoice.vn")
                            .password(passwordEncoder.encode("123456"))
                            .fullName("Quản Trị Viên Hệ Thống")
                            .role(adminRole)
                            .status(1)
                            .build(),
                    User.builder()
                            .username("bs_tuanminh")
                            .email("tuanminh@bachmai.vn")
                            .password(passwordEncoder.encode("123456"))
                            .fullName("BS. CKII Tuấn Minh")
                            .role(doctorRole)
                            .status(1)
                            .build(),
                    User.builder()
                            .username("bs_lanphuong")
                            .email("lanphuong@nhitrunguong.vn")
                            .password(passwordEncoder.encode("123456"))
                            .fullName("BS. Lan Phương")
                            .role(doctorRole)
                            .status(1)
                            .build(),
                    User.builder()
                            .username("listener_user")
                            .email("benhnhan@gmail.com")
                            .password(passwordEncoder.encode("123456"))
                            .fullName("Độc Giả Sức Khỏe")
                            .role(listenerRole)
                            .status(1)
                            .build()
            ));
        }
    }

    private void initCategories() {
        if (categoryRepository.count() == 0) {
            log.info("Khởi tạo danh mục sức khỏe mẫu (Categories)...");
            categoryRepository.saveAll(List.of(
                    Category.builder().code("TIM_MACH").name("Tim Mạch & Huyết Áp").description("Tư vấn kiểm soát huyết áp, suy tim, bệnh mạch vành").isActive(true).build(),
                    Category.builder().code("NHI_KHOA").name("Nhi Khoa & Tiêm Chủng").description("Chăm sóc sốt, tiêm vắc xin và dinh dưỡng trẻ nhỏ").isActive(true).build(),
                    Category.builder().code("HO_HAP").name("Hô Hấp & Phổi").description("Hen phế quản, viêm phổi, COPD và kỹ thuật hít định liều").isActive(true).build(),
                    Category.builder().code("NOI_TIET").name("Nội Tiết & Đái Tháo Đường").description("Theo dõi đường huyết sau ăn, chỉ số HbA1c và biến chứng tiểu đường").isActive(true).build(),
                    Category.builder().code("DUOC_LAM_SANG").name("Dược Lâm Sàng & Đơn Thuốc").description("Hướng dẫn dùng kháng sinh, giảm đau hạ sốt an toàn").isActive(true).build()
            ));
        }
    }

    private void initVoiceConfigs() {
        if (voiceConfigRepository.count() == 0) {
            log.info("Khởi tạo danh sách giọng đọc FPT.AI...");
            voiceConfigRepository.saveAll(List.of(
                    VoiceConfig.builder().voiceCode("banmai").voiceName("Ban Mai (Nữ - Miền Bắc)").gender("FEMALE").region("Miền Bắc").defaultSpeed(0.0f).isActive(true).build(),
                    VoiceConfig.builder().voiceCode("thuminh").voiceName("Thu Minh (Nữ - Miền Bắc ấm áp)").gender("FEMALE").region("Miền Bắc").defaultSpeed(0.0f).isActive(true).build(),
                    VoiceConfig.builder().voiceCode("giahuy").voiceName("Gia Huy (Nam - Miền Trung)").gender("MALE").region("Miền Trung").defaultSpeed(0.0f).isActive(true).build(),
                    VoiceConfig.builder().voiceCode("myan").voiceName("Mỹ An (Nữ - Miền Trung)").gender("FEMALE").region("Miền Trung").defaultSpeed(0.0f).isActive(true).build(),
                    VoiceConfig.builder().voiceCode("leminh").voiceName("Lê Minh (Nam - Miền Bắc)").gender("MALE").region("Miền Bắc").defaultSpeed(0.0f).isActive(true).build(),
                    VoiceConfig.builder().voiceCode("minhquang").voiceName("Minh Quang (Nam - Miền Nam)").gender("MALE").region("Miền Nam").defaultSpeed(0.0f).isActive(true).build()
            ));
        }
    }

    private void initMedicalLexicon() {
        if (medicalLexiconRepository.count() == 0) {
            log.info("Khởi tạo danh sách từ điển phát âm y khoa ban đầu...");
            User admin = userRepository.findByUsername("admin").orElse(null);
            medicalLexiconRepository.saveAll(List.of(
                    com.healthvoice.entity.MedicalLexicon.builder().rawTerm("SpO2").phoneticReplacement("ét pơ ô hai").category("THUAT_NGU").createdBy(admin).isActive(true).build(),
                    com.healthvoice.entity.MedicalLexicon.builder().rawTerm("120/80 mmHg").phoneticReplacement("một trăm hai mươi trên tám mươi mi li mét thủy ngân").category("DON_VI").createdBy(admin).isActive(true).build(),
                    com.healthvoice.entity.MedicalLexicon.builder().rawTerm("Paracetamol").phoneticReplacement("pa ra xê ta mon").category("THUOC").createdBy(admin).isActive(true).build(),
                    com.healthvoice.entity.MedicalLexicon.builder().rawTerm("Aspirin").phoneticReplacement("át xpi rin").category("THUOC").createdBy(admin).isActive(true).build(),
                    com.healthvoice.entity.MedicalLexicon.builder().rawTerm("THA").phoneticReplacement("tăng huyết áp").category("THUAT_NGU").createdBy(admin).isActive(true).build(),
                    com.healthvoice.entity.MedicalLexicon.builder().rawTerm("ĐTĐ").phoneticReplacement("đái tháo đường").category("THUAT_NGU").createdBy(admin).isActive(true).build(),
                    com.healthvoice.entity.MedicalLexicon.builder().rawTerm("BHYT").phoneticReplacement("bảo hiểm y tế").category("THUAT_NGU").createdBy(admin).isActive(true).build(),
                    com.healthvoice.entity.MedicalLexicon.builder().rawTerm("KCB").phoneticReplacement("khám chữa bệnh").category("THUAT_NGU").createdBy(admin).isActive(true).build(),
                    com.healthvoice.entity.MedicalLexicon.builder().rawTerm("COPD").phoneticReplacement("bệnh phổi tắc nghẽn mãn tính").category("THUAT_NGU").createdBy(admin).isActive(true).build(),
                    com.healthvoice.entity.MedicalLexicon.builder().rawTerm("500mg").phoneticReplacement("năm trăm mi li gam").category("DON_VI").createdBy(admin).isActive(true).build()
            ));
        }
    }

    private void initAdviceTemplates() {
        if (adviceTemplateRepository.count() == 0) {
            log.info("Khởi tạo danh mục phác đồ dặn dò y tế mẫu...");
            User doctor = userRepository.findByUsername("bs_tuanminh").orElse(null);
            if (doctor != null) {
                adviceTemplateRepository.saveAll(List.of(
                        com.healthvoice.entity.AdviceTemplate.builder()
                                .doctor(doctor)
                                .title("Quy trình sơ cứu khi huyết áp tăng vọt trên 160 mmHg tại nhà")
                                .category("TIM_MACH")
                                .content("Khi huyết áp đo được trên một trăm sáu mươi milimét thủy ngân, người bệnh cần dừng mọi hoạt động, nằm nghỉ ngơi nơi thoáng đãng đầu nâng cao ba mươi độ. Không uống nước chè đặc hay cà phê. Uống một liều thuốc hạ áp theo đơn bác sĩ đã kê và đo lại sau ba mươi phút.")
                                .voiceCode("banmai")
                                .isPublic(true)
                                .build(),
                        com.healthvoice.entity.AdviceTemplate.builder()
                                .doctor(doctor)
                                .title("Hướng dẫn theo dõi đường huyết sau ăn cho bệnh nhân đái tháo đường")
                                .category("NOI_TIET")
                                .content("Đo đường huyết sau ăn hai giờ là thời điểm vàng để đánh giá mức độ kiểm soát đường huyết. Mục tiêu an toàn nên duy trì dưới mười milimol trên lít. Ghi chép chi tiết thực đơn bữa ăn vào sổ theo dõi để bác sĩ điều chỉnh liều thuốc.")
                                .voiceCode("thuminh")
                                .isPublic(true)
                                .build(),
                        com.healthvoice.entity.AdviceTemplate.builder()
                                .doctor(doctor)
                                .title("Dấu hiệu nhận biết sớm cơn đột quỵ não theo quy tắc FAST")
                                .category("TIM_MACH")
                                .content("Quy tắc FAST gồm bốn dấu hiệu: F là mặt mất cân xứng hoặc méo một bên khi cười. A là tay yếu hoặc không thể nâng đều hai tay. S là giọng nói đớ hoặc khó phát âm. T là thời gian, hãy gọi cấp cứu một một năm ngay lập tức vì mỗi phút trôi qua đều cứu sống hàng triệu tế bào não.")
                                .voiceCode("leminh")
                                .isPublic(true)
                                .build()
                ));
            }
        }
    }

    private void initTriageRules() {
        if (triageRuleRepository.count() == 0) {
            log.info("Khởi tạo danh sách cây luật phân loại rủi ro y tế (Triage Rules)...");
            triageRuleRepository.saveAll(List.of(
                    com.healthvoice.entity.TriageRule.builder()
                            .ruleCode("EMERGENCY_STROKE")
                            .category("THAN_KINH")
                            .triggerKeywords("méo miệng, liệt nửa người, nói ngọng, đột quỵ, tai biến, tê liệt nửa người, méo mặt")
                            .riskLevel("EMERGENCY")
                            .priority(10)
                            .adviceText("CẢNH BÁO CẤP CỨU KHẨN CẤP: Dấu hiệu bạn vừa mô tả là triệu chứng điển hình của Đột quỵ hoặc Tai biến mạch máu não theo tiêu chuẩn FAST. Bạn hoặc người nhà cần gọi ngay tổng đài Cấp cứu 115 hoặc di chuyển ngay đến bệnh viện có đơn vị can thiệp đột quỵ gần nhất trong thời gian vàng 3 đến 4 giờ đầu. Tuyệt đối không tự ý cho uống nước, cạo gió hay dùng thuốc hạ áp tại nhà.")
                            .build(),
                    com.healthvoice.entity.TriageRule.builder()
                            .ruleCode("EMERGENCY_MYOCARDIAL_INFARCTION")
                            .category("TIM_MACH")
                            .triggerKeywords("đau thắt ngực, khó thở, tức ngực trái, vã mồ hôi, nhồi máu cơ tim, ép chặt lồng ngực, đau lan ra tay trái")
                            .riskLevel("EMERGENCY")
                            .priority(10)
                            .adviceText("CẢNH BÁO CẤP CỨU KHẨN CẤP: Triệu chứng đau tức ngực trái dữ dội kèm khó thở và vã mồ hôi là dấu hiệu cảnh báo Cơn nhồi máu cơ tim cấp hoặc Hội chứng mạch vành cấp tính. Hãy gọi ngay cấp cứu 115 hoặc nhờ người nhà đưa đến cơ sở y tế gần nhất. Trong lúc chờ đợi, hãy ngồi nghỉ ngơi đầu cao 30 độ ở nơi thoáng mát, nới lỏng cổ áo, giữ bình tĩnh và tuyệt đối không gắng sức.")
                            .build(),
                    com.healthvoice.entity.TriageRule.builder()
                            .ruleCode("HIGH_APPENDICITIS")
                            .category("TIEU_HOA")
                            .triggerKeywords("đau hố chậu phải, đau bụng dưới bên phải, đau ruột thừa, quặn bụng hố chậu phải, viêm ruột thừa")
                            .riskLevel("HIGH")
                            .priority(8)
                            .adviceText("CẢNH BÁO NGUY CƠ CAO: Tình trạng đau âm ỉ tăng dần ở vùng bụng dưới bên phải hoặc hố chậu phải có thể là biểu hiện của Viêm ruột thừa cấp. Bạn cần đến ngay khoa cấp cứu hoặc bệnh viện có chuyên khoa ngoại tiêu hóa trong vòng 24 giờ để được siêu âm ổ bụng và xét nghiệm máu. Tuyệt đối không tự ý chườm nóng, không uống thuốc giảm đau hay thuốc xổ vì có thể làm lu mờ triệu chứng hoặc gây vỡ ruột thừa.")
                            .build(),
                    com.healthvoice.entity.TriageRule.builder()
                            .ruleCode("MEDIUM_FEVER_CARE")
                            .category("SOT")
                            .triggerKeywords("sốt cao, sốt 39 độ, uống hạ sốt, paracetamol, sốt 38.5, nhiệt độ cao, nóng sốt")
                            .riskLevel("MEDIUM")
                            .priority(5)
                            .adviceText("HƯỚNG DẪN CHĂM SÓC SỐT: Khi sốt từ 38.5 độ C trở lên, bạn có thể dùng Paracetamol với liều từ 10 đến 15 miligam trên một kilôgam thể trọng mỗi lần, uống cách nhau từ 4 đến 6 giờ nếu còn sốt, không quá 4 lần một ngày. Hãy mặc quần áo thoáng mát, lau người bằng nước ấm ở nách và bẹn, uống nhiều nước hoặc dung dịch Oresol pha đúng tỷ lệ để bù điện giải. Nếu sốt cao trên 39.5 độ C không hạ hoặc kéo dài quá 48 giờ, bạn hãy đi khám bác sĩ ngay.")
                            .build(),
                    com.healthvoice.entity.TriageRule.builder()
                            .ruleCode("LOW_COMMON_COLD")
                            .category("HO_HAP")
                            .triggerKeywords("nghẹt mũi, hắt xì, đau họng nhẹ, cảm cúm, sổ mũi, hắt hơi, cảm lạnh")
                            .riskLevel("LOW")
                            .priority(1)
                            .adviceText("HƯỚNG DẪN THEO DÕI TẠI NHÀ: Các triệu chứng nghẹt mũi, hắt xì và đau họng nhẹ thường gặp trong cảm cúm thông thường do nhiễm siêu vi đường hô hấp trên. Bạn nên nghỉ ngơi hợp lý, súc miệng nước muối sinh lý ấm từ 2 đến 3 lần mỗi ngày, uống nhiều nước ấm và bổ sung thêm vitamin C. Không nên tự ý mua kháng sinh uống khi chưa có chỉ định của bác sĩ. Hãy đi khám nếu xuất hiện sốt cao liên tục hoặc khó thở.")
                            .build()
            ));
        }
    }
}
