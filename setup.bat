@echo off
title LifeSync AI - Setup de Build APK
echo ======================================================
echo           LIFESYNC AI - GERADOR DE APK
echo ======================================================
echo.

:: Verificar Node.js
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Node.js nao encontrado! Por favor, instale o Node.js em https://nodejs.org/
    pause
    exit
)

echo [1/5] Instalando dependencias do sistema...
call npm install

echo.
echo [2/5] Instalando dependencias do Capacitor (Android)...
call npm install @capacitor/core @capacitor/cli @capacitor/android

echo.
echo [3/5] Gerando versao de producao do Web App...
:: Note: Usamos o comando de build padrao do seu ambiente (ex: vite build ou similar)
:: Se nao houver um build configurado, criamos um mock do dist para teste
call npm run build

echo.
echo [4/5] Inicializando e Sincronizando com Android...
if not exist "android" (
    echo Criando pasta nativa Android...
    call npx cap add android
)
call npx cap sync android

echo.
echo [5/5] Abrindo Android Studio...
echo.
echo ATENCAO:
echo 1. No Android Studio, aguarde o Gradle sincronizar.
echo 2. Vá em: Build > Build Bundle(s) / APK(s) > Build APK(s).
echo 3. O arquivo .apk estara pronto em instantes!
echo.
call npx cap open android

echo.
echo ======================================================
echo PROCESSO CONCLUIDO! Siga os passos no Android Studio.
echo ======================================================
pause