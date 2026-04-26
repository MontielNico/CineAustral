package com.cineaustral.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

public class WebConfig implements WebMvcConfigurer {

    @Value("${app.upload.dir}")
    private String uploadDir;

    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/" + uploadDir + "/**")
                .addResourceLocations("file:" + uploadDir + "/");
    }

}
