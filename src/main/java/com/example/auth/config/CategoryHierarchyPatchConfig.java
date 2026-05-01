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
public class CategoryHierarchyPatchConfig {

    private static final Logger log = LoggerFactory.getLogger(CategoryHierarchyPatchConfig.class);

    /**
     * Kişisel Bakım is a sub-area under Ev &amp; Yaşam (not a top-level shop category).
     */
    @Bean
    CommandLineRunner patchPersonalCareUnderEvYasam(JdbcTemplate jdbcTemplate) {
        return args -> {
            int underEv = jdbcTemplate.update(
                    """
                            UPDATE categories child
                            SET parent_id = parent.id
                            FROM categories parent
                            WHERE parent.slug = 'ev-yasam'
                              AND child.slug = 'kisisel-bakim'
                              AND (child.parent_id IS DISTINCT FROM parent.id)
                            """);
            if (underEv > 0) {
                log.info("Patched category hierarchy: kisisel-bakim now under ev-yasam ({} rows)", underEv);
            }

            int underHub = jdbcTemplate.update(
                    """
                            UPDATE categories leaf
                            SET parent_id = hub.id
                            FROM categories hub
                            WHERE hub.slug = 'kisisel-bakim'
                              AND leaf.slug IN (
                                  'makyaj',
                                  'cilt-bakimi',
                                  'sac-bakimi',
                                  'parfum',
                                  'agiz-bakimi'
                              )
                              AND (leaf.parent_id IS DISTINCT FROM hub.id)
                            """);
            if (underHub > 0) {
                log.info(
                        "Patched category hierarchy: personal-care leaf categories under kisisel-bakim ({} rows)",
                        underHub);
            }
        };
    }
}
