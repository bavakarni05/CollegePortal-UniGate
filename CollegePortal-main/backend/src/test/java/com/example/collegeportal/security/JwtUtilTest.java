package com.example.collegeportal.security;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import org.junit.jupiter.api.Test;

class JwtUtilTest {

    @Test
    void shouldCreateJwtWithShortSecret() {
        assertDoesNotThrow(() -> {
            JwtUtil jwtUtil = new JwtUtil("short-secret", 60_000L);
            String token = jwtUtil.generateToken(1L, "STUDENT", "student@example.com");
            assertNotNull(token);
        });
    }
}
