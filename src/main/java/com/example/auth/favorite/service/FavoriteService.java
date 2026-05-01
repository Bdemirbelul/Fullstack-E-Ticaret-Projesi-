package com.example.auth.favorite.service;

import com.example.auth.category.entity.Category;
import com.example.auth.category.repository.CategoryRepository;
import com.example.auth.entity.User;
import com.example.auth.exception.ApiException;
import com.example.auth.favorite.dto.FavoriteResponseDTO;
import com.example.auth.favorite.entity.Favorite;
import com.example.auth.favorite.repository.FavoriteRepository;
import com.example.auth.product.entity.Product;
import com.example.auth.product.entity.ProductDiscount;
import com.example.auth.product.entity.ProductImage;
import com.example.auth.product.repository.ProductRepository;
import com.example.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public List<FavoriteResponseDTO> getUserFavorites(Long userId) {
        List<Favorite> favorites = favoriteRepository.findByUserId(userId);
        List<Product> products = favorites.stream()
                .map(Favorite::getProduct)
                .filter(Objects::nonNull)
                .toList();

        Map<Long, Category> categoryMap = buildCategoryMap(products);
        Instant now = Instant.now();

        return products.stream()
                .map(product -> toFavoriteResponse(product, categoryMap, now))
                .toList();
    }

    @Transactional
    public void addFavorite(Long userId, Long productId) {
        if (favoriteRepository.existsByUserIdAndProductId(userId, productId)) {
            return;
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Product not found"));

        Favorite favorite = Favorite.builder()
                .user(user)
                .product(product)
                .build();

        favoriteRepository.save(favorite);
    }

    @Transactional
    public void removeFavorite(Long userId, Long productId) {
        if (!favoriteRepository.existsByUserIdAndProductId(userId, productId)) {
            return;
        }
        favoriteRepository.deleteByUserIdAndProductId(userId, productId);
    }

    @Transactional
    public void clearFavorites(Long userId) {
        favoriteRepository.deleteByUserId(userId);
    }

    @Transactional(readOnly = true)
    public boolean isFavorite(Long userId, Long productId) {
        return favoriteRepository.existsByUserIdAndProductId(userId, productId);
    }

    public Long getUserIdByEmail(String email) {
        return userRepository.findByEmail(email)
                .map(User::getId)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    private FavoriteResponseDTO toFavoriteResponse(Product product, Map<Long, Category> categoryMap, Instant now) {
        ProductDiscount activeDiscount = findActiveDiscount(product, now);
        BigDecimal originalPrice = product.getPrice();
        BigDecimal discountPercentage = activeDiscount != null ? activeDiscount.getDiscountPercentage() : null;
        boolean hasDiscount = discountPercentage != null && discountPercentage.compareTo(BigDecimal.ZERO) > 0;
        BigDecimal finalPrice = hasDiscount
                ? originalPrice.subtract(originalPrice.multiply(discountPercentage).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP))
                : originalPrice;

        String mainImageUrl = Optional.ofNullable(product.getImages())
                .orElse(List.of())
                .stream()
                .sorted(Comparator.comparing(ProductImage::isMain).reversed())
                .map(ProductImage::getImageUrl)
                .filter(Objects::nonNull)
                .findFirst()
                .orElse(null);

        Category category = product.getCategoryId() != null ? categoryMap.get(product.getCategoryId()) : null;

        return new FavoriteResponseDTO(
                product.getId(),
                product.getName(),
                product.getDescription(),
                originalPrice,
                finalPrice,
                hasDiscount,
                discountPercentage,
                mainImageUrl,
                category != null ? category.getName() : null,
                product.getStock()
        );
    }

    private ProductDiscount findActiveDiscount(Product product, Instant now) {
        return Optional.ofNullable(product.getDiscounts())
                .orElse(List.of())
                .stream()
                .filter(ProductDiscount::isActive)
                .filter(discount -> isWithinDateWindow(discount, now))
                .max((a, b) -> {
                    int byPercent = a.getDiscountPercentage().compareTo(b.getDiscountPercentage());
                    if (byPercent != 0) return byPercent;
                    return Long.compare(a.getId(), b.getId());
                })
                .orElse(null);
    }

    private boolean isWithinDateWindow(ProductDiscount discount, Instant now) {
        boolean afterStart = discount.getStartDate() == null || !discount.getStartDate().isAfter(now);
        boolean beforeEnd = discount.getEndDate() == null || !discount.getEndDate().isBefore(now);
        return afterStart && beforeEnd;
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

        return categoryRepository.findAllById(categoryIds).stream()
                .collect(Collectors.toMap(Category::getId, Function.identity()));
    }
}

