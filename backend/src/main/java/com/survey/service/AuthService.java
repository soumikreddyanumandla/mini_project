package com.survey.service;

import com.survey.dto.AuthResponse;
import com.survey.dto.LoginRequest;
import com.survey.dto.RegisterRequest;
import com.survey.entity.Admin;
import com.survey.repository.AdminRepository;
import com.survey.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Handles admin registration and login, returning JWT tokens.
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    /**
     * Register a new admin account.
     */
    public AuthResponse register(RegisterRequest request) {
        if (adminRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered: " + request.getEmail());
        }

        Admin admin = Admin.create(
                request.getFullName(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword())
        );

        adminRepository.save(admin);
        String token = jwtService.generateToken(admin);

        return AuthResponse.builder()
                .token(token)
                .email(admin.getEmail())
                .fullName(admin.getFullName())
                .adminId(admin.getId())
                .build();
    }

    /**
     * Authenticate an existing admin and return a JWT.
     */
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        Admin admin = adminRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        String token = jwtService.generateToken(admin);

        return AuthResponse.builder()
                .token(token)
                .email(admin.getEmail())
                .fullName(admin.getFullName())
                .adminId(admin.getId())
                .build();
    }
}
