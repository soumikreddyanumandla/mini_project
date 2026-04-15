package com.survey.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Lightweight survey summary used in the admin dashboard list.
 * Does not include question details to keep payloads small.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SurveySummary {

    private Long id;
    private String title;
    private String description;
    private String publicId;
    private boolean published;
    private LocalDateTime createdAt;
    private long responseCount;
}
