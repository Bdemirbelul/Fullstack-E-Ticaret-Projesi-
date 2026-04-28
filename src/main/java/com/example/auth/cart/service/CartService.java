package com.example.auth.cart.service;

import com.example.auth.cart.dto.CartItemResponse;
import com.example.auth.cart.dto.CartResponse;
import com.example.auth.cart.dto.UpsertCartItemRequest;
import com.example.auth.cart.entity.Cart;
import com.example.auth.cart.entity.CartItem;
import com.example.auth.cart.repository.CartRepository;
import com.example.auth.entity.User;
import com.example.auth.exception.ApiException;
import com.example.auth.product.entity.Product;
import com.example.auth.product.service.ProductService;
import com.example.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CartService {

    private static final Logger log = LoggerFactory.getLogger(CartService.class);

    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final ProductService productService;

    @Transactional
    public CartResponse getOrCreateCart(String userEmail) {
        Cart cart = getOrCreateCartEntity(userEmail);
        return toResponse(cart);
    }

    @Transactional
    public CartResponse upsertItem(String userEmail, UpsertCartItemRequest request) {
        Cart cart = getOrCreateCartEntity(userEmail);
        Product product = productService.getEntity(request.productId());

        CartItem item = cart.getItems().stream()
                .filter(i -> i.getProduct().getId().equals(product.getId()))
                .findFirst()
                .orElse(null);

        if (item == null) {
            item = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(request.quantity())
                    .build();
            cart.getItems().add(item);
        } else {
            item.setQuantity(request.quantity());
        }

        Cart saved = cartRepository.save(cart);
        log.info("Cart upsert item user={} productId={} qty={}", userEmail, product.getId(), request.quantity());
        return toResponse(saved);
    }

    @Transactional
    public CartResponse removeItem(String userEmail, long productId) {
        Cart cart = getOrCreateCartEntity(userEmail);
        boolean removed = cart.getItems().removeIf(i -> i.getProduct().getId().equals(productId));
        if (!removed) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Cart item not found for productId: " + productId);
        }
        Cart saved = cartRepository.save(cart);
        log.info("Cart remove item user={} productId={}", userEmail, productId);
        return toResponse(saved);
    }

    @Transactional
    public void clear(String userEmail) {
        Cart cart = getOrCreateCartEntity(userEmail);
        cart.getItems().clear();
        cartRepository.save(cart);
        log.info("Cart cleared user={}", userEmail);
    }

    @Transactional(readOnly = true)
    public Cart getOrCreateCartEntity(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));

        return cartRepository.findByUser(user)
                .orElseGet(() -> cartRepository.save(Cart.builder().user(user).build()));
    }

    private CartResponse toResponse(Cart cart) {
        List<CartItemResponse> items = cart.getItems().stream()
                .map(i -> {
                    BigDecimal unit = i.getProduct().getPrice();
                    BigDecimal line = unit.multiply(BigDecimal.valueOf(i.getQuantity()));
                    return new CartItemResponse(
                            i.getProduct().getId(),
                            i.getProduct().getName(),
                            unit,
                            i.getQuantity(),
                            line
                    );
                })
                .toList();

        BigDecimal total = items.stream()
                .map(CartItemResponse::lineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new CartResponse(cart.getId(), items, total);
    }
}

