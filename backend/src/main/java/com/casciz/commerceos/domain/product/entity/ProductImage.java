package com.casciz.commerceos.domain.product.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

/**
 * An image attached to a product. The first image (sortOrder = 0) is the thumbnail.
 */
@Entity
@Table(name = "product_images",
    indexes = @Index(name = "idx_product_images_product_id", columnList = "product_id"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductImage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false, length = 512)
    private String url;

    @Column(length = 255)
    private String altText;

    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private int sortOrder = 0;
}
