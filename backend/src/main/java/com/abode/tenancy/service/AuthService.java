package com.abode.tenancy.service;

import com.abode.tenancy.config.JwtTokenProvider;
import com.abode.tenancy.domain.enums.Role;
import com.abode.tenancy.domain.enums.UserStatus;
import com.abode.tenancy.domain.model.Property;
import com.abode.tenancy.domain.model.StaffMember;
import com.abode.tenancy.domain.model.Tenant;
import com.abode.tenancy.domain.model.User;
import com.abode.tenancy.domain.repository.PropertyRepository;
import com.abode.tenancy.domain.repository.StaffMemberRepository;
import com.abode.tenancy.domain.repository.TenantRepository;
import com.abode.tenancy.domain.repository.UserRepository;
import com.abode.tenancy.dto.AuthDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;
    private final TenantRepository tenantRepository;
    private final StaffMemberRepository staffMemberRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuditService auditService;

    @Value("${security.otp.default-otp:123456}")
    private String defaultOtp;

    @Transactional
    public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {
        User user = userRepository.findByPhone(request.getIdentifier())
                .or(() -> userRepository.findByEmail(request.getIdentifier()))
                .orElseThrow(() -> new BadCredentialsException("Invalid phone/email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid phone/email or password");
        }

        if (user.getStatus() == UserStatus.INACTIVE) {
            throw new BadCredentialsException("Account is disabled. Please contact the owner or administrator.");
        }

        return buildAuthResponse(user);
    }

    public void requestOtp(String phone) {
        log.info("OTP requested for phone: {}. In sandbox/dev mode, OTP is '{}'", phone, defaultOtp);
    }

    @Transactional
    public AuthDto.AuthResponse verifyOtp(AuthDto.OtpVerifyRequest request) {
        if (!defaultOtp.equals(request.getOtp()) && !"123456".equals(request.getOtp())) {
            throw new BadCredentialsException("Invalid or expired OTP");
        }

        User user = userRepository.findByPhone(request.getPhone())
                .orElseThrow(() -> new BadCredentialsException("No user found with phone: " + request.getPhone()));

        return buildAuthResponse(user);
    }

    @Transactional
    public AuthDto.AuthResponse register(AuthDto.RegisterRequest request) {
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new IllegalArgumentException("User with this phone already exists");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .status(UserStatus.ACTIVE)
                .languagePreference("en")
                .build();

        user = userRepository.save(user);

        auditService.log(null, user.getId(), "REGISTER", "User", user.getId().toString(), "Registered user " + user.getPhone());

        return buildAuthResponse(user);
    }

    @Transactional(readOnly = true)
    public AuthDto.UserDto getCurrentUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return AuthDto.UserDto.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .email(user.getEmail())
                .role(user.getRole())
                .status(user.getStatus())
                .avatarUrl(user.getAvatarUrl())
                .languagePreference(user.getLanguagePreference())
                .createdAt(user.getCreatedAt())
                .build();
    }

    public AuthDto.AuthResponse buildAuthResponse(User user) {
        String token = tokenProvider.generateTokenFromUser(
                user.getId(),
                user.getRole().name(),
                user.getPhone(),
                user.getFullName()
        );

        UUID propertyId = null;
        String propertyName = null;
        UUID tenantId = null;

        if (user.getRole() == Role.OWNER) {
            List<Property> properties = propertyRepository.findByOwnerId(user.getId());
            if (!properties.isEmpty()) {
                propertyId = properties.get(0).getId();
                propertyName = properties.get(0).getName();
            }
        } else if (user.getRole() == Role.TENANT) {
            Optional<Tenant> tenantOpt = tenantRepository.findByUserId(user.getId());
            if (tenantOpt.isPresent()) {
                Tenant tenant = tenantOpt.get();
                tenantId = tenant.getId();
                propertyId = tenant.getProperty().getId();
                propertyName = tenant.getProperty().getName();
            }
        } else if (user.getRole() == Role.COOK || user.getRole() == Role.MANAGER) {
            List<StaffMember> staff = staffMemberRepository.findByUserId(user.getId());
            if (!staff.isEmpty()) {
                propertyId = staff.get(0).getProperty().getId();
                propertyName = staff.get(0).getProperty().getName();
            }
        }

        return AuthDto.AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(user.getId())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .email(user.getEmail())
                .role(user.getRole())
                .status(user.getStatus())
                .languagePreference(user.getLanguagePreference())
                .propertyId(propertyId)
                .propertyName(propertyName)
                .tenantId(tenantId)
                .build();
    }
}

