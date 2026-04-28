package com.example.auth.config;

import com.example.auth.entity.Role;
import com.example.auth.entity.User;
import com.example.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Set;

@Configuration
@RequiredArgsConstructor
public class DataSeederConfig {

    private static final Logger log = LoggerFactory.getLogger(DataSeederConfig.class);

    @Bean
    CommandLineRunner seedAdmin(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            String email = "admin@local";
            if (userRepository.existsByEmail(email)) {
                return;
            }

            User admin = User.builder()
                    .name("Admin")
                    .email(email)
                    .password(passwordEncoder.encode("Admin123!"))
                    .roles(Set.of(Role.ADMIN, Role.USER))
                    .build();

            userRepository.save(admin);
            log.info("Seeded default admin user: {}", email);
        };
    }
}

