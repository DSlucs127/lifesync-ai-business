
@echo off
echo ======================================================
echo      LIFESYNC AI - REESTRUTURACAO MONOREPO
echo ======================================================

:: 1. Criar estrutura de pastas
echo [1/4] Criando diretorios...
mkdir apps\web
mkdir apps\mobile
mkdir apps\desktop
mkdir services\chatwoot
mkdir services\evolution-api
mkdir packages\shared

:: 2. Mover o projeto Web atual para apps/web
echo [2/4] Movendo projeto Web existente...
move src apps\web\
move public apps\web\
move components apps\web\
move context apps\web\
move hooks apps\web\
move services apps\web\
move *.json apps\web\
move *.js apps\web\
move *.ts apps\web\
move *.tsx apps\web\
move *.html apps\web\
move *.css apps\web\
move .gitignore apps\web\
move *.bat apps\web\

:: Nota: Alguns arquivos de config raiz (como package.json) foram movidos.
:: Precisaremos criar novos package.json para a raiz e mobile.

echo [3/4] A estrutura base foi criada.
echo       Agora vou gerar os arquivos de configuracao para Mobile e Desktop.

echo ======================================================
echo CONCLUIDO! A estrutura de pastas foi atualizada.
echo Proximo passo: Instalar dependencias em cada pasta.
echo ======================================================
pause
