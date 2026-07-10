package com.casciz.commerceos.shared.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.HexFormat;

/**
 * Utility for generating and hashing security tokens.
 * Uses SHA-256 for hashing so only the hash is stored, never the raw token.
 */
public final class TokenHashUtil {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final int          TOKEN_BYTES   = 32; // 256 bits

    private TokenHashUtil() {}

    /**
     * Generates a cryptographically secure URL-safe base64 token.
     */
    public static String generateSecureToken() {
        byte[] bytes = new byte[TOKEN_BYTES];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    /**
     * Computes the SHA-256 hash of the given token (hex-encoded).
     */
    public static String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hashBytes);
        } catch (NoSuchAlgorithmException ex) {
            // SHA-256 is guaranteed to be present in all JVMs
            throw new IllegalStateException("SHA-256 algorithm not available", ex);
        }
    }
}
