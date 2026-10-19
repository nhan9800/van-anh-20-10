import { type CSSProperties, type RefObject, useState } from 'react';
import { Music2, Pause, Play, Volume2 } from 'lucide-react';
import { loveData } from './config/loveData';

type Props = {
  audioRef: RefObject<HTMLAudioElement | null>;
  opened: boolean;
  playing: boolean;
  onPlayingChange: (playing: boolean) => void;
  onToggle: () => void;
};

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return '0:00';
  const whole = Math.floor(seconds);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
}

export function LocalMusicPlayer({ audioRef, opened, playing, onPlayingChange, onToggle }: Props) {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [loadError, setLoadError] = useState(false);

  const seek = (value: number) => {
    if (!audioRef.current || !duration) return;
    audioRef.current.currentTime = value;
    setCurrentTime(value);
  };

  const changeVolume = (value: number) => {
    if (!audioRef.current) return;
    audioRef.current.volume = value;
    setVolume(value);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return <>
    <audio
      ref={audioRef}
      src={loveData.audioUrl}
      preload="metadata"
      loop
      onPlay={() => onPlayingChange(true)}
      onPause={() => onPlayingChange(false)}
      onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
      onDurationChange={(event) => setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0)}
      onError={() => { setLoadError(true); onPlayingChange(false); }}
    />
    {opened && <aside className={`music-player ${playing ? 'is-playing' : ''}`} aria-label="Trình phát bài Để dành cho em">
      <div className="music-player-top">
        <div className="music-player-art" aria-hidden="true"><Music2 size={18} /></div>
        <div className="music-player-info"><strong>để dành cho em</strong><span>Dangrangto · DONAL</span></div>
        <button className="music-player-play" type="button" onClick={onToggle} aria-label={playing ? 'Tạm dừng nhạc' : 'Phát nhạc'}>{playing ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" />}</button>
      </div>
      <div className="music-player-timeline">
        <span>{formatTime(currentTime)}</span>
        <input
          type="range"
          min="0"
          max={duration || 1}
          step="0.1"
          value={Math.min(currentTime, duration || 1)}
          disabled={!duration}
          onChange={(event) => seek(Number(event.currentTarget.value))}
          style={{ '--seek-progress': `${progress}%` } as CSSProperties}
          aria-label="Tua đến vị trí trong bài nhạc"
        />
        <span>{duration ? formatTime(duration) : '0:00'}</span>
      </div>
      <div className="music-player-bottom">
        <span>{loadError ? 'Không tải được file nhạc' : playing ? 'Đang phát xuyên suốt thiệp' : 'Chạm phát để nghe nhạc'}</span>
        <label className="music-player-volume"><Volume2 size={14} /><input type="range" min="0" max="1" step="0.01" value={volume} onChange={(event) => changeVolume(Number(event.currentTarget.value))} aria-label="Âm lượng nhạc" /></label>
      </div>
    </aside>}
  </>;
}
