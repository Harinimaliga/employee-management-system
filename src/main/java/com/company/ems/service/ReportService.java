package com.company.ems.service;

import java.io.ByteArrayInputStream;

public interface ReportService {
    ByteArrayInputStream generateTaskReportPdf();
    ByteArrayInputStream generateTaskReportExcel();
    ByteArrayInputStream generateProjectProgressPdf();
    ByteArrayInputStream generateAttendanceReportPdf();
    ByteArrayInputStream generateAttendanceReportExcel();
}
