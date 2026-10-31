# Kibo IPTV - escritorio (Electron)

Windows: instalador de un clic y .exe portable. Linux: AppImage.
Los datos de cada persona (usuarios, favoritos, ajustes, guía) se guardan en la carpeta de usuario del sistema
(Windows: %APPDATA%\Kibo IPTV), no junto al .exe.

## Probar en tu PC
    cd desktop
    npm install
    npm start

## Compilar
    npm run dist:win     (en Windows)
    npm run dist:linux   (en Linux)
Lo normal es dejar que GitHub Actions lo compile (.github/workflows/desktop.yml).
