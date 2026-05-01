package com.example.auth.product.controller;

import com.example.auth.product.dto.AdminDiscountRequest;
import com.example.auth.product.dto.AdminDiscountResponse;
import com.example.auth.product.dto.AdminProductImageRequest;
import com.example.auth.product.dto.ProductCreateRequest;
import com.example.auth.product.dto.ProductImageResponse;
import com.example.auth.product.dto.ProductResponse;
import com.example.auth.product.dto.ProductUpdateRequest;
import com.example.auth.product.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/admin/products")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<List<ProductResponse>> list(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String sort,
            @RequestParam(required = false) Boolean discounted
    ) {
        return ResponseEntity.ok(productService.list(categoryId, search, sort, discounted));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> get(@PathVariable long id) {
        return ResponseEntity.ok(productService.getById(id));
    }

    @PostMapping
    public ResponseEntity<ProductResponse> create(@Valid @RequestBody ProductCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> update(@PathVariable long id, @Valid @RequestBody ProductUpdateRequest request) {
        return ResponseEntity.ok(productService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable long id) {
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/images")
    public ResponseEntity<List<ProductImageResponse>> listImages(@PathVariable long id) {
        return ResponseEntity.ok(productService.listImages(id));
    }

    @PostMapping("/{id}/images")
    public ResponseEntity<List<ProductImageResponse>> addImage(@PathVariable long id, @Valid @RequestBody AdminProductImageRequest request) {
        return ResponseEntity.ok(productService.addImage(id, request));
    }

    @PutMapping("/{id}/images/{imageId}")
    public ResponseEntity<List<ProductImageResponse>> updateImage(
            @PathVariable long id,
            @PathVariable long imageId,
            @Valid @RequestBody AdminProductImageRequest request
    ) {
        return ResponseEntity.ok(productService.updateImage(id, imageId, request));
    }

    @DeleteMapping("/{id}/images/{imageId}")
    public ResponseEntity<List<ProductImageResponse>> deleteImage(@PathVariable long id, @PathVariable long imageId) {
        return ResponseEntity.ok(productService.deleteImage(id, imageId));
    }

    @PutMapping("/{id}/images/{imageId}/main")
    public ResponseEntity<List<ProductImageResponse>> setMainImage(@PathVariable long id, @PathVariable long imageId) {
        return ResponseEntity.ok(productService.setMainImage(id, imageId));
    }

    @GetMapping("/{id}/discounts")
    public ResponseEntity<List<AdminDiscountResponse>> listDiscounts(@PathVariable long id) {
        return ResponseEntity.ok(productService.listDiscounts(id));
    }

    @PostMapping("/{id}/discounts")
    public ResponseEntity<List<AdminDiscountResponse>> addDiscount(@PathVariable long id, @Valid @RequestBody AdminDiscountRequest request) {
        return ResponseEntity.ok(productService.addDiscount(id, request));
    }

    @PutMapping("/{id}/discounts/{discountId}")
    public ResponseEntity<List<AdminDiscountResponse>> updateDiscount(
            @PathVariable long id,
            @PathVariable long discountId,
            @Valid @RequestBody AdminDiscountRequest request
    ) {
        return ResponseEntity.ok(productService.updateDiscount(id, discountId, request));
    }

    @DeleteMapping("/{id}/discounts/{discountId}")
    public ResponseEntity<List<AdminDiscountResponse>> deleteDiscount(@PathVariable long id, @PathVariable long discountId) {
        return ResponseEntity.ok(productService.deleteDiscount(id, discountId));
    }

    @PatchMapping("/{id}/discounts/{discountId}/toggle")
    public ResponseEntity<List<AdminDiscountResponse>> toggleDiscount(@PathVariable long id, @PathVariable long discountId) {
        return ResponseEntity.ok(productService.toggleDiscount(id, discountId));
    }
}

