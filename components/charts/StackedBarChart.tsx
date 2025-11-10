import React from 'react';

interface StackedBarChartProps {
  data: any[];
  statusOrder: string[];
  statusColors: { [key: string]: string };
  compareYears: boolean;
  comparisonYears: { current: number; previous: number } | null;
}

const StackedBarChart: React.FC<StackedBarChartProps> = ({ data, statusOrder, statusColors, compareYears, comparisonYears }) => {
    if (!data || data.length === 0) {
        return <div className="flex items-center justify-center h-64 text-text-secondary">No hay suficientes datos para mostrar el gráfico.</div>;
    }
  
    if(compareYears) {
        const maxVal = Math.max(...data.map(d => Math.max(d.values.current, d.values.previous))) || 1;
        
        return (
            <div>
                <div className="flex justify-between items-end h-64 space-x-2 px-4 border-b border-l border-gray-200">
                    {data.map(d => (
                        <div key={d.label} className="flex-1 flex flex-col h-full justify-end items-center group relative">
                            <div className="w-full h-full flex items-end justify-center gap-1">
                                <div
                                    className="w-1/2 bg-primary transition-opacity duration-200"
                                    style={{ height: `${(d.values.current / maxVal) * 100}%` }}
                                    title={`${comparisonYears?.current}: ${d.values.current}`}
                                ></div>
                                 <div
                                    className="w-1/2 bg-secondary transition-opacity duration-200"
                                    style={{ height: `${(d.values.previous / maxVal) * 100}%` }}
                                    title={`${comparisonYears?.previous}: ${d.values.previous}`}
                                ></div>
                            </div>
                             <div className="text-xs text-gray-500 mt-1 absolute -bottom-5 transform group-hover:font-bold">{d.label}</div>
                        </div>
                    ))}
                </div>
                 <div className="flex justify-center space-x-4 mt-6 text-sm">
                    <div className="flex items-center"><div className="w-3 h-3 rounded-sm bg-primary mr-2"></div><span>{comparisonYears?.current}</span></div>
                    <div className="flex items-center"><div className="w-3 h-3 rounded-sm bg-secondary mr-2"></div><span>{comparisonYears?.previous}</span></div>
                </div>
            </div>
        );
    }
    
    const allStatuses = Array.from(new Set(data.flatMap(d => Object.keys(d.values))));
    const relevantStatuses = statusOrder.filter(s => allStatuses.includes(s));
    
    const totals = data.map(d => Object.values(d.values).reduce((sum: number, val: number) => sum + val, 0));
    const maxTotal = Math.max(...totals) || 1;

  return (
    <div className="w-full">
        <div className="flex justify-between items-end h-64 space-x-2 px-4 border-b border-l border-gray-200">
            {data.map((d, i) => (
                <div key={d.label} className="flex-1 flex flex-col h-full justify-end items-center group relative">
                    <div 
                        className="w-full flex flex-col-reverse"
                        style={{ height: `${(totals[i] / maxTotal) * 100}%` }}
                    >
                        {relevantStatuses.map(status => {
                            const value = d.values[status] || 0;
                            const percentage = totals[i] > 0 ? (value / totals[i]) * 100 : 0;
                            if (percentage === 0) return null;
                            return (
                                <div
                                    key={status}
                                    className={`w-full ${statusColors[status] || statusColors.Default} transition-opacity duration-200`}
                                    style={{ height: `${percentage}%` }}
                                    title={`${status}: ${value}`}
                                ></div>
                            );
                        })}
                    </div>
                     <div className="text-xs text-gray-500 mt-1 absolute -bottom-5 transform group-hover:font-bold">{d.label}</div>
                </div>
            ))}
        </div>
        <div className="flex flex-wrap justify-center space-x-4 mt-6 text-sm">
            {relevantStatuses.map(status => (
                <div key={status} className="flex items-center">
                    <div className={`w-3 h-3 rounded-sm ${statusColors[status] || statusColors.Default} mr-2`}></div>
                    <span>{status}</span>
                </div>
            ))}
        </div>
    </div>
  );
};

export default StackedBarChart;
