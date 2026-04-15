package com.survey.repository;

import com.survey.entity.Answer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnswerRepository extends JpaRepository<Answer, Long> {

    List<Answer> findByQuestionId(Long questionId);

    /**
     * Analytics query: count how many times each option was selected for a given question.
     * Returns Object[] rows: [optionId, optionText, count]
     */
    @Query("""
        SELECT a.selectedOption.id, a.selectedOption.text, COUNT(a)
        FROM Answer a
        WHERE a.question.id = :questionId AND a.selectedOption IS NOT NULL
        GROUP BY a.selectedOption.id, a.selectedOption.text
    """)
    List<Object[]> countOptionSelectionsByQuestion(@Param("questionId") Long questionId);
}
