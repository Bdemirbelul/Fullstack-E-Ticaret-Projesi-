package com.example.auth.order.service;

import com.example.auth.cart.entity.Cart;
import com.example.auth.cart.entity.CartItem;
import com.example.auth.cart.service.CartService;
import com.example.auth.entity.User;
import com.example.auth.exception.ApiException;
import com.example.auth.order.dto.OrderItemResponse;
import com.example.auth.order.dto.OrderResponse;
import com.example.auth.order.entity.Order;
import com.example.auth.order.entity.OrderItem;
import com.example.auth.order.entity.OrderStatus;
import com.example.auth.order.repository.OrderRepository;
import com.example.auth.product.entity.Product;
import com.example.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final CartService cartService;

    @Transactional
    public OrderResponse createFromCart(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));

        Cart cart = cartService.getOrCreateCartEntity(userEmail);
        if (cart.getItems().isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Cart is empty");
        }

        Order order = Order.builder()
                .user(user)
                .status(OrderStatus.CREATED)
                .build();

        BigDecimal total = BigDecimal.ZERO;
        for (CartItem cartItem : cart.getItems()) {
            Product product = cartItem.getProduct();

            if (product.getStock() < cartItem.getQuantity()) {
                throw new ApiException(
                        HttpStatus.CONFLICT,
                        "Insufficient stock for productId=" + product.getId()
                );
            }

            product.setStock(product.getStock() - cartItem.getQuantity());

            BigDecimal unitPrice = product.getPrice();
            BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            total = total.add(lineTotal);

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(cartItem.getQuantity())
                    .unitPrice(unitPrice)
                    .lineTotal(lineTotal)
                    .build();

            order.getItems().add(orderItem);
        }

        order.setTotal(total);
        Order saved = orderRepository.save(order);

        cart.getItems().clear();
        log.info("Order created from cart orderId={} user={}", saved.getId(), userEmail);

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> listMyOrders(String userEmail, Pageable pageable) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));

        return orderRepository.findAllByUser(user, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public OrderResponse getMyOrder(String userEmail, long orderId) {
        Order order = getEntity(orderId);
        if (!order.getUser().getEmail().equalsIgnoreCase(userEmail)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Forbidden");
        }
        return toResponse(order);
    }

    @Transactional
    public OrderResponse updateStatus(long orderId, OrderStatus status) {
        Order order = getEntity(orderId);
        order.setStatus(status);
        Order saved = orderRepository.save(order);
        log.info("Order status updated orderId={} status={}", orderId, status);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public Order getEntity(long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Order not found: " + id));
    }

    private OrderResponse toResponse(Order order) {
        List<OrderItemResponse> items = order.getItems().stream()
                .map(i -> new OrderItemResponse(
                        i.getProduct().getId(),
                        i.getProduct().getName(),
                        i.getUnitPrice(),
                        i.getQuantity(),
                        i.getLineTotal()
                ))
                .toList();

        return new OrderResponse(
                order.getId(),
                order.getStatus(),
                order.getTotal(),
                items,
                order.getCreatedAt()
        );
    }
}

