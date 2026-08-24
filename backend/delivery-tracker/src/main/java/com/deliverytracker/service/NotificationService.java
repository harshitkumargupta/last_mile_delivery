package com.deliverytracker.service;

import com.deliverytracker.entity.Notification;
import com.deliverytracker.entity.Order;
import com.deliverytracker.entity.User;
import com.deliverytracker.repository.NotificationRepository;
import com.deliverytracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    // =========================================================
    // ORDER STATUS NOTIFICATION
    // =========================================================

    @Transactional
    public Notification notifyOrderStatus(
            Order order,
            Order.Status status) {

        User customer = order.getCustomer();

        if (customer == null) {
            throw new IllegalArgumentException(
                    "Order has no customer"
            );
        }

        String title;
        String message;
        Notification.NotificationType type;

        switch (status) {

            case CREATED -> {
                title = "Order Created";
                message =
                        "Your order "
                                + order.getOrderNumber()
                                + " has been created successfully.";
                type =
                        Notification.NotificationType.ORDER_CREATED;
            }

            case PICKED_UP -> {
                title = "Order Picked Up";
                message =
                        "Your order "
                                + order.getOrderNumber()
                                + " has been picked up.";
                type =
                        Notification.NotificationType.ORDER_PICKED_UP;
            }

            case IN_TRANSIT -> {
                title = "Order In Transit";
                message =
                        "Your order "
                                + order.getOrderNumber()
                                + " is now in transit.";
                type =
                        Notification.NotificationType.ORDER_IN_TRANSIT;
            }

            case OUT_FOR_DELIVERY -> {
                title = "Out For Delivery";
                message =
                        "Your order "
                                + order.getOrderNumber()
                                + " is out for delivery.";
                type =
                        Notification.NotificationType.ORDER_OUT_FOR_DELIVERY;
            }

            case DELIVERED -> {
                title = "Order Delivered";
                message =
                        "Your order "
                                + order.getOrderNumber()
                                + " has been successfully delivered.";
                type =
                        Notification.NotificationType.ORDER_DELIVERED;
            }

            case FAILED -> {
                title = "Delivery Failed";
                message =
                        "Delivery of your order "
                                + order.getOrderNumber()
                                + " could not be completed.";
                type =
                        Notification.NotificationType.ORDER_FAILED;
            }

            case RESCHEDULED -> {
                title = "Order Rescheduled";
                message =
                        "Your order "
                                + order.getOrderNumber()
                                + " has been rescheduled.";
                type =
                        Notification.NotificationType.ORDER_RESCHEDULED;
            }

            default -> {
                title = "Order Update";
                message =
                        "Your order "
                                + order.getOrderNumber()
                                + " status has been updated to "
                                + status + ".";
                type =
                        Notification.NotificationType.GENERAL;
            }
        }

        Notification notification =
                Notification.builder()
                        .user(customer)
                        .title(title)
                        .message(message)
                        .type(type)
                        .read(false)
                        .build();

        return notificationRepository.save(notification);
    }

    // =========================================================
    // CREATE GENERAL NOTIFICATION
    // =========================================================

    @Transactional
    public Notification createNotification(
            Long userId,
            String title,
            String message,
            Notification.NotificationType type) {

        User user =
                userRepository.findById(userId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "User not found with id: "
                                                + userId
                                )
                        );

        Notification notification =
                Notification.builder()
                        .user(user)
                        .title(title)
                        .message(message)
                        .type(type)
                        .read(false)
                        .build();

        return notificationRepository.save(notification);
    }

    // =========================================================
    // GET ALL USER NOTIFICATIONS
    // =========================================================

    @Transactional(readOnly = true)
    public List<Notification> getUserNotifications(
            Long userId) {

        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException(
                    "User not found with id: " + userId
            );
        }

        return notificationRepository
                .findByUserIdOrderByCreatedAtDesc(userId);
    }

    // =========================================================
    // GET UNREAD NOTIFICATIONS
    // =========================================================

    @Transactional(readOnly = true)
    public List<Notification> getUnreadNotifications(
            Long userId) {

        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException(
                    "User not found with id: " + userId
            );
        }

        return notificationRepository
                .findByUserIdAndReadFalseOrderByCreatedAtDesc(
                        userId
                );
    }

    // =========================================================
    // GET UNREAD COUNT
    // =========================================================

    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {

        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException(
                    "User not found with id: " + userId
            );
        }

        return notificationRepository
                .countByUserIdAndReadFalse(userId);
    }

    // =========================================================
    // MARK ONE NOTIFICATION AS READ
    // =========================================================

    @Transactional
    public void markAsRead(
            Long notificationId,
            Long userId) {

        Notification notification =
                notificationRepository
                        .findById(notificationId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Notification not found with id: "
                                                + notificationId
                                )
                        );

        if (!notification.getUser()
                .getId()
                .equals(userId)) {

            throw new IllegalArgumentException(
                    "Notification does not belong to this user"
            );
        }

        notification.setRead(true);

        notificationRepository.save(notification);
    }

    // =========================================================
    // MARK ALL AS READ
    // =========================================================

    @Transactional
    public void markAllAsRead(Long userId) {

        List<Notification> notifications =
                notificationRepository
                        .findByUserIdAndReadFalseOrderByCreatedAtDesc(
                                userId
                        );

        notifications.forEach(
                notification -> notification.setRead(true)
        );

        notificationRepository.saveAll(notifications);
    }
}