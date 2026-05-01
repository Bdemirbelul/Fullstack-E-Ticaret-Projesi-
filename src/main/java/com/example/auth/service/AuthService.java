package com.example.auth.service;

import com.example.auth.dto.*;
import com.example.auth.entity.RefreshToken;
import com.example.auth.entity.Role;
import com.example.auth.entity.User;
import com.example.auth.entity.UserRole;
import com.example.auth.entity.UserRoleId;
import com.example.auth.exception.ApiException;
import com.example.auth.common.security.CurrentUser;
import com.example.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ApiException(HttpStatus.CONFLICT, "Email already in use");
        }

        User user = User.builder()
                .name(request.name())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .build();

        // Default role: USER
        UserRole userRole = UserRole.builder()
                .user(user)
                .id(new UserRoleId(null, Role.USER))
                .build();
        user.setUserRoles(java.util.Set.of(userRole));

        userRepository.save(user);
        return createTokenResponse(user);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        // Güvenli kural: yalnız BCrypt hashli kullanıcıları kabul et.
        // Düz text şifreler (ör. 123456) test amacıyla DB’de tutulsa bile production login’de reddedilir.
        String storedPassword = user.getPassword();
        if (!isBcryptHash(storedPassword)) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        boolean matches = passwordEncoder.matches(request.password(), storedPassword);
        if (!matches) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        return createTokenResponse(user);
    }

    public AuthResponse refresh(RefreshTokenRequest request) {
        RefreshToken refreshToken = refreshTokenService.verifyRefreshToken(request.refreshToken());
        User user = refreshToken.getUser();

        String accessToken = jwtService.generateAccessToken(user.getEmail());
        return new AuthResponse(
                accessToken,
                refreshToken.getToken(),
                "Bearer",
                jwtService.getAccessTokenExpirationSeconds()
        );
    }

    public MessageResponse logout(RefreshTokenRequest request) {
        RefreshToken refreshToken = refreshTokenService.verifyRefreshToken(request.refreshToken());
        refreshTokenService.revokeByToken(refreshToken.getToken());
        return new MessageResponse("Logout successful, refresh token revoked");
    }

    public MeResponse me() {
        String email = CurrentUser.email();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));

        java.util.Set<String> roles = user.getUserRoles().stream()
                .map(UserRole::getRole)
                .filter(java.util.Objects::nonNull)
                .map(Enum::name)
                .collect(java.util.stream.Collectors.toSet());

        return new MeResponse(user.getId(), user.getName(), user.getEmail(), roles);
    }

    private boolean isBcryptHash(String value) {
        // BCrypt hash prefix’i: $2a$, $2b$, $2y$
        return value != null && value.matches("^\\$2[aby]\\$.*");
    }

    private AuthResponse createTokenResponse(User user) {
        String accessToken = jwtService.generateAccessToken(user.getEmail());
        RefreshToken refreshToken = refreshTokenService.createOrReplaceRefreshToken(user);

        return new AuthResponse(
                accessToken,
                refreshToken.getToken(),
                "Bearer",
                jwtService.getAccessTokenExpirationSeconds()
        );
    }
}
