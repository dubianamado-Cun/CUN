import React from 'react';

interface MultiLineChartProps {
  data: { month: string; [key: string]: number | string }[];
  lines: string[]; // Keys of the lines to be plotted
}

const COLORS = ['#059669', '#3b82f6', '#ef4444', '#f97316', '#8b5cf6'];

const MultiLineChart: React.FC<MultiLineChartProps> = ({ data, lines }) => {
  if (!data || data.length === 0 || !lines || lines.length === 0) {
    return <div className="flex items-center justify-center h-64 text-text-secondary">No hay suficientes datos para mostrar el gráfico.</div>;
  }

  const width = 500;
  const height = 250;
  const margin = { top: 20, right: 20, bottom: 50, left: 40 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const maxY = Math.max(...data.flatMap(d => lines.map(line => d[line] as number))) * 1.1 || 10;

  const xScale = (index: number) => margin.left + (index / (data.length > 1 ? data.length - 1 : 1)) * innerWidth;
  const yScale = (value: number) => margin.top + innerHeight - (value / maxY) * innerHeight;

  const createPath = (key: string) =>
    data.map((d, i) => `${i === 0 ? 'M' : 'L'}${xScale(i)},${yScale(d[key] as number)}`).join(' ');

  const showLabelEvery = data.length > 12 ? Math.ceil(data.length / 6) : 1;
  
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
        {data.map((d, i) =>
          i % showLabelEvery === 0 && (
            <text
              key={d.month as string}
              x={xScale(i)}
              y={height - margin.bottom + 20}
              textAnchor="middle"
              fontSize="10"
              fill="#64748b"
            >
              {d.month}
            </text>
          )
        )}

        {/* Lines */}
        {lines.map((lineKey, index) => (
          <path
            key={lineKey}
            d={createPath(lineKey)}
            fill="none"
            stroke={COLORS[index % COLORS.length]}
            strokeWidth="2"
          />
        ))}
        
        {/* Hoverable areas for tooltips */}
         {data.map((d, i) => {
            const barWidth = data.length > 1 ? innerWidth / (data.length - 1) : innerWidth;
            let x, width;

            if (data.length === 1) { x = margin.left; width = innerWidth; } 
            else if (i === 0) { x = margin.left; width = barWidth / 2; } 
            else if (i === data.length - 1) { x = xScale(i) - barWidth / 2; width = barWidth / 2; } 
            else { x = xScale(i) - barWidth / 2; width = barWidth; }
            
            const tooltipText = `${d.month}\n${lines.map(key => `${key}: ${d[key]}`).join('\n')}`;

            return (
                <rect
                    key={`hover-rect-${i}`}
                    x={x} y={margin.top} width={width} height={innerHeight}
                    fill="transparent" className="cursor-pointer"
                >
                    <title>{tooltipText}</title>
                </rect>
            );
        })}

      </svg>
      <div className="flex justify-center flex-wrap gap-x-4 gap-y-1 mt-2 text-sm">
        {lines.map((lineKey, index) => (
          <div key={lineKey} className="flex items-center">
            <div
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            ></div>
            <span className="capitalize">{lineKey}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MultiLineChart;