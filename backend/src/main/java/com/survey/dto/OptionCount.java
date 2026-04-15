package com.survey.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * How many times a specific MCQ option was selected.
 * Used inside {@link QuestionAnalytics} for chart rendering.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OptionCount {

    private Long optionId;
    private String optionText;
    private long count;
}
