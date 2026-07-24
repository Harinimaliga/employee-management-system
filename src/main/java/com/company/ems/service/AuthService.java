package com.company.ems.service;

import com.company.ems.dto.JwtResponse;
import com.company.ems.dto.LoginRequest;
import com.company.ems.dto.MessageResponse;
import com.company.ems.dto.SignupRequest;
import com.company.ems.entity.Employee;
import com.company.ems.entity.Role;
import com.company.ems.entity.User;
import com.company.ems.exception.BadRequestException;
import com.company.ems.repository.EmployeeRepository;
import com.company.ems.repository.UserRepository;
import com.company.ems.security.JwtUtils;
import com.company.ems.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private JwtUtils jwtUtils;

    public JwtResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String role = userDetails.getAuthorities().iterator().next().getAuthority();

        return new JwtResponse(jwt, userDetails.getId(), userDetails.getUsername(), userDetails.getEmail(), role);
    }

    @Transactional
    public MessageResponse registerUser(SignupRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            throw new BadRequestException("Error: Username is already taken!");
        }

        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            throw new BadRequestException("Error: Email is already in use!");
        }

        // Create new user's account
        User user = User.builder()
                .username(signUpRequest.getUsername())
                .email(signUpRequest.getEmail())
                .password(encoder.encode(signUpRequest.getPassword()))
                .role(signUpRequest.getRole() != null ? signUpRequest.getRole() : Role.ROLE_EMPLOYEE)
                .build();

        userRepository.save(user);

        // Also create Employee record for employees
        if (user.getRole() == Role.ROLE_EMPLOYEE || user.getRole() == Role.ROLE_ADMIN) {
            String firstName = signUpRequest.getFirstName() != null ? signUpRequest.getFirstName() : signUpRequest.getUsername();
            String lastName = signUpRequest.getLastName() != null ? signUpRequest.getLastName() : "User";
            String dept = signUpRequest.getDepartment() != null ? signUpRequest.getDepartment() : "General";

            Employee employee = Employee.builder()
                    .firstName(firstName)
                    .lastName(lastName)
                    .email(signUpRequest.getEmail())
                    .department(dept)
                    .designation(user.getRole() == Role.ROLE_ADMIN ? "System Administrator" : "Software Engineer")
                    .user(user)
                    .build();

            employeeRepository.save(employee);
        }

        return new MessageResponse("User registered successfully!");
    }
}
