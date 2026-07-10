package com.casciz.commerceos.shared.exception;

import org.springframework.http.HttpStatus;

/**
 * Convenience factory for all named domain exceptions.
 * One file keeps all exception definitions scannable and avoids an explosion
 * of tiny single-class files for simple status-message pairs.
 */
public final class DomainExceptions {

    private DomainExceptions() {}

    // ── 400 Bad Request ───────────────────────────────────────────────────

    public static class InvalidCredentialsException extends CascizException {
        public InvalidCredentialsException() {
            super("Email or password is incorrect.", HttpStatus.UNAUTHORIZED);
        }
    }

    public static class InvalidTokenException extends CascizException {
        public InvalidTokenException(String detail) {
            super("Token is invalid or has expired: " + detail, HttpStatus.UNAUTHORIZED);
        }
    }

    public static class EmailAlreadyRegisteredException extends CascizException {
        public EmailAlreadyRegisteredException(String email) {
            super("An account with email '" + email + "' already exists.", HttpStatus.CONFLICT);
        }
    }

    public static class EmailNotVerifiedException extends CascizException {
        public EmailNotVerifiedException() {
            super("Please verify your email address before signing in.", HttpStatus.FORBIDDEN);
        }
    }

    public static class AccountDisabledException extends CascizException {
        public AccountDisabledException() {
            super("Your account has been suspended. Contact support.", HttpStatus.FORBIDDEN);
        }
    }

    // ── 404 Not Found ─────────────────────────────────────────────────────

    public static class UserNotFoundException extends CascizException {
        public UserNotFoundException(String identifier) {
            super("User not found: " + identifier, HttpStatus.NOT_FOUND);
        }
    }

    public static class ResourceNotFoundException extends CascizException {
        public ResourceNotFoundException(String resource, Object id) {
            super(resource + " with id '" + id + "' was not found.", HttpStatus.NOT_FOUND);
        }
    }

    // ── 403 Forbidden ─────────────────────────────────────────────────────

    public static class AccessDeniedException extends CascizException {
        public AccessDeniedException(String action) {
            super("You do not have permission to " + action + ".", HttpStatus.FORBIDDEN);
        }
    }

    // ── 429 Too Many Requests ─────────────────────────────────────────────

    public static class RateLimitExceededException extends CascizException {
        public RateLimitExceededException() {
            super("Too many requests. Please wait before trying again.", HttpStatus.TOO_MANY_REQUESTS);
        }
    }
}
