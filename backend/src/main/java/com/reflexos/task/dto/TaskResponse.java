package com.reflexos.task.dto;

import com.reflexos.task.TaskStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class TaskResponse {
    private UUID id;
    private String title;
    private String description;
    private TaskStatus status;
    private UUID projectId;
    private UUID sprintId;
    private UUID assigneeId;
    private String assigneeName;
    private LocalDateTime createdAt;
}
