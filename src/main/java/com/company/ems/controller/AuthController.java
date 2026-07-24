package com.company.ems.controller;

import com.company.ems.dto.JwtResponse;
import com.company.ems.dto.LoginRequest;
import com.company.ems.dto.MessageResponse;
import com.company.ems.dto.SignupRequest;
import com.company.ems.security.UserDetailsImpl;
import com.company.ems.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication Management", description = "User Registration, Login, JWT Authentication & Logout APIs")
public class AuthController {
    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Login & Acquire JWT Bearer Token", description = "Authenticates username and password, returns JWT token.")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        JwtResponse jwtResponse = authService.authenticateUser(loginRequest);
        return ResponseEntity.ok(jwtResponse);
    }

    @PostMapping("/register")
    @Operation(summary = "Register New Account", description = "Registers a new Admin or Employee account.")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        MessageResponse response = authService.registerUser(signUpRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout Account", description = "Clears security context session.")
    public ResponseEntity<?> logoutUser() {
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok(new MessageResponse("You've been logged out successfully!"));
    }

    @GetMapping("/me")
    @Operation(summary = "Get Current Authenticated User", description = "Returns profile details of currently logged-in user.")
    public ResponseEntity<?> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(new MessageResponse("Unauthorized"));
        }
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return ResponseEntity.ok(userDetails);
    }
}
