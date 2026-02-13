@echo off
chcp 65001 >nul
:: ==========================================
::   OpenClaw Gateway 启动器 (简化版)
:: ==========================================

echo.
echo ==========================================
echo   OpenClaw Gateway
echo ==========================================
echo.

:: 检查 node 是否可用
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] 未找到 Node.js
    echo [INFO] 请先安装 Node.js: https://nodejs.org/
    pause
    exit /b 1
)

:: 检查 dist/entry.js 是否存在
if not exist "dist\entry.js" (
    echo [ERROR] 未找到 dist\entry.js
    echo [INFO] 请先运行: pnpm build
    pause
    exit /b 1
)

:: 检查是否已有 gateway 在运行
netstat -ano | findstr :18789 | findstr LISTENING >nul
if %errorlevel% equ 0 (
    echo [ERROR] OpenClaw Gateway 已经在运行 (端口 18789)
    echo.
    echo 要停止现有实例，请运行: taskkill /F /IM node.exe (谨慎操作)
    echo.
    pause
    exit /b 1
)

echo [INFO] 启动 OpenClaw Gateway...
echo.
echo [INFO] 按 Ctrl+C 可以停止 Gateway
echo.
echo ==========================================
echo.
echo 网络地址: http://127.0.0.1:18789/
echo WebSocket: ws://127.0.0.1:18789
echo.
echo ==========================================
echo.

:: 启动 gateway（前台运行）
node dist\entry.js gateway run --bind loopback --port 18789 --force

echo.
echo [INFO] Gateway 已停止
pause
