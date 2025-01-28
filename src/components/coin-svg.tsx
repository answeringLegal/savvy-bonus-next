import type React from 'react';

export const CoinSVG: React.FC<{ id: string }> = ({ id }) => (
  <svg width='0' height='0'>
    <defs>
      <pattern id={id} patternUnits='objectBoundingBox' width='1' height='1'>
        <circle cx='50%' cy='50%' r='45%' fill='#FFD700' />
        <circle cx='50%' cy='50%' r='40%' fill='#FFA500' />
        <text
          x='50%'
          y='50%'
          fontFamily='Arial'
          fontSize='40'
          fill='#006400'
          textAnchor='middle'
          dominantBaseline='central'
        >
          $
        </text>
      </pattern>
    </defs>
  </svg>
);
