@echo off
title CensusGuard Dashboard
cd /d "C:\Users\kourt\Documents\Codex\2026-05-04\what-can-you-do-here"
start "CensusGuard API" "C:\Users\kourt\Documents\Codex\2026-05-05\not-sure-what-happened-to-our\tools\node-v24.15.0-win-x64\node.exe" "C:\Users\kourt\Documents\Codex\2026-05-04\what-can-you-do-here\server\pilot-api\server.mjs"
timeout /t 2 /nobreak >nul
"C:\Users\kourt\Documents\Codex\2026-05-05\not-sure-what-happened-to-our\tools\node-v24.15.0-win-x64\node.exe" "C:\Users\kourt\Documents\Codex\2026-05-04\what-can-you-do-here\node_modules\vite\bin\vite.js" --host 127.0.0.1 --port 5173
echo.
echo CensusGuard dashboard stopped. You can close this window.
pause
