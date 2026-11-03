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

## Audio, subtítulos y formatos
- La app incluye FFmpeg (paquete `ffmpeg-static`, unos 70 MB más en el instalador). Con él:
  - se listan las pistas de audio y subtítulos de películas y series (idioma y nombre),
  - se puede cambiar de pista de audio,
  - se reproducen archivos MKV y audio AC3/EAC3/DTS (se convierte el audio a AAC al vuelo; el video se copia sin recomprimir si es compatible).
- Los subtítulos de texto se extraen al elegirlos (se lee el archivo completo, puede tardar). Los subtítulos de imagen (PGS/VobSub) no se pueden mostrar.
- Si no se encuentra FFmpeg, la app reproduce el archivo directamente, como un navegador.
- Mientras se usa la conversión, adelantar/retroceder reinicia el flujo en ese punto (puede tardar un instante).

## Atajos y ratón
Clic en el video: pausa/reanuda. Doble clic o F/F11: pantalla completa. Esc: atrás. Espacio: pausa. M: silenciar. R o clic derecho: favorito.
Rueda sobre el video: volumen. Flechas izquierda/derecha: saltar. Av Pág/Re Pág: canal siguiente/anterior.
