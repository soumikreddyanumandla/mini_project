package com.survey.repository;

import com.survey.entity.Survey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SurveyRepository extends JpaRepository<Survey, Long> {

    /** Find all surveys belonging to a specific admin. */
    List<Survey> findByAdminIdOrderByCreatedAtDesc(Long adminId);

    /** Find a survey by its public UUID (for unauthenticated access). */
    Optional<Survey> findByPublicId(String publicId);

    /** Find a published survey by public UUID. */
    Optional<Survey> findByPublicIdAndPublishedTrue(String publicId);

    long countByAdminId(Long adminId);

    long countByAdminIdAndPublishedTrue(Long adminId);
}
