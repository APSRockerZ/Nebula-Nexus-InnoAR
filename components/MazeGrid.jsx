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

  // Pre-compute pipe connectivity for each WALL cell (cell === 1) & collar placements
  const { wallCells, pipeCollars } = useMemo(() => {
    if (!mazeLayout?.length) return { wallCells: [], pipeCollars: [] };

    const grid = Array.from({ length: numRows }, () => Array(numCols).fill(null));
    const cells = [];

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
        const isStraightH = connCount === 2 && hasLeft && hasRight;
        const isStraightV = connCount === 2 && hasTop && hasBottom;
        const isNode = !isStraightH && !isStraightV;

        const cellData = { r, c, cx, cy, hasTop, hasBottom, hasLeft, hasRight, connCount, isStraightH, isStraightV, isNode };
        grid[r][c] = cellData;
        cells.push(cellData);
      }
    }

    // Identify periodic sci-fi collar positions along straight pipe runs (spaced out, never touching orbs)
    const collars = [];

    // Horizontal straight runs
    for (let r = 0; r < numRows; r++) {
      let run = [];
      for (let c = 0; c < numCols; c++) {
        if (grid[r][c]?.isStraightH) {
          run.push(grid[r][c]);
        } else {
          if (run.length >= 3) {
            if (run.length === 3 || run.length === 4) {
              collars.push({ ...run[Math.floor(run.length / 2)], orientation: 'H' });
            } else {
              for (let i = 1; i < run.length - 1; i++) {
                if (i % 3 === 1) {
                  collars.push({ ...run[i], orientation: 'H' });
                }
              }
            }
          }
          run = [];
        }
      }
      if (run.length >= 3) {
        if (run.length === 3 || run.length === 4) {
          collars.push({ ...run[Math.floor(run.length / 2)], orientation: 'H' });
        } else {
          for (let i = 1; i < run.length - 1; i++) {
            if (i % 3 === 1) {
              collars.push({ ...run[i], orientation: 'H' });
            }
          }
        }
      }
    }

    // Vertical straight runs
    for (let c = 0; c < numCols; c++) {
      let run = [];
      for (let r = 0; r < numRows; r++) {
        if (grid[r][c]?.isStraightV) {
          run.push(grid[r][c]);
        } else {
          if (run.length >= 3) {
            if (run.length === 3 || run.length === 4) {
              collars.push({ ...run[Math.floor(run.length / 2)], orientation: 'V' });
            } else {
              for (let i = 1; i < run.length - 1; i++) {
                if (i % 3 === 1) {
                  collars.push({ ...run[i], orientation: 'V' });
                }
              }
            }
          }
          run = [];
        }
      }
      if (run.length >= 3) {
        if (run.length === 3 || run.length === 4) {
          collars.push({ ...run[Math.floor(run.length / 2)], orientation: 'V' });
        } else {
          for (let i = 1; i < run.length - 1; i++) {
            if (i % 3 === 1) {
              collars.push({ ...run[i], orientation: 'V' });
            }
          }
        }
      }
    }

    return { wallCells: cells, pipeCollars: collars };
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
      className="relative w-full h-full select-none outline-none cursor-pointer overflow-hidden bg-transparent"
      style={{ minHeight: '100%' }}
      tabIndex="0"
      ref={mazeRef}
      onKeyDown={handleKeyDown}
    >
        {/* ========== Pipeline Maze SVG ========== */}
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          className="absolute inset-0 z-[2] w-full h-full"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Horizontal pipe gradient: across Y (top-to-bottom) so glow runs along length (X) */}
            <linearGradient id="pipeH" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#224d5e" />
              <stop offset="6%"   stopColor="#2a667a" />
              <stop offset="16%"  stopColor="#2b8497" />
              <stop offset="28%"  stopColor="#32a9ba" />
              <stop offset="38%"  stopColor="#4ed7dc" />
              <stop offset="46%"  stopColor="#7cf7f9" />
              <stop offset="50%"  stopColor="#ffffff" />
              <stop offset="54%"  stopColor="#7cf7f9" />
              <stop offset="62%"  stopColor="#4ed7dc" />
              <stop offset="72%"  stopColor="#32a9ba" />
              <stop offset="84%"  stopColor="#2b8497" />
              <stop offset="94%"  stopColor="#2a667a" />
              <stop offset="100%" stopColor="#224d5e" />
            </linearGradient>

            {/* Vertical pipe gradient: across X (left-to-right) so glow runs along length (Y) */}
            <linearGradient id="pipeV" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%"   stopColor="#224d5e" />
              <stop offset="6%"   stopColor="#2a667a" />
              <stop offset="16%"  stopColor="#2b8497" />
              <stop offset="28%"  stopColor="#32a9ba" />
              <stop offset="38%"  stopColor="#4ed7dc" />
              <stop offset="46%"  stopColor="#7cf7f9" />
              <stop offset="50%"  stopColor="#ffffff" />
              <stop offset="54%"  stopColor="#7cf7f9" />
              <stop offset="62%"  stopColor="#4ed7dc" />
              <stop offset="72%"  stopColor="#32a9ba" />
              <stop offset="84%"  stopColor="#2b8497" />
              <stop offset="94%"  stopColor="#2a667a" />
              <stop offset="100%" stopColor="#224d5e" />
            </linearGradient>

            {/* Dedicated O2 Cylinder gradient */}
            <linearGradient id="o2CylinderGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%"   stopColor="#042738" />
              <stop offset="15%"  stopColor="#08546b" />
              <stop offset="45%"  stopColor="#d6f4ff" />
              <stop offset="55%"  stopColor="#7fd8ef" />
              <stop offset="85%"  stopColor="#0c7ea0" />
              <stop offset="100%" stopColor="#031f2c" />
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

            {/* Soft outer glow for pipe segments with sRGB interpolation */}
            <filter id="pipeEdgeGlow" x="-8%" y="-8%" width="116%" height="116%" colorInterpolationFilters="sRGB">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Node glow filter with sRGB interpolation */}
            <filter id="nodeGlowFilter" x="-40%" y="-40%" width="180%" height="180%" colorInterpolationFilters="sRGB">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Subtle dark tint so neon pipes pop cleanly against the video */}
          <rect x="0" y="0" width={SVG_W} height={SVG_H} fill="rgba(0,5,12,0.2)" />

          {/* ===== PIPE SEGMENTS (Pass 1: Streamlined bodies & length-wise glowing core) ===== */}
          {/* ===== PIPE SEGMENTS (Pass 1: Streamlined bodies & length-wise glowing core) ===== */}
          <g filter="url(#pipeEdgeGlow)">
            {wallCells.map(({ r, c, cx, cy, hasTop, hasBottom, hasLeft, hasRight, isStraightH, isStraightV }) => (
              <g key={`pipe-${r}-${c}`}>
                {/* ── Straight horizontal pipe: 1 seamless continuous body across full cell ── */}
                {isStraightH && (
                  <rect
                    x={cx - HALF - 1}
                    y={cy - PR}
                    width={CELL + 2}
                    height={PR * 2}
                    fill="url(#pipeH)"
                    stroke="#163947"
                    strokeWidth="1.2"
                  />
                )}

                {/* ── Straight vertical pipe: 1 seamless continuous body across full cell ── */}
                {isStraightV && (
                  <rect
                    x={cx - PR}
                    y={cy - HALF - 1}
                    width={PR * 2}
                    height={CELL + 2}
                    fill="url(#pipeV)"
                    stroke="#163947"
                    strokeWidth="1.2"
                  />
                )}

                {/* ── Non-straight cells (elbows, T-junctions, dead ends): connected arms ── */}
                {!isStraightH && !isStraightV && (
                  <>
                    {/* Horizontal arms use pipeH (y-shading so highlight runs along length) */}
                    {hasLeft && (
                      <rect
                        x={cx - HALF - 1}
                        y={cy - PR}
                        width={HALF + PR + 1}
                        height={PR * 2}
                        fill="url(#pipeH)"
                        stroke="#163947"
                        strokeWidth="1.2"
                      />
                    )}
                    {hasRight && (
                      <rect
                        x={cx - PR}
                        y={cy - PR}
                        width={HALF + PR + 1}
                        height={PR * 2}
                        fill="url(#pipeH)"
                        stroke="#163947"
                        strokeWidth="1.2"
                      />
                    )}

                    {/* Vertical arms use pipeV (x-shading so highlight runs along length) */}
                    {hasTop && (
                      <rect
                        x={cx - PR}
                        y={cy - HALF - 1}
                        width={PR * 2}
                        height={HALF + PR + 1}
                        fill="url(#pipeV)"
                        stroke="#163947"
                        strokeWidth="1.2"
                      />
                    )}
                    {hasBottom && (
                      <rect
                        x={cx - PR}
                        y={cy - PR}
                        width={PR * 2}
                        height={HALF + PR + 1}
                        fill="url(#pipeV)"
                        stroke="#163947"
                        strokeWidth="1.2"
                      />
                    )}
                  </>
                )}

                {/* ── Continuous laser/plasma beam running along length (zero break seams) ── */}
                {isStraightH && (
                  <>
                    <line
                      x1={cx - HALF - 1} y1={cy}
                      x2={cx + HALF + 1} y2={cy}
                      stroke="#67e8f9" strokeWidth="8" strokeOpacity="0.5"
                    />
                    <line
                      x1={cx - HALF - 1} y1={cy}
                      x2={cx + HALF + 1} y2={cy}
                      stroke="#ffffff" strokeWidth="2.5" strokeOpacity="0.9"
                    />
                  </>
                )}
                {isStraightV && (
                  <>
                    <line
                      x1={cx} y1={cy - HALF - 1}
                      x2={cx} y2={cy + HALF + 1}
                      stroke="#67e8f9" strokeWidth="8" strokeOpacity="0.5"
                    />
                    <line
                      x1={cx} y1={cy - HALF - 1}
                      x2={cx} y2={cy + HALF + 1}
                      stroke="#ffffff" strokeWidth="2.5" strokeOpacity="0.9"
                    />
                  </>
                )}
                {!isStraightH && !isStraightV && (
                  <>
                    {hasLeft && (
                      <>
                        <line x1={cx - HALF - 1} y1={cy} x2={cx} y2={cy} stroke="#67e8f9" strokeWidth="8" strokeOpacity="0.5" />
                        <line x1={cx - HALF - 1} y1={cy} x2={cx} y2={cy} stroke="#ffffff" strokeWidth="2.5" strokeOpacity="0.9" />
                      </>
                    )}
                    {hasRight && (
                      <>
                        <line x1={cx} y1={cy} x2={cx + HALF + 1} y2={cy} stroke="#67e8f9" strokeWidth="8" strokeOpacity="0.5" />
                        <line x1={cx} y1={cy} x2={cx + HALF + 1} y2={cy} stroke="#ffffff" strokeWidth="2.5" strokeOpacity="0.9" />
                      </>
                    )}
                    {hasTop && (
                      <>
                        <line x1={cx} y1={cy - HALF - 1} x2={cx} y2={cy} stroke="#67e8f9" strokeWidth="8" strokeOpacity="0.5" />
                        <line x1={cx} y1={cy - HALF - 1} x2={cx} y2={cy} stroke="#ffffff" strokeWidth="2.5" strokeOpacity="0.9" />
                      </>
                    )}
                    {hasBottom && (
                      <>
                        <line x1={cx} y1={cy} x2={cx} y2={cy + HALF + 1} stroke="#67e8f9" strokeWidth="8" strokeOpacity="0.5" />
                        <line x1={cx} y1={cy} x2={cx} y2={cy + HALF + 1} stroke="#ffffff" strokeWidth="2.5" strokeOpacity="0.9" />
                      </>
                    )}
                  </>
                )}
              </g>
            ))}
          </g>

          {/* ===== Pass 2: Sci-Fi Mounting Brackets / Collars (matching reference picture 2) ===== */}
          <g>
            {pipeCollars.map(({ r, c, cx, cy, orientation }) => {
              if (orientation === 'H') {
                return (
                  <g key={`collar-${r}-${c}`}>
                    {/* Shadow behind collar */}
                    <rect
                      x={cx - 9} y={cy - PR - 6}
                      width={18} height={PR * 2 + 12}
                      rx="3"
                      fill="rgba(0,0,0,0.65)"
                    />
                    {/* Main bracket body */}
                    <rect
                      x={cx - 8} y={cy - PR - 5}
                      width={16} height={PR * 2 + 10}
                      rx="2"
                      fill="#1b4b58"
                      stroke="#6d97a1"
                      strokeWidth="1.2"
                    />
                    {/* Top mounting lug & bolt */}
                    <rect x={cx - 6.5} y={cy - PR - 5} width={13} height={4} rx="1" fill="#213c47" />
                    <circle cx={cx} cy={cy - PR - 3} r={1.2} fill="#67e8f9" />
                    {/* Bottom mounting lug & bolt */}
                    <rect x={cx - 6.5} y={cy + PR + 1} width={13} height={4} rx="1" fill="#213c47" />
                    <circle cx={cx} cy={cy + PR + 3} r={1.2} fill="#67e8f9" />
                    {/* Inset tech panel frame */}
                    <rect
                      x={cx - 5.5} y={cy - 19}
                      width={11} height={38}
                      rx="1.5"
                      fill="#0b2430"
                      stroke="#22d3ee"
                      strokeWidth="0.8"
                    />
                    {/* Stacked indicator LED segments inside the bracket (like reference picture 2) */}
                    {[-13.5, -4.5, 4.5, 13.5].map((offsetY, idx) => (
                      <rect
                        key={idx}
                        x={cx - 4}
                        y={cy + offsetY - 2}
                        width={8}
                        height={4}
                        rx="0.8"
                        fill="#68cbd0"
                        opacity="0.95"
                      />
                    ))}
                  </g>
                );
              } else {
                return (
                  <g key={`collar-${r}-${c}`}>
                    {/* Shadow behind collar */}
                    <rect
                      x={cx - PR - 6} y={cy - 9}
                      width={PR * 2 + 12} height={18}
                      rx="3"
                      fill="rgba(0,0,0,0.65)"
                    />
                    {/* Main bracket body */}
                    <rect
                      x={cx - PR - 5} y={cy - 8}
                      width={PR * 2 + 10} height={16}
                      rx="2"
                      fill="#1b4b58"
                      stroke="#6d97a1"
                      strokeWidth="1.2"
                    />
                    {/* Left mounting lug & bolt */}
                    <rect x={cx - PR - 5} y={cy - 6.5} width={4} height={13} rx="1" fill="#213c47" />
                    <circle cx={cx - PR - 3} cy={cy} r={1.2} fill="#67e8f9" />
                    {/* Right mounting lug & bolt */}
                    <rect x={cx + PR + 1} y={cy - 6.5} width={4} height={13} rx="1" fill="#213c47" />
                    <circle cx={cx + PR + 3} cy={cy} r={1.2} fill="#67e8f9" />
                    {/* Inset tech panel frame */}
                    <rect
                      x={cx - 19} y={cy - 5.5}
                      width={38} height={11}
                      rx="1.5"
                      fill="#0b2430"
                      stroke="#22d3ee"
                      strokeWidth="0.8"
                    />
                    {/* Stacked indicator LED segments inside the bracket (like reference picture 2) */}
                    {[-13.5, -4.5, 4.5, 13.5].map((offsetX, idx) => (
                      <rect
                        key={idx}
                        x={cx + offsetX - 2}
                        y={cy - 4}
                        width={4}
                        height={8}
                        rx="0.8"
                        fill="#68cbd0"
                        opacity="0.95"
                      />
                    ))}
                  </g>
                );
              }
            })}
          </g>

          {/* ===== Pass 3: Connector node orbs at elbows, T-junctions, cross-junctions, and dead-ends ===== */}
          <g filter="url(#nodeGlowFilter)">
            {wallCells
              .filter((cell) => cell.isNode)
              .map(({ r, c, cx, cy, connCount }) => {
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
                    <circle
                      cx={cx - orbR * 0.28}
                      cy={cy - orbR * 0.28}
                      r={orbR * 0.22}
                      fill="rgba(255,255,255,0.6)"
                    />
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
                    {/* Clean high-visibility astronaut with soft blurred cyan aura (NO disk circle) */}
                    <image
                      href="/Images/astronaut.jpg"
                      x={cx - 60} y={cy - 64}
                      width={120} height={120}
                      style={{
                        mixBlendMode: 'screen',
                        filter: 'drop-shadow(0 0 14px rgba(56,189,248,0.95)) drop-shadow(0 0 28px rgba(6,182,212,0.65))',
                      }}
                    />
                  </g>
                )}

                {/* ---- DANGER TRIANGLE (Question cell in range) ---- */}
                {isQuestion && !isPlayer && (
                  <g>
                    {/* Soft blurred atmospheric glow following exact triangular contour (NO disk circle) */}
                    <polygon
                      points={`${cx},${cy - 44} ${cx + 42},${cy + 34} ${cx - 42},${cy + 34}`}
                      fill="none"
                      stroke={dangerColor}
                      strokeWidth="16"
                      strokeLinejoin="round"
                      opacity="0.5"
                      style={{ filter: 'blur(8px)' }}
                    />
                    {/* Clean High-Visibility Triangle with neon drop shadow */}
                    <polygon
                      points={`${cx},${cy - 44} ${cx + 42},${cy + 34} ${cx - 42},${cy + 34}`}
                      fill="#07120c"
                      stroke={dangerColor}
                      strokeWidth="5"
                      strokeLinejoin="round"
                      style={{ filter: `drop-shadow(0 0 8px ${dangerColor})` }}
                    />
                    {/* Exclamation Mark Bar */}
                    <rect x={cx - 5} y={cy - 20} width={10} height={26} rx={5} fill={dangerText} />
                    {/* Exclamation Mark Dot */}
                    <circle cx={cx} cy={cy + 18} r={5.5} fill={dangerText} />
                  </g>
                )}

                {/* ---- O2 CYLINDER (Goal cell) ---- */}
                {isGoal && (
                  <g style={{ filter: 'drop-shadow(0 0 16px rgba(6,182,212,0.9))' }}>
                    {/* Cylinder body */}
                    <rect x={cx - 20} y={cy - 40} width={40} height={78} rx={18} fill="url(#o2CylinderGrad)" stroke="#67e8f9" strokeWidth="2.5" />
                    {/* Top valve */}
                    <rect x={cx - 9} y={cy - 48} width={18} height={9} rx="3" fill="#94a3b8" stroke="#38bdf8" strokeWidth="1.2" />
                    {/* Metal bands */}
                    <rect x={cx - 16} y={cy - 24} width={32} height={4.5} rx="1" fill="#0f172a" stroke="#67e8f9" strokeWidth="0.8" />
                    <rect x={cx - 16} y={cy + 20} width={32} height={4.5} rx="1" fill="#0f172a" stroke="#67e8f9" strokeWidth="0.8" />
                    {/* O2 label */}
                    <text x={cx - 12} y={cy + 13} fontFamily="Arial Black, sans-serif" fontWeight="900" fontSize="24" fill="#ffffff">O</text>
                    <text x={cx + 8}  y={cy + 17} fontFamily="Arial Black, sans-serif" fontWeight="900" fontSize="16" fill="#e0f2fe">2</text>
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
