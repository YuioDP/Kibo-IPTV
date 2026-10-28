# Kibo IPTV

Una sola base de código para:
- **Samsung (Tizen)**: carpeta `web/` + `tizen/config.xml` (se empaqueta como .wgt).
- **Android (teléfono y Android TV, 64 bits)**: carpeta `android/` + `web/` (la interfaz web va dentro de la app).

## Obtener el APK de Android (sin Android Studio)
1. Crea un repositorio **privado** en GitHub (la clave de firma `android/app/kibo.jks` está en el proyecto).
2. Sube todo el contenido de esta carpeta (incluida `.github`). Si no deja subir `.github`, crea el archivo
   `.github/workflows/android.yml` desde "Add file > Create new file" y pega su contenido.
3. Entra en la pestaña **Actions** > "Compilar APK de Kibo IPTV" > **Run workflow**.
4. Al terminar (unos minutos), abre la ejecución y descarga **Kibo-IPTV-apk** (un .zip con `app-release.apk`).
5. Instala el APK en el teléfono (permite instalar desde "fuentes desconocidas").

Para actualizar: cambia los archivos de `web/` o `android/` en GitHub y vuelve a ejecutar el flujo.
Si falla, copia el error del registro de la ejecución.

## Notas
- La app instalada se llama **Kibo IPTV** y usa el mismo icono.
- En Android TV aparece en el menú de apps (banner incluido) y se maneja con el control remoto.
- En el teléfono funciona en horizontal y con toques: tocar elige, mantener pulsado marca favorito, arrastrar desplaza listas.

## Novedades de esta versión (Android)
- La interfaz se ajusta sola al tamaño real de la pantalla (también al abrir/cerrar el teclado).
- En el teléfono: botón Atrás en pantalla, barra de desplazamiento arrastrable en las listas, barra de progreso táctil
  y doble toque a izquierda/derecha para retroceder/adelantar (los segundos de Ajustes).
- Decodificador FFmpeg de Jellyfin (AC3, EAC3, DTS...) para que se oigan y listen las pistas de audio que el teléfono no decodifica.
  Ese componente tiene licencia GPLv3: está bien para uso personal; si compartes el APK públicamente, revisa esa licencia.
- Imagen en imagen: al salir de la app con algo reproduciéndose, el video sigue en una ventana flotante
  (se activa/desactiva en Ajustes > "Imagen en imagen al salir de la app").
