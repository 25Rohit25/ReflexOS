package com.reflexos.workspace;

import com.reflexos.security.UserDetailsImpl;
import com.reflexos.workspace.dto.InviteMemberRequest;
import com.reflexos.workspace.dto.WorkspaceRequest;
import com.reflexos.workspace.dto.WorkspaceResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/workspaces")
@RequiredArgsConstructor
public class WorkspaceController {

    private final WorkspaceService workspaceService;

    @GetMapping
    public ResponseEntity<List<WorkspaceResponse>> getUserWorkspaces(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(workspaceService.getUserWorkspaces(userDetails.getId()));
    }

    @PostMapping
    public ResponseEntity<WorkspaceResponse> createWorkspace(@Valid @RequestBody WorkspaceRequest request,
                                                             @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(workspaceService.createWorkspace(userDetails.getId(), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<WorkspaceResponse> updateWorkspace(@PathVariable UUID id,
                                                             @Valid @RequestBody WorkspaceRequest request,
                                                             @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(workspaceService.updateWorkspace(id, userDetails.getId(), request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorkspace(@PathVariable UUID id,
                                                @AuthenticationPrincipal UserDetailsImpl userDetails) {
        workspaceService.deleteWorkspace(id, userDetails.getId());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/invite")
    public ResponseEntity<Void> inviteUser(@PathVariable UUID id,
                                           @Valid @RequestBody InviteMemberRequest request,
                                           @AuthenticationPrincipal UserDetailsImpl userDetails) {
        workspaceService.inviteUser(id, userDetails.getId(), request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/accept")
    public ResponseEntity<Void> acceptInvitation(@PathVariable UUID id,
                                                 @AuthenticationPrincipal UserDetailsImpl userDetails) {
        workspaceService.acceptInvitation(id, userDetails.getId());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/members/{userId}")
    public ResponseEntity<Void> removeMember(@PathVariable UUID id,
                                             @PathVariable UUID userId,
                                             @AuthenticationPrincipal UserDetailsImpl userDetails) {
        workspaceService.removeMember(id, userDetails.getId(), userId);
        return ResponseEntity.noContent().build();
    }
}
