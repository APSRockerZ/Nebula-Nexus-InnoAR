"use client";
import React, { useContext } from "react";
import { GameContext } from "@/Context/GameContext";
import { MdExitToApp } from "react-icons/md";
import Image from "next/image";
import { DangerTriangle, O2Cylinder } from "@/components/SpaceshipIcons";

const Sidebar = () => {
  const { lifelines, score, timeLeft, setIsGameOver, setShowBackButton } =
    useContext(GameContext);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const end = () => {
    setShowBackButton(true);
    setIsGameOver(true);
  };

  const oxygen_tank = "/Images/Oxygen_Tank.png";

  return (
    <header className="w-full h-16 px-4 md:px-8 bg-slate-950/80 backdrop-blur-md border-b border-cyan-500/30 shadow-[0_4px_30px_rgba(0,0,0,0.85)] flex items-center justify-between text-white font-bold select-none relative z-50">
      {/* LEFT: Oxygen Lifelines */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-950/70 to-slate-900/80 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
          <span className="text-xs uppercase tracking-wider text-cyan-400 font-mono font-semibold mr-1">
            Oxygen
          </span>
          <div className="flex items-center space-x-1.5">
            {Array.from({ length: lifelines }).map((_, index) => (
              <span key={index} className="inline-block transition-transform transform hover:scale-110">
                <Image
                  alt="oxygen_tank"
                  src={oxygen_tank}
                  width={34}
                  height={34}
                  className="drop-shadow-[0_0_8px_rgba(34,211,238,0.7)]"
                />
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* CENTER: Mission Telemetry (Time & Score) */}
      <div className="flex items-center space-x-3 sm:space-x-5">
        {/* Time Badge */}
        <div
          className="flex items-center px-4 py-1.5 rounded-xl bg-gradient-to-r from-gray-900/90 to-slate-900/90 border border-cyan-500/40 shadow-lg text-cyan-300 font-mono tracking-wider"
          style={{ boxShadow: "0 0 15px rgba(6,182,212,0.2)" }}
        >
          <span className="text-xs uppercase text-cyan-400/80 mr-2 font-semibold">Time</span>
          <span className="text-xl sm:text-2xl font-bold text-white tracking-widest font-mono">
            {formatTime(timeLeft)}
          </span>
        </div>

        {/* Score Badge */}
        <div
          className="flex items-center px-4 py-1.5 rounded-xl bg-gradient-to-r from-gray-900/90 to-slate-900/90 border border-cyan-500/40 shadow-lg text-cyan-300 font-mono tracking-wider"
          style={{ boxShadow: "0 0 15px rgba(6,182,212,0.2)" }}
        >
          <span className="text-xs uppercase text-cyan-400/80 mr-2 font-semibold">Score</span>
          <span className="text-xl sm:text-2xl font-bold text-yellow-400 tracking-wider font-mono">
            {score}
          </span>
        </div>
      </div>

      {/* RIGHT: Point Legends & End Game */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Compact Point Badges */}
        <div className="hidden lg:flex items-center space-x-2">
          {[
            { icon: <DangerTriangle color="green" size={20} />, label: "Easy", pts: "+10", color: "text-green-400 border-green-500/30" },
            { icon: <DangerTriangle color="yellow" size={20} />, label: "Med", pts: "+20", color: "text-yellow-400 border-yellow-500/30" },
            { icon: <DangerTriangle color="red" size={20} />, label: "Hard", pts: "+30", color: "text-red-400 border-red-500/30" },
            { icon: <O2Cylinder size={16} animated={false} />, label: "Goal", pts: "+90", color: "text-cyan-400 border-cyan-500/30" },
          ].map((cat, idx) => (
            <div
              key={idx}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 border ${cat.color} text-xs font-semibold`}
            >
              <div className="flex items-center justify-center">{cat.icon}</div>
              <span className="text-gray-300 font-mono">{cat.pts}</span>
            </div>
          ))}
        </div>

        {/* End Game Button */}
        <button
          onClick={end}
          className="px-4 py-1.5 text-sm sm:text-base text-white font-semibold bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 shadow-[0_0_15px_rgba(234,179,8,0.4)] hover:shadow-[0_0_20px_rgba(234,179,8,0.6)] flex items-center space-x-1.5 rounded-xl transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
        >
          <span>End Game</span>
          <MdExitToApp className="text-lg" />
        </button>
      </div>
    </header>
  );
};

export default Sidebar;
