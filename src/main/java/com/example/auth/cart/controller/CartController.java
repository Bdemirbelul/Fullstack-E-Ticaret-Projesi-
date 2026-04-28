package com.example.auth.cart.controller;

import com.example.auth.cart.dto.CartResponse;
import com.example.auth.cart.dto.UpsertCartItemRequest;
import com.example.auth.cart.service.CartService;
import com.example.auth.common.security.CurrentUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/cart")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('USER','ADMIN')")
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<CartResponse> get() {
        return ResponseEntity.ok(cartService.getOrCreateCart(CurrentUser.email()));
    }

    @PostMapping("/items")
    public ResponseEntity<CartResponse> upsertItem(@Valid @RequestBody UpsertCartItemRequest request) {
        return ResponseEntity.ok(cartService.upsertItem(CurrentUser.email(), request));
    }

    @DeleteMapping("/items/{productId}")
    public ResponseEntity<CartResponse> removeItem(@PathVariable long productId) {
        return ResponseEntity.ok(cartService.removeItem(CurrentUser.email(), productId));
    }

    @DeleteMapping
    public ResponseEntity<Void> clear() {
        cartService.clear(CurrentUser.email());
        return ResponseEntity.noContent().build();
    }
}

