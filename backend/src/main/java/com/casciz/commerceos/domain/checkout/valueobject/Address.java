package com.casciz.commerceos.domain.checkout.valueobject;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

/**
 * Immutable postal address embedded into checkout and order records.
 * Column name prefixes are applied at the usage site via {@code @AttributeOverride}.
 */
@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Address {

    @Column(length = 120)
    private String fullName;

    @Column(length = 255)
    private String line1;

    @Column(length = 255)
    private String line2;

    @Column(length = 100)
    private String city;

    @Column(length = 100)
    private String state;

    @Column(name = "postal_code", length = 20)
    private String postalCode;

    /** ISO 3166-1 alpha-2 country code, e.g. "US", "GB". */
    @Column(length = 2)
    private String countryCode;

    @Column(length = 30)
    private String phone;
}
