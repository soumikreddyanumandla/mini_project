package com.survey.service;

import com.survey.entity.Answer;
import com.survey.entity.Question;
import com.survey.entity.Response;
import com.survey.entity.Survey;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import java.time.format.DateTimeFormatter;

/**
 * Sends emails asynchronously so the survey submission
 * doesn't wait for email delivery to complete.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    /**
     * Send a response confirmation email to the respondent.
     * Runs in a separate thread (@Async) so it doesn't slow down submission.
     */
    @Async
    public void sendResponseConfirmation(String toEmail, Survey survey, Response response) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("✅ Your response to \"" + survey.getTitle() + "\" has been received!");
            helper.setText(buildEmailHtml(survey, response), true); // true = HTML

            mailSender.send(message);
            log.info("Confirmation email sent to: {}", toEmail);

        } catch (Exception e) {
            // Log error but don't fail the submission if email fails
            log.error("Failed to send confirmation email to {}: {}", toEmail, e.getMessage());
        }
    }

    /**
     * Builds a clean HTML email showing the respondent's submitted answers.
     */
    private String buildEmailHtml(Survey survey, Response response) {
        StringBuilder sb = new StringBuilder();

        sb.append("""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px;">
              <div style="background: #4f46e5; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 22px;">SurveyFlow</h1>
                <p style="color: #c7d2fe; margin: 6px 0 0;">Response Confirmation</p>
              </div>
              <div style="background: white; padding: 28px; border-radius: 0 0 12px 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                <h2 style="color: #1e293b; margin-top: 0;">Thank you for your response!</h2>
                <p style="color: #475569;">You successfully submitted a response to:</p>
                <div style="background: #f1f5f9; padding: 14px; border-radius: 8px; margin: 16px 0;">
                  <strong style="color: #4f46e5; font-size: 16px;">""");
        sb.append(survey.getTitle());
        sb.append("""
                  </strong>
                </div>
                <p style="color: #475569; font-size: 13px;">
                  Submitted on: """);
        sb.append(response.getSubmittedAt()
                .format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a")));
        sb.append("""
                </p>

                <h3 style="color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">
                  Your Answers
                </h3>
                <table style="width:100%; border-collapse: collapse;">
            """);

        // List each answer
        for (Answer answer : response.getAnswers()) {
            Question q = answer.getQuestion();
            String answerText = getAnswerText(answer, q);

            sb.append("<tr><td style=\"padding: 10px; vertical-align: top; border-bottom: 1px solid #f1f5f9;\">");
            sb.append("<p style=\"margin:0; color:#64748b; font-size:12px; text-transform:uppercase; letter-spacing:0.5px;\">")
              .append(q.getQuestionType().name()).append("</p>");
            sb.append("<p style=\"margin:4px 0 0; color:#1e293b; font-weight:600;\">")
              .append(q.getText()).append("</p>");
            sb.append("<p style=\"margin:6px 0 0; color:#4f46e5;\">")
              .append(answerText).append("</p>");
            sb.append("</td></tr>");
        }

        sb.append("""
                </table>
                <div style="margin-top: 24px; padding: 16px; background: #f0fdf4;
                     border-radius: 8px; border-left: 4px solid #22c55e;">
                  <p style="margin: 0; color: #15803d; font-size: 14px;">
                    ✅ Your response has been saved successfully. Thank you for your time!
                  </p>
                </div>
                <p style="color: #94a3b8; font-size: 12px; margin-top: 24px; text-align: center;">
                  This is an automated email from SurveyFlow. Please do not reply.
                </p>
              </div>
            </div>
            """);

        return sb.toString();
    }

    private String getAnswerText(Answer answer, Question q) {
        return switch (q.getQuestionType()) {
            case MCQ    -> answer.getSelectedOption() != null
                            ? answer.getSelectedOption().getText() : "—";
            case RATING -> answer.getRatingAnswer() != null
                            ? "⭐".repeat(answer.getRatingAnswer()) + " (" + answer.getRatingAnswer() + "/5)" : "—";
            case TEXT   -> answer.getTextAnswer() != null ? answer.getTextAnswer() : "—";
        };
    }
}
