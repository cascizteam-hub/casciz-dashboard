package com.casciz.commerceos.domain.product.valueobject;

/**
 * Visibility status of a product.
 *
 * <ul>
 *   <li>DRAFT      – visible only to the store owner, not to customers.</li>
 *   <li>ACTIVE     – visible and purchasable on the storefront.</li>
 *   <li>ARCHIVED   – hidden from storefront, retained for history.</li>
 * </ul>
 */
public enum ProductStatus {
    DRAFT,
    ACTIVE,
    ARCHIVED;

    public boolean isVisibleToCustomers() {
        return this == ACTIVE;
    }
}
