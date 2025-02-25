package com.prcins.umbrella.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.AsyncConfigurer;
import org.springframework.core.task.AsyncTaskExecutor;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.aop.interceptor.AsyncUncaughtExceptionHandler;
import org.springframework.aop.interceptor.SimpleAsyncUncaughtExceptionHandler;
import java.util.concurrent.Executor;

/**
 * Configuration class for asynchronous execution using Java 21 Virtual Threads.
 * Leverages Spring Boot 3.2.x async capabilities for improved performance and resource utilization
 * under high concurrent loads.
 *
 * @version 1.0
 * @since Spring Boot 3.2.x
 */
@Configuration
@EnableAsync
public class AsyncConfig implements AsyncConfigurer {

    // Core thread pool size for base execution capacity
    private static final int CORE_POOL_SIZE = 4;
    
    // Maximum pool size for handling peak loads
    private static final int MAX_POOL_SIZE = 10;
    
    // Queue capacity for pending tasks before pool expansion
    private static final int QUEUE_CAPACITY = 50;

    /**
     * Creates and configures the async executor with Virtual Thread support.
     * Utilizes Java 21's Virtual Thread capabilities for lightweight concurrency
     * and improved throughput in high-load scenarios.
     *
     * @return Configured AsyncTaskExecutor using Virtual Threads
     */
    @Override
    public Executor getAsyncExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        
        // Configure base execution parameters
        executor.setCorePoolSize(CORE_POOL_SIZE);
        executor.setMaxPoolSize(MAX_POOL_SIZE);
        executor.setQueueCapacity(QUEUE_CAPACITY);
        executor.setThreadNamePrefix("UmbrellaAsync-");
        
        // Enable Virtual Thread support for improved performance
        executor.setVirtualThreads(true);
        
        // Set task decorator for enhanced context propagation
        executor.setTaskDecorator(runnable -> {
            return () -> {
                try {
                    runnable.run();
                } catch (Exception e) {
                    // Log any unexpected errors in virtual thread execution
                    Thread.currentThread().getUncaughtExceptionHandler()
                          .uncaughtException(Thread.currentThread(), e);
                    throw e;
                }
            };
        });

        // Initialize the executor
        executor.initialize();
        
        return executor;
    }

    /**
     * Provides exception handler for async operations.
     * Handles uncaught exceptions in asynchronous task execution.
     *
     * @return AsyncUncaughtExceptionHandler for handling async execution exceptions
     */
    @Override
    public AsyncUncaughtExceptionHandler getAsyncUncaughtExceptionHandler() {
        return new SimpleAsyncUncaughtExceptionHandler();
    }
}