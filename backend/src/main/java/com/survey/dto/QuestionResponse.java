package com.survey.dto;

import com.survey.entity.Question;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Read DTO for a single question, including its options (if MCQ).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionResponse {

    private Long id;
    private String text;
    private Question.QuestionType questionType;
    private boolean required;
    private int orderIndex;

    /** Populated for MCQ questions; empty list for TEXT questions. */
    private List<OptionResponse> options;
}
