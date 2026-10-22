'use client';

import { useEffect, useRef, useState } from 'react';

export default function AmbientAudio() {
  const audioRef = useRef(null);
  const mutedRef = useRef(false);
  const pointerMoveAttemptedRef = useRef(false);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.05;
    audio.muted = false;

    const tryAudibleAutoplay = () => {
      audio.play().catch(() => {
        // Start the ambience immediately, even where browsers block audible autoplay.
        audio.muted = true;
        audio.play().catch(() => {});
      });
    };

    if (audio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      tryAudibleAutoplay();
    } else {
      audio.addEventListener('canplay', tryAudibleAutoplay, { once: true });
    }

    const resumeAfterInteraction = (event) => {
      if (event.target instanceof Element && event.target.closest('[data-ambient-audio-control]')) return;
      if (mutedRef.current) return;
      if (event.type === 'pointermove') {
        if (pointerMoveAttemptedRef.current) return;
        pointerMoveAttemptedRef.current = true;
      }
      audio.muted = false;
      audio.play().catch(() => {});
    };

    document.addEventListener('pointermove', resumeAfterInteraction, { passive: true });
    document.addEventListener('pointerdown', resumeAfterInteraction);
    document.addEventListener('keydown', resumeAfterInteraction);
    return () => {
      audio.removeEventListener('canplay', tryAudibleAutoplay);
      document.removeEventListener('pointermove', resumeAfterInteraction);
      document.removeEventListener('pointerdown', resumeAfterInteraction);
      document.removeEventListener('keydown', resumeAfterInteraction);
    };
  }, []);

  async function toggleAudio() {
    const audio = audioRef.current;
    if (!audio) return;

    if (muted) {
      audio.muted = false;
      mutedRef.current = false;
      setMuted(false);
      try {
        audio.volume = 0.05;
        await audio.play();
      } catch {}
    } else {
      if (audio.muted || audio.paused) {
        audio.muted = false;
        mutedRef.current = false;
        audio.volume = 0.05;
        setMuted(false);
        try {
          await audio.play();
        } catch {}
      } else {
        audio.muted = true;
        mutedRef.current = true;
        setMuted(true);
      }
    }
  }

  return (
    <>
      <audio ref={audioRef} src="/space-ambience.mp3" loop preload="auto" />
      <button
        type="button"
        onClick={toggleAudio}
        data-ambient-audio-control
        className="fixed bottom-5 right-5 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-[#101112]/65 text-slate-200 backdrop-blur-sm transition hover:border-white/30 hover:text-white"
        aria-label={muted ? 'Unmute ambient space audio' : 'Mute ambient space audio'}
        title={muted ? 'Unmute ambience' : 'Mute ambience'}
      >
        {!muted ? (
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
            <path d="M11 5 6 9H3v6h3l5 4V5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
            <path d="M15.5 8.5a5 5 0 0 1 0 7m3-10a9 9 0 0 1 0 13" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        ) : (
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
            <path d="M11 5 6 9H3v6h3l5 4V5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
            <path d="m16 9 5 6m0-6-5 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        )}
      </button>
    </>
  );
}
