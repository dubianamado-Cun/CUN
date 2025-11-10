import React from 'react';

interface LineChartProps {
  data: any[];
  compareYears: boolean;
  comparisonYears: { current: number; previous: number } | null;
}

const LineChart: React.FC<LineChartProps> = ({ data, compareYears, comparisonYears }) => {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-64 text-text-secondary">No hay suficientes datos para mostrar el gráfico.</div>;
  }

  const width = 500;
  const height = 250;
  const margin = { top: 20, right: 20, bottom: 50, left: 40 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const getMaxY = () => {
      if(compareYears) {
          const maxCreatedCurrent = Math.max(...data.map(d => d.created_current));
          const maxResolvedCurrent = Math.max(...data.map(d => d.resolved_current));
          const maxCreatedPrevious = Math.max(...data.map(d => d.created_previous));
          const maxResolvedPrevious = Math.max(...data.map(d => d.resolved_previous));
          return Math.max(maxCreatedCurrent, maxResolvedCurrent, maxCreatedPrevious, maxResolvedPrevious) * 1.1 || 10;
      }
      const maxCreated = Math.max(...data.map(d => d.created));
      const maxResolved = Math.max(...data.map(d => d.resolved));
      return Math.max(maxCreated, maxResolved) * 1.1 || 10;
  }
  const maxY = getMaxY();

  const xScale = (index: number) => margin.left + (index / (data.length > 1 ? data.length - 1 : 1)) * innerWidth;
  const yScale = (value: number) => margin.top + innerHeight - (value / maxY) * innerHeight;

  const createPath = (key: string) => 
    data.map((d, i) => `${i === 0 ? 'M' : 'L'}${xScale(i)},${yScale(d[key])}`).join(' ');

  const showLabelEvery = data.length > 20 ? Math.ceil(data.length / 10) : 1;

  const legendItems = compareYears ? [
    { label: `Creados ${comparisonYears?.current}`, color: 'bg-primary' },
    { label: `Resueltos ${comparisonYears?.current}`, color: 'bg-secondary' },
    { label: `Creados ${comparisonYears?.previous}`, color: 'bg-emerald-300' },
    { label: `Resueltos ${comparisonYears?.previous}`, color: 'bg-slate-300' },
  ] : [
    { label: 'Creados', color: 'bg-primary' },
    { label: 'Resueltos', color: 'bg-secondary' },
  ];

  return (
    <div className="w-full">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
            {/* Y-axis */}
            <line x1={margin.left} y1={margin.top} x2={margin.left} y2={margin.top + innerHeight} stroke="#e2e8f0" />
            {[...Array(5)].map((_, i) => {
                const y = margin.top + (i * innerHeight / 4);
                const value = Math.round(maxY * (1 - i / 4));
                return (
                    <g key={i}>
                        <line x1={margin.left} y1={y} x2={width - margin.right} y2={y} stroke="#f1f5f9" />
                        <text x={margin.left - 8} y={y + 4} textAnchor="end" fontSize="10" fill="#64748b">{value}</text>
                    </g>
                );
            })}

            {/* X-axis */}
            <line x1={margin.left} y1={margin.top + innerHeight} x2={width - margin.right} y2={margin.top + innerHeight} stroke="#e2e8f0" />
            {data.map((d, i) => (
               i % showLabelEvery === 0 && (
                 <text 
                    key={d.label} 
                    x={xScale(i)} 
                    y={height - margin.bottom + 20} 
                    textAnchor="middle" 
                    fontSize="10" 
                    fill="#64748b"
                    transform={!compareYears ? `rotate(-30, ${xScale(i)}, ${height - margin.bottom + 20})` : ''}
                >
                    {d.label}
                </text>
               )
            ))}

            {/* Lines */}
            {compareYears ? (
                <>
                    <path d={createPath('created_current')} fill="none" stroke="#059669" strokeWidth="2" />
                    <path d={createPath('resolved_current')} fill="none" stroke="#475569" strokeWidth="2" />
                    <path d={createPath('created_previous')} fill="none" stroke="#6ee7b7" strokeWidth="2" strokeDasharray="4" />
                    <path d={createPath('resolved_previous')} fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4" />
                </>
            ) : (
                <>
                    <path d={createPath('created')} fill="none" stroke="#059669" strokeWidth="2" />
                    <path d={createPath('resolved')} fill="none" stroke="#475569" strokeWidth="2" />
                </>
            )}

            {/* Hoverable areas for tooltips */}
            {data.map((d, i) => {
                const barWidth = data.length > 1 ? innerWidth / (data.length - 1) : innerWidth;
                let x, width;

                if (data.length === 1) { x = margin.left; width = innerWidth; } 
                else if (i === 0) { x = margin.left; width = barWidth / 2; } 
                else if (i === data.length - 1) { x = xScale(i) - barWidth / 2; width = barWidth / 2; } 
                else { x = xScale(i) - barWidth / 2; width = barWidth; }

                return (
                    <rect
                        key={`hover-rect-${i}`}
                        x={x} y={margin.top} width={width} height={innerHeight}
                        fill="transparent" className="cursor-pointer"
                    >
                        <title>
                            {`${d.label}\n` + (compareYears ? 
                                `${comparisonYears?.current}: ${d.created_current} Creados, ${d.resolved_current} Resueltos\n${comparisonYears?.previous}: ${d.created_previous} Creados, ${d.resolved_previous} Resueltos` : 
                                `Creados: ${d.created}\nResueltos: ${d.resolved}`
                            )}
                        </title>
                    </rect>
                );
            })}
        </svg>
        <div className="flex justify-center flex-wrap gap-x-4 gap-y-1 mt-2 text-sm">
            {legendItems.map(item => (
                <div key={item.label} className="flex items-center">
                    <div className={`w-3 h-3 rounded-full ${item.color} mr-2`}></div>
                    <span>{item.label}</span>
                </div>
            ))}
        </div>
    </div>
  );
};

export default LineChart;
