package com.example.auth.favorite.controller;

import com.example.auth.common.security.CurrentUser;
import com.example.auth.favorite.dto.FavoriteResponseDTO;
import com.example.auth.favorite.service.FavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/favorites")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('USER','ADMIN')")
public class FavoriteController {

    private final FavoriteService favoriteService;

    @GetMapping
    public ResponseEntity<List<FavoriteResponseDTO>> list() {
        Long userId = currentUserId();
        return ResponseEntity.ok(favoriteService.getUserFavorites(userId));
    }

    @PostMapping("/{productId}")
    public ResponseEntity<Void> add(@PathVariable Long productId) {
        Long userId = currentUserId();
        favoriteService.addFavorite(userId, productId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> remove(@PathVariable Long productId) {
        Long userId = currentUserId();
        favoriteService.removeFavorite(userId, productId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> clearAll() {
        Long userId = currentUserId();
        favoriteService.clearFavorites(userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/check/{productId}")
    public ResponseEntity<Map<String, Boolean>> check(@PathVariable Long productId) {
        Long userId = currentUserId();
        boolean isFavorite = favoriteService.isFavorite(userId, productId);
        return ResponseEntity.ok(Map.of("favorite", isFavorite));
    }

    private Long currentUserId() {
        String email = CurrentUser.email();
        return favoriteService.getUserIdByEmail(email);
    }
}

