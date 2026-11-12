package com.healthvoice.service;

import com.healthvoice.dto.request.LoginRequest;
import com.healthvoice.dto.request.RegisterRequest;
import com.healthvoice.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse login(LoginRequest request);
    AuthResponse register(RegisterRequest request);
    AuthResponse getProfile(String username);
}
