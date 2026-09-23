package com.abode.tenancy.controller;

import com.abode.tenancy.common.ApiResponse;
import com.abode.tenancy.common.CurrentUser;
import com.abode.tenancy.common.UserPrincipal;
import com.abode.tenancy.dto.AuthDto;
import com.abode.tenancy.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import com.abode.tenancy.config.RateLimitService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "01. Authentication & Accounts", description = "User Login, OTP Verification, Registration, and Identity Session")
public class AuthController {

    private final AuthService authService;
    private final RateLimitService rateLimitService;

    @PostMapping("/login")
    @Operation(summary = "Login with phone/email and password")
    public ResponseEntity<ApiResponse<AuthDto.AuthResponse>> login(@Valid @RequestBody AuthDto.LoginRequest request, HttpServletRequest httpRequest) {
        String clientIp = httpRequest.getRemoteAddr() + ":" + request.getIdentifier();
        if (!rateLimitService.tryAcquire(clientIp)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(ApiResponse.error("Too many login attempts. Please wait a minute before trying again."));
        }
        AuthDto.AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/otp/request")
    @Operation(summary = "Request phone OTP (mock: 123456)")
    public ResponseEntity<ApiResponse<String>> requestOtp(@Valid @RequestBody AuthDto.OtpRequest request, HttpServletRequest httpRequest) {
        String clientIp = httpRequest.getRemoteAddr() + ":" + request.getPhone();
        if (!rateLimitService.tryAcquire(clientIp)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(ApiResponse.error("Too many OTP requests. Please wait a minute before requesting again."));
        }
        authService.requestOtp(request.getPhone());
        return ResponseEntity.ok(ApiResponse.success("OTP sent successfully to " + request.getPhone()));
    }

    @PostMapping("/otp/verify")
    @Operation(summary = "Verify phone OTP and authenticate")
    public ResponseEntity<ApiResponse<AuthDto.AuthResponse>> verifyOtp(@Valid @RequestBody AuthDto.OtpVerifyRequest request, HttpServletRequest httpRequest) {
        String clientIp = httpRequest.getRemoteAddr() + ":" + request.getPhone();
        if (!rateLimitService.tryAcquire(clientIp)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(ApiResponse.error("Too many verification attempts. Please wait a minute before trying again."));
        }
        AuthDto.AuthResponse response = authService.verifyOtp(request);
        return ResponseEntity.ok(ApiResponse.success("OTP verified successfully", response));
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new user account")
    public ResponseEntity<ApiResponse<AuthDto.AuthResponse>> register(@Valid @RequestBody AuthDto.RegisterRequest request) {
        AuthDto.AuthResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.success("User registered successfully", response));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user profile")
    public ResponseEntity<ApiResponse<AuthDto.UserDto>> getCurrentUser(@CurrentUser UserPrincipal principal) {
        AuthDto.UserDto user = authService.getCurrentUser(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(user));
    }
}

