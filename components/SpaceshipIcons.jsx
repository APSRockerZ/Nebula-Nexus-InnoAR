'use client';
import React from 'react';

/**
 * Triangular danger warning symbol with exclamation mark in respective colors:
 * - Green (Easy)
 * - Yellow / Amber (Medium)
 * - Red (Hard)
 */
export const DangerTriangle = ({ color = 'green', size = 32, className = '' }) => {
  const colorMap = {
    green: {
      stroke: '#22c55e',
      glow: '#16a34a',
      fill: 'rgba(34, 197, 94, 0.15)',
      text: '#4ade80',
      dropShadow: 'drop-shadow(0 0 8px rgba(34,197,94,0.85))',
    },
    yellow: {
      stroke: '#eab308',
      glow: '#ca8a04',
      fill: 'rgba(234, 179, 8, 0.15)',
      text: '#facc15',
      dropShadow: 'drop-shadow(0 0 8px rgba(234,179,8,0.85))',
    },
    red: {
      stroke: '#ef4444',
      glow: '#dc2626',
      fill: 'rgba(239, 68, 68, 0.2)',
      text: '#f87171',
      dropShadow: 'drop-shadow(0 0 8px rgba(239,68,68,0.9))',
    },
  };

  const theme = colorMap[color] || colorMap.green;

  return (
    <div
      className={`inline-flex items-center justify-center relative select-none ${className}`}
      style={{
        width: size,
        height: size,
        filter: theme.dropShadow,
      }}
    >
      <svg
        viewBox="0 0 100 100"
        width="100%"
        height="100%"
        className="overflow-visible"
      >
        <defs>
          <filter id={`glow-${color}`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Ambient Pulsing Halo */}
        <polygon
          points="50,12 90,82 10,82"
          fill={theme.fill}
          stroke={theme.stroke}
          strokeWidth="3"
          strokeLinejoin="round"
          opacity="0.5"
        />

        {/* Main Danger Triangle */}
        <polygon
          points="50,15 88,80 12,80"
          fill="#0f172a"
          stroke={theme.stroke}
          strokeWidth="6"
          strokeLinejoin="round"
        />

        {/* Inner Border Trim */}
        <polygon
          points="50,23 81,75 19,75"
          fill={theme.fill}
          stroke={theme.stroke}
          strokeWidth="1.5"
          strokeLinejoin="round"
          opacity="0.75"
        />

        {/* Exclamation Mark Bar */}
        <rect
          x="46"
          y="35"
          width="8"
          height="22"
          rx="4"
          fill={theme.text}
        />

        {/* Exclamation Mark Dot */}
        <circle
          cx="50"
          cy="66"
          r="4.5"
          fill={theme.text}
        />
      </svg>
    </div>
  );
};

/**
 * Sci-Fi Glowing Oxygen (O2) Cylinder matching the reference image:
 * Cyan cylindrical capsule with bold O2 stencil, metallic bands, and bright cyan glow.
 */
export const O2Cylinder = ({ size = 36, animated = true, className = '' }) => {
  return (
    <div
      className={`inline-flex items-center justify-center relative select-none ${className}`}
      style={{
        width: size,
        height: size * 1.5,
        filter: 'drop-shadow(0 0 14px rgba(6,182,212,0.95))',
      }}
    >
      <svg
        viewBox="0 0 60 90"
        width="100%"
        height="100%"
        className="overflow-visible"
      >
        <defs>
          {/* Cyan Cylindrical Metallic Gradient */}
          <linearGradient id="o2BodyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#083344" />
            <stop offset="20%" stopColor="#0891b2" />
            <stop offset="45%" stopColor="#22d3ee" />
            <stop offset="55%" stopColor="#e0f2fe" />
            <stop offset="70%" stopColor="#06b6d4" />
            <stop offset="90%" stopColor="#0e7490" />
            <stop offset="100%" stopColor="#083344" />
          </linearGradient>

          {/* Metal Collar Gradient */}
          <linearGradient id="o2MetalGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="50%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
        </defs>

        {/* Ambient Cyan Glow Aura */}
        <rect
          x="8"
          y="6"
          width="44"
          height="78"
          rx="22"
          fill="rgba(6,182,212,0.25)"
          className={animated ? 'animate-pulse' : ''}
        />

        {/* Main Capsule Body */}
        <rect
          x="10"
          y="8"
          width="40"
          height="74"
          rx="20"
          fill="url(#o2BodyGrad)"
          stroke="#67e8f9"
          strokeWidth="2.5"
        />

        {/* Top Metallic Collar Band */}
        <rect
          x="14"
          y="20"
          width="32"
          height="4"
          rx="2"
          fill="url(#o2MetalGrad)"
          stroke="#0f172a"
          strokeWidth="0.8"
        />

        {/* Bottom Metallic Collar Band */}
        <rect
          x="14"
          y="66"
          width="32"
          height="4"
          rx="2"
          fill="url(#o2MetalGrad)"
          stroke="#0f172a"
          strokeWidth="0.8"
        />

        {/* Top Valve Nozzle */}
        <rect
          x="24"
          y="2"
          width="12"
          height="7"
          rx="2"
          fill="url(#o2MetalGrad)"
          stroke="#38bdf8"
          strokeWidth="1"
        />

        {/* Bold O2 Stencil Text */}
        <g fill="#ffffff" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))' }}>
          <text
            x="24"
            y="52"
            fontFamily="Arial, sans-serif"
            fontWeight="900"
            fontSize="24"
            textAnchor="middle"
            fill="#ffffff"
            letterSpacing="-1"
          >
            O
          </text>
          <text
            x="40"
            y="56"
            fontFamily="Arial, sans-serif"
            fontWeight="900"
            fontSize="16"
            textAnchor="middle"
            fill="#e0f2fe"
          >
            2
          </text>
        </g>
      </svg>
    </div>
  );
};
