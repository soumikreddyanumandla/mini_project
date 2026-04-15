package com.survey.service;

import com.survey.dto.SubmitResponseRequest;
import com.survey.entity.*;
import com.survey.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Handles public survey response submissions.
 * Supports TEXT, MCQ, and RATING question types.
 * Optionally sends a confirmation email to the respondent.
 */
@Service
@RequiredArgsConstructor
public class ResponseService {

    private final SurveyRepository surveyRepository;
    private final ResponseRepository responseRepository;
    private final AnswerRepository answerRepository;
    private final EmailService emailService;

    @Transactional
    public void submitResponse(String publicId, SubmitResponseRequest request, String clientIp) {
        Survey survey = surveyRepository.findByPublicIdAndPublishedTrue(publicId)
                .orElseThrow(() -> new RuntimeException("Survey not found or not published"));

        Response response = Response.builder()
                .survey(survey)
                .respondentIp(clientIp)
                .respondentEmail(request.getRespondentEmail())
                .build();

        List<Answer> answers = new ArrayList<>();

        for (Question question : survey.getQuestions()) {
            Map<Long, String> submittedAnswers = request.getAnswers();
            String value = submittedAnswers.get(question.getId());

            if (value == null || value.isBlank()) {
                if (question.isRequired()) {
                    throw new RuntimeException("Question " + question.getId() + " is required.");
                }
                continue;
            }

            Answer answer = new Answer();
            answer.setResponse(response);
            answer.setQuestion(question);

            switch (question.getQuestionType()) {
                case TEXT -> answer.setTextAnswer(value);

                case MCQ -> {
                    Long optionId = Long.parseLong(value);
                    Option selected = question.getOptions().stream()
                            .filter(o -> o.getId().equals(optionId))
                            .findFirst()
                            .orElseThrow(() -> new RuntimeException("Invalid option: " + optionId));
                    answer.setSelectedOption(selected);
                }

                case RATING -> {
                    int rating = Integer.parseInt(value);
                    if (rating < 1 || rating > 5) {
                        throw new RuntimeException("Rating must be between 1 and 5");
                    }
                    answer.setRatingAnswer(rating);
                }
            }

            answers.add(answer);
        }

        response.setAnswers(answers);
        Response saved = responseRepository.save(response);

        // Send confirmation email asynchronously if email was provided
        if (request.getRespondentEmail() != null && !request.getRespondentEmail().isBlank()) {
            emailService.sendResponseConfirmation(request.getRespondentEmail(), survey, saved);
        }
    }
}
