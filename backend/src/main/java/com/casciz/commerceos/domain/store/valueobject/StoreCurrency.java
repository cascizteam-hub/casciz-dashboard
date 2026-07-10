package com.casciz.commerceos.domain.store.valueobject;

/**
 * Supported store currencies (ISO 4217).
 * Expanded in a later milestone when payment processing is added.
 */
public enum StoreCurrency {
    USD("US Dollar",          "$"),
    EUR("Euro",               "€"),
    GBP("British Pound",      "£"),
    CAD("Canadian Dollar",    "CA$"),
    AUD("Australian Dollar",  "A$"),
    JPY("Japanese Yen",       "¥"),
    INR("Indian Rupee",       "₹"),
    BRL("Brazilian Real",     "R$"),
    MXN("Mexican Peso",       "MX$"),
    SGD("Singapore Dollar",   "S$"),
    AED("UAE Dirham",         "د.إ"),
    SAR("Saudi Riyal",        "﷼");

    private final String displayName;
    private final String symbol;

    StoreCurrency(String displayName, String symbol) {
        this.displayName = displayName;
        this.symbol      = symbol;
    }

    public String getDisplayName() { return displayName; }
    public String getSymbol()      { return symbol; }
}
