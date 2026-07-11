package com.example.collegeportal.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
 
@RestController
@CrossOrigin(origins = "https://collegeportal2.netlify.app", allowedHeaders = "*")
public class RootController {

    @GetMapping("/")
    public String index() {
        return "College Portal API is running successfully. Please use the frontend application to interact with the system.";
    }
}
