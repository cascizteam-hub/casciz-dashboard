package com.casciz.commerceos.application.store;

import com.casciz.commerceos.application.store.usecase.SlugGenerator;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("SlugGenerator.toSlug()")
class SlugGeneratorTest {

    @ParameterizedTest(name = "''{0}'' → ''{1}''")
    @CsvSource({
        "My Awesome Store,    my-awesome-store",
        "Café & Boulangerie,  cafe-boulangerie",
        "Hello World!,        hello-world",
        "  leading spaces  ,  leading-spaces",
        "UPPERCASE NAME,      uppercase-name",
        "hello---multiple,    hello-multiple",
        "Ünîcödé Shöp,        unicode-shop",
    })
    void toSlug_variousInputs(String input, String expected) {
        assertThat(SlugGenerator.toSlug(input.trim())).isEqualTo(expected.trim());
    }

    @Test
    @DisplayName("toSlug: empty string falls back to 'store'")
    void toSlug_emptyString_fallsBack() {
        assertThat(SlugGenerator.toSlug("!!!")).isEqualTo("store");
    }

    @Test
    @DisplayName("toSlug: long names are truncated to 60 chars")
    void toSlug_longName_truncated() {
        String longName = "a".repeat(200);
        assertThat(SlugGenerator.toSlug(longName)).hasSize(60);
    }
}
