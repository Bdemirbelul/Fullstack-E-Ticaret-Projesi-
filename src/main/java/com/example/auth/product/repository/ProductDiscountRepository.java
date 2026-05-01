package com.example.auth.product.repository;

import com.example.auth.product.entity.ProductDiscount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductDiscountRepository extends JpaRepository<ProductDiscount, Long> {
    List<ProductDiscount> findByProduct_IdInAndIsActiveTrue(List<Long> productIds);

    List<ProductDiscount> findByProduct_Id(Long productId);

    Optional<ProductDiscount> findByIdAndProduct_Id(Long id, Long productId);
}
