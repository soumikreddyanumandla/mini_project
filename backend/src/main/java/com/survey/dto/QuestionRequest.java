package com.survey.dto;

import com.survey.entity.Question;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for a single question inside a survey creation/update request.
 * When questionType is MCQ, options must contain at least 2 entries.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuestionRequest {

    @NotBlank(message = "Question text is required")
    private String text;

    @NotNull(message = "Question type is required")
    private Question.QuestionType questionType;

    private boolean required;

    private int orderIndex;

    /**
     * Required when questionType is MCQ.
     * Each element is the display text of one option.
     */
    private List<String> options;
}
