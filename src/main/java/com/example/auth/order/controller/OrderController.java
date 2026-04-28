package com.example.auth.order.controller;

import com.example.auth.common.security.CurrentUser;
import com.example.auth.order.dto.OrderResponse;
import com.example.auth.order.dto.UpdateOrderStatusRequest;
import com.example.auth.order.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @PostMapping
    public ResponseEntity<OrderResponse> createFromCart() {
        return ResponseEntity.status(HttpStatus.CREATED).body(orderService.createFromCart(CurrentUser.email()));
    }

    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @GetMapping
    public ResponseEntity<Page<OrderResponse>> listMyOrders(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(orderService.listMyOrders(CurrentUser.email(), pageable));
    }

    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getMyOrder(@PathVariable long id) {
        return ResponseEntity.ok(orderService.getMyOrder(CurrentUser.email(), id));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}/status")
    public ResponseEntity<OrderResponse> updateStatus(@PathVariable long id, @Valid @RequestBody UpdateOrderStatusRequest request) {
        return ResponseEntity.ok(orderService.updateStatus(id, request.status()));
    }
}

