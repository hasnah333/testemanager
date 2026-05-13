package com.test.testmanagement.controller;

import com.test.testmanagement.service.FileStorageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/files")
public class FileUploadController {

    private final FileStorageService storageService;

    public FileUploadController(FileStorageService storageService) {
        this.storageService = storageService;
    }

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file) {
        String filename = storageService.save(file);
        // On renvoie l'URL complète pour accéder au fichier
        String fileUrl = "http://localhost:8081/uploads/" + filename;
        return ResponseEntity.ok(Map.of("url", fileUrl));
    }
}
