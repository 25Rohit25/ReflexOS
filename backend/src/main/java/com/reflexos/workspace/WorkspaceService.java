package com.reflexos.workspace;

import com.reflexos.user.User;
import com.reflexos.user.UserRepository;
import com.reflexos.workspace.dto.InviteMemberRequest;
import com.reflexos.workspace.dto.WorkspaceRequest;
import com.reflexos.workspace.dto.WorkspaceResponse;
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
public class WorkspaceService {

    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final UserRepository userRepository;

    @Transactional
    public WorkspaceResponse createWorkspace(UUID ownerId, WorkspaceRequest request) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Workspace workspace = Workspace.builder()
                .name(request.getName())
                .owner(owner)
                .build();

        Workspace savedWorkspace = workspaceRepository.save(workspace);

        return mapToResponse(savedWorkspace);
    }

    public List<WorkspaceResponse> getUserWorkspaces(UUID userId) {
        List<Workspace> ownedWorkspaces = workspaceRepository.findByOwnerId(userId);
        
        // Also get workspaces where user is a member
        // For simplicity, we just return owned workspaces right now based on original controller.
        // To be complete, we should combine owned and member workspaces.
        // Let's assume we return owned for now, or just map what findByOwnerId returns.
        return ownedWorkspaces.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public WorkspaceResponse updateWorkspace(UUID workspaceId, UUID ownerId, WorkspaceRequest request) {
        Workspace workspace = getWorkspaceIfOwner(workspaceId, ownerId);
        workspace.setName(request.getName());
        return mapToResponse(workspaceRepository.save(workspace));
    }

    @Transactional
    public void deleteWorkspace(UUID workspaceId, UUID ownerId) {
        Workspace workspace = getWorkspaceIfOwner(workspaceId, ownerId);
        workspaceRepository.delete(workspace);
    }

    @Transactional
    public void inviteUser(UUID workspaceId, UUID ownerId, InviteMemberRequest request) {
        Workspace workspace = getWorkspaceIfOwner(workspaceId, ownerId);

        User userToInvite = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User to invite not found"));

        if (workspace.getOwner().getId().equals(userToInvite.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot invite the owner");
        }

        if (workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspaceId, userToInvite.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User is already a member or invited");
        }

        WorkspaceMember member = WorkspaceMember.builder()
                .workspace(workspace)
                .user(userToInvite)
                .status(WorkspaceMemberStatus.PENDING)
                .build();

        workspaceMemberRepository.save(member);
    }

    @Transactional
    public void acceptInvitation(UUID workspaceId, UUID userId) {
        WorkspaceMember member = workspaceMemberRepository.findByWorkspaceIdAndUserId(workspaceId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invitation not found"));

        if (member.getStatus() == WorkspaceMemberStatus.ACCEPTED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invitation already accepted");
        }

        member.setStatus(WorkspaceMemberStatus.ACCEPTED);
        workspaceMemberRepository.save(member);
    }

    @Transactional
    public void removeMember(UUID workspaceId, UUID ownerId, UUID memberUserId) {
        Workspace workspace = getWorkspaceIfOwner(workspaceId, ownerId);

        WorkspaceMember member = workspaceMemberRepository.findByWorkspaceIdAndUserId(workspaceId, memberUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Member not found in workspace"));

        workspaceMemberRepository.delete(member);
    }

    private Workspace getWorkspaceIfOwner(UUID workspaceId, UUID ownerId) {
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Workspace not found"));

        if (!workspace.getOwner().getId().equals(ownerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the owner can perform this action");
        }
        return workspace;
    }

    private WorkspaceResponse mapToResponse(Workspace workspace) {
        return WorkspaceResponse.builder()
                .id(workspace.getId())
                .name(workspace.getName())
                .ownerId(workspace.getOwner().getId())
                .ownerName(workspace.getOwner().getName())
                .createdAt(workspace.getCreatedAt())
                .build();
    }
}
