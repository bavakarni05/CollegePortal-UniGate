package com.example.collegeportal.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.collegeportal.model.User;
import com.example.collegeportal.repository.UserRepository;
import com.example.collegeportal.security.JwtUtil;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "https://collegeportal2.netlify.app", allowedHeaders = "*")
public class AuthController {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder encoder;
    private final JwtUtil jwtUtil;

    public AuthController(UserRepository userRepository, BCryptPasswordEncoder encoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.encoder = encoder;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, Object> body) {
        String role = (String) body.getOrDefault("role", "STUDENT");
        String name = (String) body.getOrDefault("name", "");
        String email = (String) body.get("email");
        String password = (String) body.get("password");

        if (email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "email and password are required"));
        }

        if (userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "email already in use"));
        }

        User user = new User();
        user.setRole(role.toUpperCase());
        user.setName(name);
        user.setEmail(email);
        user.setPasswordHash(encoder.encode(password));

        if ("COLLEGE".equalsIgnoreCase(role)) {
            String collegeName = (String) body.getOrDefault("collegeName", "");
            user.setCollegeName(collegeName);
        }

        userRepository.save(user);
        String token = jwtUtil.generateToken(user.getId(), user.getRole(), user.getEmail());
        java.util.Map<String, Object> userMap = new java.util.HashMap<>();
        userMap.put("id", user.getId());
        userMap.put("name", user.getName());
        userMap.put("email", user.getEmail());
        userMap.put("role", user.getRole());
        if (user.getCollegeName() != null) userMap.put("collegeName", user.getCollegeName());

        java.util.Map<String, Object> resp = new java.util.HashMap<>();
        resp.put("message", "registered");
        resp.put("token", token);
        resp.put("user", userMap);
        return ResponseEntity.status(201).body(resp);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");

        if (email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "email and password required"));
        }

        var opt = userRepository.findByEmail(email);
        if (opt.isEmpty()) return ResponseEntity.status(401).body(Map.of("error", "invalid credentials"));
        User user = opt.get();
        if (!encoder.matches(password, user.getPasswordHash())) {
            return ResponseEntity.status(401).body(Map.of("error", "invalid credentials"));
        }

        String token = jwtUtil.generateToken(user.getId(), user.getRole(), user.getEmail());
        java.util.Map<String, Object> userMap = new java.util.HashMap<>();
        userMap.put("id", user.getId());
        userMap.put("name", user.getName());
        userMap.put("email", user.getEmail());
        userMap.put("role", user.getRole());
        if (user.getCollegeName() != null) userMap.put("collegeName", user.getCollegeName());
        java.util.Map<String, Object> resp = new java.util.HashMap<>();
        resp.put("token", token);
        resp.put("user", userMap);
        return ResponseEntity.ok(resp);
    }
}
