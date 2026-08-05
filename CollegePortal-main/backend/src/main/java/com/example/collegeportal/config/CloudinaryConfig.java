package com.example.collegeportal.config;

import com.cloudinary.Cloudinary;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CloudinaryConfig {

    @Value("${cloudinary.url:}")
    private String cloudinaryUrl;

    @Bean
    @ConditionalOnExpression("!'${cloudinary.url:}'.isEmpty()")
    public Cloudinary cloudinary() {
        return new Cloudinary(cloudinaryUrl);
    }
}