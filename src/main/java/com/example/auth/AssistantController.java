package com.example.auth;

import com.example.auth.assistant.dto.AssistantChatRequest;
import com.example.auth.assistant.dto.AssistantChatResponse;
import com.example.auth.assistant.service.AssistantService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Root package controller so component scanning (same base as {@link AuthApplication}) always picks this up.
 * OpenAPI: tagged and without global bearer requirement so Swagger "Try it out" works without a JWT.
 */
@RestController
@RequestMapping("/api/assistant")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Tag(name = "Shopping assistant", description = "AI müşteri asistanı (Ollama)")
@SecurityRequirements
public class AssistantController {

    private final AssistantService assistantService;

    @PostMapping("/chat")
    @Operation(summary = "Asistan ile sohbet")
    public ResponseEntity<AssistantChatResponse> chat(@Valid @RequestBody AssistantChatRequest request) {
        String reply = assistantService.chat(request);
        return ResponseEntity.ok(new AssistantChatResponse(reply));
    }
}
