package com.grade12.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Map /uploads/** URL to the physical folder where files are stored
        // The path "file:uploads/" is relative to the working directory (project root)
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");
        
        // If you store files in an absolute path like C:/uploads/, use:
        // registry.addResourceHandler("/uploads/**")
        //         .addResourceLocations("file:C:/uploads/");
    }
}