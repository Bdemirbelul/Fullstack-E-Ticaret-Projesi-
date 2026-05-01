package com.example.auth.repository;

import com.example.auth.entity.Role;
import com.example.auth.entity.UserRole;
import com.example.auth.entity.UserRoleId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRoleRepository extends JpaRepository<UserRole, UserRoleId> {
    // Intentionally minimal. User.roles is managed via User.userRoles cascade.
}

