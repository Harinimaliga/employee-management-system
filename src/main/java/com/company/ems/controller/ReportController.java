package com.company.ems.controller;

import com.company.ems.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.ByteArrayInputStream;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/reports")
@Tag(name = "Reports & Exports", description = "PDF Document Streams and Excel Spreadsheet Exporters")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @GetMapping("/tasks/pdf")
    @Operation(summary = "Export Tasks PDF Report")
    public ResponseEntity<InputStreamResource> exportTaskReportPdf() {
        ByteArrayInputStream bis = reportService.generateTaskReportPdf();
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=task_report.pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(bis));
    }

    @GetMapping("/tasks/excel")
    @Operation(summary = "Export Tasks Excel Dataset")
    public ResponseEntity<InputStreamResource> exportTaskReportExcel() {
        ByteArrayInputStream bis = reportService.generateTaskReportExcel();
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=task_report.xlsx");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new InputStreamResource(bis));
    }

    @GetMapping("/projects/pdf")
    @Operation(summary = "Export Projects PDF Summary")
    public ResponseEntity<InputStreamResource> exportProjectProgressPdf() {
        ByteArrayInputStream bis = reportService.generateProjectProgressPdf();
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=project_progress_report.pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(bis));
    }

    @GetMapping("/attendance/pdf")
    @Operation(summary = "Export Attendance PDF Report")
    public ResponseEntity<InputStreamResource> exportAttendanceReportPdf() {
        ByteArrayInputStream bis = reportService.generateAttendanceReportPdf();
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=attendance_report.pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(bis));
    }

    @GetMapping("/attendance/excel")
    @Operation(summary = "Export Attendance Excel Dataset")
    public ResponseEntity<InputStreamResource> exportAttendanceReportExcel() {
        ByteArrayInputStream bis = reportService.generateAttendanceReportExcel();
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=attendance_report.xlsx");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new InputStreamResource(bis));
    }
}
