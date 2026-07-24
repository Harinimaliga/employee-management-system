package com.company.ems.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailServiceImpl.class);

    @Override
    public void sendTaskAssignmentEmail(String toEmail, String taskTitle, String projectName, String dueDate) {
        logger.info("📧 [EMAIL NOTIFICATION DISPATCHED] To: {}, Task: '{}', Project: '{}', Due Date: {}", toEmail, taskTitle, projectName, dueDate);
    }

    @Override
    public void sendWelcomeEmail(String toEmail, String employeeName) {
        logger.info("📧 [WELCOME EMAIL DISPATCHED] To: {} ({})", employeeName, toEmail);
    }
}
