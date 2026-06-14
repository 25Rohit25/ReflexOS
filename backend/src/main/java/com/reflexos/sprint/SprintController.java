package com.reflexos.sprint;

import com.reflexos.sprint.dto.SprintRequest;
import com.reflexos.sprint.dto.SprintResponse;
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
@RequestMapping("/api/projects/{projectId}/sprints")
@RequiredArgsConstructor
public class SprintController {

    private final SprintService sprintService;

    @PostMapping
    public ResponseEntity<SprintResponse> createSprint(
            @PathVariable UUID projectId,
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody SprintRequest request) {
        UUID userId = ((UserDetailsImpl) userDetails).getId();
        return ResponseEntity.ok(sprintService.createSprint(projectId, userId, request));
    }

    @GetMapping
    public ResponseEntity<List<SprintResponse>> getSprints(
            @PathVariable UUID projectId,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = ((UserDetailsImpl) userDetails).getId();
        return ResponseEntity.ok(sprintService.getProjectSprints(projectId, userId));
    }
}
