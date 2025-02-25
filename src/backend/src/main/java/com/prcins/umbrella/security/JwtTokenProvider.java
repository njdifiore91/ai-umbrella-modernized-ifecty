package com.prcins.umbrella.security;

import com.prcins.umbrella.domain.user.User;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.JwtException;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.scheduling.annotation.Async;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.annotation.PostConstruct;
import java.security.Key;
import java.time.Instant;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

/**
 * Service component responsible for JWT token generation, validation and parsing.
 * Leverages Virtual Threads for improved performance and container-aware security context.
 * Integrated with Spring Security 6.1.x and modern Jakarta EE standards.
 */
@Component
public class JwtTokenProvider {

    private static final Logger logger = LoggerFactory.getLogger(JwtTokenProvider.class);
    private static final String TOKEN_CACHE = "jwtTokenCache";
    private static final String ROLES_CLAIM = "roles";
    private static final String CONTAINER_ID_CLAIM = "containerId";

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private int jwtExpirationMs;

    private final MeterRegistry meterRegistry;
    private final CustomUserDetailsService userDetailsService;
    private final SecurityUtils securityUtils;
    private final CacheManager cacheManager;
    private Key key;

    private final Timer tokenGenerationTimer;
    private final Timer tokenValidationTimer;
    private final Timer tokenAuthenticationTimer;

    public JwtTokenProvider(MeterRegistry meterRegistry,
                          CustomUserDetailsService userDetailsService,
                          SecurityUtils securityUtils,
                          CacheManager cacheManager) {
        this.meterRegistry = meterRegistry;
        this.userDetailsService = userDetailsService;
        this.securityUtils = securityUtils;
        this.cacheManager = cacheManager;

        // Initialize performance metrics
        this.tokenGenerationTimer = Timer.builder("jwt.token.generation")
            .description("Time taken to generate JWT tokens")
            .register(meterRegistry);
        this.tokenValidationTimer = Timer.builder("jwt.token.validation")
            .description("Time taken to validate JWT tokens")
            .register(meterRegistry);
        this.tokenAuthenticationTimer = Timer.builder("jwt.token.authentication")
            .description("Time taken to create authentication tokens")
            .register(meterRegistry);
    }

    @PostConstruct
    protected void init() {
        key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
        logger.info("JWT token provider initialized with container-aware configuration");
    }

    /**
     * Generates a JWT token for the given user details using Virtual Thread for improved performance.
     *
     * @param userDetails the user details for token generation
     * @return the generated JWT token
     */
    @Async("virtualThreadExecutor")
    public String generateToken(UserDetails userDetails) {
        return tokenGenerationTimer.record(() -> {
            try {
                Map<String, Object> claims = new HashMap<>();
                if (userDetails instanceof User) {
                    User user = (User) userDetails;
                    claims.put(ROLES_CLAIM, user.getRoles());
                }
                claims.put(CONTAINER_ID_CLAIM, securityUtils.getRequestContext());

                Instant now = Instant.now();
                String token = Jwts.builder()
                    .setClaims(claims)
                    .setSubject(userDetails.getUsername())
                    .setIssuedAt(Date.from(now))
                    .setExpiration(Date.from(now.plusMillis(jwtExpirationMs)))
                    .signWith(key, SignatureAlgorithm.HS512)
                    .compact();

                // Cache the token
                getTokenCache().put(userDetails.getUsername(), token);
                
                logger.debug("Generated JWT token for user: {}", userDetails.getUsername());
                return token;
            } catch (Exception e) {
                logger.error("Error generating JWT token", e);
                throw new JwtException("Could not generate token", e);
            }
        });
    }

    /**
     * Validates JWT token authenticity, expiration and container context.
     *
     * @param token the token to validate
     * @return true if token is valid, false otherwise
     */
    public boolean validateToken(String token) {
        return tokenValidationTimer.record(() -> {
            try {
                // Check token cache first
                String cachedToken = getTokenCache().get(getUsernameFromToken(token), String.class);
                if (cachedToken != null && !cachedToken.equals(token)) {
                    logger.warn("Token mismatch in cache");
                    return false;
                }

                Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token);

                // Verify container context
                String tokenContainerId = getClaimFromToken(token, CONTAINER_ID_CLAIM);
                if (!securityUtils.getRequestContext().equals(tokenContainerId)) {
                    logger.warn("Container context mismatch for token");
                    return false;
                }

                return true;
            } catch (Exception e) {
                logger.warn("JWT token validation failed: {}", e.getMessage());
                return false;
            }
        });
    }

    /**
     * Creates Spring Security authentication token from JWT with container awareness.
     *
     * @param token the JWT token
     * @return the authentication object
     */
    public Authentication getAuthentication(String token) {
        return tokenAuthenticationTimer.record(() -> {
            try {
                String username = getUsernameFromToken(token);
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                
                if (validateToken(token)) {
                    return new UsernamePasswordAuthenticationToken(
                        userDetails, "", userDetails.getAuthorities());
                }
                
                logger.warn("Failed to create authentication token for user: {}", username);
                return null;
            } catch (Exception e) {
                logger.error("Error creating authentication token", e);
                throw new JwtException("Could not create authentication token", e);
            }
        });
    }

    private String getUsernameFromToken(String token) {
        return Jwts.parserBuilder()
            .setSigningKey(key)
            .build()
            .parseClaimsJws(token)
            .getBody()
            .getSubject();
    }

    @SuppressWarnings("unchecked")
    private <T> T getClaimFromToken(String token, String claim) {
        return (T) Jwts.parserBuilder()
            .setSigningKey(key)
            .build()
            .parseClaimsJws(token)
            .getBody()
            .get(claim);
    }

    private Cache getTokenCache() {
        return cacheManager.getCache(TOKEN_CACHE);
    }
}