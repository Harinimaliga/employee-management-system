package com.company.ems.controller;

import com.company.ems.service.FileStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/upload")
@CrossOrigin(origins = "*")
@Tag(name = "File Upload API", description = "Endpoints for uploading employee profile pictures and attachments.")
public class FileUploadController {

    @Autowired
    private FileStorageService fileStorageService;

    @PostMapping("/profile-image")
    @Operation(summary = "Upload Profile Image", description = "Uploads an employee profile image file and returns the direct image URL.")
    public ResponseEntity<Map<String, String>> uploadProfileImage(@RequestParam("file") MultipartFile file) {
        String fileUrl = fileStorageService.storeFile(file);
        Map<String, String> response = new HashMap<>();
        response.put("imageUrl", fileUrl);
        return ResponseEntity.ok(response);
    }
}
