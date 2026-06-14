package com.reflexos.ai;

import com.reflexos.document.Document;
import com.reflexos.document.DocumentRepository;
import com.reflexos.project.Project;
import com.reflexos.project.ProjectRepository;
import dev.langchain4j.data.document.DocumentSplitter;
import dev.langchain4j.data.document.splitter.DocumentSplitters;
import dev.langchain4j.data.embedding.Embedding;
import dev.langchain4j.data.message.AiMessage;
import dev.langchain4j.data.message.SystemMessage;
import dev.langchain4j.data.message.UserMessage;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.store.embedding.EmbeddingMatch;
import dev.langchain4j.store.embedding.EmbeddingSearchRequest;
import dev.langchain4j.store.embedding.EmbeddingSearchResult;
import dev.langchain4j.store.embedding.EmbeddingStore;
import dev.langchain4j.store.embedding.filter.Filter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import static dev.langchain4j.store.embedding.filter.MetadataFilterBuilder.metadataKey;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiKnowledgeService {

    private final DocumentRepository documentRepository;
    private final ProjectRepository projectRepository;
    private final EmbeddingModel embeddingModel;
    private final ChatLanguageModel chatLanguageModel;
    private final EmbeddingStore<TextSegment> embeddingStore;

    public Document addDocument(UUID projectId, String title, String content) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        Document document = Document.builder()
                .project(project)
                .title(title)
                .content(content)
                .build();
        Document saved = documentRepository.save(document);

        // Langchain4j ingestion
        dev.langchain4j.data.document.Document lcDocument = dev.langchain4j.data.document.Document.from(content);
        lcDocument.metadata().put("projectId", projectId.toString());
        lcDocument.metadata().put("documentId", saved.getId().toString());

        DocumentSplitter splitter = DocumentSplitters.recursive(500, 50);
        List<TextSegment> segments = splitter.split(lcDocument);

        try {
            List<Embedding> embeddings = embeddingModel.embedAll(segments).content();
            embeddingStore.addAll(embeddings, segments);
            log.info("Indexed {} segments for document {}", segments.size(), saved.getId());
        } catch (Exception e) {
            log.warn("Failed to embed and store document to Qdrant (might be unavailable): {}", e.getMessage());
        }

        return saved;
    }

    public String askQuestion(UUID projectId, String question) {
        try {
            Embedding questionEmbedding = embeddingModel.embed(question).content();

            Filter projectFilter = metadataKey("projectId").isEqualTo(projectId.toString());

            EmbeddingSearchRequest searchRequest = EmbeddingSearchRequest.builder()
                    .queryEmbedding(questionEmbedding)
                    .maxResults(5)
                    .filter(projectFilter)
                    .minScore(0.6)
                    .build();

            EmbeddingSearchResult<TextSegment> searchResult = embeddingStore.search(searchRequest);

            String context = searchResult.matches().stream()
                    .map(EmbeddingMatch::embedded)
                    .map(TextSegment::text)
                    .collect(Collectors.joining("\n\n"));

            if (context.isEmpty()) {
                return "I couldn't find any relevant information in this project's knowledge base to answer your question.";
            }

            SystemMessage systemMessage = SystemMessage.from(
                    "You are an AI assistant for a project management tool called ReflexOS. " +
                    "Use the following pieces of retrieved context to answer the user's question. " +
                    "If you don't know the answer, just say that you don't know. Use formatting where appropriate.\n\n" +
                    "Context:\n" + context
            );
            UserMessage userMessage = UserMessage.from(question);

            AiMessage response = chatLanguageModel.generate(systemMessage, userMessage).content();
            return response.text();
            
        } catch (Exception e) {
            log.error("Error during RAG query: ", e);
            return "Sorry, there was an error processing your request. Please ensure the AI services (Ollama/Qdrant) are running.";
        }
    }
}
