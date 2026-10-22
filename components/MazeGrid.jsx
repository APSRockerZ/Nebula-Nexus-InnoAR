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
            {/* Horizontal pipe gradient - shiny cylinder illusion */}
            <linearGradient id="pipeH" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#062a36" />
              <stop offset="12%"  stopColor="#0a5f7a" />
              <stop offset="32%"  stopColor="#1cb8d8" />
              <stop offset="50%"  stopColor="#e8f8ff" />
              <stop offset="62%"  stopColor="#9ce6f5" />
              <stop offset="80%"  stopColor="#0f95b8" />
              <stop offset="100%" stopColor="#04232e" />
            </linearGradient>

            {/* Vertical pipe gradient */}
            <linearGradient id="pipeV" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%"   stopColor="#062a36" />
              <stop offset="12%"  stopColor="#0a5f7a" />
              <stop offset="32%"  stopColor="#1cb8d8" />
              <stop offset="50%"  stopColor="#e8f8ff" />
              <stop offset="62%"  stopColor="#9ce6f5" />
              <stop offset="80%"  stopColor="#0f95b8" />
              <stop offset="100%" stopColor="#04232e" />
            </linearGradient>

            {/* Circular flange/collar gradient */}
            <radialGradient id="flangeRad" cx="40%" cy="35%" r="65%">
              <stop offset="0%"   stopColor="#baeeff" />
              <stop offset="30%"  stopColor="#1cb8d8" />
              <stop offset="70%"  stopColor="#0d7a96" />
              <stop offset="100%" stopColor="#052838" />
            </radialGradient>

            {/* Pipe glow filter */}
            <filter id="pipeGlow" x="-15%" y="-15%" width="130%" height="130%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Bolt pattern for flanges */}
            <filter id="innerShadow">
              <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000" floodOpacity="0.7" />
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
          <g filter="url(#pipeGlow)">
            {wallCells.map(({ r, c, cx, cy, hasTop, hasBottom, hasLeft, hasRight, connCount }, idx) => (
              <g key={`wall-${r}-${c}`}>

                {/* Downward arm */}
                {hasTop && (
                  <rect
                    x={cx - PR} y={cy - HALF - 2}
                    width={PR * 2} height={HALF + PR + 2}
                    fill="url(#pipeH)"
                  />
                )}
                {/* Upward arm */}
                {hasBottom && (
                  <rect
                    x={cx - PR} y={cy - PR}
                    width={PR * 2} height={HALF + PR + 2}
                    fill="url(#pipeH)"
                  />
                )}
                {/* Rightward arm */}
                {hasLeft && (
                  <rect
                    x={cx - HALF - 2} y={cy - PR}
                    width={HALF + PR + 2} height={PR * 2}
                    fill="url(#pipeV)"
                  />
                )}
                {/* Leftward arm */}
                {hasRight && (
                  <rect
                    x={cx - PR} y={cy - PR}
                    width={HALF + PR + 2} height={PR * 2}
                    fill="url(#pipeV)"
                  />
                )}

                {/* Junction Hub / Flange */}
                {connCount >= 3 ? (
                  // Multi-way junction: big bolted collar
                  <g>
                    <circle cx={cx} cy={cy} r={PR + 9} fill="url(#flangeRad)" stroke="#67e8f9" strokeWidth="2.5" />
                    {/* Bolt holes at 4 positions */}
                    <circle cx={cx - PR - 4} cy={cy} r="3.5" fill="#cfffff" stroke="#083344" strokeWidth="1" />
                    <circle cx={cx + PR + 4} cy={cy} r="3.5" fill="#cfffff" stroke="#083344" strokeWidth="1" />
                    <circle cx={cx} cy={cy - PR - 4} r="3.5" fill="#cfffff" stroke="#083344" strokeWidth="1" />
                    <circle cx={cx} cy={cy + PR + 4} r="3.5" fill="#cfffff" stroke="#083344" strokeWidth="1" />
                    <circle cx={cx} cy={cy} r={PR - 5} fill="#0b4f64" stroke="#22d3ee" strokeWidth="1.5" />
                    <circle cx={cx} cy={cy} r={4}    fill="#e0f9ff" />
                  </g>
                ) : connCount === 2 && hasLeft && hasRight ? (
                  // Straight horizontal coupling band
                  <g>
                    <rect x={cx - PR} y={cy - PR} width={PR * 2} height={PR * 2} fill="url(#pipeV)" />
                    <rect x={cx - 6} y={cy - PR - 6} width={12} height={PR * 2 + 12} rx="3" fill="url(#flangeRad)" stroke="#67e8f9" strokeWidth="1.5" />
                    <circle cx={cx} cy={cy - PR - 4} r="2.5" fill="#cfffff" />
                    <circle cx={cx} cy={cy + PR + 4} r="2.5" fill="#cfffff" />
                  </g>
                ) : connCount === 2 && hasTop && hasBottom ? (
                  // Straight vertical coupling band
                  <g>
                    <rect x={cx - PR} y={cy - PR} width={PR * 2} height={PR * 2} fill="url(#pipeH)" />
                    <rect x={cx - PR - 6} y={cy - 6} width={PR * 2 + 12} height={12} rx="3" fill="url(#flangeRad)" stroke="#67e8f9" strokeWidth="1.5" />
                    <circle cx={cx - PR - 4} cy={cy} r="2.5" fill="#cfffff" />
                    <circle cx={cx + PR + 4} cy={cy} r="2.5" fill="#cfffff" />
                  </g>
                ) : (
                  // Elbow / dead-end: standard round collar
                  <g>
                    <circle cx={cx} cy={cy} r={PR + 7} fill="url(#flangeRad)" stroke="#67e8f9" strokeWidth="2" />
                    {hasLeft || hasRight ? (
                      <>
                        <circle cx={cx} cy={cy - PR - 4} r="2.5" fill="#cfffff" />
                        <circle cx={cx} cy={cy + PR + 4} r="2.5" fill="#cfffff" />
                      </>
                    ) : (
                      <>
                        <circle cx={cx - PR - 4} cy={cy} r="2.5" fill="#cfffff" />
                        <circle cx={cx + PR + 4} cy={cy} r="2.5" fill="#cfffff" />
                      </>
                    )}
                    <circle cx={cx} cy={cy} r="4" fill="#e0f9ff" />
                  </g>
                )}
              </g>
            ))}
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
