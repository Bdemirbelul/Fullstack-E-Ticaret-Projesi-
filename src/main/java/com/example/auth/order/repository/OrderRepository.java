package com.example.auth.order.repository;

import com.example.auth.entity.User;
import com.example.auth.order.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long>, JpaSpecificationExecutor<Order> {
    Page<Order> findAllByUser(User user, Pageable pageable);

    @Query("""
            select distinct o from Order o
            left join fetch o.deliveryDetail dd
            left join fetch o.items i
            left join fetch i.product p
            left join fetch p.images
            where o.user.id = :userId
            order by o.createdAt desc
            """)
    List<Order> findAllByUser_IdOrderByCreatedAtDesc(@Param("userId") Long userId);

    @Query("""
            select distinct o from Order o
            join fetch o.user u
            left join fetch o.deliveryDetail dd
            left join fetch o.items i
            left join fetch i.product p
            left join fetch p.images
            where o.id = :id
            """)
    Optional<Order> findWithDetailsById(@Param("id") Long id);

    @EntityGraph(attributePaths = {"user", "items", "items.product", "deliveryDetail"})
    List<Order> findAll();
}
