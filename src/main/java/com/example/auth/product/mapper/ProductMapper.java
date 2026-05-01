package com.example.auth.product.mapper;

import com.example.auth.product.dto.ProductCreateRequest;
import com.example.auth.product.dto.ProductUpdateRequest;
import com.example.auth.product.entity.Product;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ProductMapper {

    Product toEntity(ProductCreateRequest request);

    void updateEntity(ProductUpdateRequest request, @MappingTarget Product entity);
}

