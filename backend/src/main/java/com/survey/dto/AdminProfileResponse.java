package com.survey.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response DTO for admin profile info.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminProfileResponse {
    private Long id;
    private String fullName;
    private String email;
    private LocalDateTime createdAt;
}
