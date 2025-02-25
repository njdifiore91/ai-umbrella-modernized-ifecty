package com.prcins.umbrella.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.List;

/**
 * Web configuration class for Spring MVC settings and customizations.
 * Implements modern Spring Boot 3.2.x features with Jakarta EE standards.
 * 
 * @version 2.1.0
 * @since Spring Boot 3.2.x
 */
@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {

    private static final long MAX_AGE_SECS = 3600;

    /**
     * Configures CORS mappings for cross-origin requests.
     * Implements security best practices for cross-origin resource sharing.
     *
     * @param registry CorsRegistry instance for CORS configuration
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("https://umbrella.prcins.net", 
                              "https://qa.umbrella.prcins.net")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("Origin", "Content-Type", "Accept", "Authorization",
                              "X-Requested-With", "X-CSRF-TOKEN")
                .exposedHeaders("X-CSRF-TOKEN")
                .allowCredentials(true)
                .maxAge(MAX_AGE_SECS);
    }

    /**
     * Configures HTTP message converters for request/response handling.
     * Implements JSON processing with configured ObjectMapper.
     *
     * @param converters List of HttpMessageConverter instances
     */
    @Override
    public void configureMessageConverters(List<HttpMessageConverter<?>> converters) {
        MappingJackson2HttpMessageConverter converter = new MappingJackson2HttpMessageConverter();
        converter.setObjectMapper(objectMapper());
        converters.add(converter);
    }

    /**
     * Creates and configures Jackson ObjectMapper for JSON processing.
     * Implements date/time handling and serialization features.
     *
     * @return Configured ObjectMapper instance
     */
    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        
        // Configure modules
        mapper.registerModule(new JavaTimeModule());
        
        // Configure serialization features
        mapper.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
        mapper.configure(SerializationFeature.FAIL_ON_EMPTY_BEANS, false);
        mapper.configure(SerializationFeature.INDENT_OUTPUT, true);
        
        // Configure deserialization features
        mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        mapper.configure(DeserializationFeature.ACCEPT_SINGLE_VALUE_AS_ARRAY, true);
        mapper.configure(DeserializationFeature.READ_DATE_TIMESTAMPS_AS_NANOSECONDS, false);
        
        return mapper;
    }

    /**
     * Configures static resource handling with caching support.
     * Implements resource handler configuration for web assets.
     *
     * @param registry ResourceHandlerRegistry instance for resource configuration
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/static/**")
                .addResourceLocations("classpath:/static/")
                .setCachePeriod(3600) // 1 hour cache
                .resourceChain(true);

        registry.addResourceHandler("/webjars/**")
                .addResourceLocations("classpath:/META-INF/resources/webjars/")
                .setCachePeriod(3600)
                .resourceChain(true);

        registry.addResourceHandler("/docs/**")
                .addResourceLocations("classpath:/docs/")
                .setCachePeriod(3600)
                .resourceChain(true);
    }
}