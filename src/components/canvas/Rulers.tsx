import React from 'react';
import { useStudio } from '../../context/StudioContext';

interface RulersProps {
  zoom: number;
  panX: number;
  panY: number;
  docWidth: number;
  docHeight: number;
  cursorX: number;
  cursorY: number;
}

export const Rulers: React.FC<RulersProps> = ({
  zoom,
  panX,
  panY,
  docWidth,
  docHeight,
  cursorX,
  cursorY,
}) => {
  const { theme } = useStudio();

  // Horizontal ruler ticks
  const hTicks: number[] = [];
  const step = zoom > 2 ? 50 : zoom > 0.5 ? 100 : 200;
  for (let x = 0; x <= docWidth; x += step) {
    hTicks.push(x);
  }

  // Vertical ruler ticks
  const vTicks: number[] = [];
  for (let y = 0; y <= docHeight; y += step) {
    vTicks.push(y);
  }

  return (
    <>
      {/* Top Left Corner box */}
      <div
        className="absolute top-0 left-0 w-5 h-5 border-r border-b z-30 flex items-center justify-center text-[9px] font-mono font-semibold"
        style={{
          backgroundColor: theme.isLight ? '#e2e8f0' : '#252526',
          borderColor: theme.border,
          color: theme.textSecondary,
        }}
      >
        px
      </div>

      {/* Top Horizontal Ruler */}
      <div
        className="absolute top-0 left-5 right-0 h-5 border-b z-20 overflow-hidden select-none pointer-events-none"
        style={{
          backgroundColor: theme.isLight ? '#f1f5f9' : '#202022',
          borderColor: theme.border,
        }}
      >
        <div
          className="relative h-full"
          style={{
            transform: `translateX(${panX}px)`,
          }}
        >
          {hTicks.map(x => {
            const screenX = x * zoom;
            return (
              <div
                key={`h-${x}`}
                className="absolute top-0 h-full border-l text-[9px] font-mono pl-1 font-medium"
                style={{
                  left: `${screenX}px`,
                  borderColor: theme.isLight ? '#cbd5e1' : 'rgba(255,255,255,0.2)',
                  color: theme.isLight ? '#334155' : '#94a3b8',
                }}
              >
                {x}
              </div>
            );
          })}

          {/* Mouse tracking tick */}
          <div
            className="absolute top-0 bottom-0 w-px z-10"
            style={{
              left: `${cursorX * zoom}px`,
              backgroundColor: theme.accent,
            }}
          />
        </div>
      </div>

      {/* Left Vertical Ruler */}
      <div
        className="absolute top-5 left-0 bottom-0 w-5 border-r z-20 overflow-hidden select-none pointer-events-none"
        style={{
          backgroundColor: theme.isLight ? '#f1f5f9' : '#202022',
          borderColor: theme.border,
        }}
      >
        <div
          className="relative w-full"
          style={{
            transform: `translateY(${panY}px)`,
          }}
        >
          {vTicks.map(y => {
            const screenY = y * zoom;
            return (
              <div
                key={`v-${y}`}
                className="absolute left-0 w-full border-t text-[8px] font-mono pt-0.5 pl-0.5 leading-none font-medium"
                style={{
                  top: `${screenY}px`,
                  borderColor: theme.isLight ? '#cbd5e1' : 'rgba(255,255,255,0.2)',
                  color: theme.isLight ? '#334155' : '#94a3b8',
                }}
              >
                {y}
              </div>
            );
          })}

          {/* Mouse tracking tick */}
          <div
            className="absolute left-0 right-0 h-px z-10"
            style={{
              top: `${cursorY * zoom}px`,
              backgroundColor: theme.accent,
            }}
          />
        </div>
      </div>
    </>
  );
};
