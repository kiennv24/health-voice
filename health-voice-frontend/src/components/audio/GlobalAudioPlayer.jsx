import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  Volume2, 
  VolumeX, 
  X, 
  Headphones, 
  Gauge, 
  Heart
} from 'lucide-react';
import { useAudio } from '../../context/AudioContext';

export const GlobalAudioPlayer = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    playbackRate,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    setPlaybackRate,
    closePlayer,
    formatTime,
    favorites,
    toggleFavorite,
    setActiveModalTrack,
  } = useAudio();

  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  if (!currentTrack) {
    return null;
  }

  const isFav = favorites.includes(currentTrack.id);
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSeekChange = (e) => {
    const newTime = parseFloat(e.target.value);
    seek(newTime);
  };

  const skipForward10 = () => {
    seek(Math.min(duration, currentTime + 10));
  };

  const skipBackward10 = () => {
    seek(Math.max(0, currentTime - 10));
  };

  const speedOptions = [1.0, 1.15, 1.25, 1.5];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-xl transition-all">
      {/* Top progress line */}
      <div 
        className="h-1 bg-teal-700 transition-all duration-150"
        style={{ width: `${progressPercent}%` }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Track Information */}
        <div className="flex items-center gap-3 w-full md:w-1/4 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-teal-800 flex items-center justify-center text-white shrink-0 shadow-2xs">
            <Headphones className={`w-5 h-5 text-teal-100 ${isPlaying ? 'animate-pulse' : ''}`} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200/80">
                {currentTrack.categoryName || currentTrack.category || 'Tư Vấn Sức Khỏe'}
              </span>
              {currentTrack.voiceName && (
                <span className="text-[10px] text-slate-500 truncate hidden sm:inline font-mono">
                  • {currentTrack.voiceName}
                </span>
              )}
            </div>
            <h4 
              className="text-xs sm:text-sm font-bold text-slate-900 truncate mt-0.5 hover:text-teal-700 cursor-pointer transition-colors"
              onClick={() => setActiveModalTrack && setActiveModalTrack(currentTrack)}
              title={currentTrack.title}
            >
              {currentTrack.title}
            </h4>
            <p className="text-[11px] text-slate-500 truncate">
              {currentTrack.doctorName || currentTrack.doctor || 'BS. Chuyên Khoa'}
            </p>
          </div>

          {/* Favorite button */}
          <button
            type="button"
            onClick={() => toggleFavorite(currentTrack.id)}
            className={`p-2 rounded-lg transition shrink-0 t-btn-press ${
              isFav ? 'text-rose-600 bg-rose-50' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
            }`}
            title={isFav ? 'Bỏ lưu' : 'Lưu vào mục yêu thích'}
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Center: Playback Controls & Seekbar Slider */}
        <div className="flex flex-col items-center gap-1.5 w-full md:w-2/4">
          <div className="flex items-center gap-5">
            {/* Lùi 10s */}
            <button
              type="button"
              onClick={skipBackward10}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition t-btn-press"
              title="Lùi 10 giây"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Play / Pause Nổi Bật */}
            <button
              type="button"
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-teal-800 hover:bg-teal-900 text-white flex items-center justify-center transition shadow-sm t-btn-press"
              title={isPlaying ? 'Tạm dừng' : 'Phát tiếp'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 ml-0.5 fill-current" />
              )}
            </button>

            {/* Tiến 10s */}
            <button
              type="button"
              onClick={skipForward10}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition t-btn-press"
              title="Tiến 10 giây"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>

          {/* Seekbar Slider & Timers */}
          <div className="w-full flex items-center gap-2.5">
            <span className="text-[11px] font-mono text-slate-500 w-10 text-right">
              {formatTime(currentTime)}
            </span>

            <div className="relative flex-1 flex items-center">
              <input
                type="range"
                min="0"
                max={duration || 100}
                step="0.1"
                value={currentTime}
                onChange={handleSeekChange}
                className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-teal-800 focus:outline-none"
              />
            </div>

            <span className="text-[11px] font-mono text-slate-500 w-10">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Right: Volume, Speed & Close */}
        <div className="flex items-center justify-end gap-2.5 w-full md:w-1/4">
          {/* Speed Selector (1x, 1.25x, 1.5x) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200/90 flex items-center gap-1 transition t-btn-press font-mono"
              title="Tốc độ phát âm thanh"
            >
              <Gauge className="w-3.5 h-3.5 text-slate-600" />
              <span>{playbackRate}x</span>
            </button>

            {showSpeedMenu && (
              <div className="absolute bottom-full mb-2 right-0 bg-white rounded-xl shadow-xl border border-slate-200/90 py-1.5 z-50 w-28 text-xs animate-in fade-in slide-in-from-bottom-1 duration-150">
                <div className="px-3 py-1 text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                  Tốc độ đọc
                </div>
                {speedOptions.map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => {
                      setPlaybackRate(rate);
                      setShowSpeedMenu(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-slate-50 transition font-mono ${
                      playbackRate === rate ? 'text-teal-900 font-bold bg-teal-50' : 'text-slate-700'
                    }`}
                  >
                    <span>{rate}x</span>
                    {playbackRate === rate && <span className="w-1.5 h-1.5 rounded-full bg-teal-700" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Volume Control */}
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              type="button"
              onClick={toggleMute}
              className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition t-btn-press"
              title={isMuted ? 'Bật âm lượng' : 'Tắt âm lượng'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-600" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-16 h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-teal-800 focus:outline-none"
              title={`Âm lượng: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
            />
          </div>

          {/* Close Player */}
          <button
            type="button"
            onClick={closePlayer}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition ml-1 t-btn-press"
            title="Đóng trình phát"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlobalAudioPlayer;
