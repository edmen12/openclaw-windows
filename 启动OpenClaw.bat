@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion

echo.
echo ========================================================
echo   OpenClaw 直接启动器
echo ========================================================
echo.

:: 检查是否已有 gateway 在运行
netstat -ano | findstr :18789 | findstr LISTENING >nul
if %errorlevel% equ 0 (
    echo [INFO] OpenClaw Gateway 已经在运行
    echo [INFO] 端口: 18789
    echo [INFO] 访问: http://127.0.0.1:18789/
    echo.
    echo 按任意键关闭此窗口（gateway 继续运行）...
    pause >nul
    exit /b 0
)

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

echo [INFO] 启动 OpenClaw Gateway...
echo [INFO] 命令: node dist/entry.js gateway run --bind loopback --port 18789 --force
echo.

:: 启动 gateway（新窗口）
start "OpenClaw Gateway" cmd /K "node dist\entry.js gateway run --bind loopback --port 18789 --force"

:: 等待几秒让 gateway 启动
timeout /t 3 /nobreak >nul

:: 检查是否启动成功
netstat -ano | findstr :18789 | findstr LISTENING >nul
if %errorlevel% equ 0 (
    echo [SUCCESS] Gateway 已成功启动！
    echo [INFO] 端口: 18789
    echo [INFO] 访问: http://127.0.0.1:18789/
    echo.
    echo 你可以关闭此窗口，gateway 会继续在后台运行。
) else (
    echo [WARNING] Gateway 可能未成功启动，请检查上面的错误信息。
)

echo.
echo 按任意键关闭此窗口...
pause >nul
endlocal
