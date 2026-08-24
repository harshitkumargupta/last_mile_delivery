package com.deliverytracker.repository;

import com.deliverytracker.entity.Order;
import com.deliverytracker.entity.OrderTrackingHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderTrackingHistoryRepository
        extends JpaRepository<OrderTrackingHistory, Long> {

    List<OrderTrackingHistory> findByOrderIdOrderByTimestampAsc(Long orderId);
}