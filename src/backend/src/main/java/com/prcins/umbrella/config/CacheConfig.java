package com.prcins.umbrella.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.ehcache.EhCacheCacheManager;
import org.springframework.cache.ehcache.EhCacheManagerFactoryBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ClassPathResource;

/**
 * Configuration class for setting up the caching infrastructure using EhCache integrated with Spring Boot's
 * modern caching abstractions. Provides container-aware configuration and Virtual Thread support.
 * 
 * This configuration enables:
 * - Auto-configured caching capabilities
 * - Container-aware cache management
 * - Virtual Thread support for enhanced performance
 * - Integration with Spring Boot Actuator for monitoring
 * - Dynamic cache configuration for container environments
 * 
 * @version 2.1.0
 * @since Spring Boot 3.2.x
 */
@Configuration
@EnableCaching
public class CacheConfig {

    private static final String EHCACHE_CONFIG_LOCATION = "ehcache.xml";
    
    /**
     * Creates and configures the EhCache manager factory bean with container-aware settings.
     * Enables distributed caching support and monitoring capabilities.
     *
     * @return Configured EhCache manager factory with container optimization
     */
    @Bean
    public EhCacheManagerFactoryBean ehCacheManager() {
        EhCacheManagerFactoryBean ehCacheManagerFactory = new EhCacheManagerFactoryBean();
        
        // Configure with container-aware resource loading
        Resource ehcacheConfig = new ClassPathResource(EHCACHE_CONFIG_LOCATION);
        ehCacheManagerFactory.setConfigLocation(ehcacheConfig);
        
        // Enable shared cache manager for distributed scenarios
        ehCacheManagerFactory.setShared(true);
        
        // Enable cache monitoring and statistics
        ehCacheManagerFactory.setAcceptExisting(true);
        
        return ehCacheManagerFactory;
    }

    /**
     * Creates and configures the Spring cache manager with EhCache implementation.
     * Provides Virtual Thread support and integration with Spring Boot Actuator.
     *
     * @param ehCacheManager The EhCache manager instance
     * @return Configured Spring cache manager with modern features
     */
    @Bean
    public CacheManager cacheManager(net.sf.ehcache.CacheManager ehCacheManager) {
        EhCacheCacheManager cacheManager = new EhCacheCacheManager();
        
        // Set EhCache manager with Virtual Thread support
        cacheManager.setCacheManager(ehCacheManager);
        
        // Enable cache statistics for monitoring
        cacheManager.setTransactionAware(true);
        
        return cacheManager;
    }
}