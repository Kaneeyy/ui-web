@echo off
title Kamil Cheats Auth - Dev Server
color 0A
echo.
echo  ╔══════════════════════════════════════════╗
echo  ║     KAMIL CHEATS AUTH - Dev Server        ║
echo  ║     KCA Authentication System             ║
echo  ╚══════════════════════════════════════════╝
echo.
echo  [*] Starting dev server...
echo  [*] Website: http://localhost:3000/
echo  [*] Press Ctrl+C to stop
echo.

cd /d "%~dp0"
call npm run dev

pause
