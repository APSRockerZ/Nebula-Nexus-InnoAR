'use client';
import { useContext, useEffect, useRef, useMemo } from 'react';
import { GameContext } from '@/Context/GameContext';

// Cell size in SVG units - this maps each cell in the 35x23 maze to pixels in the SVG viewport
const CELL = 100;

const MazeGrid = () => {
  const {
    ratPosition,
    mazeLayout,
    handleMove,
    getQuestion,
    isQuestionModalOpen,
    numRows,
    numCols,
  } = useContext(GameContext);

  const mazeRef = useRef(null);
  const PIPE_R = 22; // Half-thickness of pipe (slightly thicker than before)

  const SVG_W = numCols * CELL;
  const SVG_H = numRows * CELL;

  useEffect(() => {
    if (mazeRef.current) mazeRef.current.focus();
  }, []);

  useEffect(() => {
    if (!isQuestionModalOpen && mazeRef.current) mazeRef.current.focus();
  }, [isQuestionModalOpen]);

  useEffect(() => {
    const handleClick = () => mazeRef.current?.focus();
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const isValidMove = (row, col) => {
    if (row < 0 || col < 0 || row >= numRows || col >= numCols) return false;
    return mazeLayout[row][col] !== 1;
  };

  const handleKeyDown = (event) => {
    event.preventDefault();
    const { row, col } = ratPosition;
    let newRow = row, newCol = col;
    switch (event.key) {
      case 'ArrowUp': case 'w': case 'W': newRow = row - 1; break;
      case 'ArrowDown': case 's': case 'S': newRow = row + 1; break;
      case 'ArrowLeft': case 'a': case 'A': newCol = col - 1; break;
      case 'ArrowRight': case 'd': case 'D': newCol = col + 1; break;
      default: return;
    }
    if (isValidMove(newRow, newCol)) {
      handleMove(newRow, newCol);
      const cellType = mazeLayout[newRow][newCol];
      if (cellType === 2 || cellType === 3 || cellType === 4) getQuestion(cellType);
    }
  };

  const isInRange = (row, col) => {
    return (
      Math.abs(row - ratPosition.row) <= 10 &&
      Math.abs(col - ratPosition.col) <= 12
    );
  };

  // Pre-compute pipe connectivity for each WALL cell (cell === 1)
  const wallCells = useMemo(() => {
    if (!mazeLayout?.length) return [];
    const result = [];
    for (let r = 0; r < numRows; r++) {
      for (let c = 0; c < numCols; c++) {
        if (mazeLayout[r][c] !== 1) continue;
        const cx = c * CELL + CELL / 2;
        const cy = r * CELL + CELL / 2;
        const hasTop    = r > 0 && mazeLayout[r - 1][c] === 1;
        const hasBottom = r < numRows - 1 && mazeLayout[r + 1][c] === 1;
        const hasLeft   = c > 0 && mazeLayout[r][c - 1] === 1;
        const hasRight  = c < numCols - 1 && mazeLayout[r][c + 1] === 1;
        const connCount = (hasTop ? 1 : 0) + (hasBottom ? 1 : 0) + (hasLeft ? 1 : 0) + (hasRight ? 1 : 0);
        result.push({ r, c, cx, cy, hasTop, hasBottom, hasLeft, hasRight, connCount });
      }
    }
    return result;
  }, [mazeLayout, numRows, numCols]);

  // Pre-compute path cells for rendering interactive items & the astronaut
  const pathCells = useMemo(() => {
    if (!mazeLayout?.length) return [];
    const result = [];
    for (let r = 0; r < numRows; r++) {
      for (let c = 0; c < numCols; c++) {
        const cell = mazeLayout[r][c];
        if (cell === 1) continue;
        result.push({ r, c, cell, cx: c * CELL + CELL / 2, cy: r * CELL + CELL / 2 });
      }
    }
    return result;
  }, [mazeLayout, numRows, numCols]);

  const PR = PIPE_R;
  const HALF = CELL / 2;

  return (
    <div
      className="relative w-full h-full select-none outline-none cursor-pointer rounded-2xl overflow-hidden border-[4px] border-[#1e3a4a] shadow-[0_0_50px_rgba(0,0,0,0.95)] bg-[#040d14]"
      style={{ minHeight: '100%' }}
      tabIndex="0"
      ref={mazeRef}
      onKeyDown={handleKeyDown}
    >
        {/* ========== Pipeline Maze SVG ========== */}
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          className="absolute inset-0 z-[2] w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Horizontal pipe gradient - top-to-bottom shiny cylinder */}
            <linearGradient id="pipeH" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#041e2a" />
              <stop offset="10%"  stopColor="#084d63" />
              <stop offset="28%"  stopColor="#14a8c8" />
              <stop offset="48%"  stopColor="#d6f4ff" />
              <stop offset="60%"  stopColor="#7fd8ef" />
              <stop offset="82%"  stopColor="#0c7ea0" />
              <stop offset="100%" stopColor="#031821" />
            </linearGradient>

            {/* Vertical pipe gradient - left-to-right shiny cylinder */}
            <linearGradient id="pipeV" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%"   stopColor="#041e2a" />
              <stop offset="10%"  stopColor="#084d63" />
              <stop offset="28%"  stopColor="#14a8c8" />
              <stop offset="48%"  stopColor="#d6f4ff" />
              <stop offset="60%"  stopColor="#7fd8ef" />
              <stop offset="82%"  stopColor="#0c7ea0" />
              <stop offset="100%" stopColor="#031821" />
            </linearGradient>

            {/* Glowing sphere node gradient - bright blue orb */}
            <radialGradient id="nodeOrb" cx="35%" cy="30%" r="65%">
              <stop offset="0%"   stopColor="#ffffff" />
              <stop offset="18%"  stopColor="#a8efff" />
              <stop offset="45%"  stopColor="#22d3ee" />
              <stop offset="75%"  stopColor="#0369a1" />
              <stop offset="100%" stopColor="#012030" />
            </radialGradient>

            {/* Outer glow ring for nodes */}
            <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
              <stop offset="40%"  stopColor="rgba(34,211,238,0)" />
              <stop offset="100%" stopColor="rgba(34,211,238,0.45)" />
            </radialGradient>

            {/* Along-pipe edge highlight — thin bright line on top of pipe body */}
            {/* (no cross-glow filter; glow achieved by a bright highlight rect) */}

            {/* Soft outer glow for pipe segments only */}
            <filter id="pipeEdgeGlow" x="-8%" y="-8%" width="116%" height="116%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Node glow filter */}
            <filter id="nodeGlowFilter" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* ===== BACKGROUND: Spaceship image ===== */}
          <image
            href="/Images/spaceship_bg.jpg"
            x="0" y="0"
            width={SVG_W}
            height={SVG_H}
            preserveAspectRatio="none"
          />
          {/* Dark semi-transparent tint to make pipes pop */}
          <rect x="0" y="0" width={SVG_W} height={SVG_H} fill="rgba(0,10,18,0.42)" />

          {/* ===== PIPE SEGMENTS (on WALL cells) ===== */}
          {/* Pass 1: pipe bodies (no cross-glow filter — glow is only along pipe via highlight strips) */}
          <g filter="url(#pipeEdgeGlow)">
            {wallCells.map(({ r, c, cx, cy, hasTop, hasBottom, hasLeft, hasRight }) => (
              <g key={`pipe-${r}-${c}`}>

                {/* ── Vertical arms (hasTop / hasBottom) use pipeH gradient (top→bottom shading) ── */}
                {hasTop && (
                  <rect
                    x={cx - PR} y={cy - HALF - 1}
                    width={PR * 2} height={HALF + PR + 1}
                    fill="url(#pipeH)"
                  />
                )}
                {hasBottom && (
                  <rect
                    x={cx - PR} y={cy - PR}
                    width={PR * 2} height={HALF + PR + 1}
                    fill="url(#pipeH)"
                  />
                )}

                {/* ── Horizontal arms (hasLeft / hasRight) use pipeV gradient (left→right shading) ── */}
                {hasLeft && (
                  <rect
                    x={cx - HALF - 1} y={cy - PR}
                    width={HALF + PR + 1} height={PR * 2}
                    fill="url(#pipeV)"
                  />
                )}
                {hasRight && (
                  <rect
                    x={cx - PR} y={cy - PR}
                    width={HALF + PR + 1} height={PR * 2}
                    fill="url(#pipeV)"
                  />
                )}

                {/* ── Highlight strips along pipe length (creates the "along-pipe" glow, not cross-glow) ── */}
                {/* Vertical highlight (top arm) */}
                {hasTop && (
                  <rect
                    x={cx - 3} y={cy - HALF - 1}
                    width={6} height={HALF + PR + 1}
                    fill="rgba(200,245,255,0.28)"
                    rx="3"
                  />
                )}
                {/* Vertical highlight (bottom arm) */}
                {hasBottom && (
                  <rect
                    x={cx - 3} y={cy - PR}
                    width={6} height={HALF + PR + 1}
                    fill="rgba(200,245,255,0.28)"
                    rx="3"
                  />
                )}
                {/* Horizontal highlight (left arm) */}
                {hasLeft && (
                  <rect
                    x={cx - HALF - 1} y={cy - 3}
                    width={HALF + PR + 1} height={6}
                    fill="rgba(200,245,255,0.28)"
                    rx="3"
                  />
                )}
                {/* Horizontal highlight (right arm) */}
                {hasRight && (
                  <rect
                    x={cx - PR} y={cy - 3}
                    width={HALF + PR + 1} height={6}
                    fill="rgba(200,245,255,0.28)"
                    rx="3"
                  />
                )}
              </g>
            ))}
          </g>

          {/* Pass 2: connector nodes on top of pipes */}
          <g filter="url(#nodeGlowFilter)">
            {wallCells.map(({ r, c, cx, cy, hasTop, hasBottom, hasLeft, hasRight, connCount }) => {
              // Straight-through mid-band (no node orb needed, just a small ring collar)
              const isStraightH = connCount === 2 && hasLeft && hasRight;
              const isStraightV = connCount === 2 && hasTop && hasBottom;

              if (isStraightH || isStraightV) {
                // Slim coupling collar — no dark navy fill, just a narrow metallic ring
                return (
                  <g key={`node-${r}-${c}`}>
                    {isStraightH ? (
                      // Horizontal pipe collar: thin vertical band across the pipe
                      <>
                        <rect x={cx - 5} y={cy - PR - 2} width={10} height={PR * 2 + 4} rx="3"
                          fill="#1a7a96" stroke="#67e8f9" strokeWidth="1.2" opacity="0.85" />
                        <rect x={cx - 2} y={cy - PR - 2} width={4} height={PR * 2 + 4} rx="2"
                          fill="rgba(200,245,255,0.35)" />
                      </>
                    ) : (
                      // Vertical pipe collar: thin horizontal band across the pipe
                      <>
                        <rect x={cx - PR - 2} y={cy - 5} width={PR * 2 + 4} height={10} rx="3"
                          fill="#1a7a96" stroke="#67e8f9" strokeWidth="1.2" opacity="0.85" />
                        <rect x={cx - PR - 2} y={cy - 2} width={PR * 2 + 4} height={4} rx="2"
                          fill="rgba(200,245,255,0.35)" />
                      </>
                    )}
                  </g>
                );
              }

              // Elbow, T-junction, cross — render glowing blue sphere orb
              const orbR = connCount >= 3 ? PR + 6 : PR + 4;
              return (
                <g key={`node-${r}-${c}`}>
                  {/* Outer ambient glow ring */}
                  <circle cx={cx} cy={cy} r={orbR + 8} fill="url(#nodeGlow)" />
                  {/* Dark rim */}
                  <circle cx={cx} cy={cy} r={orbR} fill="#062030" stroke="#22d3ee" strokeWidth="1.8" />
                  {/* Orb body */}
                  <circle cx={cx} cy={cy} r={orbR - 2} fill="url(#nodeOrb)" />
                  {/* Specular highlight (small bright dot offset top-left) */}
                  <circle cx={cx - orbR * 0.28} cy={cy - orbR * 0.28} r={orbR * 0.22}
                    fill="rgba(255,255,255,0.55)" />
                </g>
              );
            })}
          </g>

          {/* ===== INTERACTIVE ITEMS on PATH cells ===== */}
          {pathCells.map(({ r, c, cell, cx, cy }) => {
            const isPlayer = ratPosition.row === r && ratPosition.col === c;
            const isQuestion = (cell === 2 || cell === 3 || cell === 4) && isInRange(r, c);
            const isGoal = cell === 5;

            // Danger triangle colors
            const dangerColor = cell === 2 ? '#22c55e' : cell === 3 ? '#eab308' : '#ef4444';
            const dangerText  = cell === 2 ? '#4ade80' : cell === 3 ? '#fde047' : '#fca5a5';

            return (
              <g key={`path-${r}-${c}`}>
                {/* ---- ASTRONAUT ---- */}
                {isPlayer && (
                  <g>
                    {/* Pulsing cyan halo */}
                    <circle cx={cx} cy={cy} r={36} fill="rgba(34,211,238,0.18)" className="animate-pulse" />
                    <circle cx={cx} cy={cy} r={28} fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="5,4" className="animate-spin-slow" />
                    <image
                      href="/Images/astronaut.jpg"
                      x={cx - 32} y={cy - 34}
                      width={64} height={64}
                      style={{ mixBlendMode: 'screen', filter: 'drop-shadow(0 0 12px rgba(56,189,248,1))' }}
                    />
                  </g>
                )}

                {/* ---- DANGER TRIANGLE (Question cell in range) ---- */}
                {isQuestion && !isPlayer && (
                  <g>
                    <circle cx={cx} cy={cy} r={30} fill="none" stroke={dangerColor} strokeWidth="1.8" opacity="0.6" strokeDasharray="5,4" className="animate-spin-slow" />
                    {/* Triangle pointing up */}
                    <polygon
                      points={`${cx},${cy - 24} ${cx + 21},${cy + 14} ${cx - 21},${cy + 14}`}
                      fill="#080f1a"
                      stroke={dangerColor}
                      strokeWidth="4"
                      strokeLinejoin="round"
                    />
                    <polygon
                      points={`${cx},${cy - 17} ${cx + 14},${cy + 10} ${cx - 14},${cy + 10}`}
                      fill="none"
                      stroke={dangerColor}
                      strokeWidth="1.2"
                      strokeLinejoin="round"
                      opacity="0.7"
                    />
                    {/* ! bar */}
                    <rect x={cx - 3} y={cy - 10} width={6} height={13} rx="3" fill={dangerText} />
                    {/* ! dot */}
                    <circle cx={cx} cy={cy + 8} r={3.5} fill={dangerText} />
                  </g>
                )}

                {/* ---- O2 CYLINDER (Goal cell) ---- */}
                {isGoal && (
                  <g>
                    <circle cx={cx} cy={cy} r={38} fill="rgba(6,182,212,0.2)" className="animate-pulse" />
                    <circle cx={cx} cy={cy} r={44} fill="none" stroke="#22d3ee" strokeWidth="2.5" strokeDasharray="7,5" className="animate-spin-slow" />
                    {/* Cylinder body */}
                    <rect x={cx - 18} y={cy - 36} width={36} height={68} rx={16} fill="url(#pipeH)" stroke="#67e8f9" strokeWidth="2.5" />
                    {/* Top valve */}
                    <rect x={cx - 8} y={cy - 42} width={16} height={8} rx="3" fill="#94a3b8" stroke="#38bdf8" strokeWidth="1" />
                    {/* Metal bands */}
                    <rect x={cx - 14} y={cy - 22} width={28} height={4} rx="1" fill="#0f172a" stroke="#67e8f9" strokeWidth="0.8" />
                    <rect x={cx - 14} y={cy + 18} width={28} height={4} rx="1" fill="#0f172a" stroke="#67e8f9" strokeWidth="0.8" />
                    {/* O2 label */}
                    <text x={cx - 10} y={cy + 12} fontFamily="Arial Black, sans-serif" fontWeight="900" fontSize="22" fill="#ffffff" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.9))' }}>O</text>
                    <text x={cx + 8}  y={cy + 16} fontFamily="Arial Black, sans-serif" fontWeight="900" fontSize="15" fill="#e0f2fe">2</text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
    </div>
  );
};

export default MazeGrid;
