package com.reflexos.sprint;

import com.reflexos.project.Project;
import com.reflexos.project.ProjectRepository;
import com.reflexos.sprint.dto.SprintRequest;
import com.reflexos.sprint.dto.SprintResponse;
import com.reflexos.workspace.WorkspaceMemberRepository;
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
public class SprintService {

    private final SprintRepository sprintRepository;
    private final ProjectRepository projectRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;

    @Transactional
    public SprintResponse createSprint(UUID projectId, UUID userId, SprintRequest request) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));

        UUID workspaceId = project.getWorkspace().getId();

        if (!project.getWorkspace().getOwner().getId().equals(userId) &&
                !workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspaceId, userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not a member of this workspace");
        }

        Sprint sprint = Sprint.builder()
                .name(request.getName())
                .project(project)
                .build();

        return mapToResponse(sprintRepository.save(sprint));
    }

    public List<SprintResponse> getProjectSprints(UUID projectId, UUID userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));

        UUID workspaceId = project.getWorkspace().getId();

        if (!project.getWorkspace().getOwner().getId().equals(userId) &&
                !workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspaceId, userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not a member of this workspace");
        }

        return sprintRepository.findByProjectId(projectId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private SprintResponse mapToResponse(Sprint sprint) {
        return SprintResponse.builder()
                .id(sprint.getId())
                .name(sprint.getName())
                .projectId(sprint.getProject().getId())
                .createdAt(sprint.getCreatedAt())
                .build();
    }
}
