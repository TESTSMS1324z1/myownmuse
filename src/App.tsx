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
  MoreHorizontal,
  ChevronRight,
  ChevronLeft,
  X,
  Plus,
  ArrowUpRight,
  Search,
  Copy,
  Check
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
  lyrics?: string;
}

interface Folder {
  id: string;
  name: string;
  tracks: Track[];
}

const INITIAL_PLAYLIST: Track[] = [
  {
    id: 1,
    title: "愛你但說不出口",
    artist: "Karencici",
    cover: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/c9/54/84/c954844d-079a-4b58-2d5b-8f7877ba979e/5021732443519.jpg/592x592bb.webp",
    url: "https://ldosa9402.github.io/music/愛你但說不出口.mp3",
    duration: "02:59",
    lyrics: "none"
  },
  {
    id: 2,
    title: "沉溺",
    artist: "鄒沛沛、Pank",
    cover: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/04/95/ef/0495ef40-2ad6-05a4-ec2f-5d7ed45adf0f/23UMGIM28880.rgb.jpg/592x592bb.webp",
    url: "https://ldosa9402.github.io/hooyeah123.github.io/music/沉溺.m4a",
    duration: "03:13",
    lyrics: "none"
  },
  {
    id: 3,
    title: "Beauty And A Beat",
    artist: "Justin Bieber",
    cover: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/73/08/1a/73081a96-0f7c-b5f8-2757-5c17fb714323/12UMGIM31899.rgb.jpg/300x300bb.webp",
    url: "https://ldosa9402.github.io/hooyeah123.github.io/music/Beauty_And_A_Beat.m4a",
    duration: "03:48",
    lyrics: "none"
  },
  {
    id: 4,
    title: "吹夢到西洲",
    artist: "戀戀故人難,黃詩扶,妖揚",
    cover: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/6a/c2/82/6ac28205-d19f-6fb6-ced1-1d946ad8c16f/8445281384357.jpg/592x592bb.webp",
    url: "https://ldosa9402.github.io/hooyeah123.github.io/music/吹夢到西洲.m4a",
    duration: "05:15",
    lyrics: "none"
  },
  {
    id: 5,
    title: "娛樂人生",
    artist: "陳蕾",
    cover: "https://is1-ssl.mzstatic.com/image/thumb/Music123/v4/4a/0e/bb/4a0ebb26-a9c2-8f7b-df32-46487d203776/190295411046.jpg/592x592bb.webp",
    url: "https://ldosa9402.github.io/hooyeah123.github.io/music/娛樂人生.m4a",
    duration: "03:55",
    lyrics: "none"
  }
];

const INITIAL_FOLDERS: Folder[] = [
  {
    id: 'f1',
    name: 'Your Collection',
    tracks: INITIAL_PLAYLIST
  }
];

export default function App() {
  const [folders, setFolders] = useState<Folder[]>(INITIAL_FOLDERS);
  const [currentPlaylist, setCurrentPlaylist] = useState<Track[]>(INITIAL_PLAYLIST);
  const [currentPlaylistName, setCurrentPlaylistName] = useState('All Tracks');
  const [currentTrackIndex, setCurrentTrackIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'none' | 'one' | 'all'>('all');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showAddTrack, setShowAddTrack] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [queue, setQueue] = useState<Track[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [likedTracks, setLikedTracks] = useState<Set<number>>(new Set());
  const [audioError, setAudioError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = currentTrackIndex !== -1 ? currentPlaylist[currentTrackIndex] : null;

  const toggleLike = (id: number) => {
    setLikedTracks(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Handle Playback
  const togglePlay = useCallback(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(console.error);
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const playTrack = useCallback((track: Track, fromPlaylist: Track[], playlistName: string = 'Playlist') => {
    const index = fromPlaylist.findIndex(t => t.id === track.id);
    setCurrentPlaylist(fromPlaylist);
    setCurrentPlaylistName(playlistName);
    setCurrentTrackIndex(index !== -1 ? index : 0);
    setIsPlaying(true);
    setAudioError(null);
  }, []);

  const playFolder = useCallback((folder: Folder) => {
    if (folder.tracks.length > 0) {
      setCurrentPlaylist(folder.tracks);
      setCurrentPlaylistName(folder.name);
      setCurrentTrackIndex(0);
      setIsPlaying(true);
      setAudioError(null);
    }
  }, []);

  const addToQueue = (track: Track) => {
    setQueue(prev => [...prev, track]);
  };

  const removeFromQueue = (index: number) => {
    setQueue(prev => prev.filter((_, i) => i !== index));
  };

  const nextTrack = useCallback(() => {
    if (queue.length > 0) {
      const nextFromQueue = queue[0];
      setQueue(prev => prev.slice(1));
      
      // We need to find if this track exists in current playlist or not
      // If not, we might need to handle it. For now, let's just update currentTrackIndex if possible
      const indexInPlaylist = currentPlaylist.findIndex(t => t.id === nextFromQueue.id);
      if (indexInPlaylist !== -1) {
        setCurrentTrackIndex(indexInPlaylist);
      } else {
        // If it's a completely new track (e.g. from a different folder), 
        // we prepend it to current playlist or just play it as a one-off
        setCurrentPlaylist(prev => [nextFromQueue, ...prev]);
        setCurrentTrackIndex(0);
      }
      setIsPlaying(true);
      return;
    }

    let nextIndex;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * currentPlaylist.length);
    } else {
      nextIndex = (currentTrackIndex + 1) % currentPlaylist.length;
    }
    setCurrentTrackIndex(nextIndex);
    setIsPlaying(true);
  }, [currentTrackIndex, isShuffle, currentPlaylist, queue]);

  const prevTrack = useCallback(() => {
    if (currentPlaylist.length === 0) return;
    let prevIndex = (currentTrackIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
    setCurrentTrackIndex(prevIndex);
    setIsPlaying(true);
  }, [currentTrackIndex, currentPlaylist]);

  // Sync Media Session and Document Title
  useEffect(() => {
    if (currentTrack) {
      const statusIcon = isPlaying ? '▶' : '⏸';
      document.title = `${statusIcon} ${currentTrack.title} - Muse`;
      
      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new window.MediaMetadata({
          title: currentTrack.title,
          artist: currentTrack.artist,
          album: currentPlaylistName || 'Muse Collection',
          artwork: [
            { src: currentTrack.cover, sizes: '96x96', type: 'image/webp' },
            { src: currentTrack.cover, sizes: '128x128', type: 'image/webp' },
            { src: currentTrack.cover, sizes: '192x192', type: 'image/webp' },
            { src: currentTrack.cover, sizes: '256x256', type: 'image/webp' },
            { src: currentTrack.cover, sizes: '384x384', type: 'image/webp' },
            { src: currentTrack.cover, sizes: '512x512', type: 'image/webp' },
          ]
        });

        navigator.mediaSession.setActionHandler('play', togglePlay);
        navigator.mediaSession.setActionHandler('pause', togglePlay);
        navigator.mediaSession.setActionHandler('previoustrack', prevTrack);
        navigator.mediaSession.setActionHandler('nexttrack', nextTrack);
      }
    } else {
      document.title = 'Muse - 私人線上音樂播放器';
    }
  }, [currentTrack, isPlaying, nextTrack, togglePlay, prevTrack, currentPlaylistName]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (audioRef.current && currentTrack) {
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      }
    }
  }, [currentTrack?.url]);

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

  const toggleFolder = (id: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const addNewTrack = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Calculate next ID from all tracks in all folders
    const allTracks = folders.flatMap(f => f.tracks);
    const maxId = Math.max(...allTracks.map(t => t.id), 0);
    const nextId = maxId + 1;

    const title = formData.get('title') as string;
    const artist = formData.get('artist') as string;
    const cover = (formData.get('cover') as string) || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=400";
    const url = formData.get('url') as string;
    const duration = (formData.get('duration') as string) || "00:00";
    const lyrics = (formData.get('lyrics') as string) || "none";

    const code = `  {
    id: ${nextId},
    title: "${title}",
    artist: "${artist}",
    cover: "${cover}",
    url: "${url}",
    duration: "${duration}",
    lyrics: "${lyrics.replace(/\n/g, '\\n')}"
  },`;

    setGeneratedCode(code);
  };

  const copyToClipboard = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-bg text-text-main selection:bg-white/10">
      {currentTrack && (
        <audio
          key={currentTrack.url}
          ref={audioRef}
          src={encodeURI(currentTrack.url)}
          crossOrigin="anonymous"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          onError={() => {
            setIsPlaying(false);
            setAudioError("The audio file could not be loaded. Please check the URL.");
          }}
        />
      )}

      {/* Top Navigation Bar */}
      <nav className="h-16 border-b border-border-dim flex justify-between items-center px-4 md:px-6 z-50 bg-bg shrink-0">
        <div className="text-xl font-bold tracking-[0.2em] text-accent uppercase">MUSE</div>
        <div className="hidden md:flex gap-8 text-[11px] font-semibold uppercase tracking-widest text-text-dim items-center">
          <span className="cursor-pointer hover:text-white transition-colors text-white">Collection</span>
        </div>
        <div className="text-[10px] md:text-[11px] font-mono text-text-dim tabular-nums">USER_2026</div>
      </nav>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Immersive Background */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <AnimatePresence>
            {currentTrack && (
              <motion.img 
                key={currentTrack.cover}
                src={currentTrack.cover} 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.15 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                className="w-full h-full object-cover scale-110 blur-3xl"
                alt=""
              />
            )}
          </AnimatePresence>
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Sidebar - Playlist (Drawer on Mobile) */}
        <AnimatePresence mode="wait">
          {isSidebarOpen && (
            <motion.aside 
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1, width: window.innerWidth < 768 ? '100%' : 280 }}
              exit={{ x: -100, opacity: 0, width: 0 }}
              className={`h-full bg-surface border-r border-border-dim flex flex-col shrink-0 overflow-hidden z-40 ${
                window.innerWidth < 768 ? 'absolute inset-0' : 'relative'
              }`}
            >
              <div className="p-6 border-b border-border-dim flex justify-between items-center h-16 shrink-0">
                <span className="text-[11px] text-text-dim uppercase tracking-[0.15em]">Your Library</span>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setShowAddTrack(true)}
                    className="p-1.5 hover:bg-white/10 rounded transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                  {/* Close button for mobile sidebar */}
                  <button 
                    onClick={() => setIsSidebarOpen(false)}
                    className="md:hidden p-1.5 hover:bg-white/10 rounded transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              <div className="px-6 py-4 flex flex-col gap-4">
                <div className="relative group">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim group-focus-within:text-accent transition-colors" />
                  <input 
                    type="text"
                    placeholder="Search music..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-black/20 border border-white/5 rounded-full py-2 pl-9 pr-4 text-[11px] outline-none focus:border-accent/30 focus:bg-black/40 transition-all placeholder:text-text-dim/50"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-dim hover:text-white"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pt-2 space-y-1">
                {folders.map((folder) => {
                  const filteredTracks = folder.tracks.filter(track => 
                    track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    track.artist.toLowerCase().includes(searchQuery.toLowerCase())
                  );

                  if (searchQuery && filteredTracks.length === 0) return null;

                  const isExpanded = expandedFolders.has(folder.id) || !!searchQuery;
                  return (
                    <div key={folder.id} className="space-y-0.5">
                      {/* Folder Header */}
                      <div className="group flex items-center gap-2 px-6 py-3 hover:bg-white/5 cursor-pointer">
                        <div 
                          className="flex flex-1 items-center gap-2 overflow-hidden"
                          onClick={() => toggleFolder(folder.id)}
                        >
                          <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : 'rotate-0'}`}>
                            <ChevronRight size={14} className="text-text-dim" />
                          </div>
                          <span className="text-[11px] font-bold text-text-dim uppercase tracking-[0.1em] truncate">
                            {folder.name}
                          </span>
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); playFolder(folder); }}
                          className="opacity-100 md:opacity-0 md:group-hover:opacity-100 p-1.5 bg-accent text-bg rounded-md transition-all hover:scale-110 active:scale-95 shadow-lg"
                          title={`Play ${folder.name}`}
                        >
                          <Play size={12} fill="currentColor" />
                        </button>
                      </div>

                      {/* Folder Tracks */}
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden bg-black/10"
                          >
                            {filteredTracks.map((track) => {
                              const isActive = currentTrack && currentTrack.id === track.id && currentPlaylist.some(t => t.id === track.id);
                              return (
                                <div
                                  key={track.id}
                                  onClick={() => playTrack(track, folder.tracks, folder.name)}
                                  className={`w-full flex items-center gap-4 px-8 py-3 transition-all relative group cursor-pointer ${
                                    isActive ? 'bg-white/10 border-l-4 border-accent' : 'hover:bg-white/5 border-l-4 border-transparent'
                                  }`}
                                >
                                  <div className="w-9 h-9 bg-black/40 rounded shrink-0 overflow-hidden border border-white/5 relative">
                                    <img src={track.cover} alt="" className="w-full h-full object-cover" />
                                    {isActive && isPlaying && (
                                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                        <div className="flex gap-0.5 items-end h-3">
                                          <motion.div animate={{ height: [3, 8, 4, 7, 3] }} transition={{ repeat: Infinity, duration: 1 }} className="w-0.5 bg-white" />
                                          <motion.div animate={{ height: [5, 3, 9, 4, 5] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-0.5 bg-white" />
                                          <motion.div animate={{ height: [4, 7, 3, 9, 4] }} transition={{ repeat: Infinity, duration: 1.2 }} className="w-0.5 bg-white" />
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 text-left">
                                    <div className={`text-sm font-medium truncate ${isActive ? 'text-accent' : 'text-text-main opacity-80 group-hover:opacity-100'}`}>
                                      {track.title}
                                    </div>
                                    <div className="text-[10px] text-text-dim truncate">{track.artist}</div>
                                  </div>
                                  <div className="text-[10px] text-text-dim tabular-nums hidden md:block md:group-hover:hidden">{track.duration}</div>
                                  <div className="flex md:hidden md:group-hover:flex items-center gap-2">
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); addToQueue(track); }}
                                      className="p-1 hover:text-accent transition-colors"
                                      title="Add to Queue"
                                    >
                                      <ArrowUpRight size={14} />
                                    </button>
                                    <Play size={10} className="text-accent" />
                                  </div>
                                </div>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Player View */}
        <main className="flex-1 relative flex flex-col items-center justify-start md:justify-center p-6 md:p-8 overflow-y-auto z-10 transition-all duration-500 custom-scrollbar">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="absolute top-6 left-6 p-2 rounded-full hover:bg-white/10 transition-colors text-text-dim hover:text-white z-30"
          >
            {isSidebarOpen ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
          </button>

          <div className="w-full max-w-xl flex flex-col items-center gap-4 md:gap-12 mt-4 md:mt-0 flex-1 justify-center min-h-fit pb-12 md:pb-0">
            {!currentTrack ? (
              <div className="flex flex-col items-center justify-center text-center space-y-6 px-8 py-12 bg-white/5 rounded-3xl border border-white/5 backdrop-blur-sm">
                <div className="w-24 h-24 rounded-2xl bg-accent/10 flex items-center justify-center text-accent animate-pulse">
                  <Music2 size={48} strokeWidth={1} />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-white uppercase tracking-widest">Select a Vibe</h2>
                  <p className="text-sm text-text-dim max-w-[240px] leading-relaxed">Choose a folder or track from the library to begin your session</p>
                </div>
                <button 
                  onClick={() => setIsSidebarOpen(true)}
                  className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white text-[10px] uppercase tracking-[0.2em] font-bold rounded-full transition-all border border-white/10"
                >
                  Open Library
                </button>
              </div>
            ) : (
              <>
                {/* Album Art - smaller on mobile to fit controls */}
                <motion.div 
                  key={currentTrack.id}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', damping: 20 }}
                  className="relative shadow-[0_40px_80px_rgba(0,0,0,0.6)] rounded-xl overflow-hidden aspect-square w-full max-w-[220px] sm:max-w-[280px] md:max-w-md group shrink-0"
                >
                  <img src={currentTrack.cover} alt="" className="w-full h-full object-cover" />
                </motion.div>

                {/* Track Info & Actions (Mobile style) */}
                <div className="w-full max-w-[320px] md:max-w-md flex flex-col items-center md:items-center space-y-3">
                  {audioError && (
                    <div className="w-full py-2 px-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-[10px] text-center mb-2 animate-pulse">
                      {audioError}
                    </div>
                  )}
                  <div className="w-full flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl md:text-3xl font-bold text-white truncate tracking-tight">{currentTrack.title}</h2>
                      <p className="text-sm md:text-base text-text-dim/80 font-medium truncate mt-0.5">
                        {currentTrack.artist}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <button 
                        onClick={() => toggleLike(currentTrack.id)}
                        className={`p-2 border border-white/5 bg-white/5 rounded-full hover:bg-white/15 transition-all ${
                          likedTracks.has(currentTrack.id) ? 'text-accent' : 'text-text-dim'
                        }`}
                      >
                        <Heart size={18} fill={likedTracks.has(currentTrack.id) ? 'currentColor' : 'none'} />
                      </button>
                      <button className="p-2 border border-white/5 bg-white/5 rounded-full hover:bg-white/15 transition-all text-text-dim hover:text-white">
                        <MoreHorizontal size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Progress & Controls - Mobile Specific */}
                  <div className="w-full md:hidden flex flex-col gap-4">
                    {/* Progress */}
                    <div className="space-y-1">
                      <div className="relative w-full group py-1.5">
                        <input 
                          type="range" min="0" max={duration || 0} step="0.1" value={currentTime}
                          onChange={handleSeek}
                          className="w-full relative z-10 opacity-0 cursor-pointer h-1.5"
                        />
                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1.5 bg-white/10 rounded-full" />
                        <div 
                          className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 bg-white/80 rounded-full"
                          style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] font-mono text-text-dim tabular-nums px-1">
                        <span>{formatTime(currentTime)}</span>
                        <span>-{formatTime(duration - currentTime)}</span>
                      </div>
                    </div>

                    {/* Playback Controls */}
                    <div className="flex items-center justify-between px-4">
                      <button onClick={prevTrack} className="text-white hover:opacity-70 transition-opacity">
                        <SkipBack size={36} fill="currentColor" />
                      </button>
                      <button 
                        onClick={togglePlay}
                        className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl"
                      >
                        {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
                      </button>
                      <button onClick={nextTrack} className="text-white hover:opacity-70 transition-opacity">
                        <SkipForward size={36} fill="currentColor" />
                      </button>
                    </div>

                    {/* Secondary Controls - Shuffle/Repeat/Volume */}
                    <div className="flex flex-col gap-5 pt-1">
                      <div className="flex items-center gap-4 px-2">
                        <VolumeX size={14} className="text-text-dim" />
                        <div className="flex-1 relative h-4 flex items-center">
                          <input 
                            type="range" min="0" max="1" step="0.01" 
                            value={isMuted ? 0 : volume}
                            onChange={(e) => setVolume(parseFloat(e.target.value))}
                            className="w-full opacity-0 cursor-pointer relative z-10"
                          />
                          <div className="absolute inset-x-0 h-1 bg-white/10 rounded-full" />
                          <div 
                            className="absolute left-0 h-1 bg-white/50 rounded-full"
                            style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
                          />
                        </div>
                        <Volume2 size={14} className="text-text-dim" />
                      </div>

                      {/* Icon Actions */}
                      <div className="flex justify-between items-center px-4">
                        <button 
                          onClick={() => setIsShuffle(!isShuffle)}
                          className={`${isShuffle ? 'text-accent' : 'text-text-dim'} transition-colors`}
                        >
                          <Shuffle size={18} />
                        </button>
                        <button 
                          onClick={() => { setShowLyrics(!showLyrics); setShowQueue(false); }}
                          className={`${showLyrics ? 'text-accent' : 'text-text-dim'} transition-colors`}
                        >
                          <Music2 size={20} />
                        </button>
                        <button 
                          onClick={() => { setShowQueue(!showQueue); setShowLyrics(false); }}
                          className={`${showQueue ? 'text-accent' : 'text-text-dim'} transition-colors relative`}
                        >
                          <ListMusic size={20} />
                          {queue.length > 0 && <span className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full" />}
                        </button>
                        <button 
                          onClick={() => setRepeatMode(repeatMode === 'all' ? 'one' : repeatMode === 'one' ? 'none' : 'all')}
                          className={`${repeatMode !== 'none' ? 'text-accent' : 'text-text-dim'} transition-colors`}
                        >
                          <Repeat size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Lyrics Overlay */}
          <AnimatePresence>
            {showLyrics && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute inset-0 z-30 bg-bg/80 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center"
              >
                <button 
                  onClick={() => setShowLyrics(false)}
                  className="absolute top-8 right-8 text-text-dim hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
                <div className="w-full max-w-xl overflow-y-auto max-h-[70vh] px-4 py-8 space-y-6 flex flex-col items-center">
                  <h3 className="text-sm font-bold uppercase tracking-[0.3em] text-accent/60 mb-4 italic">Lyrics</h3>
                  <div className="text-xl md:text-3xl font-light leading-relaxed text-white whitespace-pre-line tracking-wide">
                    {currentTrack?.lyrics || "No lyrics available for this track."}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Queue Overlay */}
          <AnimatePresence>
            {showQueue && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="absolute inset-0 z-30 bg-bg/95 backdrop-blur-2xl flex flex-col p-6 md:p-8"
              >
                <div className="flex justify-between items-center mb-6 md:mb-8">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold uppercase tracking-[0.3em] text-accent/80 italic">Current Sequence</h3>
                    <p className="text-[10px] text-text-dim uppercase tracking-widest">Upcoming tracks</p>
                  </div>
                  <button 
                    onClick={() => setShowQueue(false)}
                    className="p-2 text-text-dim hover:text-white transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-8 max-w-2xl mx-auto w-full px-2 custom-scrollbar">
                  {/* Manual Queue */}
                  {queue.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-bold text-accent/60 uppercase tracking-[0.2em] px-2 mb-2">Next in Queue</h4>
                      {queue.map((track, idx) => (
                        <div 
                          key={`queue-${track.id}-${idx}`}
                          className="group flex items-center gap-4 bg-white/5 p-3 rounded-lg hover:bg-white/10 transition-all border border-white/5"
                        >
                          <div className="w-10 h-10 rounded overflow-hidden shrink-0">
                            <img src={track.cover} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{track.title}</p>
                            <p className="text-xs text-text-dim truncate">{track.artist}</p>
                          </div>
                          <button 
                            onClick={() => removeFromQueue(idx)}
                            className="p-2 text-text-dim hover:text-accent transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Up Next From Playlist */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-text-dim uppercase tracking-[0.2em] px-2 mb-2">
                      Next from <span className="text-white/40">{currentPlaylistName}</span>
                    </h4>
                    {currentPlaylist.length > 1 ? (
                      currentPlaylist
                        .map((track, index) => ({ track, index }))
                        .filter(({ index }) => index !== currentTrackIndex) // Show all other tracks
                        // Or just show upcoming? Let's show upcoming for clarity
                        .filter(({ index }) => index > currentTrackIndex)
                        .map(({ track, index }) => (
                          <div 
                            key={`playlist-${track.id}-${index}`}
                            onClick={() => {
                              setCurrentTrackIndex(index);
                              setIsPlaying(true);
                            }}
                            className="group flex items-center gap-4 bg-white/3 p-3 rounded-lg hover:bg-white/10 transition-all border border-white/5 cursor-pointer"
                          >
                            <div className="w-10 h-10 rounded overflow-hidden shrink-0 opacity-80 group-hover:opacity-100">
                              <img src={track.cover} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white/70 group-hover:text-white truncate">{track.title}</p>
                              <p className="text-xs text-text-dim truncate">{track.artist}</p>
                            </div>
                            <div className="text-[10px] text-text-dim tabular-nums hidden md:block md:group-hover:hidden pr-2">{track.duration}</div>
                            <div className="block md:hidden md:group-hover:block pr-2">
                              <Play size={12} className="text-accent" />
                            </div>
                          </div>
                        ))
                    ) : (
                      <p className="text-[11px] text-text-dim px-4 italic">No upcoming tracks in playlist</p>
                    )}
                    
                    {queue.length === 0 && currentPlaylist.length <= (currentTrackIndex + 1) && (
                       <div className="py-12 flex flex-col items-center justify-center text-text-dim opacity-50 space-y-4">
                        <ListMusic size={48} strokeWidth={1} />
                        <p className="text-[10px] uppercase tracking-widest font-bold">End of sequence</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Bottom Control Bar */}
      {currentTrack && (
        <footer className="hidden md:flex h-24 border-t border-border-dim bg-bg items-center px-6 md:px-8 gap-4 md:gap-12 shrink-0 z-50">
        <div className="flex items-center gap-4 md:gap-8 shrink-0">
          <button onClick={prevTrack} className="text-text-dim hover:text-white transition-colors p-1 md:p-0">
            <SkipBack size={20} fill="currentColor" />
          </button>
          <button 
            onClick={togglePlay}
            className="w-10 h-10 md:w-14 md:h-14 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-all shadow-xl"
          >
            {isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" className="ml-1" />}
          </button>
          <button onClick={nextTrack} className="text-text-dim hover:text-white transition-colors p-1 md:p-0">
            <SkipForward size={20} fill="currentColor" />
          </button>
        </div>

        {/* Progress Section */}
        <div className="flex-1 flex items-center gap-4 md:gap-6 text-[10px] md:text-[11px] font-mono text-text-dim">
          <span className="hidden sm:inline w-12 text-right tabular-nums">{formatTime(currentTime)}</span>
          <div className="relative flex-1 group py-4">
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
          <span className="hidden sm:inline w-10 tabular-nums">{formatTime(duration)}</span>
        </div>

        {/* Secondary Controls & Volume */}
        <div className="flex items-center gap-4 md:gap-10 shrink-0">
          <div className="flex gap-3 md:gap-6 text-text-dim md:mr-4 md:border-r border-border-dim md:pr-10">
            <button 
              onClick={() => { setShowQueue(!showQueue); setShowLyrics(false); }}
              className={`${showQueue ? 'text-accent' : 'hover:text-white'} p-1 transition-colors`}
              title="Queue"
            >
              <div className="relative">
                <ListMusic size={18} />
                {queue.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-accent text-bg text-[8px] font-bold rounded-full flex items-center justify-center">
                    {queue.length}
                  </span>
                )}
              </div>
            </button>
            <button 
              onClick={() => { setShowLyrics(!showLyrics); setShowQueue(false); }}
              className={`${showLyrics ? 'text-accent' : 'hover:text-white'} p-1 transition-colors`}
              title="Lyrics"
            >
              <Music2 size={18} />
            </button>
            <button 
              onClick={() => setIsShuffle(!isShuffle)}
              className={`${isShuffle ? 'text-accent' : 'hover:text-white'} p-1 transition-colors`}
            >
              <Shuffle size={18} />
            </button>
            <button 
              onClick={() => setRepeatMode(repeatMode === 'all' ? 'one' : repeatMode === 'one' ? 'none' : 'all')}
              className={`${repeatMode !== 'none' ? 'text-accent' : 'hover:text-white'} p-1 transition-colors`}
            >
              <Repeat size={18} />
            </button>
          </div>
          
          <div className="hidden lg:flex items-center gap-3 w-32 border-l border-border-dim pl-6">
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
      )}

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
              className="w-full max-w-lg bg-surface border border-border-dim p-8 rounded-lg space-y-6 shadow-2xl maxHeight-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium tracking-tight">ADD NEW TRACK</h3>
                <button onClick={() => { setShowAddTrack(false); setGeneratedCode(null); }} className="text-text-dim hover:text-white transition-colors"><X size={20} /></button>
              </div>

              {!generatedCode ? (
                <form onSubmit={addNewTrack} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-[10px] text-text-dim uppercase tracking-widest font-bold">Track Title</label>
                    <input name="title" required className="w-full bg-bg border border-border-dim rounded px-4 py-2.5 outline-none focus:border-text-dim transition-colors text-sm" placeholder="e.g. Midnight City" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-text-dim uppercase tracking-widest font-bold">Artist Name</label>
                    <input name="artist" className="w-full bg-bg border border-border-dim rounded px-4 py-2.5 outline-none focus:border-text-dim transition-colors text-sm" placeholder="e.g. M83" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-text-dim uppercase tracking-widest font-bold">Duration (MM:SS)</label>
                    <input name="duration" className="w-full bg-bg border border-border-dim rounded px-4 py-2.5 outline-none focus:border-text-dim transition-colors text-sm" placeholder="e.g. 02:59" />
                  </div>
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-[10px] text-text-dim uppercase tracking-widest font-bold">Audio URL</label>
                    <input name="url" required className="w-full bg-bg border border-border-dim rounded px-4 py-2.5 outline-none focus:border-text-dim transition-colors text-sm" placeholder="Direct link to mp3/wav" />
                  </div>
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-[10px] text-text-dim uppercase tracking-widest font-bold">Cover URL (Optional)</label>
                    <input name="cover" className="w-full bg-bg border border-border-dim rounded px-4 py-2.5 outline-none focus:border-text-dim transition-colors text-sm" placeholder="Direct link to image" />
                  </div>
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-[10px] text-text-dim uppercase tracking-widest font-bold">Lyrics (Optional)</label>
                    <textarea name="lyrics" rows={2} className="w-full bg-bg border border-border-dim rounded px-4 py-2.5 outline-none focus:border-text-dim transition-colors text-sm resize-none" placeholder="Enter song lyrics..." />
                  </div>
                  <button type="submit" className="md:col-span-2 py-3 bg-accent text-bg font-bold rounded uppercase tracking-[0.15em] text-xs hover:bg-gray-200 transition-colors mt-2">
                    Generate Snippet
                  </button>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <p className="text-xs text-text-dim">Copy the code below and add it to <code className="text-accent bg-accent/10 px-1 py-0.5 rounded">TRACKS</code> in your source code:</p>
                    <div className="relative group">
                      <pre className="w-full bg-black/40 border border-border-dim rounded-lg p-5 text-[11px] font-mono leading-relaxed overflow-x-auto text-white/80">
                        {generatedCode}
                      </pre>
                      <button 
                        onClick={copyToClipboard}
                        className="absolute top-3 right-3 p-2 bg-white/10 hover:bg-white/20 rounded-md transition-all text-white flex items-center gap-2 text-[10px] uppercase tracking-wider"
                      >
                        {isCopied ? <Check size={14} /> : <Copy size={14} />}
                        {isCopied ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setGeneratedCode(null)}
                      className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded uppercase tracking-[0.15em] text-xs transition-colors"
                    >
                      Back to Edit
                    </button>
                    <button 
                      onClick={() => { setShowAddTrack(false); setGeneratedCode(null); }}
                      className="flex-1 py-3 bg-accent text-bg font-bold rounded uppercase tracking-[0.15em] text-xs hover:bg-gray-200 transition-colors"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
