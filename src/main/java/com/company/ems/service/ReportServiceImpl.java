package com.company.ems.service;

import com.company.ems.entity.Attendance;
import com.company.ems.entity.Project;
import com.company.ems.entity.Task;
import com.company.ems.repository.AttendanceRepository;
import com.company.ems.repository.ProjectRepository;
import com.company.ems.repository.TaskRepository;
import com.lowagie.text.Chunk;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.util.List;

@Service
public class ReportServiceImpl implements ReportService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Override
    public ByteArrayInputStream generateTaskReportPdf() {
        Document document = new Document(PageSize.A4);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            com.lowagie.text.Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, Color.BLUE);
            Paragraph title = new Paragraph("Employee Task Report", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(Chunk.NEWLINE);

            PdfPTable table = new PdfPTable(6);
            table.setWidthPercentage(100);
            table.setWidths(new float[] {1f, 3f, 2f, 2f, 2f, 2f});

            String[] headers = {"ID", "Title", "Project", "Assigned To", "Status", "Priority"};
            for (String header : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(header, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.WHITE)));
                cell.setBackgroundColor(Color.DARK_GRAY);
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                table.addCell(cell);
            }

            List<Task> tasks = taskRepository.findAll();
            for (Task task : tasks) {
                table.addCell(String.valueOf(task.getId()));
                table.addCell(task.getTitle());
                table.addCell(task.getProject() != null ? task.getProject().getName() : "-");
                table.addCell(task.getAssignedTo() != null ? task.getAssignedTo().getFirstName() + " " + task.getAssignedTo().getLastName() : "Unassigned");
                table.addCell(task.getStatus().name());
                table.addCell(task.getPriority().name());
            }

            document.add(table);
            document.close();
        } catch (Exception e) {
            e.printStackTrace();
        }

        return new ByteArrayInputStream(out.toByteArray());
    }

    @Override
    public ByteArrayInputStream generateTaskReportExcel() {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Task Report");

            org.apache.poi.ss.usermodel.Row headerRow = sheet.createRow(0);
            String[] columns = {"Task ID", "Title", "Description", "Project", "Assigned Employee", "Status", "Priority", "Due Date"};

            CellStyle headerCellStyle = workbook.createCellStyle();
            org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerCellStyle.setFont(headerFont);

            for (int i = 0; i < columns.length; i++) {
                org.apache.poi.ss.usermodel.Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerCellStyle);
            }

            List<Task> tasks = taskRepository.findAll();
            int rowIdx = 1;
            for (Task task : tasks) {
                org.apache.poi.ss.usermodel.Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(task.getId());
                row.createCell(1).setCellValue(task.getTitle());
                row.createCell(2).setCellValue(task.getDescription() != null ? task.getDescription() : "");
                row.createCell(3).setCellValue(task.getProject() != null ? task.getProject().getName() : "");
                row.createCell(4).setCellValue(task.getAssignedTo() != null ? task.getAssignedTo().getFirstName() + " " + task.getAssignedTo().getLastName() : "Unassigned");
                row.createCell(5).setCellValue(task.getStatus().name());
                row.createCell(6).setCellValue(task.getPriority().name());
                row.createCell(7).setCellValue(task.getDueDate() != null ? task.getDueDate().toString() : "");
            }

            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate Excel report: " + e.getMessage());
        }
    }

    @Override
    public ByteArrayInputStream generateProjectProgressPdf() {
        Document document = new Document(PageSize.A4);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            com.lowagie.text.Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, Color.DARK_GRAY);
            Paragraph title = new Paragraph("Project Progress Report", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(Chunk.NEWLINE);

            PdfPTable table = new PdfPTable(5);
            table.setWidthPercentage(100);
            table.setWidths(new float[] {1f, 3f, 2f, 2f, 2f});

            String[] headers = {"ID", "Project Name", "Status", "Priority", "Assigned Team Size"};
            for (String header : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(header, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.WHITE)));
                cell.setBackgroundColor(Color.BLUE);
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                table.addCell(cell);
            }

            List<Project> projects = projectRepository.findAll();
            for (Project project : projects) {
                table.addCell(String.valueOf(project.getId()));
                table.addCell(project.getName());
                table.addCell(project.getStatus().name());
                table.addCell(project.getPriority().name());
                table.addCell(String.valueOf(project.getAssignedEmployees().size()));
            }

            document.add(table);
            document.close();
        } catch (Exception e) {
            e.printStackTrace();
        }

        return new ByteArrayInputStream(out.toByteArray());
    }

    @Override
    public ByteArrayInputStream generateAttendanceReportPdf() {
        Document document = new Document(PageSize.A4);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            com.lowagie.text.Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, new Color(2, 132, 199));
            Paragraph title = new Paragraph("Smart EMS - Employee Attendance Report", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(Chunk.NEWLINE);

            PdfPTable table = new PdfPTable(7);
            table.setWidthPercentage(100);
            table.setWidths(new float[] {1f, 2f, 2.5f, 2f, 2f, 2f, 2.5f});

            String[] headers = {"ID", "Date", "Employee Name", "Department", "Check-In", "Check-Out", "Status"};
            for (String header : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(header, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.WHITE)));
                cell.setBackgroundColor(new Color(15, 23, 42));
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                table.addCell(cell);
            }

            List<Attendance> attendances = attendanceRepository.findAll();
            for (Attendance a : attendances) {
                table.addCell(String.valueOf(a.getId()));
                table.addCell(a.getAttendanceDate() != null ? a.getAttendanceDate().toString() : "-");
                table.addCell(a.getEmployee() != null ? a.getEmployee().getFirstName() + " " + a.getEmployee().getLastName() : "Unknown");
                table.addCell(a.getEmployee() != null ? a.getEmployee().getDepartment() : "General");
                table.addCell(a.getCheckInTime() != null ? a.getCheckInTime().toString() : "--:--");
                table.addCell(a.getCheckOutTime() != null ? a.getCheckOutTime().toString() : "--:--");
                table.addCell(a.getStatus().name());
            }

            document.add(table);
            document.close();
        } catch (Exception e) {
            e.printStackTrace();
        }

        return new ByteArrayInputStream(out.toByteArray());
    }

    @Override
    public ByteArrayInputStream generateAttendanceReportExcel() {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Attendance Log");

            org.apache.poi.ss.usermodel.Row headerRow = sheet.createRow(0);
            String[] columns = {"ID", "Attendance Date", "Employee Name", "Department", "Check-In Time", "Check-Out Time", "Status", "Remarks"};

            CellStyle headerCellStyle = workbook.createCellStyle();
            org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerCellStyle.setFont(headerFont);

            for (int i = 0; i < columns.length; i++) {
                org.apache.poi.ss.usermodel.Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerCellStyle);
            }

            List<Attendance> attendances = attendanceRepository.findAll();
            int rowIdx = 1;
            for (Attendance a : attendances) {
                org.apache.poi.ss.usermodel.Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(a.getId());
                row.createCell(1).setCellValue(a.getAttendanceDate() != null ? a.getAttendanceDate().toString() : "");
                row.createCell(2).setCellValue(a.getEmployee() != null ? a.getEmployee().getFirstName() + " " + a.getEmployee().getLastName() : "Unknown");
                row.createCell(3).setCellValue(a.getEmployee() != null ? a.getEmployee().getDepartment() : "General");
                row.createCell(4).setCellValue(a.getCheckInTime() != null ? a.getCheckInTime().toString() : "");
                row.createCell(5).setCellValue(a.getCheckOutTime() != null ? a.getCheckOutTime().toString() : "");
                row.createCell(6).setCellValue(a.getStatus().name());
                row.createCell(7).setCellValue(a.getRemarks() != null ? a.getRemarks() : "");
            }

            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate Attendance Excel report: " + e.getMessage());
        }
    }
}
