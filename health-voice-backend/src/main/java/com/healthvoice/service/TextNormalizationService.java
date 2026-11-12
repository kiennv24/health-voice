package com.healthvoice.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Service Tiền Xử Lý & Chuẩn Hóa Thuật Ngữ Y Khoa (Text Normalization Service)
 * Chuyển đổi các chỉ số sinh tồn, đơn vị đo lâm sàng, tên thuốc và từ viết tắt
 * sang dạng phiên âm ngữ âm tiếng Việt tự nhiên cho FPT.AI TTS Engine.
 */
@Slf4j
@Service
public class TextNormalizationService {

    private static final String[] DIGITS = {
            "không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"
    };

    /**
     * Chuyển đổi số nguyên sang chữ tiếng Việt tự nhiên
     */
    public String convertNumberToWords(int number) {
        if (number < 0)
            return "âm " + convertNumberToWords(Math.abs(number));
        if (number <= 9)
            return DIGITS[number];
        if (number == 10)
            return "mười";
        if (number < 20) {
            int unit = number % 10;
            if (unit == 5)
                return "mười lăm";
            return "mười " + DIGITS[unit];
        }
        if (number < 100) {
            int tens = number / 10;
            int unit = number % 10;
            String tensStr = (tens == 1 ? "mười" : DIGITS[tens] + " mươi");
            if (unit == 0)
                return tensStr;
            if (unit == 1)
                return tensStr + " mốt";
            if (unit == 4)
                return tensStr + " tư";
            if (unit == 5)
                return tensStr + " lăm";
            return tensStr + " " + DIGITS[unit];
        }
        if (number < 1000) {
            int hundreds = number / 100;
            int remainder = number % 100;
            String hundredsStr = DIGITS[hundreds] + " trăm";
            if (remainder == 0)
                return hundredsStr;
            if (remainder < 10)
                return hundredsStr + " linh " + DIGITS[remainder];
            return hundredsStr + " " + convertNumberToWords(remainder);
        }
        if (number < 1000000) {
            int thousands = number / 1000;
            int remainder = number % 1000;
            String thousandsStr = convertNumberToWords(thousands) + " nghìn";
            if (remainder == 0)
                return thousandsStr;
            if (remainder < 100)
                return thousandsStr + " không trăm " + convertNumberToWords(remainder);
            return thousandsStr + " " + convertNumberToWords(remainder);
        }
        return String.valueOf(number);
    }

    /**
     * Chuẩn hóa toàn diện văn bản y tế
     */
    public String normalizeMedicalText(String rawText) {
        return normalize(rawText);
    }

    /**
     * Thuật toán Regex xử lý từ viết tắt, chỉ số đo, nhiệt độ, huyết áp, đường huyết
     */
    public String normalize(String rawText) {
        if (rawText == null || rawText.isBlank()) {
            return "";
        }

        String text = rawText.trim();

        // 1. Chỉ số Huyết Áp: 120/80 mmHg -> một trăm hai mươi trên tám mươi mi-li-mét thủy ngân
        Pattern bpPattern = Pattern.compile("(?i)(?<!\\p{L})(\\d{2,3})\\s*/\\s*(\\d{2,3})\\s*mmHg(?!\\p{L})");
        Matcher bpMatcher = bpPattern.matcher(text);
        StringBuilder bpSb = new StringBuilder();
        while (bpMatcher.find()) {
            int sys = Integer.parseInt(bpMatcher.group(1));
            int dia = Integer.parseInt(bpMatcher.group(2));
            String replacement = convertNumberToWords(sys) + " trên " + convertNumberToWords(dia) + " mi-li-mét thủy ngân";
            bpMatcher.appendReplacement(bpSb, Matcher.quoteReplacement(replacement));
        }
        bpMatcher.appendTail(bpSb);
        text = bpSb.toString();

        // 2. Nồng độ SpO2: SpO2 96% -> nồng độ oxy trong máu Ét-pê-ô-hai chín mươi sáu phần trăm
        Pattern spo2Pattern = Pattern.compile("(?i)(?<!\\p{L})SpO2\\s*(\\d{2,3})\\s*%");
        Matcher spo2Matcher = spo2Pattern.matcher(text);
        StringBuilder spo2Sb = new StringBuilder();
        while (spo2Matcher.find()) {
            int val = Integer.parseInt(spo2Matcher.group(1));
            String replacement = "nồng độ oxy trong máu Ét-pê-ô-hai " + convertNumberToWords(val) + " phần trăm";
            spo2Matcher.appendReplacement(spo2Sb, Matcher.quoteReplacement(replacement));
        }
        spo2Matcher.appendTail(spo2Sb);
        text = spo2Sb.toString();

        // 3. Đường huyết dạng thập phân: 5.6 mmol/L -> năm phẩy sáu mi-li-mol trên lít
        Pattern decimalMmolPattern = Pattern.compile("(?i)(?<!\\p{L})(\\d+)\\.(\\d+)\\s*mmol/L(?!\\p{L})");
        Matcher decimalMmolMatcher = decimalMmolPattern.matcher(text);
        StringBuilder mmolSb = new StringBuilder();
        while (decimalMmolMatcher.find()) {
            int whole = Integer.parseInt(decimalMmolMatcher.group(1));
            int decimal = Integer.parseInt(decimalMmolMatcher.group(2));
            String replacement = convertNumberToWords(whole) + " phẩy " + convertNumberToWords(decimal) + " mi-li-mol trên lít";
            decimalMmolMatcher.appendReplacement(mmolSb, Matcher.quoteReplacement(replacement));
        }
        decimalMmolMatcher.appendTail(mmolSb);
        text = mmolSb.toString();

        // Đường huyết nguyên: 5 mmol/L
        Pattern integerMmolPattern = Pattern.compile("(?i)(?<!\\p{L})(\\d+)\\s*mmol/L(?!\\p{L})");
        Matcher integerMmolMatcher = integerMmolPattern.matcher(text);
        StringBuilder integerMmolSb = new StringBuilder();
        while (integerMmolMatcher.find()) {
            int val = Integer.parseInt(integerMmolMatcher.group(1));
            String replacement = convertNumberToWords(val) + " mi-li-mol trên lít";
            integerMmolMatcher.appendReplacement(integerMmolSb, Matcher.quoteReplacement(replacement));
        }
        integerMmolMatcher.appendTail(integerMmolSb);
        text = integerMmolSb.toString();

        // Đường huyết mg/dL
        Pattern bloodSugarPattern = Pattern.compile("(?i)(?<!\\p{L})(\\d+)\\s*mg/dL(?!\\p{L})");
        Matcher bloodSugarMatcher = bloodSugarPattern.matcher(text);
        StringBuilder bloodSugarSb = new StringBuilder();
        while (bloodSugarMatcher.find()) {
            int val = Integer.parseInt(bloodSugarMatcher.group(1));
            String replacement = convertNumberToWords(val) + " mi-li-gam trên đề-xi-lít";
            bloodSugarMatcher.appendReplacement(bloodSugarSb, Matcher.quoteReplacement(replacement));
        }
        bloodSugarMatcher.appendTail(bloodSugarSb);
        text = bloodSugarSb.toString();

        // 4. Nhiệt độ: > 38.5 độ C / > 38.5°C -> trên ba mươi tám phẩy năm độ C
        text = text.replaceAll("(?i)>\\s*38\\.5\\s*(?:độ\\s*C|°C)", "trên ba mươi tám phẩy năm độ C");
        Pattern temperatureDecimalPattern = Pattern.compile("(?i)(?<!\\p{L})(\\d+)\\.(\\d+)\\s*(?:độ\\s*C|°C)");
        Matcher temperatureDecimalMatcher = temperatureDecimalPattern.matcher(text);
        StringBuilder temperatureSb = new StringBuilder();
        while (temperatureDecimalMatcher.find()) {
            int whole = Integer.parseInt(temperatureDecimalMatcher.group(1));
            int decimal = Integer.parseInt(temperatureDecimalMatcher.group(2));
            String replacement = convertNumberToWords(whole) + " phẩy " + convertNumberToWords(decimal) + " độ C";
            temperatureDecimalMatcher.appendReplacement(temperatureSb, Matcher.quoteReplacement(replacement));
        }
        temperatureDecimalMatcher.appendTail(temperatureSb);
        text = temperatureSb.toString();

        // Nhiệt độ nguyên
        Pattern temperatureIntPattern = Pattern.compile("(?i)(?<!\\p{L})(\\d+)\\s*(?:độ\\s*C|°C)");
        Matcher temperatureIntMatcher = temperatureIntPattern.matcher(text);
        StringBuilder temperatureIntSb = new StringBuilder();
        while (temperatureIntMatcher.find()) {
            int val = Integer.parseInt(temperatureIntMatcher.group(1));
            String replacement = convertNumberToWords(val) + " độ C";
            temperatureIntMatcher.appendReplacement(temperatureIntSb, Matcher.quoteReplacement(replacement));
        }
        temperatureIntMatcher.appendTail(temperatureIntSb);
        text = temperatureIntSb.toString();

        // 5. Liều lượng mg: 500mg -> năm trăm mi-li-gam
        Pattern mgPattern = Pattern.compile("(?i)(?<!\\p{L})(\\d+)\\s*mg(?!\\p{L})");
        Matcher mgMatcher = mgPattern.matcher(text);
        StringBuilder mgSb = new StringBuilder();
        while (mgMatcher.find()) {
            int mg = Integer.parseInt(mgMatcher.group(1));
            String replacement = convertNumberToWords(mg) + " mi-li-gam";
            mgMatcher.appendReplacement(mgSb, Matcher.quoteReplacement(replacement));
        }
        mgMatcher.appendTail(mgSb);
        text = mgSb.toString();

        // Đơn vị ml, mcg, kg, g
        Pattern mlPattern = Pattern.compile("(?i)(?<!\\p{L})(\\d+)\\s*ml(?!\\p{L})");
        Matcher mlMatcher = mlPattern.matcher(text);
        StringBuilder mlSb = new StringBuilder();
        while (mlMatcher.find()) {
            int val = Integer.parseInt(mlMatcher.group(1));
            mlMatcher.appendReplacement(mlSb, Matcher.quoteReplacement(convertNumberToWords(val) + " mi-li-lít"));
        }
        mlMatcher.appendTail(mlSb);
        text = mlSb.toString();

        Pattern mcgPattern = Pattern.compile("(?i)(?<!\\p{L})(\\d+)\\s*mcg(?!\\p{L})");
        Matcher mcgMatcher = mcgPattern.matcher(text);
        StringBuilder mcgSb = new StringBuilder();
        while (mcgMatcher.find()) {
            int val = Integer.parseInt(mcgMatcher.group(1));
            mcgMatcher.appendReplacement(mcgSb, Matcher.quoteReplacement(convertNumberToWords(val) + " mi-crô-gam"));
        }
        mcgMatcher.appendTail(mcgSb);
        text = mcgSb.toString();

        Pattern kgPattern = Pattern.compile("(?i)(?<!\\p{L})(\\d+)\\s*kg(?!\\p{L})");
        Matcher kgMatcher = kgPattern.matcher(text);
        StringBuilder kgSb = new StringBuilder();
        while (kgMatcher.find()) {
            int val = Integer.parseInt(kgMatcher.group(1));
            kgMatcher.appendReplacement(kgSb, Matcher.quoteReplacement(convertNumberToWords(val) + " ki-lô-gam"));
        }
        kgMatcher.appendTail(kgSb);
        text = kgSb.toString();

        // 6. Số viên & liều lượng dùng: 1v, 2v -> một viên, hai viên
        text = text.replaceAll("(?i)(?<!\\p{L})1\\s*v(?!\\p{L})", "một viên");
        text = text.replaceAll("(?i)(?<!\\p{L})2\\s*v(?!\\p{L})", "hai viên");
        text = text.replaceAll("(?i)(?<!\\p{L})3\\s*v(?!\\p{L})", "ba viên");
        Pattern vPattern = Pattern.compile("(?i)(?<!\\p{L})(\\d+)\\s*v(?!\\p{L})");
        Matcher vMatcher = vPattern.matcher(text);
        StringBuilder vSb = new StringBuilder();
        while (vMatcher.find()) {
            int count = Integer.parseInt(vMatcher.group(1));
            vMatcher.appendReplacement(vSb, Matcher.quoteReplacement(convertNumberToWords(count) + " viên"));
        }
        vMatcher.appendTail(vSb);
        text = vSb.toString();

        // 7. Từ viết tắt y tế và bệnh học chuẩn:
        // ĐTĐ type 2 -> đái tháo đường típ hai
        text = text.replaceAll("(?i)(?<!\\p{L})ĐTĐ\\s*type\\s*2(?!\\p{L})", "đái tháo đường típ hai");
        text = text.replaceAll("(?i)(?<!\\p{L})ĐTĐ\\s*type\\s*1(?!\\p{L})", "đái tháo đường típ một");
        text = text.replaceAll("(?i)(?<!\\p{L})tiểu đường\\s*type\\s*2(?!\\p{L})", "đái tháo đường típ hai");
        text = text.replaceAll("(?i)(?<!\\p{L})tiểu đường\\s*type\\s*1(?!\\p{L})", "đái tháo đường típ một");
        text = text.replaceAll("(?i)(?<!\\p{L})type\\s*2(?!\\p{L})", "típ hai");
        text = text.replaceAll("(?i)(?<!\\p{L})type\\s*1(?!\\p{L})", "típ một");

        // THA -> tăng huyết áp
        text = text.replaceAll("(?i)(?<!\\p{L})THA(?!\\p{L})", "tăng huyết áp");
        text = text.replaceAll("(?i)(?<!\\p{L})ĐTĐ(?!\\p{L})", "đái tháo đường");
        text = text.replaceAll("(?i)(?<!\\p{L})HA(?!\\p{L})", "Huyết áp");
        text = text.replaceAll("(?i)(?<!\\p{L})BS(?!\\p{L})", "Bác sĩ");
        text = text.replaceAll("(?i)(?<!\\p{L})BN(?!\\p{L})", "bệnh nhân");
        text = text.replaceAll("(?i)(?<!\\p{L})HbA1c(?!\\p{L})", "Hát-bê-a-một-xê");
        text = text.replaceAll("(?i)(?<!\\p{L})MDI(?!\\p{L})", "ống hít định liều Em-đê-i");
        text = text.replaceAll("(?i)(?<!\\p{L})BHYT(?!\\p{L})", "bảo hiểm y tế");
        text = text.replaceAll("(?i)(?<!\\p{L})XQ(?!\\p{L})", "X-quang");
        text = text.replaceAll("(?i)(?<!\\p{L})CT(?!\\p{L})", "chụp cắt lớp");
        text = text.replaceAll("(?i)(?<!\\p{L})MRI(?!\\p{L})", "cộng hưởng từ");
        text = text.replaceAll("(?i)(?<!\\p{L})Paracetamol(?!\\p{L})", "Pa-ra-xê-ta-mol");
        text = text.replaceAll("(?i)(?<!\\p{L})Amoxicillin(?!\\p{L})", "A-mốc-xi-xi-lin");
        text = text.replaceAll("(?i)(?<!\\p{L})Oresol(?!\\p{L})", "Ô-rê-xôn");
        text = text.replaceAll("(?i)(?<!\\p{L})115(?!\\p{L})", "một một năm");

        text = text.replaceAll("\\s+", " ").trim();
        log.debug("Chuẩn hóa y khoa xong: {}", text);
        return text;
    }
}
