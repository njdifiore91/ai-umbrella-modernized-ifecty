package com.prcins.umbrella.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import jakarta.sql.DataSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.mybatis.spring.SqlSessionFactoryBean;
import org.mybatis.spring.SqlSessionFactory;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;

import com.prcins.umbrella.util.ValidationUtils;

/**
 * Modern database configuration class leveraging Spring Boot 3.2.x capabilities with HikariCP connection pooling
 * and Virtual Thread optimization. Provides configuration for multiple data sources (SQL Server and DB2)
 * with enhanced performance and monitoring capabilities.
 *
 * @version 2.0
 * @since Spring Boot 3.2.x
 */
@Configuration
@ConfigurationProperties(prefix = "spring.datasource")
public class DatabaseConfig {

    private HikariConfig primaryHikariConfig;
    private HikariConfig secondaryHikariConfig;

    /**
     * Configures the primary SQL Server data source with optimized HikariCP settings
     * and Virtual Thread support for enhanced performance.
     *
     * @return Configured primary HikariCP data source
     */
    @Bean
    @Primary
    public DataSource primaryDataSource() {
        ValidationUtils.validateNotNull(primaryHikariConfig, "Primary HikariCP configuration");

        HikariConfig config = new HikariConfig();
        config.setDriverClassName("com.microsoft.sqlserver.jdbc.SQLServerDriver");
        config.setJdbcUrl(primaryHikariConfig.getJdbcUrl());
        config.setUsername(primaryHikariConfig.getUsername());
        config.setPassword(primaryHikariConfig.getPassword());

        // Connection pool optimization
        config.setMaximumPoolSize(20);
        config.setMinimumIdle(5);
        config.setIdleTimeout(300000);
        config.setConnectionTimeout(20000);
        config.setMaxLifetime(1200000);

        // Virtual Thread optimization
        config.setThreadFactory(Thread.ofVirtual().factory());
        config.addDataSourceProperty("useVirtualThreads", "true");

        // Performance optimization
        config.addDataSourceProperty("cachePrepStmts", "true");
        config.addDataSourceProperty("prepStmtCacheSize", "250");
        config.addDataSourceProperty("prepStmtCacheSqlLimit", "2048");

        // Monitoring and metrics
        config.setPoolName("SQLServer-Primary-Pool");
        config.setMetricRegistry(null); // Configure metrics registry if needed

        return new HikariDataSource(config);
    }

    /**
     * Configures the secondary DB2 data source with optimized HikariCP settings
     * and Virtual Thread support for enhanced performance.
     *
     * @return Configured secondary HikariCP data source
     */
    @Bean
    public DataSource secondaryDataSource() {
        ValidationUtils.validateNotNull(secondaryHikariConfig, "Secondary HikariCP configuration");

        HikariConfig config = new HikariConfig();
        config.setDriverClassName("com.ibm.db2.jcc.DB2Driver");
        config.setJdbcUrl(secondaryHikariConfig.getJdbcUrl());
        config.setUsername(secondaryHikariConfig.getUsername());
        config.setPassword(secondaryHikariConfig.getPassword());

        // Connection pool optimization
        config.setMaximumPoolSize(15);
        config.setMinimumIdle(3);
        config.setIdleTimeout(300000);
        config.setConnectionTimeout(20000);
        config.setMaxLifetime(1200000);

        // Virtual Thread optimization
        config.setThreadFactory(Thread.ofVirtual().factory());
        config.addDataSourceProperty("useVirtualThreads", "true");

        // Performance optimization
        config.addDataSourceProperty("cachePrepStmts", "true");
        config.addDataSourceProperty("prepStmtCacheSize", "250");
        config.addDataSourceProperty("prepStmtCacheSqlLimit", "2048");

        // Monitoring and metrics
        config.setPoolName("DB2-Secondary-Pool");
        config.setMetricRegistry(null); // Configure metrics registry if needed

        return new HikariDataSource(config);
    }

    /**
     * Configures the primary MyBatis SqlSessionFactory with the SQL Server data source.
     *
     * @param primaryDataSource The primary SQL Server data source
     * @return Configured SqlSessionFactory for primary database
     * @throws Exception if configuration fails
     */
    @Bean
    @Primary
    public SqlSessionFactory primarySqlSessionFactory(DataSource primaryDataSource) throws Exception {
        SqlSessionFactoryBean sessionFactory = new SqlSessionFactoryBean();
        sessionFactory.setDataSource(primaryDataSource);
        
        // Configure mapper locations
        PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
        sessionFactory.setMapperLocations(resolver.getResources("classpath:mybatis/sqlserver/mappers/**/*.xml"));
        
        // Configure type aliases package
        sessionFactory.setTypeAliasesPackage("com.prcins.umbrella.domain");
        
        // Configure MyBatis settings
        org.apache.ibatis.session.Configuration mybatisConfig = new org.apache.ibatis.session.Configuration();
        mybatisConfig.setMapUnderscoreToCamelCase(true);
        mybatisConfig.setCacheEnabled(true);
        mybatisConfig.setDefaultExecutorType(org.apache.ibatis.session.ExecutorType.REUSE);
        sessionFactory.setConfiguration(mybatisConfig);

        return sessionFactory.getObject();
    }

    /**
     * Configures the secondary MyBatis SqlSessionFactory with the DB2 data source.
     *
     * @param secondaryDataSource The secondary DB2 data source
     * @return Configured SqlSessionFactory for secondary database
     * @throws Exception if configuration fails
     */
    @Bean
    public SqlSessionFactory secondarySqlSessionFactory(DataSource secondaryDataSource) throws Exception {
        SqlSessionFactoryBean sessionFactory = new SqlSessionFactoryBean();
        sessionFactory.setDataSource(secondaryDataSource);
        
        // Configure mapper locations
        PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
        sessionFactory.setMapperLocations(resolver.getResources("classpath:mybatis/db2/mappers/**/*.xml"));
        
        // Configure type aliases package
        sessionFactory.setTypeAliasesPackage("com.prcins.umbrella.domain");
        
        // Configure MyBatis settings
        org.apache.ibatis.session.Configuration mybatisConfig = new org.apache.ibatis.session.Configuration();
        mybatisConfig.setMapUnderscoreToCamelCase(true);
        mybatisConfig.setCacheEnabled(true);
        mybatisConfig.setDefaultExecutorType(org.apache.ibatis.session.ExecutorType.REUSE);
        sessionFactory.setConfiguration(mybatisConfig);

        return sessionFactory.getObject();
    }

    // Getters and setters for configuration properties

    public void setPrimaryHikariConfig(HikariConfig primaryHikariConfig) {
        this.primaryHikariConfig = primaryHikariConfig;
    }

    public void setSecondaryHikariConfig(HikariConfig secondaryHikariConfig) {
        this.secondaryHikariConfig = secondaryHikariConfig;
    }
}