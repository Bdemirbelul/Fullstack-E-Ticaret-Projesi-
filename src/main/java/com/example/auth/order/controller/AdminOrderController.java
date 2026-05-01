package com.example.auth.order.controller;

import com.example.auth.order.dto.AdminOrderResponseDTO;
import com.example.auth.order.dto.AdminOrderStatusUpdateRequest;
import com.example.auth.order.entity.OrderStatus;
import com.example.auth.order.entity.PaymentStatus;
import com.example.auth.order.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminOrderController {

    private static final Logger log = LoggerFactory.getLogger(AdminOrderController.class);

    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<List<AdminOrderResponseDTO>> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) PaymentStatus paymentStatus,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to
    ) {
        try {
            return ResponseEntity.ok(orderService.listAdminOrders(search, status, paymentStatus, from, to));
        } catch (Exception e) {
            log.error("GET /api/admin/orders failed search={} status={} paymentStatus={} from={} to={}",
                    search, status, paymentStatus, from, to, e);
            throw e;
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdminOrderResponseDTO> get(@PathVariable long id) {
        return ResponseEntity.ok(orderService.getAdminOrder(id));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<AdminOrderResponseDTO> updateStatus(
            @PathVariable long id,
            @Valid @RequestBody AdminOrderStatusUpdateRequest request
    ) {
        return ResponseEntity.ok(orderService.updateAdminStatus(id, request.status()));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<Void> cancel(@PathVariable long id) {
        orderService.cancelOrder(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable long id) {
        orderService.cancelOrder(id);
        return ResponseEntity.noContent().build();
    }
}

