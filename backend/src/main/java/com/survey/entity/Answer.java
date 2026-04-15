package com.survey.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Answer entity — stores a respondent's answer to a single question within a response.
 * For TEXT questions: textAnswer holds the value.
 * For MCQ questions: selectedOption holds the chosen Option.
 */
@Entity
@Table(name = "answers")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Answer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "response_id", nullable = false)
    private Response response;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    /** Populated for TEXT questions. */
    @Column(columnDefinition = "TEXT")
    private String textAnswer;

    /** Populated for MCQ questions. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "selected_option_id")
    private Option selectedOption;

    /** Populated for RATING questions (value 1-5). */
    private Integer ratingAnswer;
}
