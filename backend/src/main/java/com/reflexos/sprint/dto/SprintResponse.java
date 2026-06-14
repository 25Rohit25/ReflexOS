package com.reflexos.sprint.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class SprintResponse {
    private UUID id;
    private String name;
    private UUID projectId;
    private LocalDateTime createdAt;
}
