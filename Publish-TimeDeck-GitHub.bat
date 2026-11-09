@echo off
setlocal
cd /d "%~dp0"
echo.
echo  Publish TimeDeck to GitHub
 echo Target: patilomkar7570/TimeDeck (public)
echo.
echo This will create the repository if it does not exist, push the source and v1.0.0 tag,
echo and publish the v1.0.0 GitHub release.
echo.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\publish-github.ps1"
if errorlevel 1 (
  echo.
  echo Publishing did not complete. Read the error above.
  pause
  exit /b 1
)
echo.
echo GitHub publishing finished.
pause
