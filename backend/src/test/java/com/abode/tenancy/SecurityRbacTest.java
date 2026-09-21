package com.abode.tenancy;

import com.abode.tenancy.config.JwtTokenProvider;
import com.abode.tenancy.domain.enums.Role;
import com.abode.tenancy.domain.enums.UserStatus;
import com.abode.tenancy.domain.model.User;
import com.abode.tenancy.domain.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class SecurityRbacTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private String ownerToken;
    private String cookToken;
    private String tenantToken;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();

        // 1. Create Owner User
        User owner = userRepository.save(User.builder()
                .fullName("Test Owner")
                .phone("9999900001")
                .email("owner@test.com")
                .passwordHash(passwordEncoder.encode("Pass@123"))
                .role(Role.OWNER)
                .status(UserStatus.ACTIVE)
                .build());
        ownerToken = "Bearer " + jwtTokenProvider.generateTokenFromUser(owner.getId(), "OWNER", owner.getPhone(), owner.getFullName());

        // 2. Create Cook User
        User cook = userRepository.save(User.builder()
                .fullName("Test Cook")
                .phone("9999900002")
                .email("cook@test.com")
                .passwordHash(passwordEncoder.encode("Pass@123"))
                .role(Role.COOK)
                .status(UserStatus.ACTIVE)
                .build());
        cookToken = "Bearer " + jwtTokenProvider.generateTokenFromUser(cook.getId(), "COOK", cook.getPhone(), cook.getFullName());

        // 3. Create Tenant User
        User tenant = userRepository.save(User.builder()
                .fullName("Test Tenant")
                .phone("9999900003")
                .email("tenant@test.com")
                .passwordHash(passwordEncoder.encode("Pass@123"))
                .role(Role.TENANT)
                .status(UserStatus.ACTIVE)
                .build());
        tenantToken = "Bearer " + jwtTokenProvider.generateTokenFromUser(tenant.getId(), "TENANT", tenant.getPhone(), tenant.getFullName());
    }

    @Test
    @DisplayName("Negative RBAC: Unauthenticated request to protected endpoint should return 403/401")
    void testUnauthenticatedAccessDenied() throws Exception {
        mockMvc.perform(get("/api/v1/properties"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Positive RBAC: Owner can access properties list")
    void testOwnerCanAccessProperties() throws Exception {
        mockMvc.perform(get("/api/v1/properties")
                .header("Authorization", ownerToken))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Negative RBAC: Cook MUST NOT see rent endpoints (Hard Access Rule)")
    void testCookCannotAccessRentEndpoints() throws Exception {
        mockMvc.perform(get("/api/v1/rent/dashboard/" + UUID.randomUUID())
                .header("Authorization", cookToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Negative RBAC: Cook MUST NOT see tenant management list (Hard Access Rule)")
    void testCookCannotAccessTenantList() throws Exception {
        mockMvc.perform(get("/api/v1/tenants/property/" + UUID.randomUUID())
                .header("Authorization", cookToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Negative RBAC: Tenant MUST NOT access owner property management endpoints")
    void testTenantCannotAccessOwnerProperties() throws Exception {
        mockMvc.perform(get("/api/v1/properties")
                .header("Authorization", tenantToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Positive RBAC: Public endpoints are accessible without token")
    void testPublicEndpointsAccessibleWithoutToken() throws Exception {
        mockMvc.perform(post("/api/v1/auth/otp/request")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"phone\":\"9876543210\"}"))
                .andExpect(status().isOk());
    }
}

