package com.company.ems.controller;

import com.company.ems.entity.AuditLog;
import com.company.ems.repository.AuditLogRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/audit-logs")
@Tag(name = "Audit Trail", description = "System Operations & Security Audit Log APIs")
public class AuditLogController {

    @Autowired
    private AuditLogRepository auditLogRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    @Operation(summary = "Get Audit Logs", description = "Retrieves a list of all system audit logs.")
    public ResponseEntity<List<AuditLog>> getAuditLogs() {
        return ResponseEntity.ok(auditLogRepository.findAll());
    }
}
