package com.survey.controller;

import com.survey.dto.SurveyAnalyticsResponse;
import com.survey.dto.SurveyResponse;
import com.survey.dto.SubmitResponseRequest;
import com.survey.entity.Admin;
import com.survey.service.AnalyticsService;
import com.survey.service.ResponseService;
import com.survey.service.SurveyService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * Public controller for accessing and submitting surveys without authentication.
 */
@RestController
@RequestMapping("/api/public/surveys")
@RequiredArgsConstructor
class PublicSurveyController {

    private final SurveyService surveyService;
    private final ResponseService responseService;

    /**
     * GET /api/public/surveys/{publicId}
     * Fetch a published survey for public display.
     */
    @GetMapping("/{publicId}")
    public ResponseEntity<SurveyResponse> getPublicSurvey(@PathVariable String publicId) {
        return ResponseEntity.ok(surveyService.getPublicSurvey(publicId));
    }

    /**
     * POST /api/public/surveys/{publicId}/submit
     * Submit a response to a published survey.
     */
    @PostMapping("/{publicId}/submit")
    public ResponseEntity<String> submitResponse(
            @PathVariable String publicId,
            @Valid @RequestBody SubmitResponseRequest request,
            HttpServletRequest httpRequest) {
        String clientIp = httpRequest.getRemoteAddr();
        responseService.submitResponse(publicId, request, clientIp);
        return ResponseEntity.ok("Response submitted successfully.");
    }
}

/**
 * Analytics controller — admin-only endpoint for survey results.
 */
@RestController
@RequestMapping("/api/admin/analytics")
@RequiredArgsConstructor
class AnalyticsController {

    private final AnalyticsService analyticsService;

    /**
     * GET /api/admin/analytics/{surveyId}
     * Returns aggregated analytics for a survey.
     */
    @GetMapping("/{surveyId}")
    public ResponseEntity<SurveyAnalyticsResponse> getSurveyAnalytics(
            @PathVariable Long surveyId,
            @AuthenticationPrincipal Admin admin) {
        return ResponseEntity.ok(analyticsService.getSurveyAnalytics(surveyId, admin.getId()));
    }
}
