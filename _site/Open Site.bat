@echo off
REM Navigate to the site directory
cd /d "%~dp0"

REM Check Ruby
where ruby >nul 2>&1
if %errorlevel% neq 0 (
    echo Ruby not found. Please install Ruby and add it to your PATH.
    pause
    exit /b
)

REM Check Jekyll
where jekyll >nul 2>&1
if %errorlevel% neq 0 (
    echo Jekyll not found. Install it using: gem install jekyll
    pause
    exit /b
)

REM Start Jekyll server in a new window
start "" cmd /k "jekyll serve --livereload"

REM Wait a few seconds for the server to start
timeout /t 5 /nobreak >nul

REM Open Brave pointing to the local server
REM Change the path to Brave if different on your system
start "" "C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe" http://127.0.0.1:4000