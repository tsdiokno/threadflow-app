/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  X,
  MapPin,
  FileText as FileIcon,
  MessageSquare,
  Crosshair,
  CornerDownRight,
  Link2,
  Send,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Music,
  Video,
  Clock,
} from 'lucide-react';
import { cn, formatTimecode } from '@/lib/utils';
import { FileAttachment, Message, Thread, User } from '@/types/chat';

interface ImageAnnotationModalProps {
  activeFile: FileAttachment | null;
  activeThread: Thread | null;
  messages: Message[];
  currentUser: User;
  onClose: () => void;
  onSendMessage: (
    content: string,
    options?: {
      annotationFileId?: string;
      annotationPoint?: { x: number; y: number; pinNumber: number; timestampSeconds?: number };
      replyTo?: {
        messageId: string;
        senderName: string;
        content: string;
        annotationPinNumber?: number;
        timestampSeconds?: number;
      };
    }
  ) => void;
  targetPinNumber?: number | null;
  targetTimestamp?: number | null;
  onCopyLink?: (msg: Message) => void;
  onNavigateToMessage?: (threadId: string | null, messageId: string) => void;
}

export function ImageAnnotationModal({
  activeFile,
  activeThread,
  messages,
  currentUser,
  onClose,
  onSendMessage,
  targetPinNumber,
  targetTimestamp,
  onCopyLink,
  onNavigateToMessage,
}: ImageAnnotationModalProps) {
  const [activePinNumber, setActivePinNumber] = useState<number | null>(targetPinNumber || null);
  const [prevTargetPinNumber, setPrevTargetPinNumber] = useState(targetPinNumber);
  if (targetPinNumber !== prevTargetPinNumber) {
    setPrevTargetPinNumber(targetPinNumber);
    if (targetPinNumber !== undefined && targetPinNumber !== null) {
      setActivePinNumber(targetPinNumber);
    }
  }

  const [newPinPoint, setNewPinPoint] = useState<{ x: number; y: number } | null>(null);
  const [newTimelineTimestamp, setNewTimelineTimestamp] = useState<number | null>(
    targetTimestamp ?? null
  );
  const [annotationInputValue, setAnnotationInputValue] = useState('');
  const [previewReplyingToMessage, setPreviewReplyingToMessage] = useState<Message | null>(null);

  // Media playback states
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(targetTimestamp || 0);
  const [prevTargetTimestamp, setPrevTargetTimestamp] = useState(targetTimestamp);
  if (targetTimestamp !== prevTargetTimestamp) {
    setPrevTargetTimestamp(targetTimestamp);
    if (targetTimestamp !== undefined && targetTimestamp !== null) {
      setCurrentTime(targetTimestamp);
    }
  }

  const [duration, setDuration] = useState(activeFile?.duration || 60);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [hoverTimelineTime, setHoverTimelineTime] = useState<number | null>(null);
  const [hoverMarker, setHoverMarker] = useState<Message | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const waveformRef = useRef<HTMLDivElement>(null);
  const videoTimelineRef = useRef<HTMLDivElement>(null);
  const previewInputRef = useRef<HTMLTextAreaElement>(null);
  const subthreadEndRef = useRef<HTMLDivElement>(null);

  // Seek audio/video elements when targetTimestamp prop changes
  useEffect(() => {
    if (targetTimestamp !== undefined && targetTimestamp !== null) {
      if (audioRef.current) audioRef.current.currentTime = targetTimestamp;
      if (videoRef.current) videoRef.current.currentTime = targetTimestamp;
    }
  }, [targetTimestamp]);

  const isAudio = Boolean(
    activeFile &&
      (activeFile.type.startsWith('audio/') ||
        activeFile.name.endsWith('.mp3') ||
        activeFile.name.endsWith('.ogg') ||
        activeFile.name.endsWith('.wav'))
  );

  const isVideo = Boolean(
    activeFile &&
      (activeFile.type.startsWith('video/') ||
        activeFile.name.endsWith('.mp4') ||
        activeFile.name.endsWith('.webm'))
  );

  const isTimelineMedia = isAudio || isVideo;
  const isImage = Boolean(
    activeFile &&
      !isTimelineMedia &&
      (activeFile.type.startsWith('image/') ||
        activeFile.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) !== null)
  );

  // Filter messages specifically tied to this file
  const fileAnnotationMessages = useMemo(() => {
    if (!activeFile) return [];
    return messages.filter((m) => m.annotationFileId === activeFile.id);
  }, [messages, activeFile]);

  // Deduplicated root pins (only messages with pin points that are NOT replies, and deduplicated by pinNumber)
  const currentFileRootAnnotations = useMemo(() => {
    const list: Message[] = [];
    const seenPins = new Set<number>();
    const roots = fileAnnotationMessages.filter((m) => m.annotationPoint && !m.annotationParentId);

    for (const m of roots) {
      const pinNum = m.annotationPoint!.pinNumber;
      if (!seenPins.has(pinNum)) {
        seenPins.add(pinNum);
        list.push(m);
      }
    }

    return list.sort((a, b) => {
      if (
        a.annotationPoint?.timestampSeconds !== undefined &&
        b.annotationPoint?.timestampSeconds !== undefined
      ) {
        return a.annotationPoint.timestampSeconds - b.annotationPoint.timestampSeconds;
      }
      return (a.annotationPoint?.pinNumber || 0) - (b.annotationPoint?.pinNumber || 0);
    });
  }, [fileAnnotationMessages]);

  // Determine next pin number safely
  const nextPinNumber = useMemo(() => {
    if (currentFileRootAnnotations.length === 0) return 1;
    return Math.max(...currentFileRootAnnotations.map((m) => m.annotationPoint!.pinNumber)) + 1;
  }, [currentFileRootAnnotations]);

  // Messages displayed in subthread sidebar
  const activePinRoot = currentFileRootAnnotations.find(
    (m) => m.annotationPoint?.pinNumber === activePinNumber
  );

  const displayedPreviewMessages =
    activePinNumber !== null
      ? fileAnnotationMessages.filter(
          (m) =>
            m.annotationPoint?.pinNumber === activePinNumber ||
            (activePinRoot && m.annotationParentId === activePinRoot.id)
        )
      : fileAnnotationMessages;

  // Stable pseudo-random waveform bars generated per audio track
  const waveformBars = useMemo(() => {
    const bars: number[] = [];
    const seed = activeFile?.id ? activeFile.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 17) : 17;
    for (let i = 0; i < 72; i++) {
      const val =
        Math.sin(i * 0.22 + seed) * 0.35 +
        Math.cos(i * 0.14 + seed * 1.5) * 0.28 +
        Math.sin(i * 0.7 + seed * 0.5) * 0.2 +
        0.5;
      bars.push(Math.max(0.18, Math.min(0.96, val)));
    }
    return bars;
  }, [activeFile?.id]);

  // Playback control helpers
  const togglePlayPause = () => {
    if (isAudio && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().catch(() => {
          // In case browser autoplay policy blocks unmuted or offline file
          setIsPlaying(true);
        });
        setIsPlaying(true);
      }
    } else if (isVideo && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().catch(() => {
          setIsPlaying(true);
        });
        setIsPlaying(true);
      }
    } else {
      // Simulated playback if audio/video element isn't attached
      setIsPlaying((prev) => !prev);
    }
  };

  const seekToTime = (seconds: number, autoPlay: boolean = false) => {
    const clamped = Math.max(0, Math.min(duration, seconds));
    setCurrentTime(clamped);
    if (audioRef.current) {
      audioRef.current.currentTime = clamped;
      if (autoPlay) {
        audioRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    }
    if (videoRef.current) {
      videoRef.current.currentTime = clamped;
      if (autoPlay) {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    }
  };

  const handleSkip = (deltaSeconds: number) => {
    seekToTime(currentTime + deltaSeconds);
  };

  const handleCycleSpeed = () => {
    const speeds = [1, 1.25, 1.5, 2];
    const nextIdx = (speeds.indexOf(playbackRate) + 1) % speeds.length;
    const nextRate = speeds[nextIdx];
    setPlaybackRate(nextRate);
    if (audioRef.current) audioRef.current.playbackRate = nextRate;
    if (videoRef.current) videoRef.current.playbackRate = nextRate;
  };

  const togglePlayPauseRef = useRef(togglePlayPause);
  useEffect(() => {
    togglePlayPauseRef.current = togglePlayPause;
  });

  // Keyboard shortcut listener for spacebar playback
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't toggle playback if user is typing in textarea or input
      if (['TEXTAREA', 'INPUT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.code === 'Space' && isTimelineMedia) {
        e.preventDefault();
        togglePlayPauseRef.current();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTimelineMedia]);

  // Audio / Video Time Update Handlers
  const handleMediaTimeUpdate = (e: React.SyntheticEvent<HTMLMediaElement>) => {
    const media = e.currentTarget;
    setCurrentTime(media.currentTime);
  };

  const handleMediaLoadedMetadata = (e: React.SyntheticEvent<HTMLMediaElement>) => {
    const media = e.currentTarget;
    if (media.duration && !isNaN(media.duration) && isFinite(media.duration)) {
      setDuration(media.duration);
    }
  };

  const handleMediaEnded = () => {
    setIsPlaying(false);
  };

  // Waveform clicking / scrubbing
  const handleWaveformClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!waveformRef.current) return;
    const rect = waveformRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const targetSec = Math.round(ratio * duration * 10) / 10;
    seekToTime(targetSec);
    setNewTimelineTimestamp(targetSec);
    setPreviewReplyingToMessage(null);
    previewInputRef.current?.focus();
  };

  const handleWaveformMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!waveformRef.current) return;
    const rect = waveformRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverTimelineTime(ratio * duration);
  };

  // Video scrubber clicking
  const handleVideoTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoTimelineRef.current) return;
    const rect = videoTimelineRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const targetSec = Math.round(ratio * duration * 10) / 10;
    seekToTime(targetSec);
    setNewTimelineTimestamp(targetSec);
    setPreviewReplyingToMessage(null);
    previewInputRef.current?.focus();
  };

  // Image 2D canvas clicking
  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setNewPinPoint({ x: Math.max(2, Math.min(98, x)), y: Math.max(2, Math.min(98, y)) });
    setPreviewReplyingToMessage(null);
    previewInputRef.current?.focus();
  };

  const handleAddAnnotation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFile) return;
    const text = annotationInputValue.trim();
    if (!text) return;

    let point:
      | { x: number; y: number; pinNumber: number; timestampSeconds?: number }
      | undefined = undefined;

    if (isTimelineMedia) {
      // Timeline based annotation
      const stamp = newTimelineTimestamp !== null ? newTimelineTimestamp : Math.round(currentTime);
      const ratio = duration > 0 ? (stamp / duration) * 100 : 50;
      point = {
        x: Math.max(1, Math.min(99, ratio)),
        y: 50,
        pinNumber: nextPinNumber,
        timestampSeconds: stamp,
      };
    } else if (newPinPoint) {
      // 2D image annotation
      point = {
        x: newPinPoint.x,
        y: newPinPoint.y,
        pinNumber: nextPinNumber,
      };
    }

    const replyOption = previewReplyingToMessage
      ? {
          messageId: previewReplyingToMessage.id,
          senderName: previewReplyingToMessage.senderName,
          content: previewReplyingToMessage.content,
          annotationPinNumber:
            previewReplyingToMessage.annotationPoint?.pinNumber ||
            (previewReplyingToMessage.annotationParentId
              ? currentFileRootAnnotations.find(
                  (r) => r.id === previewReplyingToMessage.annotationParentId
                )?.annotationPoint?.pinNumber
              : activePinNumber || undefined),
          timestampSeconds: previewReplyingToMessage.annotationPoint?.timestampSeconds,
        }
      : undefined;

    onSendMessage(text, {
      annotationFileId: activeFile.id,
      annotationPoint: point,
      replyTo: replyOption,
    });

    setAnnotationInputValue('');
    setNewPinPoint(null);
    setNewTimelineTimestamp(null);
    setPreviewReplyingToMessage(null);
    if (point) {
      setActivePinNumber(point.pinNumber);
    }
  };

  if (!activeFile) return null;

  return (
    <div className="fixed inset-0 z-50 flex bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      {/* Left Media Stage */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-slate-950">
        {/* Top Floating Bar */}
        <div className="p-4 flex items-center justify-between z-20 bg-slate-900/90 border-b border-slate-800 text-white shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors shrink-0 cursor-pointer"
              title="Close preview"
            >
              <X size={20} />
            </button>
            <div className="min-w-0">
              <div className="font-semibold text-sm truncate flex items-center gap-2">
                {isAudio ? (
                  <Music size={15} className="text-amber-400 shrink-0" />
                ) : isVideo ? (
                  <Video size={15} className="text-rose-400 shrink-0" />
                ) : null}
                <span>{activeFile.name}</span>
                <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400">
                  {isAudio ? 'Audio Track' : isVideo ? 'Video Clip' : 'Design Asset'}
                </span>
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <span>{(activeFile.size / 1024 / 1024).toFixed(2)} MB</span>
                {isTimelineMedia && (
                  <>
                    <span>•</span>
                    <span className="text-amber-400 flex items-center gap-1 font-mono">
                      <Clock size={11} /> {formatTimecode(duration)} total
                    </span>
                  </>
                )}
                <span>•</span>
                <span className="text-slate-300">
                  {isTimelineMedia
                    ? 'Click anywhere on the waveform or timeline to pin a comment'
                    : 'Click anywhere on image to place annotation pin'}
                </span>
              </div>
            </div>
          </div>

          {/* Pending Pin or Timestamp Indicator */}
          {newPinPoint && !isTimelineMedia && (
            <div className="flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 px-3 py-1.5 rounded-xl text-xs">
              <MapPin size={14} className="text-indigo-400 animate-bounce" />
              <span>
                Pin #{nextPinNumber} placed at {Math.round(newPinPoint.x)}%,{' '}
                {Math.round(newPinPoint.y)}%
              </span>
              <button
                onClick={() => setNewPinPoint(null)}
                className="p-0.5 hover:bg-white/10 rounded ml-1 cursor-pointer"
                title="Clear pin"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {newTimelineTimestamp !== null && isTimelineMedia && (
            <div className="flex items-center gap-2 bg-amber-500/20 border border-amber-400/30 text-amber-200 px-3 py-1.5 rounded-xl text-xs">
              <MapPin size={14} className="text-amber-400 animate-pulse" />
              <span className="font-mono font-bold">
                Pin #{nextPinNumber} at {formatTimecode(newTimelineTimestamp)}
              </span>
              <button
                onClick={() => setNewTimelineTimestamp(null)}
                className="p-0.5 hover:bg-white/10 rounded ml-1 cursor-pointer"
                title="Clear timestamp pin"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Viewport: Audio, Video, or Image */}
        <div className="flex-1 overflow-auto flex items-center justify-center p-6 select-none relative">
          {/* ================= 1. AUDIO PLAYER (SoundCloud Style) ================= */}
          {isAudio ? (
            <div className="w-full max-w-3xl flex flex-col items-center bg-slate-900 border border-slate-800 rounded-2xl p-7 shadow-2xl space-y-6">
              <audio
                ref={audioRef}
                src={activeFile.url}
                onTimeUpdate={handleMediaTimeUpdate}
                onLoadedMetadata={handleMediaLoadedMetadata}
                onEnded={handleMediaEnded}
                preload="metadata"
              />

              {/* Track Title and Header */}
              <div className="w-full flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <Music size={24} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white truncate max-w-md">
                      {activeFile.name}
                    </h3>
                    <p className="text-xs text-slate-400">
                      SoundCloud-style community timeline comments enabled
                    </p>
                  </div>
                </div>

                {/* Quick Add Comment at Current Time */}
                <button
                  type="button"
                  onClick={() => {
                    const stamp = Math.round(currentTime);
                    setNewTimelineTimestamp(stamp);
                    setPreviewReplyingToMessage(null);
                    previewInputRef.current?.focus();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
                  title="Stamp a comment at the current playback position"
                >
                  <MapPin size={13} />
                  <span>Pin at {formatTimecode(currentTime)}</span>
                </button>
              </div>

              {/* SoundCloud Waveform Container */}
              <div className="w-full relative py-6">
                {/* Waveform Scrubber & Canvas */}
                <div
                  ref={waveformRef}
                  onClick={handleWaveformClick}
                  onMouseMove={handleWaveformMouseMove}
                  onMouseLeave={() => setHoverTimelineTime(null)}
                  className="relative h-28 w-full flex items-center justify-between gap-[2px] cursor-pointer bg-slate-950/60 rounded-xl px-3 py-4 border border-slate-800 group hover:border-slate-700 transition-colors"
                >
                  {waveformBars.map((amp, idx) => {
                    const barPercent = (idx / waveformBars.length) * 100;
                    const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
                    const isPassed = barPercent <= progressPercent;
                    return (
                      <div
                        key={idx}
                        style={{ height: `${Math.round(amp * 100)}%` }}
                        className={cn(
                          'flex-1 rounded-full transition-all duration-75',
                          isPassed
                            ? 'bg-amber-400 group-hover:bg-amber-300'
                            : 'bg-slate-700/80 group-hover:bg-slate-600/80'
                        )}
                      />
                    );
                  })}

                  {/* Playhead Vertical Line */}
                  <div
                    style={{
                      left: `${Math.max(0, Math.min(100, duration > 0 ? (currentTime / duration) * 100 : 0))}%`,
                    }}
                    className="absolute top-0 bottom-0 w-[2px] bg-white pointer-events-none shadow-[0_0_8px_rgba(255,255,255,0.8)] z-10"
                  />

                  {/* Hover Guideline & Timestamp Tooltip */}
                  {hoverTimelineTime !== null && (
                    <div
                      style={{
                        left: `${Math.max(0, Math.min(100, (hoverTimelineTime / duration) * 100))}%`,
                      }}
                      className="absolute top-0 bottom-0 w-[1px] bg-amber-300/80 pointer-events-none z-10"
                    >
                      <div className="absolute -top-7 -translate-x-1/2 bg-slate-900 border border-amber-400/50 text-amber-300 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shadow-lg whitespace-nowrap">
                        {formatTimecode(hoverTimelineTime)} • Click to comment
                      </div>
                    </div>
                  )}

                  {/* Pending New Comment Pin on Waveform */}
                  {newTimelineTimestamp !== null && (
                    <div
                      style={{
                        left: `${Math.max(1, Math.min(99, (newTimelineTimestamp / duration) * 100))}%`,
                      }}
                      className="absolute -top-3 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center"
                    >
                      <div className="w-7 h-7 rounded-full bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center shadow-xl ring-4 ring-amber-400/40 animate-bounce">
                        {nextPinNumber}
                      </div>
                      <div className="w-1 h-3 bg-amber-400" />
                    </div>
                  )}

                  {/* SoundCloud Community Comment Pins along Timeline */}
                  {currentFileRootAnnotations.map((ann) => {
                    const sec = ann.annotationPoint?.timestampSeconds ?? 0;
                    const leftPercent = Math.max(1, Math.min(99, (sec / (duration || 1)) * 100));
                    const isSelected = activePinNumber === ann.annotationPoint?.pinNumber;
                    return (
                      <div
                        key={ann.id}
                        style={{ left: `${leftPercent}%` }}
                        onClick={(e) => {
                          e.stopPropagation();
                          seekToTime(sec, true);
                          setActivePinNumber(ann.annotationPoint!.pinNumber);
                        }}
                        onMouseEnter={() => setHoverMarker(ann)}
                        onMouseLeave={() => setHoverMarker(null)}
                        className={cn(
                          'absolute -bottom-3 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] shadow-xl border-2 transition-all cursor-pointer z-20',
                          isSelected
                            ? 'bg-amber-400 text-slate-950 border-white scale-125 ring-4 ring-amber-400/40'
                            : 'bg-indigo-600 text-white border-slate-900 hover:scale-125 hover:bg-indigo-500'
                        )}
                        title={`Pin #${ann.annotationPoint?.pinNumber} (${formatTimecode(sec)}): ${ann.content}`}
                      >
                        {ann.annotationPoint?.pinNumber}
                      </div>
                    );
                  })}
                </div>

                {/* Hover Marker Tooltip Card */}
                {hoverMarker && hoverMarker.annotationPoint?.timestampSeconds !== undefined && (
                  <div
                    style={{
                      left: `${Math.max(10, Math.min(90, (hoverMarker.annotationPoint.timestampSeconds / duration) * 100))}%`,
                    }}
                    className="absolute -bottom-20 -translate-x-1/2 bg-slate-900/95 backdrop-blur-md border border-slate-700 text-white p-2.5 rounded-xl shadow-2xl z-40 max-w-xs min-w-[200px] pointer-events-none animate-in fade-in zoom-in-95 duration-100"
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-bold text-amber-400">
                        {hoverMarker.senderName}
                      </span>
                      <span className="font-mono text-slate-400 bg-slate-800 px-1.5 py-0.2 rounded">
                        {formatTimecode(hoverMarker.annotationPoint.timestampSeconds)}
                      </span>
                    </div>
                    <div className="text-xs text-slate-200 line-clamp-2 italic">
                      &ldquo;{hoverMarker.content}&rdquo;
                    </div>
                  </div>
                )}
              </div>

              {/* Audio Controls Bar */}
              <div className="w-full flex items-center justify-between border-t border-slate-800 pt-4 text-slate-300">
                <div className="flex items-center gap-3">
                  {/* Play/Pause */}
                  <button
                    type="button"
                    onClick={togglePlayPause}
                    className="w-12 h-12 rounded-full bg-white hover:bg-slate-200 text-slate-950 flex items-center justify-center font-bold transition-transform active:scale-95 cursor-pointer shadow-lg"
                    title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
                  >
                    {isPlaying ? <Pause size={20} className="fill-current" /> : <Play size={20} className="fill-current ml-0.5" />}
                  </button>

                  {/* Skip Backward 5s */}
                  <button
                    type="button"
                    onClick={() => handleSkip(-5)}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title="Rewind 5 seconds"
                  >
                    <RotateCcw size={17} />
                  </button>

                  {/* Skip Forward 5s */}
                  <button
                    type="button"
                    onClick={() => handleSkip(5)}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title="Forward 5 seconds"
                  >
                    <RotateCw size={17} />
                  </button>

                  {/* Timecode display */}
                  <div className="font-mono text-sm text-slate-200 ml-2">
                    <span className="font-bold text-white">{formatTimecode(currentTime)}</span>
                    <span className="text-slate-500 mx-1">/</span>
                    <span className="text-slate-400">{formatTimecode(duration)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Playback speed toggle */}
                  <button
                    type="button"
                    onClick={handleCycleSpeed}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono font-semibold transition-colors cursor-pointer"
                    title="Cycle playback speed"
                  >
                    {playbackRate}x
                  </button>

                  {/* Mute Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      const next = !isMuted;
                      setIsMuted(next);
                      if (audioRef.current) audioRef.current.muted = next;
                    }}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
                  </button>
                </div>
              </div>
            </div>
          ) : isVideo ? (
            /* ================= 2. VIDEO PLAYER WITH TIMELINE ANNOTATIONS ================= */
            <div className="w-full max-w-4xl flex flex-col items-center bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
              <div className="relative w-full aspect-video bg-black flex items-center justify-center">
                <video
                  ref={videoRef}
                  src={activeFile.url}
                  onTimeUpdate={handleMediaTimeUpdate}
                  onLoadedMetadata={handleMediaLoadedMetadata}
                  onEnded={handleMediaEnded}
                  onClick={togglePlayPause}
                  className="w-full h-full object-contain cursor-pointer"
                />

                {/* Big Center Play Overlay Button */}
                {!isPlaying && (
                  <button
                    type="button"
                    onClick={togglePlayPause}
                    className="absolute w-16 h-16 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white border border-white/20 flex items-center justify-center shadow-2xl transition-transform hover:scale-110 cursor-pointer"
                  >
                    <Play size={28} className="fill-current ml-1" />
                  </button>
                )}
              </div>

              {/* Video Timeline Scrubber & Comments Track */}
              <div className="w-full p-4 space-y-3 bg-slate-900">
                {/* Scrubber bar */}
                <div
                  ref={videoTimelineRef}
                  onClick={handleVideoTimelineClick}
                  className="relative h-4 bg-slate-800 hover:bg-slate-700 rounded-full cursor-pointer transition-colors group flex items-center"
                >
                  {/* Progress Fill */}
                  <div
                    style={{
                      width: `${Math.max(0, Math.min(100, duration > 0 ? (currentTime / duration) * 100 : 0))}%`,
                    }}
                    className="h-full bg-rose-500 rounded-full transition-all"
                  />

                  {/* Scrubber Knob */}
                  <div
                    style={{
                      left: `${Math.max(0, Math.min(100, duration > 0 ? (currentTime / duration) * 100 : 0))}%`,
                    }}
                    className="absolute -translate-x-1/2 w-4 h-4 rounded-full bg-white shadow-lg border-2 border-rose-600 scale-100 group-hover:scale-125 transition-transform"
                  />

                  {/* Timeline Video Pins */}
                  {currentFileRootAnnotations.map((ann) => {
                    const sec = ann.annotationPoint?.timestampSeconds ?? 0;
                    const leftPercent = Math.max(1, Math.min(99, (sec / (duration || 1)) * 100));
                    const isSelected = activePinNumber === ann.annotationPoint?.pinNumber;
                    return (
                      <div
                        key={ann.id}
                        style={{ left: `${leftPercent}%` }}
                        onClick={(e) => {
                          e.stopPropagation();
                          seekToTime(sec, true);
                          setActivePinNumber(ann.annotationPoint!.pinNumber);
                        }}
                        className={cn(
                          'absolute -translate-x-1/2 w-5 h-5 rounded-full flex items-center justify-center font-bold text-[9px] shadow-md border border-white transition-all cursor-pointer z-20',
                          isSelected
                            ? 'bg-amber-400 text-slate-950 scale-125 ring-2 ring-amber-400'
                            : 'bg-indigo-600 text-white hover:scale-110'
                        )}
                        title={`Pin #${ann.annotationPoint?.pinNumber} (${formatTimecode(sec)}): ${ann.content}`}
                      >
                        {ann.annotationPoint?.pinNumber}
                      </div>
                    );
                  })}
                </div>

                {/* Video Controls Bar */}
                <div className="flex items-center justify-between text-slate-300">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={togglePlayPause}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer"
                    >
                      {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSkip(-5)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                      title="Rewind 5s"
                    >
                      <RotateCcw size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSkip(5)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                      title="Forward 5s"
                    >
                      <RotateCw size={15} />
                    </button>
                    <div className="font-mono text-xs text-slate-300 ml-1">
                      <span className="font-bold text-white">{formatTimecode(currentTime)}</span>
                      <span className="text-slate-500 mx-1">/</span>
                      <span className="text-slate-400">{formatTimecode(duration)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const stamp = Math.round(currentTime);
                        setNewTimelineTimestamp(stamp);
                        setPreviewReplyingToMessage(null);
                        previewInputRef.current?.focus();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
                    >
                      <MapPin size={13} />
                      <span>Comment at {formatTimecode(currentTime)}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCycleSpeed}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono font-semibold text-slate-300 hover:text-white"
                    >
                      {playbackRate}x
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : isImage ? (
            /* ================= 3. IMAGE 2D PIN CANVAS ================= */
            <div
              ref={imageContainerRef}
              onClick={handleImageClick}
              className="relative max-w-full max-h-full inline-block cursor-crosshair rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/20"
            >
              <img
                src={activeFile.url}
                alt={activeFile.name}
                className="max-w-[75vw] max-h-[75vh] object-contain block pointer-events-none"
              />

              {/* Render Existing Pins on the image */}
              {currentFileRootAnnotations.map((ann) => {
                if (!ann.annotationPoint) return null;
                const isSelected = activePinNumber === ann.annotationPoint.pinNumber;
                return (
                  <div
                    key={ann.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivePinNumber(ann.annotationPoint!.pinNumber);
                    }}
                    style={{
                      left: `${ann.annotationPoint.x}%`,
                      top: `${ann.annotationPoint.y}%`,
                    }}
                    className={cn(
                      'absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center shadow-xl border-2 border-white transition-all cursor-pointer z-20',
                      isSelected
                        ? 'bg-amber-500 text-slate-950 scale-125 ring-4 ring-amber-400/50'
                        : 'bg-indigo-600 text-white hover:scale-110 hover:bg-indigo-500 ring-2 ring-black/40'
                    )}
                    title={`Pin #${ann.annotationPoint.pinNumber}: ${ann.content}`}
                  >
                    {ann.annotationPoint.pinNumber}
                  </div>
                );
              })}

              {/* Render Pending New Pin marker if user clicked to place */}
              {newPinPoint && (
                <div
                  style={{
                    left: `${newPinPoint.x}%`,
                    top: `${newPinPoint.y}%`,
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-indigo-500 text-white font-bold text-xs flex items-center justify-center shadow-2xl border-2 border-white animate-pulse ring-4 ring-indigo-400/50 z-30"
                >
                  {nextPinNumber}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center text-white bg-slate-900 p-12 rounded-2xl border border-slate-800 shadow-2xl max-w-md text-center">
              <FileIcon size={64} className="text-slate-400 mb-4" />
              <div className="text-lg font-semibold mb-1">{activeFile.name}</div>
              <div className="text-sm text-slate-400 mb-4">
                {(activeFile.size / 1024 / 1024).toFixed(2)} MB
              </div>
              <div className="text-xs text-slate-500">
                Use the subthread sidebar on the right to post general comments on this file.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Annotation Subthread Sidebar */}
      <div className="w-[420px] bg-white dark:bg-slate-900 flex flex-col shadow-2xl border-l border-slate-200 dark:border-slate-800 z-10 shrink-0">
        {/* Panel Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="font-semibold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <MessageSquare size={17} className="text-indigo-600 dark:text-indigo-400" />
                {activePinNumber !== null
                  ? `Pin #${activePinNumber} Subthread`
                  : 'Annotation Subthreads'}
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {displayedPreviewMessages.length}{' '}
                {displayedPreviewMessages.length === 1 ? 'message' : 'messages'}
              </span>
            </div>
            {activePinNumber !== null && (
              <button
                onClick={() => setActivePinNumber(null)}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium cursor-pointer"
              >
                View all pins
              </button>
            )}
          </div>

          {/* Pin Filter Chips (Cleanly deduplicated) */}
          {currentFileRootAnnotations.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 pt-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setActivePinNumber(null)}
                className={cn(
                  'px-2.5 py-1 rounded-full text-xs font-medium transition-colors shrink-0 cursor-pointer',
                  activePinNumber === null
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750'
                )}
              >
                All ({currentFileRootAnnotations.length})
              </button>
              {currentFileRootAnnotations.map((rootAnn) => {
                const pinNum = rootAnn.annotationPoint?.pinNumber;
                if (!pinNum) return null;
                const isSelected = activePinNumber === pinNum;
                const sec = rootAnn.annotationPoint?.timestampSeconds;

                return (
                  <button
                    key={`pin-tab-${pinNum}-${rootAnn.id}`}
                    type="button"
                    onClick={() => {
                      setActivePinNumber(pinNum);
                      if (sec !== undefined) {
                        seekToTime(sec, true);
                      }
                    }}
                    className={cn(
                      'px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 transition-colors shrink-0 cursor-pointer',
                      isSelected
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750'
                    )}
                  >
                    {sec !== undefined ? (
                      <>
                        <Play size={9} className="fill-current" />
                        <span>
                          {formatTimecode(sec)} (Pin #{pinNum})
                        </span>
                      </>
                    ) : (
                      <>
                        <MapPin
                          size={11}
                          className={isSelected ? 'text-slate-950' : 'text-indigo-600 dark:text-indigo-400'}
                        />
                        <span>Pin #{pinNum}</span>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* List of Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50 dark:bg-slate-900/50">
          {displayedPreviewMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 dark:text-slate-400 text-sm p-6 space-y-3">
              <div className="w-14 h-14 rounded-full bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Crosshair size={28} />
              </div>
              <div className="font-medium text-slate-800 dark:text-slate-200">
                {activePinNumber !== null
                  ? `No messages in Pin #${activePinNumber}`
                  : 'No annotations on this file yet'}
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs leading-relaxed">
                {isTimelineMedia
                  ? 'Click anywhere on the waveform or timeline to leave a comment with exact timestamp.'
                  : 'Click anywhere on the image preview to drop a pin and start a threaded discussion.'}
              </p>
            </div>
          ) : (
            displayedPreviewMessages.map((msg) => {
              const isMe = msg.sender === 'me' || msg.senderName === currentUser.name;
              const pinNum =
                msg.annotationPoint?.pinNumber ||
                (msg.annotationParentId
                  ? currentFileRootAnnotations.find((r) => r.id === msg.annotationParentId)?.annotationPoint?.pinNumber
                  : undefined);
              const sec =
                msg.annotationPoint?.timestampSeconds ??
                (msg.annotationParentId
                  ? currentFileRootAnnotations.find((r) => r.id === msg.annotationParentId)?.annotationPoint?.timestampSeconds
                  : undefined);

              // Soundcloud real-time listening effect: highlight comment as playback reaches this timestamp
              const isPlayingAtTimestamp =
                isTimelineMedia && isPlaying && sec !== undefined && Math.abs(currentTime - sec) < 1.5;

              return (
                <div
                  key={msg.id}
                  className={cn(
                    'flex flex-col group transition-all rounded-xl p-1',
                    isMe ? 'items-end' : 'items-start',
                    isPlayingAtTimestamp && 'ring-2 ring-amber-400/80 bg-amber-500/10'
                  )}
                >
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {msg.senderName}
                    </span>
                    <span className="text-[10px] text-slate-400">{msg.timestamp}</span>

                    {/* Interactive Timestamp Badge (SoundCloud feature) */}
                    {sec !== undefined ? (
                      <button
                        type="button"
                        onClick={() => seekToTime(sec, true)}
                        className="bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700/80 font-bold text-[10px] px-1.5 py-0.2 rounded-full flex items-center gap-1 hover:bg-amber-200 dark:hover:bg-amber-900 cursor-pointer transition-colors"
                        title={`Jump to ${formatTimecode(sec)}`}
                      >
                        <Play size={9} className="fill-current" />
                        <span>{formatTimecode(sec)}</span>
                        {pinNum && <span className="opacity-70 font-normal">#P{pinNum}</span>}
                      </button>
                    ) : pinNum ? (
                      <span className="bg-indigo-100 dark:bg-indigo-950/70 text-indigo-900 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-bold text-[10px] px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                        <MapPin size={9} /> Pin #{pinNum}
                      </span>
                    ) : null}
                  </div>

                  <div className="relative max-w-[88%]">
                    <div
                      className={cn(
                        'p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs',
                        isMe
                          ? 'bg-indigo-600 text-white rounded-tr-xs'
                          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-tl-xs'
                      )}
                    >
                      {msg.replyToName && (
                        <div
                          className={cn(
                            'mb-2 p-2 rounded-lg text-[11px] border-l-2',
                            isMe
                              ? 'bg-indigo-700/60 border-indigo-300 text-indigo-100'
                              : 'bg-slate-100 dark:bg-slate-750 border-indigo-500 text-slate-600 dark:text-slate-300'
                          )}
                        >
                          <span className="font-semibold">{msg.replyToName}</span>: {msg.replySnippet}
                        </div>
                      )}
                      <div>{msg.content}</div>
                    </div>

                    {/* Action buttons on hover */}
                    <div
                      className={cn(
                        'absolute top-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 z-10 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xs p-1 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm',
                        isMe ? '-left-20' : '-right-20'
                      )}
                    >
                      <button
                        onClick={() => {
                          setPreviewReplyingToMessage(msg);
                          if (pinNum) setActivePinNumber(pinNum);
                          if (sec !== undefined) setNewTimelineTimestamp(sec);
                          previewInputRef.current?.focus();
                        }}
                        className="p-1.5 rounded-full text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                        title="Reply to this comment"
                      >
                        <CornerDownRight size={13} />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onCopyLink?.(msg);
                        }}
                        className="p-1.5 rounded-full text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                        title="Copy link to this message"
                      >
                        <Link2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={subthreadEndRef} className="h-0 w-full shrink-0" />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
          <div className="max-w-full">
            {previewReplyingToMessage && (
              <div className="flex items-center justify-between bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900 px-3.5 py-2 rounded-xl mb-2 text-xs">
                <div className="flex items-center gap-2 truncate min-w-0">
                  <CornerDownRight size={14} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span className="text-slate-600 dark:text-slate-300 shrink-0">
                    Replying to{' '}
                    <strong className="text-slate-800 dark:text-slate-100">
                      {previewReplyingToMessage.senderName}
                    </strong>
                    :
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 truncate italic">
                    &ldquo;{previewReplyingToMessage.content}&rdquo;
                  </span>
                  {previewReplyingToMessage.annotationPoint?.timestampSeconds !== undefined ? (
                    <span className="shrink-0 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded">
                      {formatTimecode(previewReplyingToMessage.annotationPoint.timestampSeconds)}
                    </span>
                  ) : previewReplyingToMessage.annotationPoint?.pinNumber ? (
                    <span className="shrink-0 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold px-1.5 py-0.5 rounded">
                      Pin #{previewReplyingToMessage.annotationPoint.pinNumber}
                    </span>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewReplyingToMessage(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md shrink-0 ml-2 transition-colors cursor-pointer"
                  title="Cancel reply"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {newTimelineTimestamp !== null && !previewReplyingToMessage && (
              <div className="flex items-center justify-between bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 px-3 py-1.5 rounded-xl mb-2 text-xs">
                <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-medium">
                  <Clock size={13} className="text-amber-600 dark:text-amber-400" />
                  <span>
                    Pin #{nextPinNumber} at <strong>{formatTimecode(newTimelineTimestamp)}</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setNewTimelineTimestamp(null)}
                  className="text-xs text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
                >
                  Clear Timestamp
                </button>
              </div>
            )}

            {newPinPoint && !previewReplyingToMessage && !isTimelineMedia && (
              <div className="flex items-center justify-between bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 px-3 py-1.5 rounded-xl mb-2 text-xs">
                <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-medium">
                  <MapPin size={13} className="text-amber-600 dark:text-amber-400" />
                  <span>
                    Pin #{nextPinNumber} dropped at {Math.round(newPinPoint.x)}%,{' '}
                    {Math.round(newPinPoint.y)}%
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setNewPinPoint(null)}
                  className="text-xs text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
                >
                  Clear Pin
                </button>
              </div>
            )}

            <form onSubmit={handleAddAnnotation} className="relative flex items-end">
              <textarea
                ref={previewInputRef}
                value={annotationInputValue}
                onChange={(e) => setAnnotationInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAddAnnotation(e);
                  }
                }}
                placeholder={
                  previewReplyingToMessage
                    ? `Reply to ${previewReplyingToMessage.senderName}...`
                    : newTimelineTimestamp !== null
                    ? `Comment at ${formatTimecode(newTimelineTimestamp)} (Pin #${nextPinNumber})...`
                    : newPinPoint
                    ? `Leave a comment on Pin #${nextPinNumber}...`
                    : activePinNumber
                    ? `Comment in Pin #${activePinNumber} thread...`
                    : isTimelineMedia
                    ? `Click waveform to pin, or comment at ${formatTimecode(currentTime)}...`
                    : 'Click image to pin, or type here...'
                }
                className="w-full resize-none bg-slate-100 dark:bg-slate-800 border-transparent focus:bg-white dark:focus:bg-slate-850 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-3 pl-4 pr-12 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all max-h-32"
                rows={1}
              />
              <button
                type="submit"
                disabled={!annotationInputValue.trim()}
                className="absolute right-2 bottom-2 p-1.5 bg-indigo-600 text-white rounded-lg disabled:opacity-50 disabled:bg-slate-300 dark:disabled:bg-slate-700 hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer"
                title="Send"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
