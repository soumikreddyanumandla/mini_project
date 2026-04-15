package com.survey;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Main entry point for the Online Survey System application.
 * @EnableAsync allows EmailService to send emails in background threads.
 */
@SpringBootApplication
@EnableAsync
public class SurveySystemApplication {
    public static void main(String[] args) {
        SpringApplication.run(SurveySystemApplication.class, args);
    }
}
