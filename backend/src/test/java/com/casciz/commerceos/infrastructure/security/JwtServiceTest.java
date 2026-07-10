package com.casciz.commerceos.infrastructure.security;

import com.casciz.commerceos.infrastructure.config.JwtProperties;
import com.casciz.commerceos.infrastructure.security.jwt.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collections;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("JwtService")
class JwtServiceTest {

    // 64+ char secret for HS512
    private static final String TEST_SECRET =
            "test-secret-that-is-at-least-sixty-four-characters-long-for-hs512-algorithm-ok";

    JwtService jwtService;

    @BeforeEach
    void setUp() {
        JwtProperties props = new JwtProperties(TEST_SECRET, 900_000L, 604_800_000L);
        jwtService = new JwtService(props);
    }

    @Test
    @DisplayName("generateAccessToken: produces a non-blank token")
    void generateAccessToken_returnsToken() {
        UserDetails user = buildUser("user@example.com");
        String token = jwtService.generateAccessToken(user);
        assertThat(token).isNotBlank();
    }

    @Test
    @DisplayName("extractUsername: returns the email used at generation time")
    void extractUsername_returnsCorrectEmail() {
        UserDetails user = buildUser("user@example.com");
        String token = jwtService.generateAccessToken(user);
        assertThat(jwtService.extractUsername(token)).isEqualTo("user@example.com");
    }

    @Test
    @DisplayName("isTokenValid: returns true for a freshly generated token")
    void isTokenValid_freshToken_returnsTrue() {
        UserDetails user = buildUser("user@example.com");
        String token = jwtService.generateAccessToken(user);
        assertThat(jwtService.isTokenValid(token, user)).isTrue();
    }

    @Test
    @DisplayName("isTokenValid: returns false when username does not match")
    void isTokenValid_wrongUser_returnsFalse() {
        UserDetails user  = buildUser("user@example.com");
        UserDetails other = buildUser("other@example.com");
        String token = jwtService.generateAccessToken(user);
        assertThat(jwtService.isTokenValid(token, other)).isFalse();
    }

    private UserDetails buildUser(String email) {
        return User.withUsername(email)
                .password("irrelevant")
                .authorities(Collections.emptyList())
                .build();
    }
}
