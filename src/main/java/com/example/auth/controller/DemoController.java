package com.example.auth.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/demo")
public class DemoController {

    @GetMapping("/secure")
    public String secure(Authentication authentication) {
        return "Hello " + authentication.getName() + ", access token is valid.";
    }
}
