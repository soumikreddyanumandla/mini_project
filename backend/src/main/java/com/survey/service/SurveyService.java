package com.survey.service;

import com.survey.dto.*;
import com.survey.entity.*;
import com.survey.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Core business logic for survey management.
 */
@Service
@RequiredArgsConstructor
public class SurveyService {

    private final SurveyRepository surveyRepository;
    private final AdminRepository adminRepository;
    private final ResponseRepository responseRepository;

    // ─────────────────────────────────────────────
    // CREATE
    // ─────────────────────────────────────────────

    @Transactional
    public SurveyResponse createSurvey(SurveyRequest request, Long adminId) {
        Admin admin = adminRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        Survey survey = Survey.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .published(false)
                .admin(admin)
                .build();

        // Map questions
        List<Question> questions = buildQuestions(request.getQuestions(), survey);
        survey.setQuestions(questions);

        Survey saved = surveyRepository.save(survey);
        return toSurveyResponse(saved);
    }

    // ─────────────────────────────────────────────
    // READ
    // ─────────────────────────────────────────────

    public List<SurveySummary> getSurveysForAdmin(Long adminId) {
        return surveyRepository.findByAdminIdOrderByCreatedAtDesc(adminId)
                .stream()
                .map(s -> SurveySummary.builder()
                        .id(s.getId())
                        .title(s.getTitle())
                        .description(s.getDescription())
                        .publicId(s.getPublicId())
                        .published(s.isPublished())
                        .createdAt(s.getCreatedAt())
                        .responseCount(responseRepository.countBySurveyId(s.getId()))
                        .build())
                .collect(Collectors.toList());
    }

    public SurveyResponse getSurveyById(Long surveyId, Long adminId) {
        Survey survey = surveyRepository.findById(surveyId)
                .orElseThrow(() -> new RuntimeException("Survey not found"));
        // Only the owning admin can access
        if (!survey.getAdmin().getId().equals(adminId)) {
            throw new RuntimeException("Access denied");
        }
        return toSurveyResponse(survey);
    }

    /** Public access — survey must be published. */
    public SurveyResponse getPublicSurvey(String publicId) {
        Survey survey = surveyRepository.findByPublicIdAndPublishedTrue(publicId)
                .orElseThrow(() -> new RuntimeException("Survey not found or not published"));
        return toSurveyResponse(survey);
    }

    // ─────────────────────────────────────────────
    // UPDATE
    // ─────────────────────────────────────────────

    @Transactional
    public SurveyResponse updateSurvey(Long surveyId, SurveyRequest request, Long adminId) {
        Survey survey = surveyRepository.findById(surveyId)
                .orElseThrow(() -> new RuntimeException("Survey not found"));

        if (!survey.getAdmin().getId().equals(adminId)) {
            throw new RuntimeException("Access denied");
        }

        survey.setTitle(request.getTitle());
        survey.setDescription(request.getDescription());

        // Replace all questions
        survey.getQuestions().clear();
        List<Question> questions = buildQuestions(request.getQuestions(), survey);
        survey.getQuestions().addAll(questions);

        Survey saved = surveyRepository.save(survey);
        return toSurveyResponse(saved);
    }

    // ─────────────────────────────────────────────
    // DELETE
    // ─────────────────────────────────────────────

    @Transactional
    public void deleteSurvey(Long surveyId, Long adminId) {
        Survey survey = surveyRepository.findById(surveyId)
                .orElseThrow(() -> new RuntimeException("Survey not found"));

        if (!survey.getAdmin().getId().equals(adminId)) {
            throw new RuntimeException("Access denied");
        }

        surveyRepository.delete(survey);
    }

    // ─────────────────────────────────────────────
    // PUBLISH / UNPUBLISH
    // ─────────────────────────────────────────────

    @Transactional
    public SurveyResponse togglePublish(Long surveyId, Long adminId) {
        Survey survey = surveyRepository.findById(surveyId)
                .orElseThrow(() -> new RuntimeException("Survey not found"));

        if (!survey.getAdmin().getId().equals(adminId)) {
            throw new RuntimeException("Access denied");
        }

        survey.setPublished(!survey.isPublished());
        Survey saved = surveyRepository.save(survey);
        return toSurveyResponse(saved);
    }

    // ─────────────────────────────────────────────
    // DASHBOARD STATS
    // ─────────────────────────────────────────────

    public DashboardStats getDashboardStats(Long adminId) {
        return DashboardStats.builder()
                .totalSurveys(surveyRepository.countByAdminId(adminId))
                .publishedSurveys(surveyRepository.countByAdminIdAndPublishedTrue(adminId))
                .totalResponses(responseRepository.countBySurveyAdminId(adminId))
                .build();
    }

    // ─────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────

    private List<Question> buildQuestions(List<QuestionRequest> questionRequests, Survey survey) {
        return questionRequests.stream().map(qReq -> {
            Question q = new Question();
            q.setText(qReq.getText());
            q.setQuestionType(qReq.getQuestionType());
            q.setRequired(qReq.isRequired());
            q.setOrderIndex(qReq.getOrderIndex());
            q.setSurvey(survey);

            if (qReq.getQuestionType() == Question.QuestionType.MCQ
                    && qReq.getOptions() != null) {
                List<Option> opts = qReq.getOptions().stream().map(optText -> {
                    Option o = new Option();
                    o.setText(optText);
                    o.setQuestion(q);
                    return o;
                }).collect(Collectors.toList());
                q.setOptions(opts);
            }
            return q;
        }).collect(Collectors.toList());
    }

    private SurveyResponse toSurveyResponse(Survey survey) {
        List<QuestionResponse> questionDtos = survey.getQuestions().stream()
                .map(q -> {
                    List<OptionResponse> optDtos = q.getOptions().stream()
                            .map(o -> new OptionResponse(o.getId(), o.getText()))
                            .collect(Collectors.toList());

                    return QuestionResponse.builder()
                            .id(q.getId())
                            .text(q.getText())
                            .questionType(q.getQuestionType())
                            .required(q.isRequired())
                            .orderIndex(q.getOrderIndex())
                            .options(optDtos)
                            .build();
                })
                .collect(Collectors.toList());

        return SurveyResponse.builder()
                .id(survey.getId())
                .title(survey.getTitle())
                .description(survey.getDescription())
                .publicId(survey.getPublicId())
                .published(survey.isPublished())
                .createdAt(survey.getCreatedAt())
                .updatedAt(survey.getUpdatedAt())
                .questions(questionDtos)
                .responseCount(responseRepository.countBySurveyId(survey.getId()))
                .build();
    }
}
