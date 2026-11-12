package com.healthvoice.controller;

import com.healthvoice.dto.request.LoginRequest;
import com.healthvoice.dto.request.RegisterRequest;
import com.healthvoice.dto.response.ApiResponse;
import com.healthvoice.dto.response.AuthResponse;
import com.healthvoice.service.AuthService;
import com.healthvoice.util.JwtTokenProvider;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/auth", "/api/v1/auth"})
public class AuthController {

    private final AuthService authService;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthController(AuthService authService, JwtTokenProvider jwtTokenProvider) {
        this.authService = authService;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        java.util.Map<String, Object> body = new java.util.LinkedHashMap<>();
        body.put("code", 200);
        body.put("message", "Đăng nhập thành công");
        body.put("token", response.getToken());
        body.put("accessToken", response.getAccessToken());
        body.put("tokenType", response.getTokenType());
        body.put("id", response.getId());
        body.put("username", response.getUsername());
        body.put("email", response.getEmail());
        body.put("fullName", response.getFullName());
        body.put("role", response.getRole());
        body.put("data", response);
        return ResponseEntity.ok(body);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        java.util.Map<String, Object> body = new java.util.LinkedHashMap<>();
        body.put("code", 201);
        body.put("message", "Đăng ký tài khoản thành công");
        body.put("token", response.getToken());
        body.put("accessToken", response.getAccessToken());
        body.put("tokenType", response.getTokenType());
        body.put("id", response.getId());
        body.put("username", response.getUsername());
        body.put("email", response.getEmail());
        body.put("fullName", response.getFullName());
        body.put("role", response.getRole());
        body.put("data", response);
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error(HttpStatus.UNAUTHORIZED.value(), "Thiếu hoặc sai định dạng Token"));
        }

        String token = authHeader.substring(7);
        if (!jwtTokenProvider.validateToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error(HttpStatus.UNAUTHORIZED.value(), "Token đã hết hạn hoặc không hợp lệ"));
        }

        String username = jwtTokenProvider.getUsernameFromToken(token);
        AuthResponse response = authService.getProfile(username);

        java.util.Map<String, Object> body = new java.util.LinkedHashMap<>();
        body.put("code", 200);
        body.put("message", "Lấy thông tin người dùng thành công");
        body.put("token", token);
        body.put("accessToken", token);
        body.put("tokenType", "Bearer");
        body.put("id", response.getId());
        body.put("username", response.getUsername());
        body.put("email", response.getEmail());
        body.put("fullName", response.getFullName());
        body.put("role", response.getRole());
        body.put("data", response);
        return ResponseEntity.ok(body);
    }
}
