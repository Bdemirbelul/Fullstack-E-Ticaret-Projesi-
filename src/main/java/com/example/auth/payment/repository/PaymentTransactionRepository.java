package com.example.auth.payment.repository;

import com.example.auth.payment.entity.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {
    Optional<PaymentTransaction> findByProviderReference(String providerReference);
    Optional<PaymentTransaction> findByIyzicoToken(String iyzicoToken);
}

