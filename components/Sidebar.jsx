"use client";
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { GameContext } from "@/Context/GameContext";
import { MdExitToApp } from "react-icons/md";
import Image from "next/image";
import { DangerTriangle, O2Cylinder } from "@/components/SpaceshipIcons";
const Sidebar = () => {
  const { lifelines, score, timeLeft, setIsGameOver, setShowBackButton } =
    useContext(GameContext);
  const [leaderboard, setLeaderboard] = useState([]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const end = () => {
    setShowBackButton(true);
    setIsGameOver(true);
  };

  const easyQuestionImage = "/Images/easy_new.png";
  const mediumQuestionImage = "/Images/Med_new.png";
  const hardQuestionImage = "/Images/Hard_new.png";
  const goalImage = "/Images/Treasure.png";
  const oxygen_tank = "/Images/Oxygen_Tank.png";
  // useEffect(() => {
  //   const fetchLeaderboard = async () => {
  //     try {
  //       const response = await axios.get("/api/game"); // Replace with the correct endpoint
  //       console.log(response);
  //       setLeaderboard(response.data.topUsers);
  //     } catch (error) {
  //       console.error("Error fetching leaderboard data:", error);
  //     }
  //   };

  //   fetchLeaderboard();
  // }, []);

  return (
    <div className="text-white font-bold pt-6 flex flex-col justify-between h-full relative z-50">
      <div className="flex flex-col items-center mb-8">
        <div className="relative flex items-center justify-between p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-800 shadow-lg transition-transform transform hover:scale-105">
          {Array.from({ length: lifelines }).map((_, index) => (
            <span key={index} className="mr-1" style = {{marginBottom: '4px'}}>
              <Image 
              alt="oxygen_tank"
              src = {oxygen_tank}
              width={60}
              height={60}
              ></Image>
            </span>
          ))}
        </div>
        <div className="flex flex-col items-center mt-3 mb-4 w-full px-4 space-y-2.5">
          <div className="w-[110px] h-[110px] flex items-center justify-center relative">
            <div className="absolute inset-0 bg-cyan-500/20 rounded-2xl blur-md" />
            <Image
              src="/Images/astronaut.jpg"
              alt="Astronaut"
              width={110}
              height={110}
              style={{ mixBlendMode: 'screen' }}
              className="rounded-xl drop-shadow-[0_0_15px_rgba(56,189,248,0.85)] relative z-10"
            />
          </div>
          <div className="text-xl flex flex-col space-y-2 items-center justify-center w-full">
            <span
              className="relative flex items-center justify-center p-2 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 shadow-lg transition-transform transform hover:scale-105 text-cyan-300 text-lg font-mono tracking-wider w-[220px] h-[48px]"
              style={{
                boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.4)",
                border: "1px solid rgba(56, 189, 248, 0.3)",
              }}
            >
              Time: <span className="text-2xl ml-2 text-white font-bold">{formatTime(timeLeft)}</span>
            </span>
            <span
              className="relative flex items-center justify-center p-2 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 shadow-lg transition-transform transform hover:scale-105 text-cyan-300 text-xl font-mono font-bold w-[220px] h-[46px]"
              style={{
                boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.4)",
                border: "1px solid rgba(56, 189, 248, 0.3)",
              }}
            >
              Score: <span className="text-white ml-2">{score}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="mb-8 -m-1 space-y-3 w-[90%] self-center">
        {[
          { icon: <DangerTriangle color="green" size={34} />, label: "Easy", points: "+10" },
          { icon: <DangerTriangle color="yellow" size={34} />, label: "Medium", points: "+20" },
          { icon: <DangerTriangle color="red" size={34} />, label: "Hard", points: "+30" },
          { icon: <O2Cylinder size={22} animated={false} />, label: "Goal", points: "+90" },
        ].map((category, index) => (
          <div
            key={index}
            className="relative flex items-center justify-between p-2 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 shadow-lg transition-transform transform hover:scale-105"
            style={{
              boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.3)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}
          >
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-400 via-blue-500 to-cyan-950 opacity-20 blur-md -z-10"></div>
            <div className="w-10 h-10 flex items-center justify-center">
              {category.icon}
            </div>
            <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-400">
              {category.label}
            </span>
            <span className="text-sm w-20 font-semibold text-gray-300">
              {category.points} pts
            </span>
          </div>
        ))}
      </div>

      {/* End Game Button */}
      <div className="w-full -m-1 flex justify-center z-30 mb-8 text-xl">
        <button
          onClick={end}
          variant="secondary"
          className="w-[80%] py-2 text-white font-semibold bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500 shadow-lg shadow-yellow-500/50 hover:shadow-xl hover:shadow-yellow-400/60 hover:from-amber-300 hover:to-orange-400 flex items-center justify-center space-x-2 rounded-xl"
        >
          <span>End Game</span>
          <MdExitToApp className="text-xl" />
        </button>
      </div>

      {/* <div className="w-full flex justify-start z-30 mb-8 text-xl">
        <button
          onClick={end}
          variant="secondary"
          className="w-[80%] py-2 text-white font-semibold bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-xl transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-2xl hover:from-purple-600 hover:to-pink-600 flex items-center justify-center space-x-2"
        >
          <span>End Game</span>
          <MdExitToApp className="text-xl" />
        </button>

      </div> */}
    </div>
  );
};

export default Sidebar;
