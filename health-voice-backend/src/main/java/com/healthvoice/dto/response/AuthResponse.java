package com.healthvoice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private String token;
    private String accessToken;

    @Builder.Default
    private String tokenType = "Bearer";

    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String role;

    public String getAccessToken() {
        return accessToken != null ? accessToken : token;
    }
}
