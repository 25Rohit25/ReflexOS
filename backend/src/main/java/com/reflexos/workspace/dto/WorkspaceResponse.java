package com.reflexos.workspace.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class WorkspaceResponse {
    private UUID id;
    private String name;
    private UUID ownerId;
    private String ownerName;
    private LocalDateTime createdAt;
}
