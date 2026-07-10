package com.casciz.commerceos.application.store.usecase;

import com.casciz.commerceos.domain.store.repository.StoreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.text.Normalizer;
import java.util.Locale;
import java.util.regex.Pattern;

/**
 * Generates unique URL-friendly slugs from store names.
 * Appends a numeric suffix when a collision is detected.
 */
@Component
@RequiredArgsConstructor
public class SlugGenerator {

    private static final Pattern NON_ALPHANUMERIC = Pattern.compile("[^a-z0-9]+");
    private static final Pattern LEADING_TRAILING_HYPHENS = Pattern.compile("^-+|-+$");
    private static final int MAX_SLUG_LENGTH = 60;
    private static final int MAX_ATTEMPTS    = 100;

    private final StoreRepository storeRepository;

    /**
     * Creates a unique slug from the given name.
     * The base slug is derived from the name; if it is taken, "-2", "-3", etc. are appended.
     */
    public String generate(String name) {
        String base = toSlug(name);
        if (!storeRepository.existsBySlug(base)) {
            return base;
        }
        for (int i = 2; i <= MAX_ATTEMPTS; i++) {
            String candidate = base + "-" + i;
            if (!storeRepository.existsBySlug(candidate)) {
                return candidate;
            }
        }
        throw new IllegalStateException("Could not generate a unique slug for name: " + name);
    }

    /** Converts any string to a URL-safe slug. */
    public static String toSlug(String input) {
        String normalised = Normalizer.normalize(input, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", ""); // strip diacritics
        String lower      = normalised.toLowerCase(Locale.ROOT);
        String hyphenated = NON_ALPHANUMERIC.matcher(lower).replaceAll("-");
        String trimmed    = LEADING_TRAILING_HYPHENS.matcher(hyphenated).replaceAll("");

        if (trimmed.length() > MAX_SLUG_LENGTH) {
            trimmed = trimmed.substring(0, MAX_SLUG_LENGTH);
            trimmed = LEADING_TRAILING_HYPHENS.matcher(trimmed).replaceAll("");
        }
        return trimmed.isEmpty() ? "store" : trimmed;
    }
}
