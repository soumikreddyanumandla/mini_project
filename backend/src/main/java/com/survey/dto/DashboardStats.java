package com.survey.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Aggregated statistics shown on the admin dashboard home screen.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStats {

    private long totalSurveys;
    private long publishedSurveys;
    private long totalResponses;
}
