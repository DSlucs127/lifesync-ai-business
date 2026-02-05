
@echo off
title LifeSync AI - Build Windows (.exe)
echo ======================================================
echo           LIFESYNC AI - GERADOR DE EXE (WINDOWS)
echo ======================================================
echo.

:: Verificar Node.js
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Node.js nao encontrado!
    pause
    exit
)

echo [1/3] Instalando dependencias do Electron...
call npm install

echo.
echo [2/3] Compilando o projeto Web...
call npm run build

echo.
echo [3/3] Empacotando para Windows (.exe)...
echo Isso pode levar alguns minutos...
call npm run dist:windows

echo.
echo ======================================================
echo SUCESSO! 
echo O instalador do Windows esta na pasta: "release-builds"
echo ======================================================
pause
