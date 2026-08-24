package com.deliverytracker.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailNotificationService {

    private final JavaMailSender mailSender;

    public void sendOrderNotification(
            String email,
            String orderNumber,
            String status) {

        try {

            SimpleMailMessage message =
                    new SimpleMailMessage();

            message.setTo(email);

            message.setSubject(
                    "Order Update - " + orderNumber
            );

            message.setText(
                    "Hello,\n\n"
                            + "Your order "
                            + orderNumber
                            + " has been updated.\n\n"
                            + "Current Status: "
                            + status
                            + "\n\n"
                            + "Thank you for using "
                            + "Last-Mile Delivery Tracker."
            );

            mailSender.send(message);

        } catch (Exception e) {

            // Email failure should NOT cancel the order
            System.err.println(
                    "Email notification failed: "
                            + e.getMessage()
            );
        }
    }
}