import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';

const AudioContext = createContext(null);

export function AudioProvider({ children }) {
  const audioRef = useRef(null);
  const [currentAudio, setCurrentAudio] = useState(null); // { url, metadata }
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [playbackRate, setPlaybackRateState] = useState(1.15);

  // Khởi tạo Audio object
  useEffect(() => {
    audioRef.current = new Audio();
    const audio = audioRef.current;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDurationChange = () => setDuration(audio.duration || 0);
    const onEnded = () => setIsPlaying(false);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.pause();
    };
  }, []);

  const play = useCallback((audioUrl, metadata = {}) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (currentAudio?.url === audioUrl) {
      audio.play();
      return;
    }

    audio.pause();
    audio.src = audioUrl;
    audio.volume = volume;
    audio.playbackRate = playbackRate;
    setCurrentAudio({ url: audioUrl, metadata });
    setCurrentTime(0);
    setDuration(0);
    audio.play().catch(() => {});
  }, [currentAudio, volume, playbackRate]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const resume = useCallback(() => {
    audioRef.current?.play().catch(() => {});
  }, []);

  const setVolume = useCallback((val) => {
    const v = Math.max(0, Math.min(1, val));
    setVolumeState(v);
    if (audioRef.current) audioRef.current.volume = v;
  }, []);

  const setPlaybackRate = useCallback((rate) => {
    setPlaybackRateState(rate);
    if (audioRef.current) audioRef.current.playbackRate = rate;
  }, []);

  const seek = useCallback((time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const stopAll = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = '';
    }
    setIsPlaying(false);
    setCurrentAudio(null);
  }, []);

  const [lexiconOpen, setLexiconOpen] = useState(false);
  const openLexicon = useCallback(() => setLexiconOpen(true), []);
  const closeLexicon = useCallback(() => setLexiconOpen(false), []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      resume();
    }
  }, [isPlaying, pause, resume]);

  return (
    <AudioContext.Provider value={{
      currentAudio,
      currentTrack: currentAudio,
      isPlaying,
      duration,
      currentTime,
      volume,
      playbackRate,
      play,
      pause,
      resume,
      togglePlay,
      setVolume,
      setPlaybackRate,
      seek,
      stopAll,
      closePlayer: stopAll,
      lexiconOpen,
      openLexicon,
      closeLexicon,
    }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error('useAudio must be used within AudioProvider');
  return ctx;
}

export const useAudioPlayer = useAudio;

export default AudioContext;
