package com.casciz.commerceos.domain.page.valueobject;

/**
 * Type of a store page.
 * Each store has exactly one HOME page; all others are optional and may be multiple.
 */
public enum PageType {
    HOME,
    ABOUT,
    CONTACT,
    CATALOG,
    CUSTOM;

    public boolean isUnique() {
        return this == HOME;
    }
}
