package com.example.auth.product.repository;

import com.example.auth.product.entity.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {
    List<ProductImage> findByProduct_IdIn(List<Long> productIds);

    List<ProductImage> findByProduct_Id(Long productId);

    Optional<ProductImage> findByIdAndProduct_Id(Long id, Long productId);
}
