package com.reflexos.project.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class ProjectResponse {
    private UUID id;
    private String title;
    private String status;
    private UUID workspaceId;
    private LocalDateTime createdAt;
}
