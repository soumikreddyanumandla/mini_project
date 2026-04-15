package com.survey.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Full survey response DTO — returned to admin or public user.
 * Includes all questions and their options.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SurveyResponse {

    private Long id;
    private String title;
    private String description;

    /** UUID used to build the public survey URL. */
    private String publicId;

    private boolean published;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<QuestionResponse> questions;

    /** Total number of submissions received. */
    private long responseCount;
}
