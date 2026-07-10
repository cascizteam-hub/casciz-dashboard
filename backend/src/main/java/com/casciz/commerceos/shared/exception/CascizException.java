package com.casciz.commerceos.shared.exception;

import org.springframework.http.HttpStatus;

/**
 * Base exception for all Casciz domain exceptions.
 * Carries an HTTP status so the global handler can respond correctly.
 */
public class CascizException extends RuntimeException {

    private final HttpStatus status;

    public CascizException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

    public CascizException(String message, HttpStatus status, Throwable cause) {
        super(message, cause);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
