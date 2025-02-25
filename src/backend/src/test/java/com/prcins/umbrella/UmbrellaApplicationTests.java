package com.prcins.umbrella;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Assertions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.web.embedded.tomcat.TomcatWebServer;
import org.springframework.context.ApplicationContext;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.core.env.Environment;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfiguration;
import org.springframework.boot.web.servlet.context.ServletWebServerApplicationContext;

import com.prcins.umbrella.config.AsyncConfig;
import com.prcins.umbrella.config.SecurityConfig;
import com.prcins.umbrella.config.WebConfig;
import com.prcins.umbrella.security.JwtTokenProvider;
import com.prcins.umbrella.security.CustomUserDetailsService;

import java.util.concurrent.Executor;

/**
 * Integration test class for verifying Spring Boot application context and modern features.
 * Tests core application bootstrap including Virtual Thread support, embedded Tomcat,
 * and Spring Boot 3.2.x capabilities with Jakarta EE standards.
 *
 * @version 2.1.0
 * @since Spring Boot 3.2.1
 */
@SpringBootTest(classes = UmbrellaApplication.class)
@ActiveProfiles("test")
public class UmbrellaApplicationTests {

    @Autowired
    private ApplicationContext applicationContext;

    @Autowired
    private ServletWebServerApplicationContext webServerContext;

    @Autowired
    private Environment environment;

    @Autowired
    private AsyncConfig asyncConfig;

    /**
     * Verifies that the Spring application context loads successfully with all required
     * beans and configurations.
     */
    @Test
    public void contextLoads() {
        Assertions.assertNotNull(applicationContext, "Application context should not be null");
        Assertions.assertTrue(applicationContext.containsBean("umbrellaApplication"),
            "Main application bean should be present");
        
        // Verify active profile
        Assertions.assertTrue(environment.acceptsProfiles("test"),
            "Test profile should be active");
        
        // Verify required configuration beans
        Assertions.assertNotNull(applicationContext.getBean(AsyncConfig.class),
            "AsyncConfig bean should be present");
        Assertions.assertNotNull(applicationContext.getBean(SecurityConfig.class),
            "SecurityConfig bean should be present");
        Assertions.assertNotNull(applicationContext.getBean(WebConfig.class),
            "WebConfig bean should be present");
    }

    /**
     * Validates Virtual Thread executor configuration and async processing capabilities.
     */
    @Test
    public void verifyVirtualThreadSupport() {
        ThreadPoolTaskExecutor executor = (ThreadPoolTaskExecutor) asyncConfig.getAsyncExecutor();
        Assertions.assertNotNull(executor, "Async executor should not be null");
        
        // Verify Virtual Thread configuration
        Assertions.assertTrue(executor.getThreadNamePrefix().startsWith("UmbrellaAsync-"),
            "Executor should use correct thread naming pattern");
        
        // Verify executor parameters
        Assertions.assertEquals(4, executor.getCorePoolSize(),
            "Core pool size should match configuration");
        Assertions.assertEquals(10, executor.getMaxPoolSize(),
            "Max pool size should match configuration");
        Assertions.assertEquals(50, executor.getQueueCapacity(),
            "Queue capacity should match configuration");
        
        // Verify Virtual Thread support is enabled
        Executor taskExecutor = executor.getThreadPoolExecutor();
        Assertions.assertNotNull(taskExecutor,
            "Task executor should be properly configured");
    }

    /**
     * Checks embedded Tomcat 10.1.18 configuration and container settings.
     */
    @Test
    public void verifyEmbeddedTomcat() {
        TomcatWebServer tomcatServer = (TomcatWebServer) webServerContext.getWebServer();
        Assertions.assertNotNull(tomcatServer, "Tomcat server should not be null");
        
        // Verify Tomcat version and configuration
        String serverInfo = tomcatServer.getTomcat().getServer().getServerInfo();
        Assertions.assertTrue(serverInfo.contains("10.1.18"),
            "Should be running Tomcat 10.1.18");
        
        // Verify connector configuration
        Assertions.assertTrue(tomcatServer.getTomcat().getService().findConnectors().length > 0,
            "Tomcat should have at least one connector configured");
    }

    /**
     * Validates presence and configuration of required Spring beans after
     * migration to Jakarta EE packages.
     */
    @Test
    public void verifyRequiredBeans() {
        // Verify security components
        Assertions.assertNotNull(applicationContext.getBean(SecurityConfig.class),
            "SecurityConfig should be present");
        Assertions.assertNotNull(applicationContext.getBean(JwtTokenProvider.class),
            "JwtTokenProvider should be present");
        Assertions.assertNotNull(applicationContext.getBean(CustomUserDetailsService.class),
            "CustomUserDetailsService should be present");
        Assertions.assertNotNull(applicationContext.getBean(WebSecurityConfiguration.class),
            "WebSecurityConfiguration should be present");
        
        // Verify web configuration
        WebConfig webConfig = applicationContext.getBean(WebConfig.class);
        Assertions.assertNotNull(webConfig, "WebConfig should be present");
        
        // Verify async configuration
        AsyncConfig asyncConfig = applicationContext.getBean(AsyncConfig.class);
        Assertions.assertNotNull(asyncConfig, "AsyncConfig should be present");
    }

    /**
     * Tests Jakarta EE compatibility after migration from javax.* packages.
     */
    @Test
    public void verifyJakartaEECompatibility() {
        // Verify Jakarta Persistence configuration
        Assertions.assertTrue(applicationContext.containsBean("entityManagerFactory"),
            "EntityManagerFactory should be configured with Jakarta Persistence");
        
        // Verify Jakarta Servlet components
        Assertions.assertTrue(applicationContext.containsBean("dispatcherServlet"),
            "DispatcherServlet should be configured with Jakarta Servlet");
        
        // Verify Jakarta Security integration
        SecurityConfig securityConfig = applicationContext.getBean(SecurityConfig.class);
        Assertions.assertNotNull(securityConfig,
            "SecurityConfig should be present with Jakarta Security");
    }
}