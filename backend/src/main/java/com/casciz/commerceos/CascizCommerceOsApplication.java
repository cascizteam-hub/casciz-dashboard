package com.casciz.commerceos;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Casciz Commerce OS – Application Entry Point
 *
 * <p>Clean Architecture layers:
 * <ul>
 *   <li>domain        – pure business logic, no framework dependencies</li>
 *   <li>application   – use-cases, orchestrates domain</li>
 *   <li>infrastructure – JPA, Redis, security, mail, external adapters</li>
 *   <li>presentation  – REST controllers, request/response DTOs</li>
 *   <li>shared        – cross-cutting (exceptions, response envelope)</li>
 * </ul>
 */
@SpringBootApplication
@ConfigurationPropertiesScan
@EnableAsync
@EnableScheduling
public class CascizCommerceOsApplication {

    public static void main(String[] args) {
        SpringApplication.run(CascizCommerceOsApplication.class, args);
    }
}
