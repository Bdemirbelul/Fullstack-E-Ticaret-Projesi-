package com.example.auth.payment.service;

import com.example.auth.exception.ApiException;
import com.example.auth.order.entity.Order;
import com.example.auth.order.entity.OrderStatus;
import com.example.auth.order.service.OrderService;
import com.example.auth.payment.dto.PaymentResponse;
import com.example.auth.payment.entity.PaymentProvider;
import com.example.auth.payment.entity.PaymentStatus;
import com.example.auth.payment.entity.PaymentTransaction;
import com.example.auth.payment.repository.PaymentTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MockIyzicoPaymentService {

    private static final Logger log = LoggerFactory.getLogger(MockIyzicoPaymentService.class);

    private final PaymentTransactionRepository paymentTransactionRepository;
    private final OrderService orderService;

    @Transactional
    public PaymentResponse pay(long orderId, boolean succeed) {
        Order order = orderService.getEntity(orderId);

        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new ApiException(HttpStatus.CONFLICT, "Cannot pay for a cancelled order");
        }

        PaymentTransaction tx = PaymentTransaction.builder()
                .order(order)
                .provider(PaymentProvider.IYZICO_MOCK)
                .amount(order.getTotal())
                .providerReference("MOCK-" + UUID.randomUUID())
                .status(succeed ? PaymentStatus.SUCCESS : PaymentStatus.FAILED)
                .build();

        PaymentTransaction saved = paymentTransactionRepository.save(tx);

        if (saved.getStatus() == PaymentStatus.SUCCESS) {
            orderService.updateStatus(orderId, OrderStatus.PAID);
        }

        log.info("Mock payment processed orderId={} txId={} status={}", orderId, saved.getId(), saved.getStatus());
        return new PaymentResponse(
                saved.getId(),
                orderId,
                saved.getProvider(),
                saved.getStatus(),
                saved.getAmount(),
                saved.getProviderReference(),
                saved.getCreatedAt()
        );
    }
}

