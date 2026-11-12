package com.healthvoice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;
import java.util.List;

/**
 * Cấu hình CORS (Cross-Origin Resource Sharing) cho phép Frontend React (http://localhost:5173)
 * gọi API tới Backend (http://localhost:8080) một cách an toàn và thông suốt.
 */
@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();

        // 1. Cho phép Frontend Vite / React và các môi trường dev
        config.setAllowedOriginPatterns(Arrays.asList(
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "http://localhost:3000",
                "http://127.0.0.1:3000"
        ));

        // 2. Cho phép gửi kèm Credentials (Cookies, Authorization Headers)
        config.setAllowCredentials(true);

        // 3. Cho phép đầy đủ các phương thức HTTP
        config.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"
        ));

        // 4. Cho phép các Headers cần thiết
        config.setAllowedHeaders(Arrays.asList(
                "Origin", "Content-Type", "Accept", "Authorization",
                "X-Requested-With", "Access-Control-Request-Method",
                "Access-Control-Request-Headers"
        ));

        // 5. Cho phép Frontend đọc các Headers này từ phản hồi
        config.setExposedHeaders(Arrays.asList(
                "Authorization", "Content-Disposition", "Content-Length", "Content-Range"
        ));

        // 6. Thời gian cache lại kết quả preflight (OPTIONS) request (1 giờ)
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return new CorsFilter(source);
    }
}
