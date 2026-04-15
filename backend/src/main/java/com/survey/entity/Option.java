package com.survey.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Option entity — represents a choice for an MCQ question.
 */
@Entity
@Table(name = "options")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Option {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String text;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;
}
