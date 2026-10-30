package com.kibo.iptv;

import android.app.Activity;
import android.app.PictureInPictureParams;
import android.app.UiModeManager;
import android.content.res.Configuration;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.util.Rational;
import android.view.KeyEvent;
import android.view.SurfaceView;
import android.view.View;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;

import androidx.media3.common.C;
import androidx.media3.common.Format;
import androidx.media3.common.MediaItem;
import androidx.media3.common.PlaybackException;
import androidx.media3.common.Player;
import androidx.media3.common.TrackSelectionOverride;
import androidx.media3.common.Tracks;
import androidx.media3.common.VideoSize;
import androidx.media3.common.text.Cue;
import androidx.media3.common.text.CueGroup;
import androidx.media3.datasource.DefaultHttpDataSource;
import androidx.media3.exoplayer.DefaultLoadControl;
import androidx.media3.exoplayer.DefaultRenderersFactory;
import androidx.media3.exoplayer.ExoPlayer;
import androidx.media3.exoplayer.source.DefaultMediaSourceFactory;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

/**
 * Kibo IPTV (Android): la interfaz web (assets/www) va dentro de un WebView transparente
 * y el video lo dibuja ExoPlayer (Media3) en una SurfaceView por debajo, igual que AVPlay en Samsung.
 */
public class MainActivity extends Activity {

    private final Handler ui = new Handler(Looper.getMainLooper());
    private FrameLayout root;
    private SurfaceView sv;
    private WebView web;
    private ExoPlayer pl;

    private boolean tv;
    private boolean prepared;
    private int bufSec = 0;
    private boolean pipOn = true;
    private boolean inPip = false;
    private int ar = 0; // 0 original, 1 16:9, 2 4:3, 3 estirar, 4 zoom

    // zona de video pedida por la interfaz (píxeles) y tamaño real del video
    private int rx = 0, ry = 0, rw = 1, rh = 1;
    private int vw = 0, vh = 0;

    private volatile String stateStr = "IDLE";
    private volatile boolean pwr = false;
    private volatile long durMs = 0;
    private volatile String tracksJson = "[]";
    private final List<Object[]> trk = new ArrayList<>();

    private final Runnable tick = new Runnable() {
        @Override public void run() {
            if (pl != null && prepared) {
                long d = pl.getDuration();
                durMs = (d == C.TIME_UNSET) ? 0 : d;
                js("window.__av('time'," + pl.getCurrentPosition() + ")");
            }
            ui.postDelayed(this, 500);
        }
    };

    @Override
    protected void onCreate(Bundle b) {
        super.onCreate(b);
        UiModeManager um = (UiModeManager) getSystemService(UI_MODE_SERVICE);
        tv = (um != null && um.getCurrentModeType() == Configuration.UI_MODE_TYPE_TELEVISION)
                || getPackageManager().hasSystemFeature("android.software.leanback");

        root = new FrameLayout(this);
        root.setBackgroundColor(Color.BLACK);

        sv = new SurfaceView(this);
        sv.setLayoutParams(new FrameLayout.LayoutParams(1, 1));
        sv.setVisibility(View.INVISIBLE);
        root.addView(sv);

        web = new WebView(this);
        web.setBackgroundColor(Color.TRANSPARENT);
        web.setOverScrollMode(View.OVER_SCROLL_NEVER);
        web.setVerticalScrollBarEnabled(false);
        web.setHorizontalScrollBarEnabled(false);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(true);
        s.setAllowFileAccessFromFileURLs(true);
        s.setAllowUniversalAccessFromFileURLs(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        s.setUseWideViewPort(false);
        s.setLoadWithOverviewMode(false);
        s.setSupportZoom(false);
        s.setBuiltInZoomControls(false);
        web.setWebChromeClient(new WebChromeClient());
        web.setWebViewClient(new WebViewClient() {
            @Override public void onPageFinished(WebView v, String u) { sendDim(); }
        });
        web.addJavascriptInterface(new Bridge(), "KiboNative");
        root.addView(web, new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT));
        setContentView(root);

        // avisar a la interfaz del tamaño real de la pantalla cada vez que cambie (teclado, giro, barras...)
        root.addOnLayoutChangeListener(new View.OnLayoutChangeListener() {
            @Override public void onLayoutChange(View v, int l, int t, int r, int bt,
                                                 int oL, int oT, int oR, int oB) {
                if ((r - l) != (oR - oL) || (bt - t) != (oB - oT)) { sendDim(); if (inPip) applyRect(); }
            }
        });

        web.loadUrl("file:///android_asset/www/index.html");
        ui.postDelayed(tick, 500);
    }

    private void sendDim() {
        if (root == null) return;
        float d = getResources().getDisplayMetrics().density;
        int w = root.getWidth(), h = root.getHeight();
        if (w > 0 && h > 0) js("window.__dim&&window.__dim(" + (w / d) + "," + (h / d) + "," + w + "," + h + ")");
    }

    // ---------- teclas del control remoto / botón Atrás ----------
    private int mapKey(int c) {
        switch (c) {
            case KeyEvent.KEYCODE_BACK: return 10009;
            case KeyEvent.KEYCODE_PROG_RED: return 403;
            case KeyEvent.KEYCODE_CHANNEL_UP: return 427;
            case KeyEvent.KEYCODE_CHANNEL_DOWN: return 428;
            case KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE: return 10252;
            case KeyEvent.KEYCODE_MEDIA_PLAY: return 415;
            case KeyEvent.KEYCODE_MEDIA_PAUSE: return 19;
            case KeyEvent.KEYCODE_MEDIA_STOP: return 413;
            case KeyEvent.KEYCODE_MEDIA_FAST_FORWARD: return 417;
            case KeyEvent.KEYCODE_MEDIA_REWIND: return 412;
            default: return 0;
        }
    }

    @Override
    public boolean dispatchKeyEvent(KeyEvent e) {
        int m = mapKey(e.getKeyCode());
        if (m > 0) {
            if (e.getAction() == KeyEvent.ACTION_DOWN && e.getRepeatCount() == 0) js("window.__k(" + m + ")");
            return true;
        }
        return super.dispatchKeyEvent(e);
    }

    // ---------- ciclo de vida ----------
    @Override protected void onStart() { super.onStart(); js("window.__vis&&window.__vis(true)"); }
    @Override protected void onStop() { js("window.__vis&&window.__vis(false)"); super.onStop(); }

    @Override
    protected void onDestroy() {
        ui.removeCallbacks(tick);
        releaseP();
        if (web != null) { web.destroy(); web = null; }
        super.onDestroy();
    }

    @Override
    public void onWindowFocusChanged(boolean f) {
        super.onWindowFocusChanged(f);
        if (f) hideBars();
    }

    // ---------- imagen en imagen (superposición) ----------
    @Override
    protected void onUserLeaveHint() {
        super.onUserLeaveHint();
        if (!tv && pipOn && pl != null && prepared && pwr && Build.VERSION.SDK_INT >= 26) {
            try {
                enterPictureInPictureMode(new PictureInPictureParams.Builder()
                        .setAspectRatio(new Rational(16, 9)).build());
            } catch (Exception ignored) { }
        }
    }

    @Override
    public void onPictureInPictureModeChanged(boolean isIn, Configuration c) {
        super.onPictureInPictureModeChanged(isIn, c);
        inPip = isIn;
        if (web != null) web.setVisibility(isIn ? View.INVISIBLE : View.VISIBLE);
        applyRect();
        ui.postDelayed(new Runnable() { @Override public void run() { applyRect(); } }, 250);
    }

    private void hideBars() {
        if (Build.VERSION.SDK_INT >= 30) {
            getWindow().setDecorFitsSystemWindows(false);
            WindowInsetsController c = getWindow().getInsetsController();
            if (c != null) {
                c.hide(WindowInsets.Type.systemBars());
                c.setSystemBarsBehavior(WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
            }
        } else {
            getWindow().getDecorView().setSystemUiVisibility(
                    View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                            | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                            | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION);
        }
    }

    private void js(final String code) {
        ui.post(new Runnable() {
            @Override public void run() {
                if (web != null) web.evaluateJavascript(code, null);
            }
        });
    }

    // ---------- reproductor ----------
    private void applyRect() {
        int x = rx, y = ry, w = rw, h = rh;
        if (inPip && root != null) { x = 0; y = 0; w = root.getWidth(); h = root.getHeight(); }
        float va = (vw > 0 && vh > 0) ? (float) vw / vh : 0f;
        if (ar == 1) va = 16f / 9f; else if (ar == 2) va = 4f / 3f;
        if (ar != 3 && va > 0 && w > 0 && h > 0) {
            float ra = (float) w / h;
            boolean cover = (ar == 4);
            if ((va > ra) != cover) { int nh = Math.round(w / va); y += (h - nh) / 2; h = nh; }
            else { int nw = Math.round(h * va); x += (w - nw) / 2; w = nw; }
        }
        FrameLayout.LayoutParams lp = new FrameLayout.LayoutParams(Math.max(1, w), Math.max(1, h));
        lp.leftMargin = x;
        lp.topMargin = y;
        sv.setLayoutParams(lp);
        sv.setVisibility(View.VISIBLE);
    }

    private void releaseP() {
        if (pl != null) {
            pl.release();
            pl = null;
        }
        prepared = false;
        pwr = false;
        stateStr = "IDLE";
        durMs = 0;
        vw = 0;
        vh = 0;
        tracksJson = "[]";
        trk.clear();
    }

    private void openP(String url) {
        releaseP();
        DefaultLoadControl lc;
        if (bufSec > 0) {
            lc = new DefaultLoadControl.Builder().setBufferDurationsMs(
                    Math.max(15000, bufSec * 1000), Math.max(50000, bufSec * 2000),
                    bufSec * 1000, bufSec * 1000).build();
        } else {
            lc = new DefaultLoadControl.Builder().build();
        }
        DefaultHttpDataSource.Factory http = new DefaultHttpDataSource.Factory()
                .setAllowCrossProtocolRedirects(true)
                .setUserAgent("Kibo IPTV");
        // el decodificador FFmpeg (si está) permite AC3/EAC3/DTS que muchos teléfonos no decodifican
        DefaultRenderersFactory rf = new DefaultRenderersFactory(this)
                .setExtensionRendererMode(DefaultRenderersFactory.EXTENSION_RENDERER_MODE_PREFER)
                .setEnableDecoderFallback(true);
        pl = new ExoPlayer.Builder(this, rf)
                .setMediaSourceFactory(new DefaultMediaSourceFactory(http))
                .setLoadControl(lc)
                .build();
        pl.setTrackSelectionParameters(pl.getTrackSelectionParameters().buildUpon()
                .setTrackTypeDisabled(C.TRACK_TYPE_TEXT, true).build());
        pl.addListener(new Player.Listener() {
            @Override public void onPlaybackStateChanged(int st) {
                if (st == Player.STATE_READY) {
                    long d = pl != null ? pl.getDuration() : C.TIME_UNSET;
                    durMs = (d == C.TIME_UNSET) ? 0 : d;
                    if (!prepared) {
                        prepared = true;
                        stateStr = pwr ? "PLAYING" : "PAUSED";
                        js("window.__av('prep')");
                    } else {
                        js("window.__av('be')");
                    }
                } else if (st == Player.STATE_BUFFERING) {
                    if (prepared) js("window.__av('bs')");
                } else if (st == Player.STATE_ENDED) {
                    js("window.__av('end')");
                }
            }
            @Override public void onPlayWhenReadyChanged(boolean pw, int reason) {
                pwr = pw;
                if (prepared) stateStr = pw ? "PLAYING" : "PAUSED";
            }
            @Override public void onPlayerError(PlaybackException err) {
                js("window.__av('err'," + JSONObject.quote(String.valueOf(err.getErrorCodeName())) + ")");
            }
            @Override public void onTracksChanged(Tracks t) { rebuildTracks(t); }
            @Override public void onVideoSizeChanged(VideoSize v) {
                vw = Math.round(v.width * (v.pixelWidthHeightRatio > 0 ? v.pixelWidthHeightRatio : 1f));
                vh = v.height;
                applyRect();
            }
            @Override public void onCues(CueGroup g) {
                StringBuilder sb = new StringBuilder();
                for (Cue c : g.cues) {
                    if (c.text != null) { if (sb.length() > 0) sb.append('\n'); sb.append(c.text); }
                }
                String txt = sb.toString();
                js("window.__av('sub'," + (txt.isEmpty() ? 1 : 60000) + "," + JSONObject.quote(txt) + ")");
            }
        });
        pl.setVideoSurfaceView(sv);
        pl.setMediaItem(MediaItem.fromUri(url));
        pl.setPlayWhenReady(false);
    }

    private void rebuildTracks(Tracks t) {
        trk.clear();
        JSONArray arr = new JSONArray();
        int idx = 0;
        try {
            for (Tracks.Group g : t.getGroups()) {
                int type = g.getType();
                if (type != C.TRACK_TYPE_AUDIO && type != C.TRACK_TYPE_TEXT) continue;
                for (int i = 0; i < g.length; i++) {
                    Format f = g.getTrackFormat(i);
                    JSONObject e = new JSONObject();
                    e.put("language", f.language == null ? "" : f.language);
                    e.put("label", f.label == null ? "" : f.label);
                    e.put("channels", f.channelCount > 0 ? f.channelCount : 0);
                    e.put("codec", f.sampleMimeType == null ? "" : f.sampleMimeType);
                    e.put("supported", g.isTrackSupported(i));
                    JSONObject o = new JSONObject();
                    o.put("index", idx);
                    o.put("type", type == C.TRACK_TYPE_AUDIO ? "AUDIO" : "TEXT");
                    o.put("extra_info", e.toString());
                    arr.put(o);
                    trk.add(new Object[]{type, g, i});
                    idx++;
                }
            }
        } catch (JSONException ignored) { }
        tracksJson = arr.toString();
        js("window.__av('trk')");
    }

    private void selectP(int idx) {
        if (pl == null || idx < 0 || idx >= trk.size()) return;
        Object[] o = trk.get(idx);
        int type = (Integer) o[0];
        Tracks.Group g = (Tracks.Group) o[1];
        int i = (Integer) o[2];
        pl.setTrackSelectionParameters(pl.getTrackSelectionParameters().buildUpon()
                .setTrackTypeDisabled(type, false)
                .setOverrideForType(new TrackSelectionOverride(g.getMediaTrackGroup(), i))
                .build());
    }

    // ---------- puente JS <-> Java (las funciones se llaman desde un hilo de WebView) ----------
    public class Bridge {
        @JavascriptInterface public void open(final String u) {
            ui.post(new Runnable() { public void run() { openP(u); } });
        }
        @JavascriptInterface public void prepare() {
            ui.post(new Runnable() { public void run() { if (pl != null) pl.prepare(); } });
        }
        @JavascriptInterface public void play() {
            pwr = true;
            ui.post(new Runnable() { public void run() { if (pl != null) pl.play(); } });
        }
        @JavascriptInterface public void pause() {
            pwr = false;
            ui.post(new Runnable() { public void run() { if (pl != null) pl.pause(); } });
        }
        @JavascriptInterface public void close() {
            ui.post(new Runnable() { public void run() { releaseP(); } });
        }
        @JavascriptInterface public void seek(final long ms) {
            ui.post(new Runnable() { public void run() { if (pl != null) pl.seekTo(ms); } });
        }
        @JavascriptInterface public void rect(final int x, final int y, final int w, final int h) {
            ui.post(new Runnable() { public void run() {
                rx = x; ry = y; rw = Math.max(1, w); rh = Math.max(1, h);
                applyRect();
            } });
        }
        @JavascriptInterface public void buffer(int sec) { bufSec = sec; }
        @JavascriptInterface public void setPip(boolean on) { pipOn = on; }
        @JavascriptInterface public void aspect(final int m) {
            ui.post(new Runnable() { public void run() { ar = m; applyRect(); } });
        }
        @JavascriptInterface public void select(String type, final int idx) {
            ui.post(new Runnable() { public void run() { selectP(idx); } });
        }
        @JavascriptInterface public String state() { return stateStr; }
        @JavascriptInterface public double dur() { return (double) durMs; }
        @JavascriptInterface public String tracks() { return tracksJson; }
        @JavascriptInterface public boolean isTv() { return tv; }
        @JavascriptInterface public void quit() {
            ui.post(new Runnable() { public void run() { finish(); } });
        }
    }
}
