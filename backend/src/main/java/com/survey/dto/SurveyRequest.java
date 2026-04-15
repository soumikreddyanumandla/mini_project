package com.survey.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Request body for creating or updating a survey.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SurveyRequest {

    @NotBlank(message = "Survey title is required")
    private String title;

    private String description;

    @NotNull(message = "Questions list must not be null")
    @Valid
    private List<QuestionRequest> questions;
}
