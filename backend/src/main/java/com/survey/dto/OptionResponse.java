package com.survey.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Read DTO for a single MCQ option.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OptionResponse {

    private Long id;
    private String text;
}
