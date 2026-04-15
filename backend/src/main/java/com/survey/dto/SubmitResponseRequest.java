package com.survey.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * Public survey submission request.
 *
 * The {@code answers} map uses:
 * <ul>
 *   <li>Key   — questionId (Long)</li>
 *   <li>Value — for TEXT    questions: the free-text answer string</li>
 *   <li>Value — for MCQ     questions: the selected optionId as a string</li>
 *   <li>Value — for RATING  questions: a number 1-5 as a string</li>
 * </ul>
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubmitResponseRequest {

    @NotNull(message = "Answers map must not be null")
    private Map<Long, String> answers;

    /** Optional — if provided, a confirmation email is sent to this address. */
    @Email(message = "Must be a valid email address")
    private String respondentEmail;
}
