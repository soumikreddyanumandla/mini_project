package com.survey.dto;

import com.survey.entity.Question;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Analytics for a single question.
 * MCQ     → optionCounts populated
 * TEXT    → textAnswers populated
 * RATING  → averageRating + ratingDistribution populated
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionAnalytics {

    private Long questionId;
    private String questionText;
    private Question.QuestionType questionType;

    /** MCQ: option vote counts */
    private List<OptionCount> optionCounts;

    /** TEXT: raw text answers */
    private List<String> textAnswers;

    /** RATING: average score out of 5 */
    private Double averageRating;

    /** RATING: count per star (index 0 = 1 star ... index 4 = 5 stars) */
    private List<Long> ratingDistribution;
}
