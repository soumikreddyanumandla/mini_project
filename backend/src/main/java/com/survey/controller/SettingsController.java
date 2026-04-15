package com.survey.controller;

import com.survey.dto.AdminProfileResponse;
import com.survey.dto.ChangePasswordRequest;
import com.survey.dto.UpdateProfileRequest;
import com.survey.entity.Admin;
import com.survey.service.SettingsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Settings controller — all endpoints require JWT authentication.
 *
 * GET    /api/admin/settings/profile          → get profile
 * PUT    /api/admin/settings/profile          → update name/email
 * PUT    /api/admin/settings/password         → change password
 * DELETE /api/admin/settings/account          → delete account
 */
@RestController
@RequestMapping("/api/admin/settings")
@RequiredArgsConstructor
public class SettingsController {

    private final SettingsService settingsService;

    /** GET /api/admin/settings/profile — fetch current admin profile */
    @GetMapping("/profile")
    public ResponseEntity<AdminProfileResponse> getProfile(
            @AuthenticationPrincipal Admin admin) {
        return ResponseEntity.ok(settingsService.getProfile(admin.getId()));
    }

    /** PUT /api/admin/settings/profile — update name and email */
    @PutMapping("/profile")
    public ResponseEntity<AdminProfileResponse> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            @AuthenticationPrincipal Admin admin) {
        return ResponseEntity.ok(settingsService.updateProfile(admin.getId(), request));
    }

    /** PUT /api/admin/settings/password — change password */
    @PutMapping("/password")
    public ResponseEntity<Map<String, String>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            @AuthenticationPrincipal Admin admin) {
        settingsService.changePassword(admin.getId(), request);
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }

    /** DELETE /api/admin/settings/account — permanently delete account */
    @DeleteMapping("/account")
    public ResponseEntity<Map<String, String>> deleteAccount(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal Admin admin) {
        String confirmPassword = body.get("confirmPassword");
        if (confirmPassword == null || confirmPassword.isBlank()) {
            throw new RuntimeException("Password confirmation is required");
        }
        settingsService.deleteAccount(admin.getId(), confirmPassword);
        return ResponseEntity.ok(Map.of("message", "Account deleted successfully"));
    }
}
