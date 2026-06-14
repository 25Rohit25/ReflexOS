package com.reflexos.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.reflexos.kafka.dto.TaskEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class KafkaConsumerService {

    private final ObjectMapper objectMapper;
    private final SimpMessagingTemplate messagingTemplate;

    @KafkaListener(topics = "task-events", groupId = "reflexos-group")
    public void consumeTaskEvent(String message) {
        try {
            TaskEvent event = objectMapper.readValue(message, TaskEvent.class);
            log.info("Consumed TaskEvent from Kafka: {}", event);

            // Broadcast to the project topic so all clients in the project get real-time updates!
            String destination = "/topic/projects/" + event.getProjectId() + "/tasks";
            messagingTemplate.convertAndSend(destination, event);
            log.info("Broadcasted TaskEvent to WebSocket destination: {}", destination);
        } catch (Exception e) {
            log.error("Failed to process consumed TaskEvent", e);
        }
    }
}
