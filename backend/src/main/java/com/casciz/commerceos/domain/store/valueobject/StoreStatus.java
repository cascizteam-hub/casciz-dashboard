package com.casciz.commerceos.domain.store.valueobject;

/**
 * Lifecycle status of a store.
 *
 * <p>State machine:
 * <pre>
 *  DRAFT ──────────────────→ PUBLISHED
 *    └──────────────────────→ ARCHIVED
 *  PUBLISHED ───────────────→ ARCHIVED
 *  PUBLISHED ───────────────→ DRAFT   (un-publish)
 * </pre>
 */
public enum StoreStatus {

    /** Store is being configured; not publicly visible. */
    DRAFT,

    /** Store is live and accessible to customers. */
    PUBLISHED,

    /** Store has been deactivated; retains all data. */
    ARCHIVED;

    public boolean canTransitionTo(StoreStatus next) {
        return switch (this) {
            case DRAFT      -> next == PUBLISHED || next == ARCHIVED;
            case PUBLISHED  -> next == DRAFT     || next == ARCHIVED;
            case ARCHIVED   -> false; // terminal state
        };
    }
}
