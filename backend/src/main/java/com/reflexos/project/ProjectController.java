package com.reflexos.project;

import com.reflexos.project.dto.ProjectRequest;
import com.reflexos.project.dto.ProjectResponse;
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
@RequestMapping("/api/workspaces/{workspaceId}/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @PostMapping
    public ResponseEntity<ProjectResponse> createProject(
            @PathVariable UUID workspaceId,
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ProjectRequest request) {
        UUID userId = ((UserDetailsImpl) userDetails).getId();
        return ResponseEntity.ok(projectService.createProject(workspaceId, userId, request));
    }

    @GetMapping
    public ResponseEntity<List<ProjectResponse>> getProjects(
            @PathVariable UUID workspaceId,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = ((UserDetailsImpl) userDetails).getId();
        return ResponseEntity.ok(projectService.getWorkspaceProjects(workspaceId, userId));
    }
}
