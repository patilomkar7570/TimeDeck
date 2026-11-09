@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js 20.19 or newer is required. Install it from https://nodejs.org/.
  pause
  exit /b 1
)
if not exist "node_modules" call npm install
if errorlevel 1 (
  echo Dependency installation failed.
  pause
  exit /b 1
)
call npm run typecheck
if errorlevel 1 (
  pause
  exit /b 1
)
call npm test
if errorlevel 1 (
  pause
  exit /b 1
)
call npm run build
if errorlevel 1 (
  pause
  exit /b 1
)
echo.
echo TimeDeck production build is ready in the dist folder.
echo Run "npm run preview" to test the production build locally.
pause
