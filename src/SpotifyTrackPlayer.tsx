import { useEffect, useRef, useState } from 'react';
import { ExternalLink, Music2, X } from 'lucide-react';
import { loveData } from './config/loveData';

type SpotifyController = {
  play: () => void;
  pause: () => void;
  destroy: () => void;
  addListener: (event: string, callback: (event: { data: { isPaused?: boolean } }) => void) => void;
};
type SpotifyApi = {
  createController: (element: HTMLElement, options: { uri: string; width: string; height: number }, callback: (controller: SpotifyController) => void) => void;
};

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: SpotifyApi) => void;
  }
}

let spotifyApiPromise: Promise<SpotifyApi> | null = null;

function loadSpotifyApi() {
  if (!spotifyApiPromise) {
    spotifyApiPromise = new Promise<SpotifyApi>((resolve, reject) => {
      window.onSpotifyIframeApiReady = resolve;
      const script = document.createElement('script');
      script.src = 'https://open.spotify.com/embed/iframe-api/v1';
      script.async = true;
      script.onerror = () => {
        spotifyApiPromise = null;
        reject(new Error('Spotify player could not be loaded'));
      };
      document.head.appendChild(script);
    });
  }
  return spotifyApiPromise;
}

export function SpotifyTrackPlayer({ playing, onPlaybackChange, onClose }: { playing: boolean; onPlaybackChange: (playing: boolean) => void; onClose: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<SpotifyController | null>(null);
  const playingRef = useRef(playing);
  const onPlaybackChangeRef = useRef(onPlaybackChange);
  const [unavailable, setUnavailable] = useState(false);
  const [needsTap, setNeedsTap] = useState(false);

  playingRef.current = playing;
  onPlaybackChangeRef.current = onPlaybackChange;

  useEffect(() => {
    let disposed = false;
    let startTimer: number | undefined;
    let hasStarted = false;
    const container = containerRef.current;
    if (!container) return;

    void loadSpotifyApi().then((api) => {
      if (disposed) return;
      const mountPoint = document.createElement('div');
      container.appendChild(mountPoint);
      api.createController(mountPoint, { uri: `spotify:track:${loveData.spotifyTrackId}`, width: '100%', height: 152 }, (controller) => {
        if (disposed) { controller.destroy(); return; }
        controllerRef.current = controller;
        controller.addListener('ready', () => {
          if (disposed) return;
          if (!playingRef.current) return;
          controller.play();
          startTimer = window.setTimeout(() => {
            if (!hasStarted && !disposed) {
              setNeedsTap(true);
              onPlaybackChangeRef.current(false);
            }
          }, 2500);
        });
        controller.addListener('playback_started', () => {
          if (disposed) return;
          hasStarted = true;
          setNeedsTap(false);
          onPlaybackChangeRef.current(true);
        });
        controller.addListener('playback_update', ({ data }) => {
          if (disposed) return;
          if (hasStarted && typeof data.isPaused === 'boolean') onPlaybackChangeRef.current(!data.isPaused);
        });
      });
    }).catch(() => {
      if (!disposed) {
        setUnavailable(true);
        onPlaybackChangeRef.current(false);
      }
    });

    return () => {
      disposed = true;
      if (startTimer) window.clearTimeout(startTimer);
      controllerRef.current?.destroy();
      controllerRef.current = null;
      container.replaceChildren();
    };
  }, []);

  useEffect(() => {
    if (playing) {
      setNeedsTap(false);
      controllerRef.current?.play();
    } else controllerRef.current?.pause();
  }, [playing]);

  return (
    <aside className="official-player-card" aria-label="Bản preview bài Để dành cho em">
      <div className="official-player-heading"><Music2 size={16} /><span>Để dành cho em</span><small>Dangrangto · DONAL</small><button onClick={onClose} aria-label="Đóng trình phát và tắt nhạc"><X size={14} /></button></div>
      <div className="official-player-frame" ref={containerRef} />
      {needsTap && <p className="official-player-hint">Chạm Play trong khung nhạc để nghe preview.</p>}
      {unavailable && <p className="official-player-error">Không tải được bản preview trên trang này.</p>}
      <div className="official-player-links"><a href={loveData.spotifyTrackUrl} target="_blank" rel="noreferrer">Spotify <ExternalLink size={12} /></a><a href={loveData.officialTrackUrl} target="_blank" rel="noreferrer">Video chính thức <ExternalLink size={12} /></a></div>
    </aside>
  );
}
