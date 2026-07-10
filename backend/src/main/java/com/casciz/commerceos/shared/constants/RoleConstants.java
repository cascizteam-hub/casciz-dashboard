package com.casciz.commerceos.shared.constants;

/**
 * System-wide role names.
 * Keep in sync with the roles table seed data in the Flyway migration.
 */
public final class RoleConstants {

    private RoleConstants() {}

    /** Full system administrator – internal Casciz staff only. */
    public static final String ROLE_SUPER_ADMIN = "ROLE_SUPER_ADMIN";

    /** Tenant owner – created the workspace, has all tenant permissions. */
    public static final String ROLE_OWNER = "ROLE_OWNER";

    /** Tenant administrator – delegated admin rights within the workspace. */
    public static final String ROLE_ADMIN = "ROLE_ADMIN";

    /** Regular team member – can manage stores but not billing/team. */
    public static final String ROLE_MEMBER = "ROLE_MEMBER";

    /** View-only access – can see dashboards but cannot make changes. */
    public static final String ROLE_VIEWER = "ROLE_VIEWER";
}
