package com.healthvoice.config;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(Customizer.withDefaults())
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setContentType("application/json;charset=UTF-8");
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.getWriter().write("{\"code\":401,\"message\":\"Yêu cầu đăng nhập hoặc phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.\",\"error\":\"Unauthorized\"}");
                })
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    response.setContentType("application/json;charset=UTF-8");
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.getWriter().write("{\"code\":403,\"message\":\"Từ chối truy cập: Chức năng này yêu cầu quyền Bác sĩ (ROLE_DOCTOR) hoặc Quản trị viên (ROLE_ADMIN).\",\"error\":\"Forbidden\"}");
                })
            )
            .authorizeHttpRequests(auth -> auth
                // 1. Công khai (PUBLIC): Xem bài viết, Nghe streaming audio (HTTP 206), Đăng nhập/Đăng ký
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/stream/**", "/api/audio/stream/**", "/api/audios/*/stream", "/api/audio/file/**").permitAll()
                .requestMatchers("/api/public/podcasts/**", "/api/podcasts/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/scripts/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/categories/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/voices/**", "/api/voice-studio/voices").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/audios/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/analytics/ratings", "/api/audios/*/ratings", "/api/audios/*/rating").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/analytics/scripts/*/ratings").permitAll()
                .requestMatchers("/api/reminders/**", "/api/diaries/**").permitAll()
                .requestMatchers("/audio/**", "/uploads/**").permitAll()
                .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                .requestMatchers("/error").permitAll()

                // 2. Phân quyền Người bệnh / Đã đăng nhập: Phiên tư vấn, Đánh giá MOS
                .requestMatchers("/api/consultation/**").authenticated()
                .requestMatchers("/api/evaluations/**").authenticated()

                // 3. Phân quyền Bác sĩ (DOCTOR) & ADMIN: Doctor Portal, Soạn kịch bản, Từ điển, Phác đồ mẫu
                .requestMatchers("/api/doctor/**").hasAnyRole("DOCTOR", "ADMIN")
                .requestMatchers("/api/voice-studio/**").hasAnyRole("DOCTOR", "ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/scripts/normalize", "/api/voice-studio/normalize").hasAnyRole("DOCTOR", "ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/scripts", "/api/scripts/**").hasAnyRole("DOCTOR", "ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/scripts/**").hasAnyRole("DOCTOR", "ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/scripts/**").hasAnyRole("DOCTOR", "ADMIN")

                // 4. Phân quyền Quản trị viên (ADMIN): Quản trị chuyên khoa, giọng đọc, người dùng, dashboard thống kê
                .requestMatchers("/api/admin/**", "/api/analytics/dashboard").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/categories/**", "/api/voices/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/categories/**", "/api/voices/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/categories/**", "/api/voices/**").hasRole("ADMIN")

                // Mọi request còn lại yêu cầu xác thực
                .anyRequest().authenticated()
            );

        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("*"));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Range", "Accept", "Origin", "X-Requested-With"));
        config.setExposedHeaders(Arrays.asList("Content-Range", "Accept-Ranges", "Content-Length", "Content-Type"));
        config.setAllowCredentials(false);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
