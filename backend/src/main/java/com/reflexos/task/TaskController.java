package com.reflexos.task;

import com.reflexos.task.dto.AssignTaskRequest;
import com.reflexos.task.dto.TaskRequest;
import com.reflexos.task.dto.TaskResponse;
import com.reflexos.task.dto.UpdateTaskStatusRequest;
import com.reflexos.security.UserDetailsImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/projects/{projectId}/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @PostMapping
    public ResponseEntity<TaskResponse> createTask(
            @PathVariable UUID projectId,
            @RequestParam(required = false) UUID sprintId,
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody TaskRequest request) {
        UUID userId = ((UserDetailsImpl) userDetails).getId();
        return ResponseEntity.ok(taskService.createTask(projectId, sprintId, userId, request));
    }

    @GetMapping
    public ResponseEntity<List<TaskResponse>> getTasks(
            @PathVariable UUID projectId,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = ((UserDetailsImpl) userDetails).getId();
        return ResponseEntity.ok(taskService.getProjectTasks(projectId, userId));
    }

    @PutMapping("/{taskId}/assign")
    public ResponseEntity<TaskResponse> assignTask(
            @PathVariable UUID projectId,
            @PathVariable UUID taskId,
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody AssignTaskRequest request) {
        UUID userId = ((UserDetailsImpl) userDetails).getId();
        return ResponseEntity.ok(taskService.assignTask(taskId, request.getAssigneeId(), userId));
    }

    @PutMapping("/{taskId}/status")
    public ResponseEntity<TaskResponse> updateTaskStatus(
            @PathVariable UUID projectId,
            @PathVariable UUID taskId,
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UpdateTaskStatusRequest request) {
        UUID userId = ((UserDetailsImpl) userDetails).getId();
        return ResponseEntity.ok(taskService.changeTaskStatus(taskId, request.getStatus(), userId));
    }

    @DeleteMapping("/{taskId}")
    public ResponseEntity<Void> deleteTask(
            @PathVariable UUID projectId,
            @PathVariable UUID taskId,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = ((UserDetailsImpl) userDetails).getId();
        taskService.deleteTask(taskId, userId);
        return ResponseEntity.ok().build();
    }
}
