package com.survey.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Top-level analytics response returned for a survey.
 * Contains per-question aggregated results.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SurveyAnalyticsResponse {

    private Long surveyId;
    private String surveyTitle;
    private long totalResponses;

    /** One entry per question in the survey. */
    private List<QuestionAnalytics> questions;
}
