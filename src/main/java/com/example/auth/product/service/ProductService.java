package com.example.auth.product.service;

import com.example.auth.exception.ApiException;
import com.example.auth.product.dto.ProductCreateRequest;
import com.example.auth.product.dto.ProductResponse;
import com.example.auth.product.dto.ProductUpdateRequest;
import com.example.auth.product.entity.Product;
import com.example.auth.product.mapper.ProductMapper;
import com.example.auth.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProductService {

    private static final Logger log = LoggerFactory.getLogger(ProductService.class);

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;

    @Transactional
    public ProductResponse create(ProductCreateRequest request) {
        Product product = productMapper.toEntity(request);
        Product saved = productRepository.save(product);
        log.info("Product created id={}", saved.getId());
        return productMapper.toResponse(saved);
    }

    @Transactional
    public ProductResponse update(long id, ProductUpdateRequest request) {
        Product product = getEntity(id);
        productMapper.updateEntity(request, product);
        Product saved = productRepository.save(product);
        log.info("Product updated id={}", saved.getId());
        return productMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public ProductResponse getById(long id) {
        return productMapper.toResponse(getEntity(id));
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> list(Pageable pageable) {
        return productRepository.findAll(pageable).map(productMapper::toResponse);
    }

    @Transactional
    public void delete(long id) {
        Product product = getEntity(id);
        productRepository.delete(product);
        log.info("Product deleted id={}", id);
    }

    @Transactional(readOnly = true)
    public Product getEntity(long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Product not found: " + id));
    }
}

