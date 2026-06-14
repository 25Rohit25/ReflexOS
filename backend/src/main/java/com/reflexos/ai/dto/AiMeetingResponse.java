package com.reflexos.ai.dto;

import com.reflexos.task.dto.TaskResponse;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class AiMeetingResponse {
    private String summary;
    private List<TaskResponse> actionItems;
}
