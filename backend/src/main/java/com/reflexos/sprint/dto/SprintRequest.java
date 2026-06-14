package com.reflexos.sprint.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class SprintRequest {
    @NotBlank(message = "Sprint name is required")
    private String name;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
}
