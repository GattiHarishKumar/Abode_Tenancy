package com.abode.tenancy.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI abodeOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Abode Tenancy Platform API")
                        .description("Digital Operating System for PGs & Hostels - Complete End-to-End REST API Specification")
                        .version("1.0.0")
                        .contact(new Contact().name("Abode Engineering").email("support@abodetenancy.com"))
                        .license(new License().name("Proprietary").url("https://abodetenancy.com")))
                .addSecurityItem(new SecurityRequirement().addList("Bearer Authentication"))
                .components(new Components()
                        .addSecuritySchemes("Bearer Authentication", new SecurityScheme()
                                .name("Bearer Authentication")
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")));
    }
}

