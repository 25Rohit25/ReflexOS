package com.reflexos.chat;

import com.reflexos.project.Project;
import com.reflexos.project.ProjectRepository;
import com.reflexos.user.User;
import com.reflexos.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
public class ChatController {

    private final ChatMessageRepository chatMessageRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    @MessageMapping("/chat/{projectId}")
    @SendTo("/topic/project/{projectId}")
    public ChatMessageDto sendMessage(@DestinationVariable String projectId, @Payload ChatMessageDto messageDto) {
        
        Project project = projectRepository.findById(UUID.fromString(projectId))
                .orElseThrow(() -> new RuntimeException("Project not found"));
        User sender = userRepository.findById(UUID.fromString(messageDto.getSenderId()))
                .orElseThrow(() -> new RuntimeException("User not found"));

        ChatMessage message = ChatMessage.builder()
                .content(messageDto.getContent())
                .project(project)
                .sender(sender)
                .timestamp(LocalDateTime.now())
                .build();

        ChatMessage saved = chatMessageRepository.save(message);

        return ChatMessageDto.builder()
                .id(saved.getId().toString())
                .content(saved.getContent())
                .projectId(project.getId().toString())
                .senderId(sender.getId().toString())
                .senderUsername(sender.getName())
                .timestamp(saved.getTimestamp())
                .build();
    }

    @GetMapping("/api/projects/{projectId}/chat")
    public ResponseEntity<List<ChatMessageDto>> getChatHistory(@PathVariable String projectId) {
        List<ChatMessage> messages = chatMessageRepository.findByProjectIdOrderByTimestampAsc(UUID.fromString(projectId));
        List<ChatMessageDto> dtos = messages.stream().map(msg -> ChatMessageDto.builder()
                .id(msg.getId().toString())
                .content(msg.getContent())
                .projectId(msg.getProject().getId().toString())
                .senderId(msg.getSender().getId().toString())
                .senderUsername(msg.getSender().getName())
                .timestamp(msg.getTimestamp())
                .build()).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
}
