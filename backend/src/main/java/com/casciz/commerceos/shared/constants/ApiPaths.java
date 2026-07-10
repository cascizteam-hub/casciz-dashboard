package com.casciz.commerceos.shared.constants;

/**
 * Centralised API path constants.
 * Referenced by controllers and the security configuration to avoid magic strings.
 */
public final class ApiPaths {

    private ApiPaths() {}

    public static final String API_V1    = "/api/v1";
    public static final String AUTH_BASE = API_V1 + "/auth";
    public static final String USER_BASE = API_V1 + "/users";
    public static final String STORE_BASE = API_V1 + "/stores";

    // Auth sub-paths
    public static final String AUTH_REGISTER        = AUTH_BASE + "/register";
    public static final String AUTH_LOGIN           = AUTH_BASE + "/login";
    public static final String AUTH_REFRESH         = AUTH_BASE + "/refresh";
    public static final String AUTH_LOGOUT          = AUTH_BASE + "/logout";
    public static final String AUTH_VERIFY_EMAIL    = AUTH_BASE + "/verify-email";
    public static final String AUTH_FORGOT_PASSWORD = AUTH_BASE + "/forgot-password";
    public static final String AUTH_RESET_PASSWORD  = AUTH_BASE + "/reset-password";

    // User sub-paths
    public static final String USER_ME       = USER_BASE + "/me";
    public static final String USER_PASSWORD = USER_BASE + "/me/password";

    // Store sub-paths
    public static final String STORE_STATS        = STORE_BASE + "/stats";
    public static final String STORE_SLUG_CHECK   = STORE_BASE + "/slug/check";
    public static final String STORE_BY_ID        = STORE_BASE + "/{storeId}";
    public static final String STORE_STATUS       = STORE_BASE + "/{storeId}/status";
}
