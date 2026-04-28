package com.example.auth.product.service;

import com.example.auth.product.dto.ProductCreateRequest;
import com.example.auth.product.dto.ProductResponse;
import com.example.auth.product.mapper.ProductMapper;
import com.example.auth.product.repository.ProductRepository;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class ProductServiceTest {

    private final ProductRepository productRepository = mock(ProductRepository.class);
    private final ProductMapper productMapper = mock(ProductMapper.class);

    private final ProductService productService = new ProductService(productRepository, productMapper);

    @Test
    void create_savesProduct() {
        ProductCreateRequest req = new ProductCreateRequest("Phone", "Nice", new BigDecimal("999.99"), 5);

        var entity = com.example.auth.product.entity.Product.builder()
                .name("Phone")
                .description("Nice")
                .price(new BigDecimal("999.99"))
                .stock(5)
                .build();
        when(productMapper.toEntity(req)).thenReturn(entity);

        when(productRepository.save(any())).thenAnswer(inv -> {
            var p = inv.getArgument(0, com.example.auth.product.entity.Product.class);
            p.setId(10L);
            return p;
        });

        ProductResponse mapped = new ProductResponse(10L, "Phone", "Nice", new BigDecimal("999.99"), 5, null, null);
        when(productMapper.toResponse(any())).thenReturn(mapped);

        ProductResponse res = productService.create(req);

        ArgumentCaptor<com.example.auth.product.entity.Product> captor = ArgumentCaptor.forClass(com.example.auth.product.entity.Product.class);
        verify(productRepository).save(captor.capture());
        assertThat(captor.getValue().getName()).isEqualTo("Phone");
        assertThat(res.id()).isEqualTo(10L);
    }
}

