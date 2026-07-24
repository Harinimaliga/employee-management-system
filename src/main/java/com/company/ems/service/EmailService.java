package com.company.ems.service;

public interface EmailService {
    void sendTaskAssignmentEmail(String toEmail, String taskTitle, String projectName, String dueDate);
    void sendWelcomeEmail(String toEmail, String employeeName);
}
