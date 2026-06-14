package com.reflexos.project;

import com.reflexos.project.dto.ProjectRequest;
import com.reflexos.project.dto.ProjectResponse;
import com.reflexos.workspace.Workspace;
import com.reflexos.workspace.WorkspaceMemberRepository;
import com.reflexos.workspace.WorkspaceRepository;
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
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;

    @Transactional
    public ProjectResponse createProject(UUID workspaceId, UUID userId, ProjectRequest request) {
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Workspace not found"));

        if (!workspace.getOwner().getId().equals(userId) &&
                !workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspaceId, userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not a member of this workspace");
        }

        Project project = Project.builder()
                .title(request.getTitle())
                .status(request.getStatus() != null ? request.getStatus() : "ACTIVE")
                .workspace(workspace)
                .build();

        return mapToResponse(projectRepository.save(project));
    }

    public List<ProjectResponse> getWorkspaceProjects(UUID workspaceId, UUID userId) {
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Workspace not found"));

        if (!workspace.getOwner().getId().equals(userId) &&
                !workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspaceId, userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not a member of this workspace");
        }

        return projectRepository.findByWorkspaceId(workspaceId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private ProjectResponse mapToResponse(Project project) {
        return ProjectResponse.builder()
                .id(project.getId())
                .title(project.getTitle())
                .status(project.getStatus())
                .workspaceId(project.getWorkspace().getId())
                .createdAt(project.getCreatedAt())
                .build();
    }
}
