import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { StyleMetrics } from '../types';

interface StyleRadarProps {
  metrics: StyleMetrics;
  referenceMetrics?: StyleMetrics; // Optional comparison
  className?: string;
}

const StyleRadar: React.FC<StyleRadarProps> = ({ metrics, className }) => {
  const data = [
    { subject: 'VOCAB', A: metrics.vocabularyComplexity, fullMark: 100 },
    { subject: 'VARIETY', A: metrics.sentenceVariety, fullMark: 100 },
    { subject: 'FORMAL', A: metrics.formality, fullMark: 100 },
    { subject: 'IMAGE', A: metrics.imagery, fullMark: 100 },
    { subject: 'WARMTH', A: metrics.warmth, fullMark: 100 },
    { subject: 'PACING', A: metrics.pacing, fullMark: 100 },
  ];

  return (
    <div className={`w-full h-64 font-mono text-xs ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#121212" strokeOpacity={0.2} />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#121212', fontSize: 10, fontWeight: 'bold' }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="My Style"
            dataKey="A"
            stroke="#FF3B00"
            strokeWidth={2}
            fill="#FF3B00"
            fillOpacity={0.3}
            dot={{ r: 3, fill: '#FF3B00', strokeWidth: 0 }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StyleRadar;