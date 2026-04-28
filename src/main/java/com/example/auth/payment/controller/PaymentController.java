package com.example.auth.payment.controller;

import com.example.auth.payment.dto.PaymentResponse;
import com.example.auth.payment.service.MockIyzicoPaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/payments/mock/iyzico")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('USER','ADMIN')")
public class PaymentController {

    private final MockIyzicoPaymentService mockIyzicoPaymentService;

    @PostMapping("/pay/{orderId}")
    public ResponseEntity<PaymentResponse> pay(@PathVariable long orderId,
                                               @RequestParam(defaultValue = "true") boolean succeed) {
        return ResponseEntity.ok(mockIyzicoPaymentService.pay(orderId, succeed));
    }
}

