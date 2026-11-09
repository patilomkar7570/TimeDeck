@echo off
setlocal EnableExtensions
set "MODE=%~1"
set "APP_URL=https://patilomkar7570.github.io/TimeDeck/"
set "BRAVE_EXE="

if defined ProgramFiles if exist "%ProgramFiles%\BraveSoftware\Brave-Browser\Application\brave.exe" set "BRAVE_EXE=%ProgramFiles%\BraveSoftware\Brave-Browser\Application\brave.exe"
if not defined BRAVE_EXE if defined ProgramFiles(x86) if exist "%ProgramFiles(x86)%\BraveSoftware\Brave-Browser\Application\brave.exe" set "BRAVE_EXE=%ProgramFiles(x86)%\BraveSoftware\Brave-Browser\Application\brave.exe"
if not defined BRAVE_EXE if defined LocalAppData if exist "%LocalAppData%\BraveSoftware\Brave-Browser\Application\brave.exe" set "BRAVE_EXE=%LocalAppData%\BraveSoftware\Brave-Browser\Application\brave.exe"
if not defined BRAVE_EXE for %%I in (brave.exe) do if not "%%~$PATH:I"=="" set "BRAVE_EXE=%%~$PATH:I"

if not defined BRAVE_EXE (
  echo Brave was not found. Opening TimeDeck in your default browser instead.
  start "" "%APP_URL%"
  exit /b 0
)

if /i "%MODE%"=="app" (
  echo Opening TimeDeck in its own Brave app window...
  start "" "%BRAVE_EXE%" --app="%APP_URL%"
) else (
  echo Opening TimeDeck in a normal Brave browser tab...
  start "" "%BRAVE_EXE%" "%APP_URL%"
)
exit /b 0
