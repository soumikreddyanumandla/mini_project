package com.survey.service;

import com.survey.entity.*;
import com.survey.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Generates a properly formatted CSV file for Excel.
 * Uses UTF-8 BOM so Excel auto-splits columns correctly.
 */
@Service
@RequiredArgsConstructor
public class CsvExportService {

    private final SurveyRepository surveyRepository;
    private final ResponseRepository responseRepository;

    private static final DateTimeFormatter FMT =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public byte[] exportSurveyResponsesCsv(Long surveyId, Long adminId) {
        Survey survey = surveyRepository.findById(surveyId)
                .orElseThrow(() -> new RuntimeException("Survey not found"));

        if (!survey.getAdmin().getId().equals(adminId)) {
            throw new RuntimeException("Access denied");
        }

        List<Question> questions = survey.getQuestions();
        List<Response> responses = responseRepository.findBySurveyId(surveyId);

        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();

            // ✅ Write UTF-8 BOM — this tells Excel to split columns by comma automatically
            baos.write(new byte[]{(byte) 0xEF, (byte) 0xBB, (byte) 0xBF});

            PrintWriter pw = new PrintWriter(
                    new OutputStreamWriter(baos, StandardCharsets.UTF_8));

            // ── Header row ──────────────────────────────────────
            StringBuilder header = new StringBuilder();
            header.append("Response #").append(",");
            header.append("Submitted At").append(",");
            header.append("Respondent Email");
            for (Question q : questions) {
                header.append(",").append(wrap(q.getText()));
            }
            pw.println(header);

            // ── Data rows ────────────────────────────────────────
            int num = 1;
            for (Response response : responses) {
                StringBuilder row = new StringBuilder();
                row.append(num++).append(",");
                row.append(response.getSubmittedAt().format(FMT)).append(",");
                row.append(response.getRespondentEmail() != null
                        ? wrap(response.getRespondentEmail()) : "");

                for (Question q : questions) {
                    row.append(",");
                    String answerValue = response.getAnswers().stream()
                            .filter(a -> a.getQuestion().getId().equals(q.getId()))
                            .findFirst()
                            .map(a -> getAnswerValue(a, q))
                            .orElse("");
                    row.append(wrap(answerValue));
                }
                pw.println(row);
            }

            pw.flush();
            return baos.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate CSV: " + e.getMessage());
        }
    }

    private String getAnswerValue(Answer a, Question q) {
        return switch (q.getQuestionType()) {
            case TEXT   -> a.getTextAnswer() != null ? a.getTextAnswer() : "";
            case MCQ    -> a.getSelectedOption() != null ? a.getSelectedOption().getText() : "";
            case RATING -> a.getRatingAnswer() != null ? a.getRatingAnswer() + " / 5" : "";
        };
    }

    /** Wraps value in quotes and escapes internal quotes for CSV */
    private String wrap(String value) {
        if (value == null) return "\"\"";
        return "\"" + value.replace("\"", "\"\"") + "\"";
    }
}
