package com.example.auth.product.service;

import com.example.auth.exception.ApiException;
import com.example.auth.category.entity.Category;
import com.example.auth.category.repository.CategoryRepository;
import com.example.auth.product.dto.ProductCreateRequest;
import com.example.auth.product.dto.AdminDiscountRequest;
import com.example.auth.product.dto.AdminDiscountResponse;
import com.example.auth.product.dto.AdminProductImageRequest;
import com.example.auth.product.dto.ProductImageResponse;
import com.example.auth.product.dto.ProductResponse;
import com.example.auth.product.dto.ProductUpdateRequest;
import com.example.auth.favorite.repository.FavoriteRepository;
import com.example.auth.product.entity.Product;
import com.example.auth.product.entity.ProductDiscount;
import com.example.auth.product.entity.ProductImage;
import com.example.auth.product.mapper.ProductMapper;
import com.example.auth.product.repository.ProductDiscountRepository;
import com.example.auth.product.repository.ProductImageRepository;
import com.example.auth.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Comparator;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;

@Service
@RequiredArgsConstructor
public class ProductService {

    private static final Logger log = LoggerFactory.getLogger(ProductService.class);

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductImageRepository productImageRepository;
    private final ProductDiscountRepository productDiscountRepository;
    private final ProductMapper productMapper;
    private final FavoriteRepository favoriteRepository;

    @Transactional
    public ProductResponse create(ProductCreateRequest request) {
        Product product = productMapper.toEntity(request);
        Product saved = productRepository.save(product);
        log.info("Product created id={}", saved.getId());
        return toResponse(saved, buildCategoryMap(List.of(saved)));
    }

    @Transactional
    public ProductResponse update(long id, ProductUpdateRequest request) {
        Product product = getEntity(id);
        productMapper.updateEntity(request, product);
        Product saved = productRepository.save(product);
        log.info("Product updated id={}", saved.getId());
        return toResponse(saved, buildCategoryMap(List.of(saved)));
    }

    @Transactional(readOnly = true)
    public ProductResponse getById(long id) {
        Product product = getEntity(id);
        return toResponse(product, buildCategoryMap(List.of(product)));
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> list(Long categoryId, String search, String sort, Boolean discounted) {
        Specification<Product> specification = Specification.where(null);

        if (categoryId != null) {
            specification = specification.and((root, query, cb) -> cb.equal(root.get("categoryId"), categoryId));
        }

        if (search != null && !search.isBlank()) {
            String keyword = "%" + search.trim().toLowerCase() + "%";
            specification = specification.and((root, query, cb) -> cb.like(cb.lower(root.get("name")), keyword));
        }

        Sort sortSpec = resolveSort(sort);
        List<Product> products = productRepository.findAll(specification, sortSpec);
        Map<Long, Category> categoryMap = buildCategoryMap(products);
        Map<Long, List<ProductImage>> imageMap = buildImageMap(products);
        Map<Long, ProductDiscount> discountMap = buildDiscountMap(products);

        return products.stream()
                .map(product -> toResponse(product, categoryMap, imageMap, discountMap))
                .filter(response -> discounted == null || !discounted || response.hasDiscount())
                .toList();
    }

    @Transactional
    public void delete(long id) {
        Product product = getEntity(id);
        // Clean favorites for FK safety before product removal.
        favoriteRepository.deleteByProduct_Id(id);
        productRepository.delete(product);
        log.info("Product deleted id={}", id);
    }

    @Transactional(readOnly = true)
    public List<ProductImageResponse> listImages(long productId) {
        return productImageRepository.findByProduct_Id(productId).stream()
                .map(image -> new ProductImageResponse(image.getId(), image.getImageUrl(), image.isMain()))
                .toList();
    }

    @Transactional
    public List<ProductImageResponse> addImage(long productId, AdminProductImageRequest request) {
        Product product = getEntity(productId);
        boolean makeMain = Boolean.TRUE.equals(request.isMain());
        if (makeMain) {
            unsetMainImages(productId);
        }

        ProductImage image = ProductImage.builder()
                .product(product)
                .imageUrl(request.imageUrl())
                .isMain(makeMain || hasNoMainImage(productId))
                .build();
        productImageRepository.save(image);
        return listImages(productId);
    }

    @Transactional
    public List<ProductImageResponse> updateImage(long productId, long imageId, AdminProductImageRequest request) {
        ProductImage image = productImageRepository.findByIdAndProduct_Id(imageId, productId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Image not found"));

        image.setImageUrl(request.imageUrl());
        if (Boolean.TRUE.equals(request.isMain())) {
            unsetMainImages(productId);
            image.setMain(true);
        }
        productImageRepository.save(image);
        ensureSingleMainImage(productId);
        return listImages(productId);
    }

    @Transactional
    public List<ProductImageResponse> deleteImage(long productId, long imageId) {
        ProductImage image = productImageRepository.findByIdAndProduct_Id(imageId, productId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Image not found"));
        productImageRepository.delete(image);
        ensureSingleMainImage(productId);
        return listImages(productId);
    }

    @Transactional
    public List<ProductImageResponse> setMainImage(long productId, long imageId) {
        ProductImage image = productImageRepository.findByIdAndProduct_Id(imageId, productId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Image not found"));
        unsetMainImages(productId);
        image.setMain(true);
        productImageRepository.save(image);
        return listImages(productId);
    }

    @Transactional(readOnly = true)
    public List<AdminDiscountResponse> listDiscounts(long productId) {
        return productDiscountRepository.findByProduct_Id(productId).stream()
                .map(this::toAdminDiscountResponse)
                .toList();
    }

    @Transactional
    public List<AdminDiscountResponse> addDiscount(long productId, AdminDiscountRequest request) {
        Product product = getEntity(productId);
        ProductDiscount discount = ProductDiscount.builder()
                .product(product)
                .discountPercentage(request.discountPercentage())
                .isActive(request.isActive() == null || request.isActive())
                .startDate(request.startDate())
                .endDate(request.endDate())
                .build();
        productDiscountRepository.save(discount);
        return listDiscounts(productId);
    }

    @Transactional
    public List<AdminDiscountResponse> updateDiscount(long productId, long discountId, AdminDiscountRequest request) {
        ProductDiscount discount = productDiscountRepository.findByIdAndProduct_Id(discountId, productId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Discount not found"));
        discount.setDiscountPercentage(request.discountPercentage());
        if (request.isActive() != null) {
            discount.setActive(request.isActive());
        }
        discount.setStartDate(request.startDate());
        discount.setEndDate(request.endDate());
        productDiscountRepository.save(discount);
        return listDiscounts(productId);
    }

    @Transactional
    public List<AdminDiscountResponse> deleteDiscount(long productId, long discountId) {
        ProductDiscount discount = productDiscountRepository.findByIdAndProduct_Id(discountId, productId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Discount not found"));
        productDiscountRepository.delete(discount);
        return listDiscounts(productId);
    }

    @Transactional
    public List<AdminDiscountResponse> toggleDiscount(long productId, long discountId) {
        ProductDiscount discount = productDiscountRepository.findByIdAndProduct_Id(discountId, productId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Discount not found"));
        discount.setActive(!discount.isActive());
        productDiscountRepository.save(discount);
        return listDiscounts(productId);
    }

    @Transactional(readOnly = true)
    public Product getEntity(long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Product not found: " + id));
    }

    /**
     * Birim satış fiyatı (aktif indirim varsa indirimli, yoksa liste fiyatı).
     */
    @Transactional(readOnly = true)
    public BigDecimal getFinalUnitPrice(Product product) {
        Map<Long, ProductDiscount> discountMap = buildDiscountMap(List.of(product));
        ProductDiscount activeDiscount = discountMap.get(product.getId());
        BigDecimal originalPrice = product.getPrice();
        BigDecimal discountPercentage = activeDiscount != null ? activeDiscount.getDiscountPercentage() : BigDecimal.ZERO;
        boolean hasDiscount = activeDiscount != null && discountPercentage.compareTo(BigDecimal.ZERO) > 0;
        if (!hasDiscount) {
            return originalPrice;
        }
        return originalPrice.subtract(
                originalPrice.multiply(discountPercentage).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP)
        );
    }

    private Map<Long, Category> buildCategoryMap(List<Product> products) {
        List<Long> categoryIds = products.stream()
                .map(Product::getCategoryId)
                .filter(Objects::nonNull)
                .distinct()
                .toList();

        if (categoryIds.isEmpty()) {
            return Map.of();
        }

        Map<Long, Category> categories = new HashMap<>();
        categoryRepository.findAllById(categoryIds)
                .forEach(category -> categories.put(category.getId(), category));
        return categories;
    }

    private ProductResponse toResponse(Product product, Map<Long, Category> categoryMap) {
        Map<Long, List<ProductImage>> imageMap = buildImageMap(List.of(product));
        Map<Long, ProductDiscount> discountMap = buildDiscountMap(List.of(product));
        return toResponse(product, categoryMap, imageMap, discountMap);
    }

    private ProductResponse toResponse(
            Product product,
            Map<Long, Category> categoryMap,
            Map<Long, List<ProductImage>> imageMap,
            Map<Long, ProductDiscount> discountMap
    ) {
        Category category = null;
        if (categoryMap != null && product.getCategoryId() != null) {
            category = categoryMap.get(product.getCategoryId());
        }

        ProductDiscount activeDiscount = discountMap.get(product.getId());
        BigDecimal originalPrice = product.getPrice();
        BigDecimal discountPercentage = activeDiscount != null ? activeDiscount.getDiscountPercentage() : BigDecimal.ZERO;
        boolean hasDiscount = activeDiscount != null && discountPercentage.compareTo(BigDecimal.ZERO) > 0;
        BigDecimal discountedPrice = hasDiscount
                ? originalPrice.subtract(originalPrice.multiply(discountPercentage).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP))
                : originalPrice;
        BigDecimal finalPrice = discountedPrice;

        List<ProductImageResponse> imageResponses = imageMap.getOrDefault(product.getId(), List.of()).stream()
                .map(image -> new ProductImageResponse(image.getId(), image.getImageUrl(), image.isMain()))
                .toList();

        String mainImageUrl = imageMap.getOrDefault(product.getId(), List.of()).stream()
                .sorted(Comparator.comparing(ProductImage::isMain).reversed())
                .map(ProductImage::getImageUrl)
                .findFirst()
                .orElse(null);

        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                product.getStock(),
                product.getCategoryId(),
                category != null ? category.getName() : null,
                category != null ? category.getSlug() : null,
                hasDiscount,
                hasDiscount ? discountPercentage : null,
                originalPrice,
                hasDiscount ? discountedPrice : null,
                finalPrice,
                mainImageUrl,
                imageResponses,
                product.getCreatedAt(),
                product.getUpdatedAt()
        );
    }

    private Map<Long, List<ProductImage>> buildImageMap(List<Product> products) {
        List<Long> productIds = products.stream().map(Product::getId).filter(Objects::nonNull).toList();
        if (productIds.isEmpty()) {
            return Map.of();
        }

        Map<Long, List<ProductImage>> imageMap = new HashMap<>();
        productImageRepository.findByProduct_IdIn(productIds)
                .forEach(image -> imageMap.computeIfAbsent(image.getProduct().getId(), key -> new java.util.ArrayList<>()).add(image));
        return imageMap;
    }

    private Map<Long, ProductDiscount> buildDiscountMap(List<Product> products) {
        List<Long> productIds = products.stream().map(Product::getId).filter(Objects::nonNull).toList();
        if (productIds.isEmpty()) {
            return Map.of();
        }

        Instant now = Instant.now();
        List<ProductDiscount> discounts = productDiscountRepository
                .findByProduct_IdInAndIsActiveTrue(productIds)
                .stream()
                .filter(discount -> isWithinDateWindow(discount, now))
                .toList();

        Map<Long, ProductDiscount> discountMap = new HashMap<>();
        for (ProductDiscount discount : discounts) {
            Long productId = discount.getProduct().getId();
            ProductDiscount existing = discountMap.get(productId);
            if (existing == null || isPreferred(discount, existing)) {
                discountMap.put(productId, discount);
            }
        }
        return discountMap;
    }

    private boolean isPreferred(ProductDiscount candidate, ProductDiscount current) {
        int percentageCompare = candidate.getDiscountPercentage().compareTo(current.getDiscountPercentage());
        if (percentageCompare != 0) {
            return percentageCompare > 0;
        }
        return candidate.getId() > current.getId();
    }

    private boolean isWithinDateWindow(ProductDiscount discount, Instant now) {
        boolean afterStart = discount.getStartDate() == null || !discount.getStartDate().isAfter(now);
        boolean beforeEnd = discount.getEndDate() == null || !discount.getEndDate().isBefore(now);
        return afterStart && beforeEnd;
    }

    private AdminDiscountResponse toAdminDiscountResponse(ProductDiscount discount) {
        return new AdminDiscountResponse(
                discount.getId(),
                discount.getDiscountPercentage(),
                discount.isActive(),
                discount.getStartDate(),
                discount.getEndDate()
        );
    }

    private void unsetMainImages(long productId) {
        List<ProductImage> images = productImageRepository.findByProduct_Id(productId);
        for (ProductImage existing : images) {
            if (existing.isMain()) {
                existing.setMain(false);
                productImageRepository.save(existing);
            }
        }
    }

    private boolean hasNoMainImage(long productId) {
        return productImageRepository.findByProduct_Id(productId).stream().noneMatch(ProductImage::isMain);
    }

    private void ensureSingleMainImage(long productId) {
        List<ProductImage> images = productImageRepository.findByProduct_Id(productId);
        if (images.isEmpty()) return;
        long mainCount = images.stream().filter(ProductImage::isMain).count();
        if (mainCount == 0) {
            ProductImage first = images.get(0);
            first.setMain(true);
            productImageRepository.save(first);
        } else if (mainCount > 1) {
            boolean firstKept = false;
            for (ProductImage image : images) {
                if (image.isMain() && !firstKept) {
                    firstKept = true;
                    continue;
                }
                if (image.isMain()) {
                    image.setMain(false);
                    productImageRepository.save(image);
                }
            }
        }
    }

    private Sort resolveSort(String sort) {
        if (sort == null || sort.isBlank()) {
            return Sort.by(Sort.Direction.DESC, "createdAt");
        }

        return switch (sort) {
            case "price_asc" -> Sort.by(Sort.Direction.ASC, "price");
            case "price_desc" -> Sort.by(Sort.Direction.DESC, "price");
            case "stock_asc" -> Sort.by(Sort.Direction.ASC, "stock");
            case "stock_desc" -> Sort.by(Sort.Direction.DESC, "stock");
            case "newest" -> Sort.by(Sort.Direction.DESC, "createdAt");
            case "discount" -> Sort.by(Sort.Direction.DESC, "createdAt");
            default -> Sort.by(Sort.Direction.DESC, "createdAt");
        };
    }
}

