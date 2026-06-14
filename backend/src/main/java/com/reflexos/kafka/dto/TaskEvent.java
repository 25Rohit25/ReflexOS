package com.reflexos.kafka.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskEvent {
    private UUID taskId;
    private UUID projectId;
    private String action; // e.g., "CREATED", "UPDATED", "DELETED"
    private UUID triggeredByUserId;
}
