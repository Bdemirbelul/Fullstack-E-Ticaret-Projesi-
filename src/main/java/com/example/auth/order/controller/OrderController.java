package com.example.auth.order.controller;

import com.example.auth.common.security.CurrentUser;
import com.example.auth.order.dto.CheckoutRequest;
import com.example.auth.order.dto.OrderResponse;
import com.example.auth.order.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping({"/api/orders", "/orders"})
@RequiredArgsConstructor
public class OrderController {

    private static final Logger log = LoggerFactory.getLogger(OrderController.class);

    private final OrderService orderService;

    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @PostMapping
    public ResponseEntity<OrderResponse> createFromCart(@Valid @RequestBody CheckoutRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(orderService.createFromCart(CurrentUser.email(), request));
    }

    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @GetMapping({"/my", "/my-orders"})
    public ResponseEntity<List<OrderResponse>> listMyOrders() {
        String email = CurrentUser.email();
        log.debug("GET .../orders/my user={}", email);
        try {
            return ResponseEntity.ok(orderService.listMyOrdersList(email));
        } catch (Exception e) {
            log.error("GET /api/orders/my failed for user={}", email, e);
            throw e;
        }
    }

    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @GetMapping("/{id:\\d+}")
    public ResponseEntity<OrderResponse> getMyOrder(@PathVariable long id) {
        return ResponseEntity.ok(orderService.getMyOrder(CurrentUser.email(), id));
    }

    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @PatchMapping("/{id:\\d+}/cancel")
    public ResponseEntity<OrderResponse> cancelMyOrder(@PathVariable long id) {
        return ResponseEntity.ok(orderService.cancelMyOrder(CurrentUser.email(), id));
    }

    /** Bazı ortamlarda PATCH engellenebildiği için POST fallback'i de destekliyoruz. */
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @PostMapping("/{id:\\d+}/cancel")
    public ResponseEntity<OrderResponse> cancelMyOrderViaPost(@PathVariable long id) {
        return ResponseEntity.ok(orderService.cancelMyOrder(CurrentUser.email(), id));
    }
}
