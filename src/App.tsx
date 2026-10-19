import { type CSSProperties, type PointerEvent, type SyntheticEvent, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, MotionConfig, motion, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion';
import confetti from 'canvas-confetti';
import Lenis from 'lenis';
import { ArrowDown, ArrowUpRight, ChevronLeft, ChevronRight, Heart, MapPin, Music2, Pause, Play, Quote, Sparkles, X } from 'lucide-react';
import { loveData } from './config/loveData';
import { LocalMusicPlayer } from './LocalMusicPlayer';

type Counter = { days: number; hours: number; minutes: number; seconds: number };

const format = (value: number) => String(value).padStart(2, '0');
const imageFallback = (event: SyntheticEvent<HTMLImageElement>) => {
  const image = event.currentTarget;
  if (!image.src.endsWith('/images/photo-fallback.svg')) image.src = `${import.meta.env.BASE_URL}images/photo-fallback.svg`;
};

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

function MusicToggle({ playing, onToggle }: { playing: boolean; onToggle: () => void }) {
  return (
    <div className="music-actions">
      <button className={`music-toggle ${playing ? 'is-playing' : ''}`} onClick={onToggle} aria-label={playing ? 'Tắt nhạc' : 'Bật nhạc'}>
        <span className="disc"><Music2 size={14} /></span><span>{playing ? 'Đang phát' : 'Bật nhạc'}</span>{playing ? <Pause size={14} /> : <Play size={14} />}
      </button>
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
  const petals = useMemo(() => Array.from({ length: 42 }, (_, index) => {
    const duration = 11 + (index * 7) % 10;
    return {
      left: `${(index * 47.3) % 101}%`,
      delay: `${-((index * 3.7) % duration)}s`,
      duration: `${duration}s`,
      size: `${index % 5 === 0 ? 25 + index % 9 : 14 + index % 11}px`,
      drift: `${-95 + (index * 31) % 190}px`,
      tint: index % 3,
      flower: index % 5 === 0,
    };
  }), []);
  return <div className="petal-layer" aria-hidden="true">{petals.map((petal, index) => <span key={index} className={`falling-flower flower-${petal.tint} ${petal.flower ? 'is-blossom' : 'is-petal'}`} style={{ '--flower-left': petal.left, '--flower-delay': petal.delay, '--flower-duration': petal.duration, '--flower-size': petal.size, '--flower-drift': petal.drift } as CSSProperties}>{petal.flower && <svg viewBox="0 0 40 40" focusable="false"><ellipse cx="20" cy="10" rx="7" ry="10" /><ellipse cx="29.5" cy="17" rx="7" ry="10" transform="rotate(72 29.5 17)" /><ellipse cx="26" cy="29" rx="7" ry="10" transform="rotate(144 26 29)" /><ellipse cx="14" cy="29" rx="7" ry="10" transform="rotate(216 14 29)" /><ellipse cx="10.5" cy="17" rx="7" ry="10" transform="rotate(288 10.5 17)" /><circle cx="20" cy="20" r="4" /></svg>}</span>)}</div>;
}

function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const imageY = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const imageRotate = useTransform(scrollYProgress, [0, 1], [3, -3]);
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const springX = useSpring(tiltX, { stiffness: 120, damping: 22 });
  const springY = useSpring(tiltY, { stiffness: 120, damping: 22 });
  const movePhotos = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse') return;
    const rect = event.currentTarget.getBoundingClientRect();
    tiltX.set(((event.clientY - rect.top) / rect.height - 0.5) * -8);
    tiltY.set(((event.clientX - rect.left) / rect.width - 0.5) * 8);
  };
  return (
    <section className="hero section-pad" id="top" ref={heroRef}>
      <div className="hero-copy">
        <p className="eyebrow"><span>✦</span> Happy Vietnamese Women&apos;s Day <span>·</span> 20.10.2026</p>
        <h2>Gửi Vân Anh,<br /><em>dịu dàng</em> của riêng anh.</h2>
        <p className="hero-lede">Có những người xuất hiện rất khẽ, rồi làm cả thế giới của mình trở nên mềm hơn. Với anh, người đó là em.</p>
        <a className="text-link" href="#journey">Đi qua những điều anh thương <ArrowDown size={15} /></a>
      </div>
      <div className="hero-visual" aria-label="Ảnh của Vân Anh" onPointerMove={movePhotos} onPointerLeave={() => { tiltX.set(0); tiltY.set(0); }}>
        <motion.div className="hero-tilt" style={{ rotateX: springX, rotateY: springY }}>
          <motion.div className="hero-stamp" initial={{ scale: 0, rotate: -22 }} animate={{ scale: 1, rotate: 8 }} transition={{ delay: 0.6, type: 'spring' }}>VA <span>♥</span></motion.div>
          <motion.div className="hero-frame frame-back" style={{ y: imageY, rotate: imageRotate }}>
            <img src={loveData.images.heroSecondary} alt="Vân Anh cầm bó hoa" onError={imageFallback} />
            <span className="frame-caption">a little joy, kept forever</span>
          </motion.div>
          <motion.div className="hero-frame frame-front" initial={{ opacity: 0, y: 30, rotate: -7 }} animate={{ opacity: 1, y: 0, rotate: -7 }} transition={{ duration: 0.8, delay: 0.15 }}>
            <img src={loveData.images.hero} alt="Vân Anh trong chiếc váy đỏ" onError={imageFallback} />
            <span className="frame-caption">for my favourite person</span>
          </motion.div>
          <div className="hero-thread"><span /><Heart size={20} fill="currentColor" /><span /></div>
        </motion.div>
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
  const lastSwipeAt = useRef(0);
  const pointerStartX = useRef(0);
  const pointerMoved = useRef(false);
  const deck = loveData.images.selfies;
  const next = () => setDeckIndex((index) => (index + 1) % deck.length);
  const previous = () => setDeckIndex((index) => (index - 1 + deck.length) % deck.length);
  useEffect(() => {
    if (!selected) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelected(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selected]);
  return (
    <section className="gallery section-pad" id="gallery">
      <div className="section-heading gallery-heading"><div><p className="eyebrow"><span>02</span> the photo studio</p><h3>Mảnh ghép<br /><em>của chúng mình.</em></h3></div><p className="heading-note">Một vài phiên bản của em mà anh muốn giữ lại thật lâu.</p></div>
      <div className="split-story"><motion.div className="split-image split-left" initial={{ opacity: 0, x: -75, rotate: -8 }} whileInView={{ opacity: 1, x: 0, rotate: -3 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}><img src={loveData.images.portraits[0]} alt="Vân Anh nhìn về phía máy ảnh" onError={imageFallback} /></motion.div><motion.div className="split-copy" initial={{ opacity: 0, scale: 0.92 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.7, delay: 0.15 }}><Quote size={22} /><p>Mọi mảnh ghép đều trở nên hoàn hảo từ ngày có em.</p><span>Trọng Nhân, 2026</span></motion.div><motion.div className="split-image split-right" initial={{ opacity: 0, x: 75, rotate: 8 }} whileInView={{ opacity: 1, x: 0, rotate: 3 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}><img src={loveData.images.bouquet} alt="Vân Anh ôm bó hoa" onError={imageFallback} /></motion.div></div>
      <div className="bento-head"><p className="eyebrow"><span>03</span> vẻ đẹp của em</p><p>Không cần dịp đặc biệt để thấy em thật xinh.</p></div>
      <div className="bento-grid">
        {loveData.images.portraits.map((src, index) => <button key={src} className={`bento-item bento-${index + 1}`} onClick={() => setSelected(src)}><img src={src} alt={`Khoảnh khắc ${index + 1} của Vân Anh`} onError={imageFallback} /><span className="bento-note">{loveData.compliments[index]}</span></button>)}
        <div className="bento-note-card"><Sparkles size={21} /><p>Em là phần dịu dàng nhất trong những ngày bận rộn của anh.</p><span>✦ with love</span></div>
      </div>
      <div className="polaroid-section"><div className="polaroid-copy"><p className="eyebrow"><span>04</span> polaroid deck</p><h4>Những khung hình<br /><em>anh muốn cất.</em></h4><p>Vuốt qua từng tấm ảnh nhỏ, như lật lại một ngăn ký ức.</p></div><div className="deck-wrap"><div className="deck-shadow" /><motion.button className="polaroid-card" key={deckIndex} type="button" drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.2} initial={{ opacity: 0, x: 38, rotate: 8 }} animate={{ opacity: 1, x: 0, rotate: -5 }} transition={{ duration: 0.45 }} onPointerDown={(event) => { pointerStartX.current = event.clientX; pointerMoved.current = false; }} onPointerMove={(event) => { if (Math.abs(event.clientX - pointerStartX.current) > 15) pointerMoved.current = true; }} onDragEnd={(_, info) => { if (Math.abs(info.offset.x) < 45) return; lastSwipeAt.current = performance.now(); if (info.offset.x < 0) next(); else previous(); }} onClick={(event) => { if (event.detail === 0 || (!pointerMoved.current && performance.now() - lastSwipeAt.current > 400)) setSelected(deck[deckIndex]); }} aria-label={`Xem lớn ảnh ${deckIndex + 1}, vuốt để chuyển ảnh`}><img src={deck[deckIndex]} alt="Ảnh kỷ niệm của Vân Anh" draggable="false" onError={imageFallback} /><span>Vân Anh, always</span></motion.button><div className="deck-controls"><button onClick={previous} aria-label="Ảnh trước"><ChevronLeft size={18} /></button><span>{String(deckIndex + 1).padStart(2, '0')} / {String(deck.length).padStart(2, '0')}</span><button onClick={next} aria-label="Ảnh tiếp theo"><ChevronRight size={18} /></button></div></div></div>
      {selected && <div className="lightbox" role="dialog" aria-modal="true" aria-label="Xem ảnh lớn" onClick={(event) => { if (event.target === event.currentTarget) setSelected(null); }}><button className="lightbox-close" onClick={() => setSelected(null)} aria-label="Đóng ảnh"><X /></button><img src={selected} alt="Khoảnh khắc phóng to" onError={imageFallback} /></div>}
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
    const heart = confetti.shapeFromPath({ path: 'M50 90 C35 77 8 57 8 34 C8 19 19 9 33 9 C41 9 47 13 50 20 C53 13 59 9 67 9 C81 9 92 19 92 34 C92 57 65 77 50 90 Z' });
    confetti({ particleCount: 120, spread: 100, origin: { y: 0.7 }, colors: ['#7a1c33', '#d4af37', '#f6d4dc', '#fff7ee'], shapes: [heart, 'circle'], scalar: 1.15 });
    window.setTimeout(() => confetti({ particleCount: 70, spread: 120, origin: { y: 0.55 }, colors: ['#7a1c33', '#e9a8ba', '#d4af37'] }), 250);
  };
  return <section className="gift-section section-pad"><div className="gift-orb orb-left" /><div className="gift-orb orb-right" /><div className="gift-inner"><p className="eyebrow light-eyebrow"><span>06</span> one last little thing</p><h3>Món quà nhỏ<br /><em>cho em.</em></h3><p>Nhấn vào đây để nhận một lời hứa mà anh muốn giữ thật lâu.</p><button className="gift-button" onClick={launch}><span>Chạm để nhận hoa từ anh</span><Heart size={18} fill="currentColor" /></button></div>{opened && <motion.div className="pass" initial={{ opacity: 0, scale: 0.85, x: '-50%', y: 'calc(-50% + 24px)', rotate: -3 }} animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%', rotate: -3 }}><button className="pass-close" onClick={() => setOpened(false)} aria-label="Đóng thẻ"><X size={18} /></button><div className="pass-mark">VA <span>♥</span></div><p className="pass-kicker">LOVE VIP PASS · 20.10.2026</p><h4>Đặc quyền<br /><em>của Vân Anh</em></h4><ul>{loveData.lovePass.map((item) => <li key={item}><Heart size={14} fill="currentColor" />{item}</li>)}</ul><div className="pass-footer"><span>issued with love</span><strong>TN · ∞</strong></div></motion.div>}</section>;
}

function Footer() { return <footer className="site-footer"><span>VA · 20.10</span><span>made for the girl who makes everything softer <Heart size={13} fill="currentColor" /></span><span>© 2026</span></footer>; }

export default function App() {
  const [opened, setOpened] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [musicOn, setMusicOn] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const smoothRef = useRef<Lenis | null>(null);
  useEffect(() => {
    if (showIntro) return;
    const lenis = new Lenis({ duration: 1.05, smoothWheel: true });
    smoothRef.current = lenis;
    let frame = 0;
    const raf = (time: number) => { lenis.raf(time); frame = requestAnimationFrame(raf); };
    frame = requestAnimationFrame(raf);
    return () => { cancelAnimationFrame(frame); lenis.destroy(); smoothRef.current = null; };
  }, [showIntro]);
  const pageVariants = useMemo(() => ({ initial: { opacity: 0 }, animate: { opacity: 1, transition: { duration: 0.9, delayChildren: 0.1, staggerChildren: 0.08 } } }), []);
  const handleOpen = () => {
    // Start inside the envelope click so mobile browsers allow sound immediately.
    void audioRef.current?.play().catch(() => setMusicOn(false));
    setOpened(true);
    setShowIntro(false);
  };
  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) void audio.play().catch(() => setMusicOn(false));
    else audio.pause();
  };
  return <MotionConfig reducedMotion="never"><div className="app-shell"><LocalMusicPlayer audioRef={audioRef} opened={opened} playing={musicOn} onPlayingChange={setMusicOn} onToggle={toggleMusic} /><AnimatePresence>{showIntro && <Intro onOpen={handleOpen} />}</AnimatePresence>{opened && <motion.div variants={pageVariants} initial="initial" animate="animate" className="page"><PetalRain /><Header musicOn={musicOn} onToggleMusic={toggleMusic} /><main><Hero /><Journey /><Gallery /><Letter /><Gift /></main><Footer /></motion.div>}</div></MotionConfig>;
}
