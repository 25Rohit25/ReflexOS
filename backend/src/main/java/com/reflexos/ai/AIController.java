package com.reflexos.ai;

import com.reflexos.document.Document;
import com.reflexos.document.DocumentDto;
import com.reflexos.document.DocumentRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/projects/{projectId}")
public class AIController {

    private final AiKnowledgeService aiKnowledgeService;
    private final DocumentRepository documentRepository;
    private final AIService aiService;

    @PostMapping("/documents")
    public ResponseEntity<DocumentDto> addDocument(@PathVariable UUID projectId, @RequestBody DocumentRequest request) {
        Document saved = aiKnowledgeService.addDocument(projectId, request.getTitle(), request.getContent());
        return ResponseEntity.ok(DocumentDto.builder()
                .id(saved.getId().toString())
                .title(saved.getTitle())
                .content(saved.getContent())
                .projectId(projectId.toString())
                .createdAt(saved.getCreatedAt())
                .build());
    }

    @GetMapping("/documents")
    public ResponseEntity<List<DocumentDto>> getDocuments(@PathVariable UUID projectId) {
        List<Document> docs = documentRepository.findByProjectIdOrderByCreatedAtDesc(projectId);
        List<DocumentDto> dtos = docs.stream().map(doc -> DocumentDto.builder()
                .id(doc.getId().toString())
                .title(doc.getTitle())
                .content(doc.getContent())
                .projectId(projectId.toString())
                .createdAt(doc.getCreatedAt())
                .build()).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/ai/ask")
    public ResponseEntity<AiResponse> askQuestion(@PathVariable UUID projectId, @RequestBody AiRequest request) {
        String answer = aiKnowledgeService.askQuestion(projectId, request.getQuestion());
        return ResponseEntity.ok(new AiResponse(answer));
    }

    @PostMapping("/ai/plan")
    public ResponseEntity<List<com.reflexos.task.dto.TaskResponse>> generateSprintPlan(
            @PathVariable UUID projectId,
            @RequestBody com.reflexos.ai.dto.AiPlanRequest request) {
        return ResponseEntity.ok(aiService.generateSprintPlan(request.getPrompt(), projectId));
    }

    @PostMapping("/ai/meeting")
    public ResponseEntity<com.reflexos.ai.dto.AiMeetingResponse> analyzeMeeting(
            @PathVariable UUID projectId,
            @RequestBody com.reflexos.ai.dto.AiMeetingRequest request) {
        return ResponseEntity.ok(aiService.analyzeMeeting(request.getTranscript(), projectId));
    }

    @Data
    public static class DocumentRequest {
        private String title;
        private String content;
    }

    @Data
    public static class AiRequest {
        private String question;
    }

    @Data
    public static class AiResponse {
        private final String answer;
    }
}
