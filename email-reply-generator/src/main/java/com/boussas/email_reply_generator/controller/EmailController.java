package com.boussas.email_reply_generator.controller;

import com.boussas.email_reply_generator.dto.EmailRequest;
import com.boussas.email_reply_generator.service.EmailGeneratorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/email")
@CrossOrigin(origins = "*")
public class EmailController {
    private final EmailGeneratorService service;

    public EmailController(EmailGeneratorService service) {
        this.service = service;
    }

    @PostMapping("/generate")
    public ResponseEntity<String> generateEmail(@RequestBody EmailRequest emailRequest) {
        String response = service.generateEmail(emailRequest);
        return ResponseEntity.ok(response);
    }
}
