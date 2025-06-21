package com.boussas.email_reply_generator.service;

import com.boussas.email_reply_generator.dto.EmailRequest;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.HashMap;
import java.util.Map;

@Service
public class EmailGeneratorService {
    private final WebClient webClient;
    public EmailGeneratorService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }
    @Value("${gemini.api.url}")
    private String geminiApiUrl;
    @Value("${gemini.api.key}")
    private String apiKey;



    public String generateEmail(EmailRequest emailRequest) {
        String Prompt = buildPrompt(emailRequest);
        // Craft a request
        Map<String, Object> requestBody = Map.of(
                "contents", new Object[]{
                        Map.of(
                                "parts", new Object[]{
                                        Map.of("text", Prompt)
                                }
                        )
                }
        );
        String response = webClient.post().uri(geminiApiUrl+apiKey)
                .header("Content-Type","application/json")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .block();
        return extractResponseContent(response);
        // Do request and get a response
        // return response
    }

    private String extractResponseContent(String response) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(response);
            return root.path("candidates")
                    .get(0)
                    .path("content")
                    .path("parts")
                    .get(0)
                    .path("text")
                    .asText();
        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }


    private String buildPrompt(EmailRequest emailRequest) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("Generate an email reply with the same email content language for the following email content,without a subject line or anything besides email content , just email body nothing else.");
        prompt.append("\nEmail content: ");
        if(emailRequest.getTone()!=null && !emailRequest.getTone().isEmpty()) {
            prompt.append("with a ").append(emailRequest.getTone()).append(" tone\n");
        };
        prompt.append("original email content: ").append(emailRequest.getEmailContent());
        return prompt.toString();
    }
}
