'use client'
import { useContext, useState, useEffect } from 'react';
import MazeGrid from '@/components/MazeGrid';
//import { GameProvider } from '@/Context/GameContext';
import Sidebar from '@/components/Sidebar';
import QuestionModal from '@/components/QuestionModal';
import GameOverModal from '@/components/GameOverModal';
import { GameContext } from '@/Context/GameContext';
import StarsCanvas from "@/components/main/StarBackground";

const Onboarding = () => {
  const { setGameStarted } = useContext(GameContext);
  useEffect(()=>{
    const startTime = new Date();
    setGameStarted(startTime);
    console.log('Game started at:', startTime);
   
  },[])

    return (
            <div className="flex flex-row items-center bg-black">
              <StarsCanvas/>
                <div className="w-[80%] h-screen flex items-center justify-center p-4">
                    <div className="h-[760px] w-[1160px] max-w-[94%] relative">
                       <MazeGrid />
                    </div>
                </div>
                <div className="bg-black w-[20%] h-screen">
                    <Sidebar/>
                </div>
                <GameOverModal />
                 <QuestionModal />
            </div>
    );
};

export default Onboarding;
