@echo off
REM ====================================================================
REM  EventSphere MongoDB Automated Backup Script (Windows)
REM ====================================================================

set TIMESTAMP=%date:~10,4%-%date:~4,2%-%date:~7,2%_%time:~0,2%-%time:~3,2%-%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%
set BACKUP_DIR=..\backups\%TIMESTAMP%

echo [EventSphere] Initiating MongoDB database backup to: %BACKUP_DIR%

if not exist ..\backups mkdir ..\backups

mongodump --uri="%MONGO_URI%" --out="%BACKUP_DIR%"

if %ERRORLEVEL% EQU 0 (
    echo [EventSphere] Backup completed successfully at: %BACKUP_DIR%
) else (
    echo [EventSphere] Backup failed. Verify mongodump is installed and MONGO_URI is set.
)
