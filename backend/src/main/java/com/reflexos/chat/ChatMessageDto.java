package com.reflexos.chat;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessageDto {
    private String id;
    private String content;
    private String projectId;
    private String senderId;
    private String senderUsername;
    private LocalDateTime timestamp;
}
