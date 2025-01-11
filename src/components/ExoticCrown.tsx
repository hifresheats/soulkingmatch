import { cn } from '../lib/utils';

interface ExoticCrownProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'vibrant';
}

export function ExoticCrown({ className, size = 'md', variant = 'vibrant' }: ExoticCrownProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  return (
    <div className={cn('relative transform-gpu transition-transform hover:scale-105', sizeClasses[size], className)}>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full filter drop-shadow-lg"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="crownGradient" x1="0%" y1="0%" x2="100%" y2="100%" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFD700">
              <animate
                attributeName="stop-color"
                values="#FFD700; #FFA500; #FFD700"
                dur="4s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="50%" stopColor="#FFA500">
              <animate
                attributeName="stop-color"
                values="#FFA500; #DAA520; #FFA500"
                dur="4s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="100%" stopColor="#DAA520">
              <animate
                attributeName="stop-color"
                values="#DAA520; #FFD700; #DAA520"
                dur="4s"
                repeatCount="indefinite"
              />
            </stop>
          </linearGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feFlood floodColor="#FFD700" floodOpacity="0.3" result="glowColor"/>
            <feComposite in="glowColor" in2="coloredBlur" operator="in" result="softGlow"/>
            <feMerge>
              <feMergeNode in="softGlow"/>
              <feMergeNode in="softGlow"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <filter id="shimmer">
            <feTurbulence type="fractalNoise" baseFrequency="0.01 0.02" numOctaves="2" result="noise"/>
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" xChannelSelector="R" yChannelSelector="G"/>
          </filter>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Crown base */}
        <path
          d="M20 70 L80 70 L75 40 L50 60 L25 40 L20 70"
          fill="url(#crownGradient)"
          stroke="url(#crownGradient)"
          strokeWidth="2"
          filter="url(#glow)"
          className="animate-pulse"
        />
        
        {/* Crown points */}
        <path
          d="M25 40 L35 25 L50 35 L65 25 L75 40"
          fill="url(#crownGradient)"
          stroke="url(#crownGradient)"
          strokeWidth="2"
          filter="url(#shimmer)"
        />
        
        {/* Jewels */}
        <circle cx="35" cy="30" r="4" fill="#FF0000" filter="url(#glow)">
          <animate
            attributeName="fill"
            values="#FF0000; #FF6B6B; #FF0000"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="50" cy="40" r="4" fill="#4169E1" filter="url(#glow)">
          <animate
            attributeName="fill"
            values="#4169E1; #6B8AFF; #4169E1"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="65" cy="30" r="4" fill="#50C878" filter="url(#glow)">
          <animate
            attributeName="fill"
            values="#50C878; #6BE0A0; #50C878"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
    </div>
  );
}