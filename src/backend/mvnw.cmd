@REM ----------------------------------------------------------------------------
@REM Maven Wrapper startup script for Windows
@REM
@REM Required ENV vars:
@REM JAVA_HOME - location of a JDK 21 home dir
@REM
@REM Optional ENV vars
@REM MAVEN_BATCH_ECHO - set to 'on' to enable the echoing of the batch commands
@REM MAVEN_BATCH_PAUSE - set to 'on' to wait for a keystroke before ending
@REM MAVEN_OPTS - parameters passed to the Java VM when running Maven
@REM     e.g. to enable Virtual Threads: "-XX:+EnableVirtualThreads"
@REM ----------------------------------------------------------------------------

@REM Begin all REM lines with '@' in case MAVEN_BATCH_ECHO is 'on'
@echo off
@REM set title of command window
title %0
@REM enable echoing by setting MAVEN_BATCH_ECHO to 'on'
@if "%MAVEN_BATCH_ECHO%" == "on"  echo %MAVEN_BATCH_ECHO%

@REM set %HOME% to equivalent of $HOME
if "%HOME%" == "" (set "HOME=%HOMEDRIVE%%HOMEPATH%")

@REM Execute a user defined script before this one
if not "%MAVEN_SKIP_RC%" == "" goto skipRcPre
@REM check for pre script, once with legacy .bat ending and once with .cmd ending
if exist "%USERPROFILE%\mavenrc_pre.bat" call "%USERPROFILE%\mavenrc_pre.bat" %*
if exist "%USERPROFILE%\mavenrc_pre.cmd" call "%USERPROFILE%\mavenrc_pre.cmd" %*
:skipRcPre

@setlocal

set ERROR_CODE=0

@REM ==== START VALIDATION ====
:validateJava
@REM Validate Java 21 installation
if not "%JAVA_HOME%" == "" goto checkJavaVersion
echo Error: JAVA_HOME not found in your environment.
echo Please set the JAVA_HOME variable in your environment to match the
echo location of your Java installation.
goto error

:checkJavaVersion
@REM Verify Java 21 is being used
"%JAVA_HOME%\bin\java" -version 2>&1 | findstr "21" >nul
if errorlevel 1 (
    echo Error: This version of Maven Wrapper requires Java 21.
    echo Current Java version does not appear to be 21
    goto error
)

@REM ==== START VALIDATION ====
if not "%MAVEN_SKIP_RC%" == "" goto skipRcPost
@REM check for post script, once with legacy .bat ending and once with .cmd ending
if exist "%USERPROFILE%\mavenrc_post.bat" call "%USERPROFILE%\mavenrc_post.bat"
if exist "%USERPROFILE%\mavenrc_post.cmd" call "%USERPROFILE%\mavenrc_post.cmd"
:skipRcPost

@REM Find the project base dir
:findBaseDir
@REM Enhanced base directory detection for container environments
set MAVEN_PROJECTBASEDIR=%MAVEN_BASEDIR%
if not "%MAVEN_PROJECTBASEDIR%"=="" goto endDetectBaseDir

set EXEC_DIR=%CD%
set WDIR=%EXEC_DIR%

:findBaseDir
IF EXIST "%WDIR%"\.mvn goto baseDirFound
cd ..
IF "%WDIR%"=="%CD%" goto baseDirNotFound
set WDIR=%CD%
goto findBaseDir

:baseDirFound
set MAVEN_PROJECTBASEDIR=%WDIR%
cd "%EXEC_DIR%"
goto endDetectBaseDir

:baseDirNotFound
set MAVEN_PROJECTBASEDIR=%EXEC_DIR%
cd "%EXEC_DIR%"

:endDetectBaseDir

@REM ==== SETUP MAVEN WRAPPER ====
:setupWrapper
set DOWNLOAD_URL_BASE=https://repo.maven.apache.org/maven2/org/apache/maven/wrapper
set WRAPPER_JAR=.mvn\wrapper\maven-wrapper.jar
set WRAPPER_PROPERTIES=.mvn\wrapper\maven-wrapper.properties

@REM Check if wrapper jar exists, download if needed
if not exist "%MAVEN_PROJECTBASEDIR%\%WRAPPER_JAR%" (
    if not exist "%MAVEN_PROJECTBASEDIR%\.mvn\wrapper" mkdir "%MAVEN_PROJECTBASEDIR%\.mvn\wrapper"
    
    echo Downloading Maven Wrapper from %DOWNLOAD_URL_BASE%
    powershell -Command "&{"^
        "$webclient = new-object System.Net.WebClient;"^
        "[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12;"^
        "$webclient.DownloadFile('%DOWNLOAD_URL_BASE%/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar', '%MAVEN_PROJECTBASEDIR%\%WRAPPER_JAR%')"^
    "}
    if "%MVNW_VERBOSE%" == "true" (
        echo Finished downloading %WRAPPER_JAR%
    )
)

@REM Configure Maven command with enhanced security and container support
set MAVEN_CMD_LINE_ARGS=%*

@REM Setup improved Java options for container environments
if not defined MAVEN_OPTS (
    set "MAVEN_OPTS=-XX:+EnableVirtualThreads -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"
)

@REM Start Maven with wrapper and enhanced security
"%JAVA_HOME%\bin\java" %MAVEN_OPTS% ^
  -Dmaven.multiModuleProjectDirectory="%MAVEN_PROJECTBASEDIR%" ^
  -Dmaven.home="%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-home" ^
  -Dlibrary.jansi.path="%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\lib" ^
  -Dhttps.protocols=TLSv1.2,TLSv1.3 ^
  -jar "%MAVEN_PROJECTBASEDIR%\%WRAPPER_JAR%" ^
  %MAVEN_CMD_LINE_ARGS%
if ERRORLEVEL 1 goto error
goto end

:error
set ERROR_CODE=1

:end
@endlocal & set ERROR_CODE=%ERROR_CODE%

if not "%MAVEN_SKIP_RC%"=="" goto skipRcPost
@REM check for post script, once with legacy .bat ending and once with .cmd ending
if exist "%USERPROFILE%\mavenrc_post.bat" call "%USERPROFILE%\mavenrc_post.bat"
if exist "%USERPROFILE%\mavenrc_post.cmd" call "%USERPROFILE%\mavenrc_post.cmd"
:skipRcPost

exit /B %ERROR_CODE%