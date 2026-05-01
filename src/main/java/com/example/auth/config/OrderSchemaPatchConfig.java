package com.example.auth.config;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
@RequiredArgsConstructor
public class OrderSchemaPatchConfig {

    private static final Logger log = LoggerFactory.getLogger(OrderSchemaPatchConfig.class);

    @Bean
    CommandLineRunner patchOrderCheckConstraints(JdbcTemplate jdbcTemplate) {
        return args -> {
            // Hibernate ddl-auto=update does not reliably update old enum check constraints.
            jdbcTemplate.execute("""
                    ALTER TABLE orders
                    DROP CONSTRAINT IF EXISTS orders_status_check
                    """);
            jdbcTemplate.execute("""
                    ALTER TABLE orders
                    ADD CONSTRAINT orders_status_check
                    CHECK (status IN (
                        'CREATED',
                        'PENDING_PAYMENT',
                        'PAID',
                        'PREPARING',
                        'SHIPPED',
                        'IN_TRANSIT',
                        'DELIVERED',
                        'CANCELLED',
                        'REFUNDED'
                    ))
                    """);

            jdbcTemplate.execute("""
                    ALTER TABLE orders
                    DROP CONSTRAINT IF EXISTS orders_payment_status_check
                    """);
            jdbcTemplate.execute("""
                    ALTER TABLE orders
                    ADD CONSTRAINT orders_payment_status_check
                    CHECK (payment_status IN (
                        'PENDING_PAYMENT',
                        'PAID',
                        'FAILED',
                        'REFUNDED'
                    ))
                    """);

            jdbcTemplate.execute("""
                    ALTER TABLE payment_transactions
                    DROP CONSTRAINT IF EXISTS payment_transactions_provider_check
                    """);
            jdbcTemplate.execute("""
                    ALTER TABLE payment_transactions
                    ADD CONSTRAINT payment_transactions_provider_check
                    CHECK (provider IN (
                        'IYZICO',
                        'IYZICO_MOCK'
                    ))
                    """);

            jdbcTemplate.execute("""
                    ALTER TABLE payment_transactions
                    DROP CONSTRAINT IF EXISTS payment_transactions_status_check
                    """);
            jdbcTemplate.execute("""
                    ALTER TABLE payment_transactions
                    ADD CONSTRAINT payment_transactions_status_check
                    CHECK (status IN (
                        'INITIATED',
                        'SUCCESS',
                        'FAILED'
                    ))
                    """);

            log.info("Order status/payment check constraints patched");
        };
    }
}

