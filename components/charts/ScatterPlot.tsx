
import React from 'react';

interface ScatterPlotProps {
  data: { x: number; y: number; label: string }[];
  xAxisLabel: string;
  yAxisLabel: string;
}

const ScatterPlot: React.FC<ScatterPlotProps> = ({ data, xAxisLabel, yAxisLabel }) => {
    if (!data || data.length === 0) {
        return <div className="flex items-center justify-center h-full text-text-secondary">No hay datos para el gráfico de dispersión.</div>;
    }

    const width = 500;
    const height = 300;
    const margin = { top: 20, right: 20, bottom: 60, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const maxX = Math.max(...data.map(d => d.x)) * 1.1 || 10;
    const maxY = Math.max(...data.map(d => d.y)) * 1.1 || 10;

    const xScale = (value: number) => margin.left + (value / maxX) * innerWidth;
    const yScale = (value: number) => margin.top + innerHeight - (value / maxY) * innerHeight;
    
    return (
        <div className="w-full h-full flex items-center justify-center">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
                {/* Y-axis */}
                <line x1={margin.left} y1={margin.top} x2={margin.left} y2={margin.top + innerHeight} stroke="#e2e8f0" />
                <text 
                    transform={`rotate(-90)`}
                    x={-(margin.top + innerHeight / 2)}
                    y={margin.left - 45}
                    textAnchor="middle" fontSize="12" fill="#64748b"
                >
                    {yAxisLabel}
                </text>
                 {[...Array(5)].map((_, i) => {
                    const y = margin.top + (i * innerHeight / 4);
                    const value = Math.round(maxY * (1 - i / 4));
                    return (
                        <g key={i}>
                            <line x1={margin.left} y1={y} x2={width - margin.right} y2={y} stroke="#f1f5f9" />
                            <text x={margin.left - 8} y={y + 4} textAnchor="end" fontSize="10" fill="#64748b">{value.toLocaleString()}</text>
                        </g>
                    );
                })}

                {/* X-axis */}
                <line x1={margin.left} y1={margin.top + innerHeight} x2={width - margin.right} y2={margin.top + innerHeight} stroke="#e2e8f0" />
                <text 
                    x={margin.left + innerWidth / 2}
                    y={height - margin.bottom + 40}
                    textAnchor="middle" fontSize="12" fill="#64748b"
                >
                    {xAxisLabel}
                </text>
                 {[...Array(5)].map((_, i) => {
                    const x = margin.left + (i * innerWidth / 4);
                    const value = Math.round(maxX * (i / 4));
                    return (
                        <g key={i}>
                             <text x={x} y={height - margin.bottom + 20} textAnchor="middle" fontSize="10" fill="#64748b">{value.toLocaleString()}</text>
                        </g>
                    );
                })}
                
                {/* Points */}
                {data.map((d, i) => (
                    <circle 
                        key={i}
                        cx={xScale(d.x)} 
                        cy={yScale(d.y)} 
                        r={4}
                        className="fill-primary opacity-60 hover:opacity-100 transition-opacity"
                    >
                        <title>{`${d.label}\n${xAxisLabel}: ${d.x}\n${yAxisLabel}: ${d.y}`}</title>
                    </circle>
                ))}
            </svg>
        </div>
    );
};

export default ScatterPlot;
