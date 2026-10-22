'use client';
import { useContext, useEffect } from 'react';
import MazeGrid from '@/components/MazeGrid';
import Sidebar from '@/components/Sidebar';
import QuestionModal from '@/components/QuestionModal';
import GameOverModal from '@/components/GameOverModal';
import { GameContext } from '@/Context/GameContext';
import StarsCanvas from "@/components/main/StarBackground";

const Onboarding = () => {
  const { setGameStarted } = useContext(GameContext);
  useEffect(() => {
    const startTime = new Date();
    setGameStarted(startTime);
    console.log('Game started at:', startTime);
  }, [setGameStarted]);

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden select-none flex flex-col">
      {/* Background Starfield */}
      <StarsCanvas />

      {/* Top Horizontal Mission Control HUD */}
      <Sidebar />

      {/* Main Spaceship Viewport & Maze Area */}
      <main className="relative flex-1 w-full h-[calc(100vh-4rem)] flex items-center justify-center p-2 sm:p-4 z-30 overflow-hidden">
        {/* 16:9 Spaceship Prime Container */}
        <div className="relative w-full aspect-video max-h-full max-w-[calc((100vh-4.5rem)*16/9)] flex items-center justify-center rounded-2xl overflow-hidden shadow-[0_0_80px_rgba(6,182,212,0.22)] border border-cyan-500/30 bg-black/95">
          {/* Prime Spaceship Video Background */}
          <video
            src="/prefinalbg.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
          />

          {/* Maze Contained Inside Spaceship Cargo Bay (Black Area) */}
          <div
            className="absolute z-20"
            style={{
              left: '27.03%',
              top: '27.50%',
              width: '40.63%',
              height: '44.72%',
            }}
          >
            <MazeGrid />
          </div>
        </div>
      </main>

      <GameOverModal />
      <QuestionModal />
    </div>
  );
};

export default Onboarding;
