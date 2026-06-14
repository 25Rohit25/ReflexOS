package com.reflexos.ai.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class SprintPlanRequest {
    private String prompt;
    private UUID projectId;
}
