package com.prcins.umbrella.config;

import com.prcins.umbrella.security.JwtTokenProvider;
import com.prcins.umbrella.security.CustomUserDetailsService;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.servlet.util.matcher.MvcRequestMatcher;
import org.springframework.web.servlet.handler.HandlerMappingIntrospector;
import org.springframework.security.web.context.DelegatingSecurityContextRepository;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.RequestAttributeSecurityContextRepository;

/**
 * Modern Spring Security configuration class leveraging Spring Boot 3.2.x features
 * and Jakarta EE standards. Provides enhanced security with Virtual Thread support
 * and container-aware context management.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(
    securedEnabled = true,
    jsr250Enabled = true
)
public class SecurityConfig {

    private final JwtTokenProvider jwtTokenProvider;
    private final CustomUserDetailsService userDetailsService;

    public SecurityConfig(JwtTokenProvider jwtTokenProvider, 
                        CustomUserDetailsService userDetailsService) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.userDetailsService = userDetailsService;
    }

    /**
     * Configures the security filter chain with Virtual Thread support
     * and container-aware security context.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, 
            HandlerMappingIntrospector introspector) throws Exception {
        MvcRequestMatcher.Builder mvcMatcherBuilder = new MvcRequestMatcher.Builder(introspector);

        return http
            .csrf(AbstractHttpConfigurer::disable) // Disable CSRF for stateless JWT authentication
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers(mvcMatcherBuilder.pattern("/api/auth/**")).permitAll()
                .requestMatchers(mvcMatcherBuilder.pattern("/actuator/health")).permitAll()
                .requestMatchers(mvcMatcherBuilder.pattern("/actuator/info")).permitAll()
                
                // Policy management endpoints
                .requestMatchers(mvcMatcherBuilder.pattern("/api/policy/**")).hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers(mvcMatcherBuilder.pattern("/api/claims/**")).hasAnyRole("ADMIN", "MANAGER", "USER")
                
                // User management endpoints
                .requestMatchers(mvcMatcherBuilder.pattern("/api/users/**")).hasRole("ADMIN")
                .requestMatchers(mvcMatcherBuilder.pattern("/api/roles/**")).hasRole("ADMIN")
                
                // Report endpoints
                .requestMatchers(mvcMatcherBuilder.pattern("/api/reports/**")).hasAnyRole("ADMIN", "MANAGER")
                
                // Require authentication for all other endpoints
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(
                jwtAuthenticationFilter(),
                UsernamePasswordAuthenticationFilter.class
            )
            .securityContext(context -> context
                .securityContextRepository(new DelegatingSecurityContextRepository(
                    new RequestAttributeSecurityContextRepository(),
                    new HttpSessionSecurityContextRepository()
                ))
            )
            .build();
    }

    /**
     * Creates JWT authentication filter with Virtual Thread support
     */
    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(jwtTokenProvider, userDetailsService);
    }

    /**
     * Configures authentication provider with modern password encoding
     */
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    /**
     * Creates authentication manager with Virtual Thread optimization
     */
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    /**
     * Configures modern password encoder with enhanced security settings
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }
}