@echo off
setlocal

rem Open index.html in the default browser from the script's directory
set "PROJECT_DIR=%~dp0"
start "" "%PROJECT_DIR%index.html"

endlocal


