package com.survey.service;

import com.survey.dto.AdminProfileResponse;
import com.survey.dto.ChangePasswordRequest;
import com.survey.dto.UpdateProfileRequest;
import com.survey.entity.Admin;
import com.survey.repository.AdminRepository;
import com.survey.repository.ResponseRepository;
import com.survey.repository.SurveyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Handles all admin settings operations:
 * - Get profile
 * - Update profile (name/email)
 * - Change password
 * - Delete account
 */
@Service
@RequiredArgsConstructor
public class SettingsService {

    private final AdminRepository adminRepository;
    private final SurveyRepository surveyRepository;
    private final ResponseRepository responseRepository;
    private final PasswordEncoder passwordEncoder;

    // ─────────────────────────────────────────────
    // GET PROFILE
    // ─────────────────────────────────────────────

    public AdminProfileResponse getProfile(Long adminId) {
        Admin admin = adminRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        return AdminProfileResponse.builder()
                .id(admin.getId())
                .fullName(admin.getFullName())
                .email(admin.getEmail())
                .createdAt(admin.getCreatedAt())
                .build();
    }

    // ─────────────────────────────────────────────
    // UPDATE PROFILE
    // ─────────────────────────────────────────────

    @Transactional
    public AdminProfileResponse updateProfile(Long adminId, UpdateProfileRequest request) {
        Admin admin = adminRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        // Check if new email is taken by another admin
        if (!admin.getEmail().equals(request.getEmail())
                && adminRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already in use by another account");
        }

        admin.setFullName(request.getFullName());
        admin.setEmail(request.getEmail());
        adminRepository.save(admin);

        return AdminProfileResponse.builder()
                .id(admin.getId())
                .fullName(admin.getFullName())
                .email(admin.getEmail())
                .createdAt(admin.getCreatedAt())
                .build();
    }

    // ─────────────────────────────────────────────
    // CHANGE PASSWORD
    // ─────────────────────────────────────────────

    @Transactional
    public void changePassword(Long adminId, ChangePasswordRequest request) {
        Admin admin = adminRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), admin.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        // Confirm new passwords match
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("New passwords do not match");
        }

        // Prevent reusing same password
        if (passwordEncoder.matches(request.getNewPassword(), admin.getPassword())) {
            throw new RuntimeException("New password must be different from current password");
        }

        admin.setPassword(passwordEncoder.encode(request.getNewPassword()));
        adminRepository.save(admin);
    }

    // ─────────────────────────────────────────────
    // DELETE ACCOUNT
    // ─────────────────────────────────────────────

    @Transactional
    public void deleteAccount(Long adminId, String confirmPassword) {
        Admin admin = adminRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        // Require password confirmation before deleting
        if (!passwordEncoder.matches(confirmPassword, admin.getPassword())) {
            throw new RuntimeException("Password is incorrect");
        }

        // Delete admin — cascades to surveys, responses, answers via DB
        adminRepository.delete(admin);
    }
}
