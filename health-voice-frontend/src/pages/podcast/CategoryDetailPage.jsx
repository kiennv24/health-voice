import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  HeartPulse, 
  Brain, 
  Stethoscope, 
  Wind, 
  Apple, 
  Pill,
  BookOpen,
  Headphones,
  Play,
  Pause,
  Clock,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Search,
  Sparkles,
  ArrowLeft,
  Volume2,
  Calendar,
  Share2,
  Activity
} from 'lucide-react';
import { podcastApi } from '../../api/endpoints';
import { useAudioPlayer } from '../../context/AudioContext';

// 6 Chuyên mục Y tế trọng điểm
export const CATEGORY_CONFIG = {
  TIM_MACH: {
    id: 'TIM_MACH',
    name: 'Bệnh Tim Mạch & Huyết Áp',
    shortName: 'Tim Mạch & Huyết Áp',
    icon: HeartPulse,
    tagColor: 'bg-rose-600 text-white',
    badgeColor: 'bg-rose-50 text-rose-800 border-rose-200',
    accentColor: 'text-rose-700',
    borderColor: 'border-rose-200 hover:border-rose-400',
    lightBg: 'bg-rose-50/60',
    heroTag: 'Tim Mạch Học Lâm Sàng',
    subtitle: 'Chăm sóc sức khỏe trái tim, phòng ngừa nhồi máu cơ tim & hạ huyết áp an toàn',
    description: 'Hệ thống tim mạch đóng vai trò then chốt trong việc duy trì tuần hoàn máu và oxy đến mọi tế bào cơ thể. Chuyên trang Tim Mạch cung cấp các phác đồ y khoa chính thống từ Bác sĩ chuyên khoa: hướng dẫn đo huyết áp chuẩn xác tại nhà, kiểm soát mỡ máu LDL, nhận diện sớm cơn đau thắt ngực và kỹ năng sơ cứu nhồi máu cơ tim cấp.',
    subtopics: [
      { id: 'ALL', name: 'Tất cả chủ đề' },
      { id: 'huyet_ap', name: 'Tăng huyết áp', keyword: 'huyết áp' },
      { id: 'mach_vanh', name: 'Bệnh mạch vành & Đau thắt ngực', keyword: 'ngực' },
      { id: 'mo_mau', name: 'Mỡ máu & Xơ vữa', keyword: 'mỡ máu' },
      { id: 'nhip_tim', name: 'Rối loạn nhịp tim', keyword: 'nhịp tim' },
      { id: 'suy_tim', name: 'Suy tim ứ huyết', keyword: 'suy tim' },
    ],
    faqs: [
      {
        q: 'Chỉ số huyết áp bao nhiêu là bắt đầu nguy hiểm cần can thiệp y tế?',
        a: 'Huyết áp từ 140/90 mmHg được chẩn đoán là tăng huyết áp độ 1. Nếu huyết áp tăng vọt trên 180/120 mmHg kèm đau đầu dữ dội, mờ mắt hoặc khó thở, đây là cơn tăng huyết áp cấp cứu cần gọi ngay 115.'
      },
      {
        q: 'Làm sao phân biệt đau thắt ngực do trào ngược dạ dày với nhồi máu cơ tim?',
        a: 'Đau do trào ngược thường có cảm giác nóng rát sau xương ức, tăng khi nằm ngay sau ăn. Đau do tim có cảm giác đè nặng như đá tảng, lan lên cằm, vai trái, cánh tay trái và thường kéo dài trên 15 phút không đỡ khi nghỉ ngơi.'
      },
      {
        q: 'Uống thuốc hạ huyết áp suốt đời có gây hại cho thận không?',
        a: 'Ngược lại, huyết áp cao không được kiểm soát mới là nguyên nhân hàng đầu phá hủy cầu thận gây suy thận mạn. Thuốc hạ áp hiện đại được thiết kế bảo vệ mạch máu thận và ngăn ngừa biến chứng tim mạch khi dùng đúng chỉ định.'
      },
      {
        q: 'Người bị bệnh tim có nên kiêng hoàn toàn chất béo không?',
        a: 'Không nên kiêng hoàn toàn. Cần loại bỏ mỡ động vật và chất béo chuyển hóa (trans fat), nhưng nên bổ sung chất béo không bão hòa Omega-3 từ cá béo, quả bơ và dầu ô liu để chống viêm thành mạch.'
      }
    ],
    advisoryDoctor: {
      name: 'ThS. BS Trần Thị Mai',
      role: 'Phó Giám đốc Trung tâm Tim Mạch Can thiệp',
      hospital: 'Bệnh viện Đại học Y Hà Nội',
      exp: '18 năm kinh nghiệm giảng dạy & điều trị',
      avatar: 'https://images.unsplash.com/photo-1594824813583-718227ec23f3?w=400&auto=format&fit=crop'
    }
  },

  THAN_KINH: {
    id: 'THAN_KINH',
    name: 'Thần Kinh & Cấp Cứu Đột Quỵ',
    shortName: 'Thần Kinh & Đột Quỵ',
    icon: Brain,
    tagColor: 'bg-purple-700 text-white',
    badgeColor: 'bg-purple-50 text-purple-800 border-purple-200',
    accentColor: 'text-purple-700',
    borderColor: 'border-purple-200 hover:border-purple-400',
    lightBg: 'bg-purple-50/60',
    heroTag: 'Thần Kinh & Cấp Cứu 115',
    subtitle: 'Khung giờ vàng 4.5 giờ cấp cứu tai biến mạch máu não và phục hồi chức năng thần kinh',
    description: 'Hệ thần kinh điều phối mọi hoạt động ý thức, vận động và cảm giác của con người. Chuyên trang Thần kinh & Đột quỵ tập hợp kiến thức lâm sàng chuẩn mực về quy tắc FAST nhận diện tai biến, phân biệt cơn thiếu máu não thoáng qua (TIA), điều trị đau đầu Migraine, rối loạn tiền đình và sa sút trí tuệ tuổi già.',
    subtopics: [
      { id: 'ALL', name: 'Tất cả chủ đề' },
      { id: 'fast', name: 'Quy tắc FAST 115', keyword: 'fast' },
      { id: 'dot_quy', name: 'Đột quỵ não & Thiếu máu não TIA', keyword: 'máu não' },
      { id: 'dau_dau', name: 'Đau đầu & Migraine', keyword: 'đau đầu' },
      { id: 'tien_dinh', name: 'Rối loạn tiền đình & Chóng mặt', keyword: 'tiền đình' },
      { id: 'tri_nho', name: 'Sa sút trí tuệ & Alzheimer', keyword: 'trí nhớ' },
    ],
    faqs: [
      {
        q: 'Quy tắc FAST nhận diện đột quỵ gồm những bước nào?',
        a: 'F (Face): Méo miệng, lệch một bên mặt khi cười. A (Arm): Yếu liệt một bên tay, không nhấc đều 2 tay. S (Speech): Nói ngọng, líu lưỡi hoặc không hiểu lời. T (Time): Gọi ngay 115 và ghi nhớ giờ khởi phát.'
      },
      {
        q: 'Có nên dùng kim châm vào đầu ngón tay hay cạo gió khi người nhà bị đột quỵ?',
        a: 'Tuyệt đối KHÔNG. Châm kim gây đau làm huyết áp tăng vọt nguy cơ vỡ mạch máu não. Cần đặt người bệnh nằm nghiêng đầu cao 30 độ và đưa ngay đến trung tâm có máy CT/MRI.'
      },
      {
        q: 'Cơn chóng mặt quay cuồng khi trở mình trên giường có phải đột quỵ không?',
        a: 'Thường là Chóng mặt kịch phát lành tính (BPPV) do sỏi ốc tai lạc chỗ, không gây liệt tay chân. Tuy nhiên nếu chóng mặt kèm nhìn đôi hoặc nói khó thì cần cấp cứu loại trừ nhồi máu tiểu não.'
      }
    ],
    advisoryDoctor: {
      name: 'BS. CKII Nguyễn Văn Hùng',
      role: 'Trưởng khoa Cấp cứu & Can thiệp Đột quỵ',
      hospital: 'Bệnh viện Bạch Mai',
      exp: '24 năm kinh nghiệm cấp cứu thần kinh',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop'
    }
  },

  TIEU_HOA: {
    id: 'TIEU_HOA',
    name: 'Tiêu Hóa & Gan Mật Dạ Dày',
    shortName: 'Tiêu Hóa & Dạ Dày',
    icon: Stethoscope,
    tagColor: 'bg-orange-600 text-white',
    badgeColor: 'bg-orange-50 text-orange-800 border-orange-200',
    accentColor: 'text-orange-700',
    borderColor: 'border-orange-200 hover:border-orange-400',
    lightBg: 'bg-orange-50/60',
    heroTag: 'Tiêu Hóa Gan Mật',
    subtitle: 'Chăm sóc hệ tiêu hóa khỏe mạnh, tiêu trừ vi khuẩn HP và bảo vệ chức năng gan mật',
    description: 'Đường tiêu hóa là bộ não thứ hai của cơ thể kết nối chặt chẽ với hệ miễn dịch. Chuyên trang Tiêu hóa & Gan Mật cung cấp giải pháp phòng ngừa và điều trị: viêm loét dạ dày tá tràng, trào ngược thực quản GERD, hội chứng ruột kích thích IBS, gan nhiễm mỡ và phát hiện sớm xuất huyết tiêu hóa.',
    subtopics: [
      { id: 'ALL', name: 'Tất cả chủ đề' },
      { id: 'da_day', name: 'Viêm loét dạ dày & GERD', keyword: 'dạ dày' },
      { id: 'hp', name: 'Vi khuẩn HP', keyword: 'hp' },
      { id: 'ibs', name: 'Hội chứng ruột kích thích IBS', keyword: 'ruột' },
      { id: 'gan', name: 'Gan nhiễm mỡ & Xơ gan', keyword: 'gan' },
      { id: 'xuat_huyet', name: 'Xuất huyết tiêu hóa', keyword: 'xuất huyết' },
    ],
    faqs: [
      {
        q: 'Nhiễm vi khuẩn HP dạ dày có nhất thiết phải uống thuốc kháng sinh diệt trừ không?',
        a: 'Không phải mọi ca đều cần diệt. Chỉ định bắt buộc khi có ổ loét dạ dày tá tràng, tiền sử gia đình ung thư dạ dày hoặc tổn thương teo niêm mạc dạ dày.'
      },
      {
        q: 'Uống nước chanh ấm buổi sáng có tốt cho người trào ngược dạ dày không?',
        a: 'Nước chanh chứa acid citric làm giảm pH dạ dày, kích thích niêm mạc thực quản đang tổn thương gây ợ chua, nóng rát dữ dội hơn.'
      },
      {
        q: 'Gan nhiễm mỡ độ 1 có thể chữa khỏi hoàn toàn được không?',
        a: 'Giai đoạn 1 là thoái hóa mỡ đơn thuần chưa có viêm hay xơ hóa, hoàn toàn có thể đảo ngược 100% bằng cách giảm 7-10% cân nặng và hạn chế bia rượu.'
      }
    ],
    advisoryDoctor: {
      name: 'ThS. BS Trần Thị Mai',
      role: 'Chuyên gia Nội Tiêu Hóa Gan Mật',
      hospital: 'Bệnh viện Đại học Y Hà Nội',
      exp: '18 năm kinh nghiệm giảng dạy & điều trị',
      avatar: 'https://images.unsplash.com/photo-1594824813583-718227ec23f3?w=400&auto=format&fit=crop'
    }
  },

  HO_HAP: {
    id: 'HO_HAP',
    name: 'Hô Hấp & Bệnh Theo Mùa',
    shortName: 'Hô Hấp & Bệnh Theo Mùa',
    icon: Wind,
    tagColor: 'bg-sky-600 text-white',
    badgeColor: 'bg-sky-50 text-sky-800 border-sky-200',
    accentColor: 'text-sky-700',
    borderColor: 'border-sky-200 hover:border-sky-400',
    lightBg: 'bg-sky-50/60',
    heroTag: 'Hô Hấp Học Lâm Sàng',
    subtitle: 'Bảo vệ đường thở trong lành, kiểm soát hen suyễn và phòng ngừa viêm phổi mùa lạnh',
    description: 'Hệ hô hấp trực tiếp tiếp xúc với môi trường khí quyển và các tác nhân khói bụi, virus vi khuẩn. Chuyên trang Hô hấp mang đến kiến thức y học thiết thực: kỹ thuật cắt cơn hen phế quản cấp, theo dõi chỉ số SpO2 tại nhà, phục hồi chức năng phổi COPD và vệ sinh mũi xoang đúng cách.',
    subtopics: [
      { id: 'ALL', name: 'Tất cả chủ đề' },
      { id: 'hen', name: 'Hen phế quản cấp', keyword: 'hen' },
      { id: 'spo2', name: 'Theo dõi chỉ số SpO2', keyword: 'spo2' },
      { id: 'copd', name: 'Bệnh phổi tắc nghẽn COPD', keyword: 'copd' },
      { id: 'xoang', name: 'Viêm xoang dị ứng & Rửa mũi', keyword: 'xoang' },
      { id: 'viem_phoi', name: 'Cảm cúm & Viêm phổi', keyword: 'phổi' },
    ],
    faqs: [
      {
        q: 'Chỉ số SpO2 bao nhiêu thì người bệnh cần phải nhập viện thở oxy?',
        a: 'SpO2 dưới 94% ở người bình thường là dấu hiệu thiếu oxy máu. Nếu dưới 90% kèm thở nhanh co kéo hõm ức, đây là cấp cứu suy hô hấp cần đi viện gấp.'
      },
      {
        q: 'Xịt thuốc cắt cơn hen phế quản Salbutamol bao nhiêu nhát là an toàn?',
        a: 'Khi lên cơn khó thở cấp, xịt ngay 2 nhát. Nếu sau 15 phút không đỡ có thể xịt thêm 2 nhát và đưa người bệnh đến cơ sở y tế gần nhất.'
      },
      {
        q: 'Rửa mũi bằng nước muối sinh lý có gây viêm tai giữa không?',
        a: 'Chỉ gây viêm tai giữa nếu xì mũi quá mạnh bằng cả 2 lỗ mũi cùng lúc. Cần há miệng khi bơm nước và để nước chảy tự nhiên ra lỗ mũi bên kia.'
      }
    ],
    advisoryDoctor: {
      name: 'BS. Lê Hoàng Nam',
      role: 'Bác sĩ Hồi sức Hô hấp & Nhi khoa',
      hospital: 'Bệnh viện Nhi Trung Ương',
      exp: '15 năm kinh nghiệm điều trị',
      avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&auto=format&fit=crop'
    }
  },

  DINH_DUONG: {
    id: 'DINH_DUONG',
    name: 'Dinh Dưỡng & Lối Sống Lành Mạnh',
    shortName: 'Dinh Dưỡng & Lối Sống',
    icon: Apple,
    tagColor: 'bg-emerald-600 text-white',
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    accentColor: 'text-emerald-700',
    borderColor: 'border-emerald-200 hover:border-emerald-400',
    lightBg: 'bg-emerald-50/60',
    heroTag: 'Dinh Dưỡng Điều Trị',
    subtitle: 'Liệu pháp dinh dưỡng điều trị, kiểm soát đường huyết và vận động phục hồi chức năng',
    description: 'Dinh dưỡng đúng cách là phương thuốc tự nhiên hiệu quả nhất phòng ngừa bệnh mạn tính. Chuyên trang Dinh Dưỡng cung cấp các nguyên tắc khoa học: chế độ ăn đái tháo đường típ 2, phương pháp Địa Trung Hải, bổ sung vi chất sắt kẽm, tập luyện thoái hóa khớp gối và nhịn ăn gián đoạn an toàn.',
    subtopics: [
      { id: 'ALL', name: 'Tất cả chủ đề' },
      { id: 'tieu_duong', name: 'Đái tháo đường Típ 2', keyword: 'đường' },
      { id: 'dia_trung_hai', name: 'Chế độ ăn Địa Trung Hải', keyword: 'địa trung hải' },
      { id: 'khop', name: 'Thoái hóa khớp & Vận động', keyword: 'khớp' },
      { id: 'vi_chat', name: 'Bổ sung sắt & Vi chất', keyword: 'sắt' },
      { id: 'nhin_an', name: 'Nhịn ăn gián đoạn 16:8', keyword: 'nhịn ăn' },
    ],
    faqs: [
      {
        q: 'Người đái tháo đường có nên nhịn ăn hoàn toàn cơm trắng không?',
        a: 'Không nên nhịn tuyệt đối tinh bột vì dễ gây hạ đường huyết và teo cơ. Nên thay thế cơm trắng bằng gạo lứt, yến mạch hoặc khoai lang luộc có chỉ số đường huyết GI thấp.'
      },
      {
        q: 'Người thoái hóa khớp gối có nên đi bộ nhiều không?',
        a: 'Đi bộ đường bằng vừa sức 20-30 phút rất tốt giúp tiết dịch khớp. Tránh leo cầu thang, mang vác nặng hoặc chạy nhảy tác động lực mạnh lên sụn khớp.'
      },
      {
        q: 'Phương pháp nhịn ăn gián đoạn 16:8 ai không được áp dụng?',
        a: 'Phụ nữ mang thai, cho con bú, người đái tháo đường đang tiêm Insulin và trẻ em đang tuổi dậy thì tuyệt đối không được tự ý nhịn ăn 16 tiếng.'
      }
    ],
    advisoryDoctor: {
      name: 'ThS. BS Trần Thị Mai',
      role: 'Chuyên gia Dinh dưỡng Lâm sàng & Nội tiết',
      hospital: 'Bệnh viện Đại học Y Hà Nội',
      exp: '18 năm kinh nghiệm giảng dạy & điều trị',
      avatar: 'https://images.unsplash.com/photo-1594824813583-718227ec23f3?w=400&auto=format&fit=crop'
    }
  },

  DUOC_PHAM: {
    id: 'DUOC_PHAM',
    name: 'Thuốc & Dược Liệu Hướng Dẫn',
    shortName: 'Thuốc & Dược Liệu',
    icon: Pill,
    tagColor: 'bg-teal-700 text-white',
    badgeColor: 'bg-teal-50 text-teal-800 border-teal-200',
    accentColor: 'text-teal-800',
    borderColor: 'border-teal-200 hover:border-teal-400',
    lightBg: 'bg-teal-50/60',
    heroTag: 'Dược Lâm Sàng',
    subtitle: 'Sử dụng thuốc an toàn, phòng ngừa tương tác độc tính và bài trừ thói quen lạm dụng kháng sinh',
    description: 'Thuốc là con dao hai lưỡi nếu sử dụng sai liều lượng hoặc tương tác nguy hiểm với thực phẩm. Chuyên trang Dược Phẩm trang bị kiến thức dùng thuốc thông thái: liều Paracetamol chuẩn theo cân nặng, cảnh báo kháng kháng sinh toàn cầu, thời điểm uống men vi sinh và thận trọng với rượu thuốc dân gian.',
    subtopics: [
      { id: 'ALL', name: 'Tất cả chủ đề' },
      { id: 'paracetamol', name: 'Hạ sốt Paracetamol', keyword: 'paracetamol' },
      { id: 'khang_sinh', name: 'Cảnh báo kháng kháng sinh', keyword: 'kháng sinh' },
      { id: 'tuong_tac', name: 'Tương tác thuốc & Thực phẩm', keyword: 'tương tác' },
      { id: 'men_vi_sinh', name: 'Men vi sinh Probiotics', keyword: 'men vi sinh' },
      { id: 'duoc_lieu', name: 'Dược liệu & Rượu thuốc', keyword: 'dược liệu' },
    ],
    faqs: [
      {
        q: 'Liều dùng Paracetamol an toàn cho người lớn và trẻ em là bao nhiêu?',
        a: 'Trẻ em: 10 - 15 mg/kg cân nặng mỗi lần, cách nhau 4 - 6 giờ (tối đa 60 mg/kg/ngày). Người lớn: 500 - 1000 mg mỗi lần (tối đa 4000 mg/ngày).'
      },
      {
        q: 'Uống thuốc với nước ngọt có ga, sữa hoặc nước trà có được không?',
        a: 'Tuyệt đối nên uống thuốc với nước lọc đun sôi để nguội. Sữa chứa canxi kết tủa kháng sinh, trà chứa tanin kết tủa sắt, nước ngọt làm biến đổi pH dạ dày làm hỏng lớp bao thuốc.'
      },
      {
        q: 'Tại sao đang uống thuốc hạ mỡ máu Statin lại phải kiêng ăn bưởi?',
        a: 'Chất furanocoumarins trong bưởi vô hiệu hóa enzym CYP3A4 ở ruột non, khiến nồng độ thuốc Statin trong máu tăng gấp 5-10 lần gây độc cơ vân và suy thận cấp.'
      }
    ],
    advisoryDoctor: {
      name: 'BS. CKII Nguyễn Văn Hùng',
      role: 'Hội đồng Kiểm duyệt Dược Lâm sàng',
      hospital: 'Bệnh viện Bạch Mai',
      exp: '24 năm kinh nghiệm cấp cứu & dược lý',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop'
    }
  }
};

export default function CategoryDetailPage() {
  const { categoryCode } = useParams();
  const navigate = useNavigate();
  const { play, currentAudio, isPlaying, pause, resume, stopAll } = useAudioPlayer();

  // Chuẩn hóa category hiện tại (mặc định TIM_MACH nếu mã không hợp lệ)
  const currentKey = (categoryCode || 'TIM_MACH').toUpperCase();
  const currentCategory = CATEGORY_CONFIG[currentKey] || CATEGORY_CONFIG.TIM_MACH;

  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubtopic, setSelectedSubtopic] = useState('ALL');
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // Tự động tắt âm thanh khi người dùng thoát ra khỏi trang hoặc chuyển đổi chuyên mục
  useEffect(() => {
    return () => {
      stopAll();
    };
  }, [currentKey, stopAll]);

  // Cuộn lên đầu trang khi thay đổi chuyên mục
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setSelectedSubtopic('ALL');
  }, [currentKey]);

  // Tải danh sách bài viết theo chuyên mục
  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const res = await podcastApi.getPublic({
          category: currentCategory.id,
          size: 30,
        });
        const data = res?.data?.content || res?.data || res || [];
        if (Array.isArray(data)) {
          setPodcasts(data);
        }
      } catch (err) {
        console.warn('Lỗi tải bài viết chuyên mục:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [currentCategory.id]);

  // Phân chia dữ liệu theo layout Tạp chí Y khoa (Hello Bacsi style)
  // Bài 1: Hero bài lớn (Tiêu điểm)
  // Bài 2..5: 4 bài nhỏ của khối "Kiến thức chung" (Grid 2x2)
  // Các bài còn lại: Danh sách dòng ngang "Xem thêm về..."
  const heroArticle = podcasts[0] || null;
  const gridArticles = podcasts.slice(1, 5);
  const remainingArticles = podcasts.slice(5);

  // Lọc bài viết dòng ngang theo Subtopic đã chọn
  const filteredRemaining = remainingArticles.filter(item => {
    if (selectedSubtopic === 'ALL') return true;
    const sub = currentCategory.subtopics.find(s => s.id === selectedSubtopic);
    if (!sub || !sub.keyword) return true;
    const kw = sub.keyword.toLowerCase();
    return (
      item.title?.toLowerCase().includes(kw) ||
      item.summary?.toLowerCase().includes(kw) ||
      item.content?.toLowerCase().includes(kw)
    );
  });

  // Xử lý phát / tạm dừng audio bài viết
  const handleTogglePlay = (e, podcast) => {
    e.preventDefault();
    e.stopPropagation();

    if (!podcast?.audioUrl) return;

    if (currentAudio?.url === podcast.audioUrl) {
      if (isPlaying) {
        pause();
      } else {
        resume();
      }
      return;
    }

    play(podcast.audioUrl, {
      title: podcast.title,
      author: podcast.authorName || 'Bác sĩ chuyên khoa',
      category: podcast.category,
      podcastId: podcast.id,
      thumbnailUrl: podcast.thumbnailUrl,
    });
  };

  const isAudioActive = (audioUrl) => currentAudio?.url === audioUrl && isPlaying;

  const CategoryIcon = currentCategory.icon;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      {/* =================================================================== */}
      {/* 1. TOP BAR: BREADCRUMB & CHUYỂN NHANH 6 CHUYÊN MỤC Y TẾ              */}
      {/* =================================================================== */}
      <div className="bg-white/95 backdrop-blur-md border-b border-slate-200/90 sticky top-16 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 overflow-x-auto whitespace-nowrap scrollbar-none font-medium">
              <Link to="/" className="hover:text-teal-800 transition flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-teal-700" />
                <span>Trang Chủ</span>
              </Link>
              <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
              <Link to="/#podcast-library" className="hover:text-teal-800 transition">
                Chuyên Khoa Y Tế
              </Link>
              <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="font-bold text-slate-900 truncate">
                {currentCategory.shortName}
              </span>
            </div>

            {/* Pill tabs chọn nhanh 6 chuyên mục */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
              {Object.values(CATEGORY_CONFIG).map(cat => {
                const Icon = cat.icon;
                const isActive = cat.id === currentCategory.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => navigate(`/category/${cat.id}`)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 border t-btn-press ${
                      isActive 
                        ? 'bg-teal-800 text-white border-teal-800 shadow-2xs font-bold' 
                        : 'bg-slate-50 text-slate-600 border-slate-200/90 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-teal-200' : 'text-slate-500'}`} />
                    <span>{cat.shortName}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. CATEGORY HERO BANNER (Đầu trang chuẩn Hello Bacsi)               */}
      {/* =================================================================== */}
      <section className="bg-gradient-to-b from-white via-white to-slate-50/80 border-b border-slate-200/90 pt-10 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            {/* Category Icon lớn trung tâm */}
            <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-teal-50 border border-teal-200/80 shadow-xs mb-1">
              <CategoryIcon className={`w-10 h-10 ${currentCategory.accentColor}`} />
            </div>

            {/* Tiêu đề Chuyên Mục */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 leading-snug">
              {currentCategory.name}
            </h1>

            {/* Đoạn mô tả y khoa chuẩn mực */}
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto">
              {currentCategory.description}
            </p>

            {/* Clinical Trust Badges */}
            <div className="pt-3 flex flex-wrap items-center justify-center gap-2.5 text-[11px] text-slate-500 font-medium">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-700" />
                Hội đồng Bác sĩ kiểm duyệt
              </span>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700">
                <Headphones className="w-3.5 h-3.5 text-teal-700" />
                100% có Audio Y Khoa
              </span>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
                Phác đồ lâm sàng chuẩn
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* 3. KHỐI 1: "KIẾN THỨC CHUNG" (Hero Card lớn + 4 Grid Articles)      */}
      {/* =================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="flex items-center justify-between gap-4 mb-6 pb-2 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Kiến thức chung
            </h2>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-100 text-teal-800">
              Tiêu Điểm Lâm Sàng
            </span>
          </div>

          <span className="text-xs text-slate-500 font-medium">
            {podcasts.length} bài viết đã xuất bản
          </span>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center text-slate-500 shadow-2xs">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-teal-700" />
            <p className="text-xs font-semibold">Đang tổng hợp các bài viết chuyên khoa {currentCategory.shortName}...</p>
          </div>
        ) : !heroArticle ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">Chưa có bài viết nào trong chuyên mục này</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* CỘT TRÁI: 1 Bài viết lớn Hero (Featured Article) */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition group flex flex-col justify-between">
              <div>
                <div className="relative aspect-video sm:aspect-16/9 w-full overflow-hidden bg-slate-100">
                  <img
                    src={heroArticle.thumbnailUrl || 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&auto=format&fit=crop'}
                    alt={heroArticle.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-teal-800 text-white shadow-xs">
                      {currentCategory.heroTag}
                    </span>
                  </div>

                  {heroArticle.audioUrl && (
                    <button
                      type="button"
                      onClick={(e) => handleTogglePlay(e, heroArticle)}
                      className={`absolute bottom-3 right-3 p-3 rounded-full text-white shadow-md transition transform active:scale-90 flex items-center justify-center ${
                        isAudioActive(heroArticle.audioUrl)
                          ? 'bg-rose-600 hover:bg-rose-700 animate-pulse'
                          : 'bg-teal-800/90 hover:bg-teal-900 backdrop-blur-xs'
                      }`}
                      title={isAudioActive(heroArticle.audioUrl) ? 'Tạm dừng nghe' : 'Nghe toàn văn Audio Podcast'}
                    >
                      {isAudioActive(heroArticle.audioUrl) ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      )}
                    </button>
                  )}
                </div>

                <div className="p-5 sm:p-6 space-y-3">
                  <span className="text-[11px] font-semibold text-teal-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                    Bác sĩ tham vấn y khoa: {heroArticle.authorName || currentCategory.advisoryDoctor.name}
                  </span>

                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug group-hover:text-teal-900 transition">
                    <Link to={`/podcasts/${heroArticle.slug}`}>
                      {heroArticle.title}
                    </Link>
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed">
                    {heroArticle.summary}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="px-5 sm:px-6 pb-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {heroArticle.audioDurationSeconds ? `${Math.floor(heroArticle.audioDurationSeconds / 60)} phút nghe` : '4 phút nghe'}
                  </span>
                  <span>•</span>
                  <span className="text-teal-700 font-medium">Giọng đọc Y khoa chuẩn</span>
                </div>

                <div className="flex items-center gap-2">
                  {heroArticle.audioUrl && (
                    <button
                      type="button"
                      onClick={(e) => handleTogglePlay(e, heroArticle)}
                      className="px-3.5 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-900 text-xs font-bold border border-teal-200 transition flex items-center gap-1.5"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-teal-700" />
                      <span>{isAudioActive(heroArticle.audioUrl) ? 'Đang phát...' : 'Nghe Audio'}</span>
                    </button>
                  )}

                  <Link
                    to={`/podcasts/${heroArticle.slug}`}
                    className="px-4 py-1.5 rounded-lg bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold transition flex items-center gap-1 shadow-2xs"
                  >
                    <span>Đọc chi tiết</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* CỘT PHẢI: 4 Bài viết dạng Grid 2x2 nhỏ gọn */}
            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {gridArticles.map((article) => {
                const isActive = isAudioActive(article.audioUrl);
                return (
                  <article
                    key={article.id}
                    className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-sm hover:border-teal-400 transition flex flex-col justify-between group"
                  >
                    <div>
                      <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-100">
                        <img
                          src={article.thumbnailUrl || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop'}
                          alt={article.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                          loading="lazy"
                        />
                        {article.audioUrl && (
                          <button
                            type="button"
                            onClick={(e) => handleTogglePlay(e, article)}
                            className={`absolute bottom-2 right-2 p-2 rounded-full text-white shadow-xs transition active:scale-90 ${
                              isActive ? 'bg-rose-600 animate-pulse' : 'bg-slate-900/80 hover:bg-teal-800'
                            }`}
                            title="Nghe audio"
                          >
                            {isActive ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current ml-0.5" />}
                          </button>
                        )}
                      </div>

                      <div className="p-3.5 space-y-1.5">
                        <span className="text-[10px] uppercase font-bold text-teal-800">
                          {currentCategory.shortName}
                        </span>

                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-teal-900 transition">
                          <Link to={`/podcasts/${article.slug}`}>
                            {article.title}
                          </Link>
                        </h4>
                      </div>
                    </div>

                    <div className="p-3.5 pt-0 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-50">
                      <span className="truncate max-w-[130px] font-medium text-slate-600">
                        {article.authorName || currentCategory.advisoryDoctor.name}
                      </span>
                      <Link
                        to={`/podcasts/${article.slug}`}
                        className="text-teal-800 font-bold hover:underline shrink-0"
                      >
                        Đọc &amp; Nghe →
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* =================================================================== */}
      {/* 4. KHỐI 2: KHÁM PHÁ THÊM CÁC CHỦ ĐỀ CHUYÊN SÂU (Sub-topics Pills)   */}
      {/* =================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-12">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs">
          <div className="mb-4">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Khám phá thêm các chủ đề về {currentCategory.shortName}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Chọn chủ đề trọng tâm để lọc nhanh các bài viết và bản tin podcast lâm sàng
            </p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {currentCategory.subtopics.map((sub) => {
              const isSelected = selectedSubtopic === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubtopic(sub.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                    isSelected
                      ? 'bg-teal-800 text-white border-teal-800 shadow-xs font-bold'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-teal-50 hover:text-teal-900 hover:border-teal-300'
                  }`}
                >
                  <CategoryIcon className={`w-3.5 h-3.5 ${isSelected ? 'text-teal-200' : 'text-slate-400'}`} />
                  <span>{sub.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* 5. KHỐI 3: LAYOUT 2 CỘT ("Xem thêm về..." + Sidebar Y Tế)           */}
      {/* =================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* =============================================================== */}
          {/* CỘT TRÁI (Lg: 8 cols): Danh sách bài viết dạng Dòng Ngang         */}
          {/* =============================================================== */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Xem thêm về {currentCategory.shortName}
              </h3>
              <span className="text-xs text-slate-500">
                Hiển thị {filteredRemaining.length} bài viết
              </span>
            </div>

            {filteredRemaining.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
                <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">Chưa có bài viết phụ cho chủ đề này</p>
                <button
                  onClick={() => setSelectedSubtopic('ALL')}
                  className="mt-3 text-xs font-bold text-teal-800 hover:underline"
                >
                  ← Xem lại toàn bộ chủ đề
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRemaining.map((item) => {
                  const isActive = isAudioActive(item.audioUrl);
                  return (
                    <article
                      key={item.id}
                      className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs hover:shadow-sm hover:border-teal-400 transition flex flex-col sm:flex-row gap-4 sm:gap-5 group"
                    >
                      {/* Thumbnail ảnh */}
                      <div className="relative w-full sm:w-56 h-40 shrink-0 rounded-xl overflow-hidden bg-slate-100">
                        <img
                          src={item.thumbnailUrl || 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&auto=format&fit=crop'}
                          alt={item.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                          loading="lazy"
                        />
                        {item.audioUrl && (
                          <button
                            type="button"
                            onClick={(e) => handleTogglePlay(e, item)}
                            className={`absolute bottom-2.5 right-2.5 p-2.5 rounded-full text-white shadow-xs transition active:scale-90 ${
                              isActive ? 'bg-rose-600 animate-pulse' : 'bg-slate-900/80 hover:bg-teal-800'
                            }`}
                            title={isActive ? 'Tạm dừng' : 'Nghe Podcast'}
                          >
                            {isActive ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                          </button>
                        )}
                      </div>

                      {/* Nội dung bài viết */}
                      <div className="flex-1 flex flex-col justify-between space-y-2">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-teal-900 border border-slate-200">
                              {currentCategory.shortName}
                            </span>
                            <span className="text-[11px] text-slate-500 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {item.audioDurationSeconds ? `${Math.floor(item.audioDurationSeconds / 60)} phút nghe` : '4 phút nghe'}
                            </span>
                          </div>

                          <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug group-hover:text-teal-900 transition">
                            <Link to={`/podcasts/${item.slug}`}>
                              {item.title}
                            </Link>
                          </h4>

                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                            {item.summary}
                          </p>
                        </div>

                        {/* Doctor info & Action */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
                          <span className="text-[11px] font-medium text-slate-600 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-teal-600" />
                            {item.authorName || currentCategory.advisoryDoctor.name}
                          </span>

                          <div className="flex items-center gap-2">
                            {item.audioUrl && (
                              <button
                                type="button"
                                onClick={(e) => handleTogglePlay(e, item)}
                                className="text-[11px] font-bold text-teal-800 hover:text-teal-950 flex items-center gap-1 px-2.5 py-1 rounded bg-teal-50 hover:bg-teal-100 transition"
                              >
                                <Volume2 className="w-3 h-3" />
                                <span>{isActive ? 'Đang phát' : 'Nghe audio'}</span>
                              </button>
                            )}

                            <Link
                              to={`/podcasts/${item.slug}`}
                              className="text-[11px] font-bold text-slate-700 hover:text-teal-900 flex items-center gap-0.5 transition"
                            >
                              <span>Đọc bài</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          {/* =============================================================== */}
          {/* CỘT PHẢI (Lg: 4 cols): SIDEBAR TIỆN ÍCH LÂM SÀNG                 */}
          {/* =============================================================== */}
          <div className="lg:col-span-4 space-y-6">
            {/* WIDGET 1: CÂU HỎI THƯỜNG GẶP (FAQ ACCORDION) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
              <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100">
                <span className="p-1.5 rounded-lg bg-teal-100 text-teal-800">
                  <BookOpen className="w-4 h-4" />
                </span>
                <h4 className="font-bold text-sm text-slate-900">
                  Câu hỏi thường gặp về {currentCategory.shortName}
                </h4>
              </div>

              <div className="space-y-2.5">
                {currentCategory.faqs.map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div
                      key={idx}
                      className="border border-slate-200 rounded-xl overflow-hidden transition"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                        className="w-full text-left p-3 flex items-start justify-between gap-2 text-xs font-bold text-slate-800 hover:bg-slate-50 transition"
                      >
                        <span className="leading-snug">{faq.q}</span>
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        )}
                      </button>

                      {isOpen && (
                        <div className="px-3 pb-3 text-xs text-slate-600 leading-relaxed bg-slate-50/50 border-t border-slate-100">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* WIDGET 2: TƯ VẤN SỨC KHỎE AI 1 CHẠM (TRIAGE 4 TẦNG) */}
            <div className="bg-gradient-to-br from-teal-900 to-slate-900 rounded-2xl p-5 text-white shadow-xs relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-6 -mt-6 w-28 h-28 bg-teal-600/20 rounded-full blur-2xl" />

              <div className="relative z-10 space-y-3">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold uppercase tracking-wider">
                  <Activity className="w-3 h-3" />
                  <span>Triage Cấp Cứu 115</span>
                </div>

                <h4 className="text-base font-bold leading-snug">
                  Bạn có triệu chứng bất thường về {currentCategory.shortName}?
                </h4>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Nhận diện nguy cơ khẩn cấp tức thì hoặc được phân tích phác đồ cá nhân hóa qua Trợ lý Bác sĩ Y khoa AI.
                </p>

                <Link
                  to="/patient"
                  className="w-full py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Tư vấn sức khỏe trực tuyến</span>
                </Link>
              </div>
            </div>

            {/* WIDGET 3: HỘI ĐỒNG BÁC SĨ CỐ VẤN CHUYÊN KHOA */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <span className="p-1.5 rounded-lg bg-teal-50 text-teal-800">
                  <Stethoscope className="w-4 h-4" />
                </span>
                <h4 className="font-bold text-sm text-slate-900">
                  Bác sĩ Cố vấn Chuyên khoa
                </h4>
              </div>

              <div className="flex items-center gap-3.5">
                <img
                  src={currentCategory.advisoryDoctor.avatar}
                  alt={currentCategory.advisoryDoctor.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-teal-600 shadow-2xs shrink-0"
                />
                <div className="space-y-0.5">
                  <h5 className="font-bold text-xs text-slate-900">
                    {currentCategory.advisoryDoctor.name}
                  </h5>
                  <p className="text-[11px] text-teal-800 font-medium">
                    {currentCategory.advisoryDoctor.role}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {currentCategory.advisoryDoctor.hospital}
                  </p>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200 leading-normal">
                ✓ {currentCategory.advisoryDoctor.exp}. Nội dung được kiểm định theo Hướng dẫn chẩn đoán và điều trị của Bộ Y Tế.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

