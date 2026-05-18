/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect, useCallback, ChangeEvent, FormEvent } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Repeat, 
  Shuffle, 
  Volume2, 
  VolumeX, 
  ListMusic, 
  Music2, 
  Heart,
  ChevronRight,
  ChevronLeft,
  X,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

/**
 * 【使用教程 / 如何替換音樂】
 * 
 * 下方的 `INITIAL_PLAYLIST` 數組存放了所有歌曲的信息。
 * 你可以修改或新增對象來更新歌單：
 * 
 * {
 *   id: number,          // 唯一ID
 *   title: string,       // 歌曲名
 *   artist: string,      // 歌手名
 *   cover: string,       // 專輯封面圖片鏈接
 *   url: string,         // 音樂文件鏈接 (mp3, wav 等)
 *   duration: string     // 顯示時長 (可選)
 * }
 */

interface Track {
  id: number;
  title: string;
  artist: string;
  cover: string;
  url: string;
  duration: string;
}

const INITIAL_PLAYLIST: Track[] = [
  {
    id: 1,
    title: "Lofi Study",
    artist: "FASSounds",
    cover: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&q=80&w=400",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    duration: "06:12"
  },
  {
    id: 2,
    title: "Chill Deep House",
    artist: "Coma-Media",
    cover: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=400",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    duration: "07:05"
  },
  {
    id: 3,
    title: "Midnight City",
    artist: "80s Vibe",
    cover: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&q=80&w=400",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    duration: "05:40"
  },
  {
    id: 4,
    title: "Nature Sounds",
    artist: "Ambient Explorer",
    cover: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=400",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    duration: "08:22"
  }
];

export default function App() {
  const [playlist, setPlaylist] = useState<Track[]>(INITIAL_PLAYLIST);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'none' | 'one' | 'all'>('all');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showAddTrack, setShowAddTrack] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = playlist[currentTrackIndex];

  // Handle Playback
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(console.error);
      }
      setIsPlaying(!isPlaying);
    }
  };

  const playTrack = (index: number) => {
    setCurrentTrackIndex(index);
    setIsPlaying(true);
  };

  const nextTrack = useCallback(() => {
    let nextIndex;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * playlist.length);
    } else {
      nextIndex = (currentTrackIndex + 1) % playlist.length;
    }
    playTrack(nextIndex);
  }, [currentTrackIndex, isShuffle, playlist.length]);

  const prevTrack = () => {
    let prevIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
    playTrack(prevIndex);
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.play().catch(() => setIsPlaying(false));
    }
  }, [currentTrackIndex]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (!duration) setDuration(audioRef.current.duration);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleEnded = () => {
    if (repeatMode === 'one') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else if (repeatMode === 'all') {
      nextTrack();
    } else {
      setIsPlaying(false);
    }
  };

  const addNewTrack = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newTrack: Track = {
      id: Date.now(),
      title: formData.get('title') as string,
      artist: formData.get('artist') as string,
      cover: (formData.get('cover') as string) || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=400",
      url: formData.get('url') as string,
      duration: "--:--"
    };
    if (newTrack.title && newTrack.url) {
      setPlaylist([...playlist, newTrack]);
      setShowAddTrack(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-bg text-text-main selection:bg-white/10">
      <audio
        ref={audioRef}
        src={currentTrack.url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      {/* Top Navigation Bar */}
      <nav className="h-16 border-b border-border-dim flex justify-between items-center px-6 z-50 bg-bg shrink-0">
        <div className="text-xl font-bold tracking-[0.2em] text-accent uppercase">MUSE</div>
        <div className="flex gap-8 text-[11px] font-semibold uppercase tracking-widest text-text-dim items-center">
          <span className="cursor-pointer hover:text-white transition-colors">Discovery</span>
          <span className="cursor-pointer hover:text-white transition-colors text-white">Collection</span>
          <span className="cursor-pointer hover:text-white transition-colors">About</span>
        </div>
        <div className="text-[11px] font-mono text-text-dim tabular-nums">USER_2026</div>
      </nav>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar - Playlist */}
        <AnimatePresence mode="wait">
          {isSidebarOpen && (
            <motion.aside 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="h-full bg-surface border-r border-border-dim flex flex-col shrink-0 overflow-hidden"
            >
              <div className="p-6 border-b border-border-dim flex justify-between items-center h-16 shrink-0">
                <span className="text-[11px] text-text-dim uppercase tracking-[0.15em]">Your Library</span>
                <button 
                  onClick={() => setShowAddTrack(true)}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pt-4 space-y-0.5">
                {playlist.map((track, index) => (
                  <button
                    key={track.id}
                    onClick={() => playTrack(index)}
                    className={`w-full flex items-center gap-4 px-6 py-3 transition-all relative group ${
                      currentTrackIndex === index ? 'bg-white/10 border-l-4 border-accent' : 'hover:bg-white/5 border-l-4 border-transparent'
                    }`}
                  >
                    <div className="w-10 h-10 bg-black/40 rounded shrink-0 overflow-hidden border border-white/5">
                      <img src={track.cover} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className={`text-sm font-medium truncate ${currentTrackIndex === index ? 'text-accent' : 'text-text-main opacity-80 group-hover:opacity-100'}`}>
                        {track.title}
                      </div>
                      <div className="text-xs text-text-dim truncate">{track.artist}</div>
                    </div>
                    <div className="text-[11px] text-text-dim tabular-nums">{track.duration}</div>
                  </button>
                ))}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Player View */}
        <main className="flex-1 relative flex flex-col items-center justify-center p-8 bg-[radial-gradient(circle_at_center,_#1a1a1a_0%,_#0a0a0a_100%)]">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="absolute top-6 left-6 p-2 rounded-full hover:bg-white/10 transition-colors text-text-dim hover:text-white z-40"
          >
            {isSidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>

          <div className="w-full max-w-2xl flex flex-col items-center gap-16">
            {/* Vinyl Record */}
            <div className="relative group">
              <div 
                className={`w-[240px] h-[240px] md:w-[320px] md:h-[320px] rounded-full bg-black border-[12px] border-[#1a1a1a] shadow-[0_40px_100px_rgba(0,0,0,0.8)] relative flex items-center justify-center transition-transform duration-700 ${
                  isPlaying ? 'animate-rotate' : 'pause-animation'
                }`}
              >
                {/* Vinyl Texture Lines */}
                <div className="absolute inset-0 rounded-full border border-white/5" />
                <div className="absolute inset-[10%] rounded-full border border-white/5" />
                <div className="absolute inset-[20%] rounded-full border border-white/5" />
                
                {/* Album Cover Circle */}
                <div className="w-[140px] h-[140px] rounded-full overflow-hidden border-[4px] border-[#111] z-10 shrink-0">
                  <img src={currentTrack.cover} alt="" className="w-full h-full object-cover" />
                </div>
                
                {/* Central Hole */}
                <div className="absolute w-6 h-6 rounded-full bg-bg z-20 border border-white/10" />
              </div>
            </div>

            {/* Track Metadata */}
            <div className="text-center space-y-3">
              <h2 className="text-3xl md:text-5xl font-light text-white tracking-wide">{currentTrack.title}</h2>
              <p className="text-base text-text-dim uppercase tracking-[0.2em]">{currentTrack.artist} — Album</p>
            </div>
          </div>
        </main>
      </div>

      {/* Bottom Control Bar */}
      <footer className="h-24 border-t border-border-dim bg-bg flex items-center px-6 gap-10 shrink-0 z-50">
        <div className="flex items-center gap-6 shrink-0">
          <button onClick={prevTrack} className="text-text-dim hover:text-white transition-colors">
            <SkipBack size={20} fill="currentColor" />
          </button>
          <button 
            onClick={togglePlay}
            className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-all shadow-xl"
          >
            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
          </button>
          <button onClick={nextTrack} className="text-text-dim hover:text-white transition-colors">
            <SkipForward size={20} fill="currentColor" />
          </button>
        </div>

        {/* Progress Section */}
        <div className="flex-1 flex items-center gap-4 text-[11px] font-mono text-text-dim">
          <span className="w-10 text-right tabular-nums">{formatTime(currentTime)}</span>
          <div className="relative flex-1 group">
            <input 
              type="range" 
              min="0" 
              max={duration || 0} 
              step="0.1"
              value={currentTime}
              onChange={handleSeek}
              className="w-full relative z-10 opacity-0 cursor-pointer h-1"
            />
            {/* Custom Track Visuals */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 bg-border-dim rounded-full" />
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-accent rounded-full pointer-events-none"
              style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
            />
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full shadow-lg pointer-events-none"
              style={{ left: `${(currentTime / (duration || 1)) * 100}%`, transform: 'translate(-50%, -50%)' }}
            />
          </div>
          <span className="w-10 tabular-nums">{formatTime(duration)}</span>
        </div>

        {/* Secondary Controls & Volume */}
        <div className="flex items-center gap-6 shrink-0">
          <div className="flex gap-4 text-text-dim mr-4 border-r border-border-dim pr-6">
            <button 
              onClick={() => setIsShuffle(!isShuffle)}
              className={isShuffle ? 'text-accent' : 'hover:text-white'}
            >
              <Shuffle size={16} />
            </button>
            <button 
              onClick={() => setRepeatMode(repeatMode === 'all' ? 'one' : repeatMode === 'one' ? 'none' : 'all')}
              className={repeatMode !== 'none' ? 'text-accent' : 'hover:text-white'}
            >
              <Repeat size={16} />
            </button>
          </div>
          
          <div className="flex items-center gap-3 w-32 border-l border-border-dim pl-6 hidden md:flex">
            <button onClick={() => setIsMuted(!isMuted)} className="text-text-dim hover:text-white">
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <div className="flex-1 relative flex items-center group">
              <input 
                type="range" min="0" max="1" step="0.01" 
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-full opacity-0 cursor-pointer relative z-10"
              />
              <div className="absolute inset-x-0 h-[2px] bg-border-dim rounded-full" />
              <div 
                className="absolute left-0 h-[2px] bg-text-dim rounded-full"
                style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </footer>

      {/* Add Track Dialog */}
      <AnimatePresence>
        {showAddTrack && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-md bg-surface border border-border-dim p-8 rounded-lg space-y-6 shadow-2xl"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium tracking-tight">ADD NEW TRACK</h3>
                <button onClick={() => setShowAddTrack(false)} className="text-text-dim hover:text-white transition-colors"><X size={20} /></button>
              </div>
              <form onSubmit={addNewTrack} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-text-dim uppercase tracking-widest font-bold">Track Title</label>
                  <input name="title" required className="w-full bg-bg border border-border-dim rounded px-4 py-2.5 outline-none focus:border-text-dim transition-colors text-sm" placeholder="e.g. Midnight City" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-text-dim uppercase tracking-widest font-bold">Artist Name</label>
                  <input name="artist" className="w-full bg-bg border border-border-dim rounded px-4 py-2.5 outline-none focus:border-text-dim transition-colors text-sm" placeholder="e.g. M83" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-text-dim uppercase tracking-widest font-bold">Audio URL</label>
                  <input name="url" required className="w-full bg-bg border border-border-dim rounded px-4 py-2.5 outline-none focus:border-text-dim transition-colors text-sm" placeholder="Direct link to mp3/wav" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-text-dim uppercase tracking-widest font-bold">Cover URL (Optional)</label>
                  <input name="cover" className="w-full bg-bg border border-border-dim rounded px-4 py-2.5 outline-none focus:border-text-dim transition-colors text-sm" placeholder="Direct link to image" />
                </div>
                <button type="submit" className="w-full py-3 bg-accent text-bg font-bold rounded uppercase tracking-[0.15em] text-xs hover:bg-gray-200 transition-colors mt-2">
                  Confirm Addition
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
