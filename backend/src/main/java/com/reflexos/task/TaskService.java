package com.reflexos.task;

import com.reflexos.project.Project;
import com.reflexos.project.ProjectRepository;
import com.reflexos.sprint.Sprint;
import com.reflexos.sprint.SprintRepository;
import com.reflexos.task.dto.TaskRequest;
import com.reflexos.task.dto.TaskResponse;
import com.reflexos.user.User;
import com.reflexos.user.UserRepository;
import com.reflexos.workspace.WorkspaceMemberRepository;
import com.reflexos.kafka.KafkaProducerService;
import com.reflexos.kafka.dto.TaskEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final SprintRepository sprintRepository;
    private final UserRepository userRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final KafkaProducerService kafkaProducerService;

    @Transactional
    public TaskResponse createTask(UUID projectId, UUID sprintId, UUID userId, TaskRequest request) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));

        validateWorkspaceMembership(project, userId);

        Sprint sprint = null;
        if (sprintId != null) {
            sprint = sprintRepository.findById(sprintId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sprint not found"));
            if (!sprint.getProject().getId().equals(projectId)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Sprint does not belong to the given project");
            }
        }

        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .status(TaskStatus.TODO)
                .project(project)
                .sprint(sprint)
                .build();

        Task saved = taskRepository.save(task);
        kafkaProducerService.publishTaskEvent(new TaskEvent(saved.getId(), projectId, "CREATED", userId));
        return mapToResponse(saved);
    }

    public List<TaskResponse> getProjectTasks(UUID projectId, UUID userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));
        
        validateWorkspaceMembership(project, userId);

        return taskRepository.findByProjectId(projectId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public TaskResponse assignTask(UUID taskId, UUID assigneeId, UUID userId) {
        Task task = getTaskAndValidateAccess(taskId, userId);

        User assignee = userRepository.findById(assigneeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Assignee user not found"));

        validateWorkspaceMembership(task.getProject(), assigneeId);

        task.setAssignee(assignee);
        Task saved = taskRepository.save(task);
        kafkaProducerService.publishTaskEvent(new TaskEvent(saved.getId(), saved.getProject().getId(), "ASSIGNED", userId));
        return mapToResponse(saved);
    }

    @Transactional
    public TaskResponse changeTaskStatus(UUID taskId, TaskStatus status, UUID userId) {
        Task task = getTaskAndValidateAccess(taskId, userId);
        task.setStatus(status);
        Task saved = taskRepository.save(task);
        kafkaProducerService.publishTaskEvent(new TaskEvent(saved.getId(), saved.getProject().getId(), "UPDATED", userId));
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteTask(UUID taskId, UUID userId) {
        Task task = getTaskAndValidateAccess(taskId, userId);
        taskRepository.delete(task);
        kafkaProducerService.publishTaskEvent(new TaskEvent(taskId, task.getProject().getId(), "DELETED", userId));
    }

    private Task getTaskAndValidateAccess(UUID taskId, UUID userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));
        validateWorkspaceMembership(task.getProject(), userId);
        return task;
    }

    private void validateWorkspaceMembership(Project project, UUID userId) {
        UUID workspaceId = project.getWorkspace().getId();
        if (!project.getWorkspace().getOwner().getId().equals(userId) &&
                !workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspaceId, userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not a member of this workspace");
        }
    }

    private TaskResponse mapToResponse(Task task) {
        return TaskResponse.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .status(task.getStatus())
                .projectId(task.getProject().getId())
                .sprintId(task.getSprint() != null ? task.getSprint().getId() : null)
                .assigneeId(task.getAssignee() != null ? task.getAssignee().getId() : null)
                .assigneeName(task.getAssignee() != null ? task.getAssignee().getName() : null)
                .createdAt(task.getCreatedAt())
                .build();
    }
}
