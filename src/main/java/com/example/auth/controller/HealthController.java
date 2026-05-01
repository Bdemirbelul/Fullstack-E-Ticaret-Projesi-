package com.example.auth.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequiredArgsConstructor
public class HealthController {

    private final JdbcTemplate jdbcTemplate;

    @GetMapping("/health/db")
    public ResponseEntity<Map<String, Object>> dbHealth() {
        Integer result = jdbcTemplate.queryForObject("SELECT 1", Integer.class);
        boolean connected = result != null && result == 1;

        return ResponseEntity.ok(Map.of(
                "database", "postgresql",
                "connected", connected
        ));
    }

    @GetMapping("/debug/db")
    public Map<String, Object> debugDb() {
        return jdbcTemplate.queryForMap("""
                SELECT
                    current_database() AS database,
                    current_schema() AS schema,
                    inet_server_addr() AS host,
                    inet_server_port() AS port,
                    (SELECT COUNT(*) FROM products) AS product_count
                """);
    }
}
