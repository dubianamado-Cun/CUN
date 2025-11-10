import React from 'react';
import { getDayOfWeek } from '../../utils/dateUtils';

interface HeatmapProps {
  data: number[][]; // 7 (days) x 24 (hours)
  comparisonData: number[][] | null;
  comparisonYears: { current: number; previous: number } | null;
}

const HeatmapGrid: React.FC<{ gridData: number[][] }> = ({ gridData }) => {
    const maxVal = Math.max(...gridData.flat());
    
    const getColor = (value: number) => {
        if (value <= 0) return 'bg-gray-100';
        if (maxVal === 0) return 'bg-gray-100';
        const ratio = value / maxVal;
        if (ratio > 0.8) return 'bg-green-700';
        if (ratio > 0.6) return 'bg-green-600';
        if (ratio > 0.4) return 'bg-green-500';
        if (ratio > 0.2) return 'bg-green-400';
        return 'bg-green-200';
    };
    
    const days = Array.from({length: 7}, (_, i) => getDayOfWeek(i));
    const hours = Array.from({length: 24}, (_, i) => i);

    return (
        <div style={{ minWidth: '700px' }}>
            <div className="flex text-xs text-text-secondary">
                <div className="w-12 flex-shrink-0">&nbsp;</div>
                <div className="grid flex-1" style={{ gridTemplateColumns: 'repeat(24, minmax(0, 1fr))' }}>
                     {hours.map(hour => (
                        <div key={hour} className="text-center">{hour.toString().padStart(2, '0')}</div>
                    ))}
                </div>
            </div>
            <div className="flex mt-1">
              <div className="flex flex-col w-12 flex-shrink-0 text-xs text-text-secondary">
                {days.map(day => (
                  <div key={day} className="flex-1 flex items-center justify-end pr-2 font-semibold" style={{minHeight: '2rem'}}>{day}</div>
                ))}
              </div>
              <div className="grid flex-1 gap-1" style={{ gridTemplateColumns: 'repeat(24, minmax(0, 1fr))' }}>
                {gridData.flat().map((value, index) => (
                  <div 
                    key={index} 
                    className={`w-full aspect-square rounded-sm ${getColor(value)}`}
                    title={`${value} tickets`}
                  ></div>
                ))}
              </div>
            </div>
        </div>
    );
};

const Heatmap: React.FC<HeatmapProps> = ({ data, comparisonData, comparisonYears }) => {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-64 text-text-secondary">No hay datos para el mapa de calor.</div>;
  }
  
  if (comparisonData && comparisonYears) {
      return (
          <div>
              <div className="flex flex-col gap-8 w-full">
                  <div className="flex-1 overflow-x-auto">
                      <h4 className="text-lg font-bold text-center mb-2">{comparisonYears.current}</h4>
                      <HeatmapGrid gridData={data} />
                  </div>
                  <div className="flex-1 overflow-x-auto">
                      <h4 className="text-lg font-bold text-center mb-2">{comparisonYears.previous}</h4>
                      <HeatmapGrid gridData={comparisonData} />
                  </div>
              </div>
              <div className="flex items-center justify-center mt-4 space-x-4 text-xs text-text-secondary">
                <span>Menos</span>
                <div className="flex items-center space-x-1">
                    <div className="w-4 h-4 rounded-sm bg-green-200"></div>
                    <div className="w-4 h-4 rounded-sm bg-green-400"></div>
                    <div className="w-4 h-4 rounded-sm bg-green-500"></div>
                    <div className="w-4 h-4 rounded-sm bg-green-600"></div>
                    <div className="w-4 h-4 rounded-sm bg-green-700"></div>
                </div>
                <span>Más</span>
              </div>
          </div>
      )
  }

  return (
    <div className="w-full overflow-x-auto">
      <HeatmapGrid gridData={data} />
      <div className="flex items-center justify-center mt-4 space-x-4 text-xs text-text-secondary">
        <span>Menos</span>
        <div className="flex items-center space-x-1">
            <div className="w-4 h-4 rounded-sm bg-green-200"></div>
            <div className="w-4 h-4 rounded-sm bg-green-400"></div>
            <div className="w-4 h-4 rounded-sm bg-green-500"></div>
            <div className="w-4 h-4 rounded-sm bg-green-600"></div>
            <div className="w-4 h-4 rounded-sm bg-green-700"></div>
        </div>
        <span>Más</span>
      </div>
    </div>
  );
};

export default Heatmap;