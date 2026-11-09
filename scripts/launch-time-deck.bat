@echo off
setlocal EnableExtensions
set "MODE=%~1"
set "PROJECT_DIR=%~dp0.."
for %%I in ("%PROJECT_DIR%") do set "PROJECT_DIR=%%~fI"
set "APP_URL=http://127.0.0.1:5173/"

if /i "%MODE%"=="app" (
  set "MODE_LABEL=standalone app window"
) else (
  set "MODE=web"
  set "MODE_LABEL=Brave browser tab"
)

echo.
echo  TimeDeck - Your World, At a Glance.
echo  Launch mode: %MODE_LABEL%
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js 20.19 or newer was not found.
  echo Install Node.js from https://nodejs.org/ and run this launcher again.
  pause
  exit /b 1
)
where npm >nul 2>nul
if errorlevel 1 (
  echo npm was not found. Repair your Node.js installation and try again.
  pause
  exit /b 1
)

pushd "%PROJECT_DIR%"
if not exist "node_modules" (
  echo Installing TimeDeck dependencies. The first setup needs internet access...
  call npm install
  if errorlevel 1 (
    echo.
    echo Dependency installation failed. Check your connection and try again.
    popd
    pause
    exit /b 1
  )
)

rem Reuse an already-running TimeDeck Vite server instead of starting a duplicate.
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "try { $r = Invoke-WebRequest -Uri 'http://127.0.0.1:5173/' -UseBasicParsing -TimeoutSec 2; if ($r.StatusCode -eq 200 -and $r.Content -match '/@vite/client') { exit 0 } else { exit 1 } } catch { exit 1 }" >nul 2>&1
if errorlevel 1 (
  echo Starting the local TimeDeck server...
  start "TimeDeck Local Server" /min "%ComSpec%" /d /c "cd /d ""%PROJECT_DIR%"" && npm run dev -- --host 127.0.0.1"
)

set "SERVER_READY="
for /l %%N in (1,1,40) do (
  powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "try { $r = Invoke-WebRequest -Uri 'http://127.0.0.1:5173/' -UseBasicParsing -TimeoutSec 2; if ($r.StatusCode -eq 200 -and $r.Content -match '/@vite/client') { exit 0 } else { exit 1 } } catch { exit 1 }" >nul 2>&1
  if not errorlevel 1 (
    set "SERVER_READY=1"
    goto server_ready
  )
  timeout /t 1 /nobreak >nul
)

:server_timeout
echo.
echo TimeDeck did not become available at %APP_URL%.
echo Check whether another program is using port 5173 or inspect the minimized TimeDeck Local Server window.
popd
pause
exit /b 1

:server_ready
set "BRAVE_EXE="
if defined ProgramFiles if exist "%ProgramFiles%\BraveSoftware\Brave-Browser\Application\brave.exe" set "BRAVE_EXE=%ProgramFiles%\BraveSoftware\Brave-Browser\Application\brave.exe"
if not defined BRAVE_EXE if defined ProgramFiles(x86) if exist "%ProgramFiles(x86)%\BraveSoftware\Brave-Browser\Application\brave.exe" set "BRAVE_EXE=%ProgramFiles(x86)%\BraveSoftware\Brave-Browser\Application\brave.exe"
if not defined BRAVE_EXE if defined LocalAppData if exist "%LocalAppData%\BraveSoftware\Brave-Browser\Application\brave.exe" set "BRAVE_EXE=%LocalAppData%\BraveSoftware\Brave-Browser\Application\brave.exe"
if not defined BRAVE_EXE for %%I in (brave.exe) do if not "%%~$PATH:I"=="" set "BRAVE_EXE=%%~$PATH:I"

if not defined BRAVE_EXE (
  echo Brave was not found. Opening TimeDeck in your default browser instead.
  if /i "%MODE%"=="app" echo For the standalone window, install Brave and run Start-TimeDeck-App.bat again.
  start "" "%APP_URL%"
) else (
  if /i "%MODE%"=="app" (
    echo Opening TimeDeck in its own Brave app window...
    start "" "%BRAVE_EXE%" --app="%APP_URL%"
  ) else (
    echo Opening TimeDeck in a normal Brave browser tab...
    start "" "%BRAVE_EXE%" "%APP_URL%"
  )
)

popd
exit /b 0
