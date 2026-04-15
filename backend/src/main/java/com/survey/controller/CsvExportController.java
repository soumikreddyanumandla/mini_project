package com.survey.controller;

import com.survey.entity.Admin;
import com.survey.service.CsvExportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * GET /api/admin/export/{surveyId}/csv
 * Downloads all responses for a survey as a CSV file.
 */
@RestController
@RequestMapping("/api/admin/export")
@RequiredArgsConstructor
public class CsvExportController {

    private final CsvExportService csvExportService;

    @GetMapping("/{surveyId}/csv")
    public ResponseEntity<byte[]> exportCsv(
            @PathVariable Long surveyId,
            @AuthenticationPrincipal Admin admin) {

        byte[] csvBytes = csvExportService.exportSurveyResponsesCsv(surveyId, admin.getId());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"survey-" + surveyId + "-responses.csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvBytes);
    }
}
