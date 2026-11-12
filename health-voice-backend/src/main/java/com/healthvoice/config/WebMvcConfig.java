package com.healthvoice.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path uploadDir = Paths.get("./uploads").toAbsolutePath().normalize();
        String uploadUri = uploadDir.toUri().toString();
        if (!uploadUri.endsWith("/")) {
            uploadUri += "/";
        }
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(uploadUri);

        Path audioDir = Paths.get("../tts-service/audio_storage").toAbsolutePath().normalize();
        String audioUri = audioDir.toUri().toString();
        if (!audioUri.endsWith("/")) {
            audioUri += "/";
        }
        registry.addResourceHandler("/audio/**")
                .addResourceLocations(audioUri);
    }
}

