package com.survey.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Response entity — represents a single survey submission by a public user.
 */
@Entity
@Table(name = "responses")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Response {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "survey_id", nullable = false)
    private Survey survey;

    /** Optional: store respondent IP for dedup / analytics. */
    private String respondentIp;

    /** Optional: respondent email — used to send confirmation email. */
    private String respondentEmail;

    @Column(nullable = false, updatable = false)
    private LocalDateTime submittedAt;

    @Builder.Default
    @OneToMany(mappedBy = "response", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Answer> answers = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        this.submittedAt = LocalDateTime.now();
    }
}
