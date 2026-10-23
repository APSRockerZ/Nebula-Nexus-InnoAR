import { Inter } from "next/font/google";
import "../globals.css";
import { auth } from "@/auth";
import { SessionProvider } from "next-auth/react";
const inter = Inter({ subsets: ["latin"] });
import { GameProvider } from '@/Context/GameContext';
export const metadata = {
  title: "Nebula Nexus | Cosmic Tech Fest",
  description: "Explore. Compete. Build. Connect. A coding and tech fest by the Algorithm & Programming Club, NIT Rourkela.",
};

export default async function RootLayout({ children }) {
  const session = await auth();
  //const session = await auth();

  return (
    <SessionProvider session={session}>
      <GameProvider>
      <html lang="en">
        <body className={`${inter.className} bg-[#101112] overflow-x-hidden`}>
          { children }
        </body>
      </html>
      </GameProvider>
    </SessionProvider>
  );
}
