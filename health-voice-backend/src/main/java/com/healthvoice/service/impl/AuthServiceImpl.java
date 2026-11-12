package com.healthvoice.service.impl;

import com.healthvoice.dto.request.LoginRequest;
import com.healthvoice.dto.request.RegisterRequest;
import com.healthvoice.dto.response.AuthResponse;
import com.healthvoice.entity.Role;
import com.healthvoice.entity.User;
import com.healthvoice.exception.ResourceNotFoundException;
import com.healthvoice.repository.RoleRepository;
import com.healthvoice.repository.UserRepository;
import com.healthvoice.service.AuthService;
import com.healthvoice.util.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Tên đăng nhập đã tồn tại trong hệ thống");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email đã được sử dụng");
        }

        String targetRole = request.getRole() != null && !request.getRole().isBlank()
                ? request.getRole().toUpperCase()
                : "ROLE_LISTENER";

        if (!targetRole.startsWith("ROLE_")) {
            targetRole = "ROLE_" + targetRole;
        }

        final String finalRole = targetRole;
        Role userRole = roleRepository.findByName(finalRole)
                .orElseGet(() -> roleRepository.findByName("ROLE_LISTENER")
                        .orElseThrow(() -> new ResourceNotFoundException("Role", "name", "ROLE_LISTENER")));

        User user = User.builder()
                .username(request.getUsername().trim())
                .email(request.getEmail().trim())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName() != null ? request.getFullName().trim() : request.getUsername())
                .role(userRole)
                .status(1)
                .build();

        User savedUser = userRepository.save(user);
        String token = jwtTokenProvider.generateToken(savedUser.getUsername(), savedUser.getRole().getName());

        return AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .id(savedUser.getId())
                .username(savedUser.getUsername())
                .fullName(savedUser.getFullName())
                .email(savedUser.getEmail())
                .role(savedUser.getRole().getName())
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        String input = request.getUsername().trim();
        User user = userRepository.findByUsernameIgnoreCase(input)
                .or(() -> userRepository.findByEmailIgnoreCase(input))
                .orElseThrow(() -> new IllegalArgumentException("Tên đăng nhập hoặc mật khẩu không chính xác"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Tên đăng nhập hoặc mật khẩu không chính xác");
        }

        if (user.getStatus() == null || user.getStatus() != 1) {
            throw new IllegalStateException("Tài khoản đang bị khóa hoặc chưa được kích hoạt");
        }

        String token = jwtTokenProvider.generateToken(user.getUsername(), user.getRole().getName());

        return AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().getName())
                .build();
    }

    @Override
    public AuthResponse getProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        return AuthResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole() != null ? user.getRole().getName() : "ROLE_LISTENER")
                .build();
    }
}
