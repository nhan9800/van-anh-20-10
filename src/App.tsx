import { type CSSProperties, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import confetti from 'canvas-confetti';
import Lenis from 'lenis';
import { ArrowDown, ArrowUpRight, ChevronLeft, ChevronRight, ExternalLink, Heart, MapPin, Music2, Pause, Play, Quote, Sparkles, X } from 'lucide-react';
import { loveData } from './config/loveData';

type Counter = { days: number; hours: number; minutes: number; seconds: number };

const format = (value: number) => String(value).padStart(2, '0');

function useLoveCounter() {
  const [counter, setCounter] = useState<Counter>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const tick = () => {
      const from = new Date(loveData.anniversaryISO).getTime();
      const difference = Math.max(0, Date.now() - from);
      const totalSeconds = Math.floor(difference / 1000);
      setCounter({
        days: Math.floor(totalSeconds / 86400),
        hours: Math.floor((totalSeconds % 86400) / 3600),
        minutes: Math.floor((totalSeconds % 3600) / 60),
        seconds: totalSeconds % 60,
      });
    };
    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, []);
  return counter;
}

function Intro({ onOpen }: { onOpen: () => void }) {
  return (
    <motion.div className="intro" initial={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.75 } }}>
      <div className="intro-noise" />
      <motion.div className="intro-orbit orbit-a" animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }} />
      <motion.div className="intro-orbit orbit-b" animate={{ rotate: -360 }} transition={{ duration: 24, repeat: Infinity, ease: 'linear' }} />
      <div className="intro-copy">
        <p className="eyebrow light-eyebrow"><span>✦</span> Một món quà nhỏ từ Trọng Nhân <span>✦</span></p>
        <h1>Dành riêng cho<br /><em>Vân Anh</em></h1>
        <p className="intro-sub">Mở thiệp để bước vào một góc nhỏ có hoa, ảnh và những điều anh thương.</p>
      </div>
      <button className="envelope-wrap" onClick={onOpen} aria-label="Mở thiệp dành cho Vân Anh">
        <motion.div className="envelope" whileHover={{ y: -6, rotate: -1 }} whileTap={{ scale: 0.98 }}>
          <span className="envelope-flap" />
          <span className="envelope-paper"><Heart size={28} strokeWidth={1.25} fill="currentColor" /><small>VA · 20.10</small></span>
          <span className="wax-seal">VA</span>
        </motion.div>
        <span className="open-label">Chạm để mở thiệp <ArrowUpRight size={16} /></span>
      </button>
      <p className="intro-date">20.10.2026 <span>·</span> love letter no. 01</p>
    </motion.div>
  );
}

type LoveAudio = { context: AudioContext; master: GainNode; timer: number };
let loveAudio: LoveAudio | null = null;

const chordSequence = [
  [261.63, 329.63, 392.0, 493.88],
  [220.0, 261.63, 329.63, 392.0],
  [174.61, 220.0, 261.63, 329.63],
  [196.0, 293.66, 392.0, 440.0],
];

function playLoveChord(context: AudioContext, master: GainNode, chord: number[], index: number) {
  const start = context.currentTime + 0.05;
  chord.forEach((frequency, noteIndex) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = noteIndex === 3 ? 'triangle' : 'sine';
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(noteIndex === 3 ? 0.02 : 0.05, start + 0.8);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 4.9);
    oscillator.connect(gain).connect(master);
    oscillator.start(start);
    oscillator.stop(start + 5.1);
  });

  const melody = [chord[2] * 2, chord[3] * 2, chord[1] * 2, chord[2] * 2][index % 4];
  const lead = context.createOscillator();
  const leadGain = context.createGain();
  lead.type = 'sine';
  lead.frequency.setValueAtTime(melody, start + 1.05);
  leadGain.gain.setValueAtTime(0.0001, start + 1.05);
  leadGain.gain.linearRampToValueAtTime(0.025, start + 1.35);
  leadGain.gain.exponentialRampToValueAtTime(0.0001, start + 3.6);
  lead.connect(leadGain).connect(master);
  lead.start(start + 1.05);
  lead.stop(start + 3.8);
}

function startLoveMusic() {
  if (loveAudio) {
    void loveAudio.context.resume();
    return true;
  }
  const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return false;
  const context = new AudioContextClass();
  const master = context.createGain();
  const compressor = context.createDynamicsCompressor();
  compressor.threshold.value = -18;
  compressor.knee.value = 24;
  compressor.ratio.value = 8;
  compressor.attack.value = 0.012;
  compressor.release.value = 0.25;
  master.gain.value = loveData.music.volume;
  master.connect(compressor).connect(context.destination);
  let index = 0;
  playLoveChord(context, master, chordSequence[index], index);
  const timer = window.setInterval(() => {
    index = (index + 1) % chordSequence.length;
    playLoveChord(context, master, chordSequence[index], index);
  }, 5100);
  loveAudio = { context, master, timer };
  return true;
}

function stopLoveMusic() {
  if (!loveAudio) return;
  window.clearInterval(loveAudio.timer);
  loveAudio.master.gain.exponentialRampToValueAtTime(0.0001, loveAudio.context.currentTime + 0.35);
  const context = loveAudio.context;
  window.setTimeout(() => { void context.close(); }, 450);
  loveAudio = null;
}

function MusicToggle({ playing, onToggle }: { playing: boolean; onToggle: () => void }) {
  return (
    <div className="music-actions">
      <button className={`music-toggle ${playing ? 'is-playing' : ''}`} onClick={onToggle} aria-label={playing ? 'Tắt nhạc' : 'Bật nhạc'}>
        <span className="disc"><Music2 size={14} /></span><span>{playing ? 'Đang phát' : 'Bật nhạc'}</span>{playing ? <Pause size={14} /> : <Play size={14} />}
      </button>
      <a className="official-track" href={loveData.officialTrackUrl} target="_blank" rel="noreferrer" aria-label="Mở bản chính thức của bài Để dành cho em">
        <ExternalLink size={13} /><span>Bản chính thức</span>
      </a>
    </div>
  );
}

function Header({ musicOn, onToggleMusic }: { musicOn: boolean; onToggleMusic: () => void }) {
  return (
    <header className="site-header">
      <a className="brand" href="#top" aria-label="Về đầu trang"><span>VA</span><small>20·10</small></a>
      <nav className="nav-links" aria-label="Điều hướng chính">
        <a href="#journey">Hành trình</a><a href="#gallery">Mảnh ghép</a><a href="#letter">Lời chúc</a>
      </nav>
      <MusicToggle playing={musicOn} onToggle={onToggleMusic} />
    </header>
  );
}

function PetalRain() {
  const petals = useMemo(() => Array.from({ length: 24 }, (_, index) => ({
    left: `${(index * 37) % 101}%`,
    delay: `${(index % 8) * 0.9}s`,
    duration: `${8 + (index % 5) * 1.4}s`,
    size: `${8 + (index % 4) * 2}px`,
    drift: `${-70 + (index % 7) * 23}px`,
    tint: index % 3,
  })), []);
  return <div className="petal-layer" aria-hidden="true">{petals.map((petal, index) => <span key={index} className={`petal petal-${petal.tint}`} style={{ '--petal-left': petal.left, '--petal-delay': petal.delay, '--petal-duration': petal.duration, '--petal-size': petal.size, '--petal-drift': petal.drift } as CSSProperties} />)}</div>;
}

function Hero() {
  const reduce = useReducedMotion();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const imageY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 90]);
  const imageRotate = useTransform(scrollYProgress, [0, 1], [3, reduce ? 3 : -3]);
  return (
    <section className="hero section-pad" id="top" ref={heroRef}>
      <div className="hero-copy">
        <p className="eyebrow"><span>✦</span> Happy Vietnamese Women&apos;s Day <span>·</span> 20.10.2026</p>
        <h2>Gửi Vân Anh,<br /><em>dịu dàng</em> của riêng anh.</h2>
        <p className="hero-lede">Có những người xuất hiện rất khẽ, rồi làm cả thế giới của mình trở nên mềm hơn. Với anh, người đó là em.</p>
        <a className="text-link" href="#journey">Đi qua những điều anh thương <ArrowDown size={15} /></a>
      </div>
      <div className="hero-visual" aria-label="Ảnh của Vân Anh">
        <motion.div className="hero-stamp" initial={{ scale: 0, rotate: -22 }} animate={{ scale: 1, rotate: 8 }} transition={{ delay: 0.6, type: 'spring' }}>VA <span>♥</span></motion.div>
        <motion.div className="hero-frame frame-back" style={{ y: imageY, rotate: imageRotate }}>
          <img src={loveData.images.heroSecondary} alt="Vân Anh cầm bó hoa" />
          <span className="frame-caption">a little joy, kept forever</span>
        </motion.div>
        <motion.div className="hero-frame frame-front" initial={{ opacity: 0, y: 30, rotate: -7 }} animate={{ opacity: 1, y: 0, rotate: -7 }} transition={{ duration: 0.8, delay: 0.15 }}>
          <img src={loveData.images.hero} alt="Vân Anh trong chiếc váy đỏ" />
          <span className="frame-caption">for my favourite person</span>
        </motion.div>
        <div className="hero-thread"><span /><Heart size={20} fill="currentColor" /><span /></div>
      </div>
      <div className="hero-scroll"><span>scroll gently</span><span className="scroll-line" /></div>
    </section>
  );
}

function CounterCard() {
  const counter = useLoveCounter();
  const items = [
    { value: counter.days, label: 'ngày' }, { value: format(counter.hours), label: 'giờ' }, { value: format(counter.minutes), label: 'phút' }, { value: format(counter.seconds), label: 'giây' },
  ];
  return (
    <div className="counter-card paper-card">
      <div className="counter-top"><span className="tiny-label">Từ ngày 28.12.2025</span><Heart size={17} fill="currentColor" /></div>
      <p className="counter-title">Mình đã có nhau được</p>
      <div className="counter-grid">{items.map((item) => <div className="counter-unit" key={item.label}><strong>{item.value}</strong><span>{item.label}</span></div>)}</div>
      <p className="counter-foot">và anh vẫn đang đếm thêm từng ngày có em</p>
    </div>
  );
}

function Journey() {
  return (
    <section className="journey section-pad" id="journey">
      <div className="section-heading"><div><p className="eyebrow"><span>01</span> our little timeline</p><h3>Một tình yêu<br /><em>đang lớn lên.</em></h3></div><p className="heading-note">Khoảng cách có thể dài, nhưng cảm giác được ở cạnh nhau luôn chỉ cách một tin nhắn.</p></div>
      <div className="journey-grid">
        <CounterCard />
        <div className="bridge-card">
          <div className="bridge-map"><span className="map-dot dot-left" /><span className="map-dash" /><span className="bridge-heart"><Heart size={20} fill="currentColor" /></span><span className="map-dash" /><span className="map-dot dot-right" /></div>
          <div className="bridge-cities"><span><MapPin size={15} />Đà Nẵng</span><span>Bắc Ninh<MapPin size={15} /></span></div>
          <p>Khoảng cách địa lý chỉ là những con số, vì trong tim anh, em luôn ở gần nhất.</p>
        </div>
      </div>
    </section>
  );
}

function Gallery() {
  const [selected, setSelected] = useState<string | null>(null);
  const [deckIndex, setDeckIndex] = useState(0);
  const deck = loveData.images.selfies;
  const next = () => setDeckIndex((index) => (index + 1) % deck.length);
  const previous = () => setDeckIndex((index) => (index - 1 + deck.length) % deck.length);
  return (
    <section className="gallery section-pad" id="gallery">
      <div className="section-heading gallery-heading"><div><p className="eyebrow"><span>02</span> the photo studio</p><h3>Mảnh ghép<br /><em>của chúng mình.</em></h3></div><p className="heading-note">Một vài phiên bản của em mà anh muốn giữ lại thật lâu.</p></div>
      <div className="split-story"><div className="split-image split-left"><img src={loveData.images.portraits[0]} alt="Vân Anh nhìn về phía máy ảnh" /></div><div className="split-copy"><Quote size={22} /><p>Mọi mảnh ghép đều trở nên hoàn hảo từ ngày có em.</p><span>Trọng Nhân, 2026</span></div><div className="split-image split-right"><img src={loveData.images.bouquet} alt="Vân Anh ôm bó hoa" /></div></div>
      <div className="bento-head"><p className="eyebrow"><span>03</span> vẻ đẹp của em</p><p>Không cần dịp đặc biệt để thấy em thật xinh.</p></div>
      <div className="bento-grid">
        {loveData.images.portraits.map((src, index) => <button key={src} className={`bento-item bento-${index + 1}`} onClick={() => setSelected(src)}><img src={src} alt={`Khoảnh khắc ${index + 1} của Vân Anh`} /><span className="bento-note">{loveData.compliments[index]}</span></button>)}
        <div className="bento-note-card"><Sparkles size={21} /><p>Em là phần dịu dàng nhất trong những ngày bận rộn của anh.</p><span>✦ with love</span></div>
      </div>
      <div className="polaroid-section"><div className="polaroid-copy"><p className="eyebrow"><span>04</span> polaroid deck</p><h4>Những khung hình<br /><em>anh muốn cất.</em></h4><p>Vuốt qua từng tấm ảnh nhỏ, như lật lại một ngăn ký ức.</p></div><div className="deck-wrap"><div className="deck-shadow" /><motion.button className="polaroid-card" key={deckIndex} initial={{ opacity: 0, x: 38, rotate: 8 }} animate={{ opacity: 1, x: 0, rotate: -5 }} transition={{ duration: 0.45 }} onClick={() => setSelected(deck[deckIndex])}><img src={deck[deckIndex]} alt="Ảnh kỷ niệm của Vân Anh" /><span>Vân Anh, always</span></motion.button><div className="deck-controls"><button onClick={previous} aria-label="Ảnh trước"><ChevronLeft size={18} /></button><span>{String(deckIndex + 1).padStart(2, '0')} / {String(deck.length).padStart(2, '0')}</span><button onClick={next} aria-label="Ảnh tiếp theo"><ChevronRight size={18} /></button></div></div></div>
      {selected && <div className="lightbox" role="dialog" aria-modal="true" aria-label="Xem ảnh lớn"><button className="lightbox-close" onClick={() => setSelected(null)} aria-label="Đóng ảnh"><X /></button><img src={selected} alt="Khoảnh khắc phóng to" /></div>}
    </section>
  );
}

function Letter() {
  return <section className="letter-section section-pad" id="letter"><div className="letter-top"><p className="eyebrow"><span>05</span> a note, in my handwriting</p><p>Gửi em, từ nơi anh luôn nghĩ về em.</p></div><motion.article className="letter-card" initial={{ opacity: 0, y: 34, rotate: 1 }} whileInView={{ opacity: 1, y: 0, rotate: -1 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.8 }}><div className="letter-heart">♡</div><div className="letter-lines">{loveData.wishes.map((line, i) => <motion.p key={line} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 + i * 0.16 }}>{line}</motion.p>)}</div><div className="letter-sign"><span>thương em,</span><strong>Trọng Nhân</strong></div><div className="letter-doodle doodle-one">✦</div><div className="letter-doodle doodle-two">♡</div></motion.article></section>;
}

function Gift() {
  const [opened, setOpened] = useState(false);
  const launch = () => {
    setOpened(true);
    confetti({ particleCount: 120, spread: 100, origin: { y: 0.7 }, colors: ['#7a1c33', '#d4af37', '#f6d4dc', '#fff7ee'], shapes: ['circle'], scalar: 1.15 });
    window.setTimeout(() => confetti({ particleCount: 70, spread: 120, origin: { y: 0.55 }, colors: ['#7a1c33', '#e9a8ba', '#d4af37'] }), 250);
  };
  return <section className="gift-section section-pad"><div className="gift-orb orb-left" /><div className="gift-orb orb-right" /><div className="gift-inner"><p className="eyebrow light-eyebrow"><span>06</span> one last little thing</p><h3>Món quà nhỏ<br /><em>cho em.</em></h3><p>Nhấn vào đây để nhận một lời hứa mà anh muốn giữ thật lâu.</p><button className="gift-button" onClick={launch}><span>Chạm để nhận hoa từ anh</span><Heart size={18} fill="currentColor" /></button></div>{opened && <motion.div className="pass" initial={{ opacity: 0, scale: 0.85, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }}><button className="pass-close" onClick={() => setOpened(false)} aria-label="Đóng thẻ"><X size={18} /></button><div className="pass-mark">VA <span>♥</span></div><p className="pass-kicker">LOVE VIP PASS · 20.10.2026</p><h4>Đặc quyền<br /><em>của Vân Anh</em></h4><ul>{loveData.lovePass.map((item) => <li key={item}><Heart size={14} fill="currentColor" />{item}</li>)}</ul><div className="pass-footer"><span>issued with love</span><strong>TN · ∞</strong></div></motion.div>}</section>;
}

function Footer() { return <footer className="site-footer"><span>VA · 20.10</span><span>made for the girl who makes everything softer <Heart size={13} fill="currentColor" /></span><span>© 2026</span></footer>; }

export default function App() {
  const [opened, setOpened] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [musicOn, setMusicOn] = useState(false);
  const reduce = useReducedMotion();
  const smoothRef = useRef<Lenis | null>(null);
  useEffect(() => {
    if (showIntro || reduce) return;
    const lenis = new Lenis({ duration: 1.05, smoothWheel: true });
    smoothRef.current = lenis;
    let frame = 0;
    const raf = (time: number) => { lenis.raf(time); frame = requestAnimationFrame(raf); };
    frame = requestAnimationFrame(raf);
    return () => { cancelAnimationFrame(frame); lenis.destroy(); smoothRef.current = null; };
  }, [showIntro, reduce]);
  const pageVariants = useMemo(() => ({ initial: { opacity: 0 }, animate: { opacity: 1, transition: { duration: 0.9, delayChildren: 0.1, staggerChildren: 0.08 } } }), []);
  useEffect(() => () => stopLoveMusic(), []);
  const handleOpen = () => {
    const started = startLoveMusic();
    setMusicOn(started);
    setOpened(true);
    setShowIntro(false);
  };
  const toggleMusic = () => {
    if (musicOn) { stopLoveMusic(); setMusicOn(false); } else { setMusicOn(startLoveMusic()); }
  };
  return <div className="app-shell"><AnimatePresence>{showIntro && <Intro onOpen={handleOpen} />}</AnimatePresence>{opened && <motion.div variants={pageVariants} initial="initial" animate="animate" className="page"><PetalRain /><Header musicOn={musicOn} onToggleMusic={toggleMusic} /><main><Hero /><Journey /><Gallery /><Letter /><Gift /></main><Footer /></motion.div>}</div>;
}
