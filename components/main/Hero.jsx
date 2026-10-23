import Image from "next/image";
import TechText from "./TechText";
import Galaxy from "./Galaxy";
import AmbientAudio from "./AmbientAudio";

function ArrowIcon({ className = "h-5 w-5" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

export default function Hero() {
  return (
    <main id="home" className="nebula-hero relative isolate min-h-[100svh] overflow-hidden bg-[#101112] text-[#f1f0ed] caret-transparent selection:bg-violet-900 selection:text-white">
      <AmbientAudio />
      <div aria-hidden="true" className="nebula-backdrop pointer-events-none fixed inset-0 z-0">
        <div className="nebula-image-layer absolute inset-0" />
        <div className="nebula-dust-cloud absolute inset-0" />
        <Galaxy
          className="nebula-galaxy absolute inset-0"
          density={0.8}
          starSpeed={0.18}
          speed={0.7}
          glowIntensity={0.22}
          flareIntensity={0.25}
          hueShift={250}
          saturation={0}
          twinkleIntensity={0.25}
          layers={4}
          mouseInteraction
          mouseRepulsion
          repulsionStrength={0.85}
          clickWarp={false}
          intro
          transparent
          lightMode={false}
        />
        <div className="nebula-vignette absolute inset-0" />
      </div>

      <div aria-hidden="true" className="rocket-flight pointer-events-none absolute bottom-[16%] left-[24%] z-[1]">
        <svg viewBox="0 0 32 48" className="h-8 w-6 text-slate-100/80 sm:h-10 sm:w-8" fill="none">
          <path d="M16 3C10.8 9.2 8.5 16.4 9.2 26l6.8 6 6.8-6C23.5 16.4 21.2 9.2 16 3Z" fill="currentColor" fillOpacity=".82" />
          <path d="m9.4 20-5 5.2-.8 9.1 7.3-5.6M22.6 20l5 5.2.8 9.1-7.3-5.6M12.8 32l3.2 5 3.2-5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          <circle cx="16" cy="18" r="3" fill="#111827" fillOpacity=".82" />
          <path d="M16 37v7" stroke="#d8d2e4" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>

      <header className="fixed inset-x-0 top-0 z-50 w-full px-3 py-2 sm:px-5 sm:py-2 lg:px-7 lg:py-2">
        <div className="flex w-full items-center justify-between gap-6">
          <a href="#home" className="group flex shrink-0 items-center gap-3 sm:gap-4" aria-label="APS, home">
            <span className="relative flex h-14 w-24 items-center justify-center sm:h-16 sm:w-28">
              <Image
                src="/aps-logo.png"
                alt="APS logo"
                width={180}
                height={180}
                priority
                className="h-14 w-24 object-contain transition-transform duration-100 group-hover:scale-105 sm:h-16 sm:w-28"
              />
            </span>
            <span className="hidden flex-col gap-1 sm:flex">
              <span className="text-xs font-semibold leading-none tracking-[0.04em] text-slate-200 sm:text-sm">Algorithmic and Programming Society</span>
              <span className="text-[10px] uppercase leading-none tracking-[0.2em] text-slate-400 sm:text-xs">NIT Rourkela</span>
            </span>
          </a>

          <a href="#home" className="group flex shrink-0 items-center gap-3" aria-label="InnoVision">
            <Image
              src="/inno.png"
              alt="InnoVision logo"
              width={80}
              height={80}
              className="h-14 w-14 object-contain transition-transform duration-100 group-hover:scale-105 sm:h-16 sm:w-16"
            />
            <span className="text-base font-semibold uppercase tracking-[0.18em] text-slate-100 sm:text-lg">InnoVision</span>
          </a>
        </div>
      </header>

      <section id="about" className="nebula-hero-section relative z-10 mx-auto flex min-h-[100svh] max-w-7xl items-center px-5 pb-16 pt-[108px] sm:px-8 lg:px-14 lg:pb-24">
        <div className="relative z-10 w-full max-w-3xl">
          <p className="mb-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.35em] text-stone-300 sm:text-sm">
            <span className="h-px w-8 bg-stone-400/70" /> A P S&nbsp; P R E S E N T S
          </p>

          <div className="relative my-2 flex flex-col">
            <h1 className="relative z-10 text-[#f4f3f0]" aria-label="NEBULA NEXUS">
              <TechText
                text="NEBULA"
                fontFamily="myFirstFont, ui-sans-serif, sans-serif"
                fontWeight={400}
                fontSize={128}
                letterSpacing={0.01}
                align="left"
                color="#f4f3f0"
                accentColor="#a59bad"
                lineStyle="solid"
                reveal="letter"
                selection={false}
                labels={false}
                draggable={false}
                clickKick={false}
                intro="none"
                className="nebula-title-animation h-[48px] w-full sm:h-[68px] lg:h-[78px]"
              />
              <TechText
                text="NEXUS"
                fontFamily="myFirstFont, ui-sans-serif, sans-serif"
                fontWeight={400}
                fontSize={128}
                letterSpacing={0.01}
                align="left"
                color="#f4f3f0"
                accentColor="#a59bad"
                lineStyle="solid"
                reveal="letter"
                selection={false}
                labels={false}
                draggable={false}
                clickKick={false}
                intro="none"
                className="nebula-title-animation h-[48px] w-full sm:h-[68px] lg:h-[78px]"
              />
            </h1>
          </div>

          <p className="mb-8 mt-6 max-w-xl font-mono text-sm leading-6 tracking-[0.015em] text-slate-200 sm:text-base">
            Let us commence the APS Game of Nebula Nexus
          </p>

          <div id="tracks" className="flex flex-wrap items-center gap-3 sm:gap-5">
            <a href="/register" className="group inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white text-sm font-semibold text-[#171819] transition duration-100 hover:scale-[1.03] hover:bg-stone-200 hover:shadow-[0_0_28px_rgba(139,92,246,0.25)] sm:px-8 sm:py-3.5 sm:text-base px-6 py-3">
              Register Now <ArrowIcon className="h-5 w-5 transition-transform duration-100 group-hover:translate-x-1" />
            </a>
          </div>
        </div>

      </section>

      <p className="pointer-events-none fixed inset-x-0 bottom-3 z-40 text-center text-xs text-slate-300/80 sm:bottom-4 sm:text-sm">
        Made with <span aria-label="love">❤️</span> by APS
      </p>
    </main>
  );
}
