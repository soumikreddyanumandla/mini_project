package com.survey.controller;

import com.survey.dto.*;
import com.survey.entity.Admin;
import com.survey.service.SurveyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Admin-only survey management endpoints.
 * All routes require a valid JWT (Authorization: Bearer <token>).
 */
@RestController
@RequestMapping("/api/admin/surveys")
@RequiredArgsConstructor
public class SurveyController {

    private final SurveyService surveyService;

    /** GET /api/admin/surveys — list all surveys for the authenticated admin */
    @GetMapping
    public ResponseEntity<List<SurveySummary>> getMySurveys(
            @AuthenticationPrincipal Admin admin) {
        return ResponseEntity.ok(surveyService.getSurveysForAdmin(admin.getId()));
    }

    /** GET /api/admin/surveys/{id} — get a single survey with full questions */
    @GetMapping("/{id}")
    public ResponseEntity<SurveyResponse> getSurvey(
            @PathVariable Long id,
            @AuthenticationPrincipal Admin admin) {
        return ResponseEntity.ok(surveyService.getSurveyById(id, admin.getId()));
    }

    /** POST /api/admin/surveys — create a new survey */
    @PostMapping
    public ResponseEntity<SurveyResponse> createSurvey(
            @Valid @RequestBody SurveyRequest request,
            @AuthenticationPrincipal Admin admin) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(surveyService.createSurvey(request, admin.getId()));
    }

    /** PUT /api/admin/surveys/{id} — update an existing survey */
    @PutMapping("/{id}")
    public ResponseEntity<SurveyResponse> updateSurvey(
            @PathVariable Long id,
            @Valid @RequestBody SurveyRequest request,
            @AuthenticationPrincipal Admin admin) {
        return ResponseEntity.ok(surveyService.updateSurvey(id, request, admin.getId()));
    }

    /** DELETE /api/admin/surveys/{id} — delete a survey */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSurvey(
            @PathVariable Long id,
            @AuthenticationPrincipal Admin admin) {
        surveyService.deleteSurvey(id, admin.getId());
        return ResponseEntity.noContent().build();
    }

    /** PATCH /api/admin/surveys/{id}/publish — toggle publish/unpublish */
    @PatchMapping("/{id}/publish")
    public ResponseEntity<SurveyResponse> togglePublish(
            @PathVariable Long id,
            @AuthenticationPrincipal Admin admin) {
        return ResponseEntity.ok(surveyService.togglePublish(id, admin.getId()));
    }

    /** GET /api/admin/dashboard — dashboard statistics */
    @GetMapping("/dashboard/stats")
    public ResponseEntity<DashboardStats> getDashboardStats(
            @AuthenticationPrincipal Admin admin) {
        return ResponseEntity.ok(surveyService.getDashboardStats(admin.getId()));
    }
}
