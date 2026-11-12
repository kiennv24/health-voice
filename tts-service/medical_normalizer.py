"""
medical_normalizer.py — Bộ chuẩn hóa văn bản y tế chuyên biệt
Chuyển đổi từ viết tắt, chỉ số sinh tồn, đơn vị y tế sang dạng đọc tự nhiên bằng tiếng Việt.
"""
import re
from typing import Dict, List, Tuple

# ============================================================================
# Từ điển chuẩn hóa cơ sở — được nạp từ database qua API /api/v1/lexicon/reload
# ============================================================================
_dynamic_lexicon: Dict[str, str] = {}


def reload_lexicon(entries: List[Tuple[str, str]]) -> int:
    """Nạp lại từ điển phát âm từ database (được gọi bởi Spring Boot sau khi admin cập nhật)."""
    global _dynamic_lexicon
    _dynamic_lexicon = {raw.strip(): phonetic.strip() for raw, phonetic in entries}
    return len(_dynamic_lexicon)


# ============================================================================
# Từ điển tĩnh nội bộ: Từ viết tắt y tế phổ biến
# ============================================================================
MEDICAL_ABBREVIATIONS: Dict[str, str] = {
    # Chỉ số sinh tồn & thiết bị
    "SpO2": "ét pơ ô hai",
    "ECG": "i - xê - gi",
    "EEG": "i - i - gi",
    "MRI": "em - rờ - ai",
    "CT": "xê - tê",
    "USG": "siêu âm",
    "X-ray": "chụp x quang",
    "X ray": "chụp x quang",
    # Chẩn đoán & bệnh lý
    "THA": "tăng huyết áp",
    "ĐTĐ": "đái tháo đường",
    "BMI": "chỉ số khối cơ thể",
    "BHYT": "bảo hiểm y tế",
    "KCB": "khám chữa bệnh",
    "BV": "bệnh viện",
    "BS": "bác sĩ",
    "BN": "bệnh nhân",
    "PK": "phòng khám",
    "HA": "huyết áp",
    # Dược học
    "IV": "tiêm tĩnh mạch",
    "IM": "tiêm bắp",
    "SC": "tiêm dưới da",
    "PO": "uống",
    "PRN": "khi cần",
    "QD": "mỗi ngày một lần",
    "BID": "mỗi ngày hai lần",
    "TID": "mỗi ngày ba lần",
    "QID": "mỗi ngày bốn lần",
    # Viết tắt bổ sung
    "COPD": "bệnh phổi tắc nghẽn mãn tính",
    "AIDS": "hội chứng suy giảm miễn dịch mắc phải",
    "HIV": "vi-rút gây suy giảm miễn dịch ở người",
    "TB": "lao phổi",
    "CKD": "bệnh thận mãn tính",
    "CHF": "suy tim sung huyết",
    "DM": "đái tháo đường",
    "HTN": "tăng huyết áp",
    "MI": "nhồi máu cơ tim",
    "CVA": "tai biến mạch máu não",
    "PE": "thuyên tắc phổi",
    "DVT": "huyết khối tĩnh mạch sâu",
    "UTI": "nhiễm trùng đường tiết niệu",
    "URTI": "nhiễm trùng đường hô hấp trên",
    "LRTI": "nhiễm trùng đường hô hấp dưới",
    "GI": "đường tiêu hóa",
}

# ============================================================================
# Quy tắc Regex cho chỉ số sinh tồn & đơn vị đo lường
# ============================================================================

def _convert_number_vi(n: int) -> str:
    """Chuyển số nguyên 0-9999 sang chữ tiếng Việt."""
    units = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"]
    teens = ["mười", "mười một", "mười hai", "mười ba", "mười bốn", "mười lăm",
             "mười sáu", "mười bảy", "mười tám", "mười chín"]
    if n < 10:
        return units[n]
    if n < 20:
        return teens[n - 10]
    if n < 100:
        d, u = divmod(n, 10)
        s = units[d] + " mươi"
        if u == 1 and d > 1:
            s += " mốt"
        elif u == 5 and d > 1:
            s += " lăm"
        elif u != 0:
            s += " " + units[u]
        return s
    if n < 1000:
        h, rest = divmod(n, 100)
        s = units[h] + " trăm"
        if rest > 0:
            if rest < 10:
                s += " lẻ " + _convert_number_vi(rest)
            else:
                s += " " + _convert_number_vi(rest)
        return s
    t, rest = divmod(n, 1000)
    s = _convert_number_vi(t) + " nghìn"
    if rest > 0:
        if rest < 100:
            s += " không trăm " + _convert_number_vi(rest)
        else:
            s += " " + _convert_number_vi(rest)
    return s


def _normalize_blood_pressure(match: re.Match) -> str:
    """120/80 mmHg → một trăm hai mươi trên tám mươi mi-li-mét thủy ngân."""
    systolic = int(match.group(1))
    diastolic = int(match.group(2))
    return (f"{_convert_number_vi(systolic)} trên {_convert_number_vi(diastolic)} "
            f"mi-li-mét thủy ngân")


def _normalize_temperature(match: re.Match) -> str:
    """37.5°C → ba mươi bảy phẩy năm độ xê."""
    whole = int(match.group(1))
    decimal = match.group(2)
    s = _convert_number_vi(whole)
    if decimal:
        decimal_digits = " ".join([_convert_number_vi(int(d)) for d in decimal])
        s += f" phẩy {decimal_digits}"
    return s + " độ xê"


def _normalize_weight_dosage(match: re.Match) -> str:
    """500mg → năm trăm mi-li-gam; 10ml → mười mi-li-lít; 2g → hai gam."""
    value_str = match.group(1)
    unit = match.group(2).lower()
    try:
        # Số nguyên
        value = int(float(value_str))
        num_vi = _convert_number_vi(value)
    except ValueError:
        num_vi = value_str

    unit_map = {
        "mg": "mi-li-gam",
        "mcg": "mi-cro-gam",
        "g": "gam",
        "ml": "mi-li-lít",
        "l": "lít",
        "ui": "đơn vị quốc tế",
        "iu": "đơn vị quốc tế",
        "mmhg": "mi-li-mét thủy ngân",
        "mmol/l": "mi-li-mol trên lít",
        "mg/dl": "mi-li-gam trên đề-xi-lít",
    }
    unit_vi = unit_map.get(unit, unit)
    return f"{num_vi} {unit_vi}"


def _normalize_spo2(match: re.Match) -> str:
    """SpO2 96% → nồng độ ô-xi trong máu chín mươi sáu phần trăm."""
    value = int(match.group(1))
    return f"nồng độ ô-xi trong máu {_convert_number_vi(value)} phần trăm"


def _normalize_blood_sugar(match: re.Match) -> str:
    """5.6 mmol/L → năm phẩy sáu mi-li-mol trên lít."""
    whole = int(match.group(1))
    decimal = match.group(2)
    s = _convert_number_vi(whole)
    if decimal:
        decimal_digits = " ".join([_convert_number_vi(int(d)) for d in decimal])
        s += f" phẩy {decimal_digits}"
    return s + " mi-li-mol trên lít"


def _normalize_tablet_count(match: re.Match) -> str:
    """2v → hai viên; 1t → một tablet."""
    num = int(match.group(1))
    suffix = match.group(2).lower()
    num_vi = _convert_number_vi(num)
    suffix_map = {"v": "viên", "t": "viên", "cap": "viên nang", "gói": "gói", "ống": "ống"}
    return f"{num_vi} {suffix_map.get(suffix, suffix)}"


# ============================================================================
# Hàm chuẩn hóa chính
# ============================================================================

def strip_markdown_for_speech(text: str) -> str:
    """Loại bỏ ký tự định dạng markdown (*, **, #, >, -, `) để giọng đọc TTS chuẩn xác tự nhiên."""
    if not text:
        return ""
    # Bold, italic, strikethrough
    cleaned = re.sub(r'[*_~]{1,3}(.*?)[*_~]{1,3}', r'\1', text)
    # Markdown headers (#, ##, ###)
    cleaned = re.sub(r'^[#]+\s*', '', cleaned, flags=re.MULTILINE)
    # Gạch đầu dòng (*, -, +)
    cleaned = re.sub(r'^\s*[-*+]\s+', '', cleaned, flags=re.MULTILINE)
    # Trích dẫn (> )
    cleaned = re.sub(r'^\s*>\s+', '', cleaned, flags=re.MULTILINE)
    # Code blocks và inline code
    cleaned = re.sub(r'`{1,3}(.*?)`{1,3}', r'\1', cleaned)
    return cleaned


def normalize_medical_text(text: str) -> str:
    """
    Chuẩn hóa văn bản y tế tiếng Việt để tổng hợp giọng nói tự nhiên.
    Áp dụng: từ điển động (từ DB) → từ viết tắt → đơn vị y tế → chỉ số sinh tồn.
    """
    if not text or not text.strip():
        return text

    result = strip_markdown_for_speech(text.strip())

    # 1. Áp dụng từ điển động từ database (ưu tiên cao nhất)
    for raw_term, phonetic in _dynamic_lexicon.items():
        result = re.sub(re.escape(raw_term), phonetic, result, flags=re.IGNORECASE)

    # 2. SpO2 với giá trị: SpO2 96% hoặc SpO2: 96%
    result = re.sub(
        r'SpO2\s*[:=]?\s*(\d{2,3})\s*%',
        _normalize_spo2,
        result,
        flags=re.IGNORECASE
    )

    # 3. Huyết áp: 120/80 mmHg (phải trước khi xử lý mmHg riêng lẻ)
    result = re.sub(
        r'(\d{2,3})\s*/\s*(\d{2,3})\s*mmHg',
        _normalize_blood_pressure,
        result,
        flags=re.IGNORECASE
    )

    # 4. Nhiệt độ: 37.5°C hoặc 38,5 độ C
    result = re.sub(
        r'(\d{2,3})(?:[.,](\d+))?\s*[°℃]\s*C',
        _normalize_temperature,
        result,
        flags=re.IGNORECASE
    )
    result = re.sub(
        r'(\d{2,3})(?:[.,](\d+))?\s*độ\s*C',
        _normalize_temperature,
        result,
        flags=re.IGNORECASE
    )

    # 5. Đường huyết: 5.6 mmol/L
    result = re.sub(
        r'(\d+)[.,](\d+)\s*mmol/[lL]',
        _normalize_blood_sugar,
        result,
        flags=re.IGNORECASE
    )

    # 6. Liều thuốc: 500mg, 250mcg, 10ml, 5g, 100UI
    result = re.sub(
        r'(\d+(?:[.,]\d+)?)\s*(mg|mcg|g|ml|l|ui|iu)(?!\w)',
        _normalize_weight_dosage,
        result,
        flags=re.IGNORECASE
    )

    # 7. Số viên thuốc: 1v, 2t
    result = re.sub(
        r'(\d+)\s*(v|t)(?=\s|$|\.|,)',
        _normalize_tablet_count,
        result
    )

    # 8. Tỷ lệ phần trăm đơn giản (không phải SpO2)
    result = re.sub(r'(\d+)\s*%', lambda m: f"{_convert_number_vi(int(m.group(1)))} phần trăm", result)

    # 9. Từ viết tắt y tế (tra từ điển tĩnh) — sau cùng để không conflict với pattern trên
    for abbr, full in MEDICAL_ABBREVIATIONS.items():
        # Chỉ thay thế nếu là từ độc lập (word boundary)
        result = re.sub(r'(?<!\w)' + re.escape(abbr) + r'(?!\w)', full, result)

    # 10. Dấu > và < trong ngữ cảnh y tế
    result = re.sub(r'>\s*(\d)', r'trên \1', result)
    result = re.sub(r'<\s*(\d)', r'dưới \1', result)
    result = re.sub(r'>=\s*(\d)', r'từ \1 trở lên', result)
    result = re.sub(r'<=\s*(\d)', r'từ \1 trở xuống', result)

    # 11. Số điện thoại khẩn cấp
    result = re.sub(r'\b115\b', 'một một năm', result)
    result = re.sub(r'\b113\b', 'một một ba', result)
    result = re.sub(r'\b114\b', 'một một bốn', result)

    # 12. Làm sạch khoảng trắng thừa
    result = re.sub(r'\s{2,}', ' ', result).strip()

    return result

