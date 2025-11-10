import React from 'react';

interface BarData {
  name: string;
  value?: number;
  currentValue?: number;
  previousValue?: number;
}

interface HorizontalBarChartProps {
  data: BarData[];
  compareYears: boolean;
  comparisonYears: { current: number; previous: number } | null;
}

const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({ data, compareYears, comparisonYears }) => {
    if (!data || data.length === 0) {
        return <div className="flex items-center justify-center h-full text-text-secondary">No hay datos para mostrar el gráfico.</div>;
    }

    const maxValue = compareYears
        ? Math.max(...data.map(d => Math.max(d.currentValue || 0, d.previousValue || 0))) || 1
        : Math.max(...data.map(d => d.value || 0)) || 1;
    
    if (compareYears && comparisonYears) {
        return (
            <div>
                <div className="space-y-4 p-2">
                    {data.map((item) => {
                         const currentBarWidth = ((item.currentValue || 0) / maxValue) * 100;
                         const previousBarWidth = ((item.previousValue || 0) / maxValue) * 100;
                         return (
                            <div key={item.name} className="flex items-start group">
                                <div className="w-1/3 text-sm text-text-secondary truncate pr-2 text-right pt-1" title={item.name}>
                                    {item.name}
                                </div>
                                <div className="w-2/3 space-y-1">
                                    <div 
                                        className="bg-primary h-5 flex items-center rounded-r-md transition-all duration-300 ease-out group-hover:bg-accent"
                                        style={{ width: `${currentBarWidth}%`, minWidth: '20px' }}
                                    >
                                        <span className="text-xs font-bold text-white pl-2 pr-1">{(item.currentValue || 0).toLocaleString()}</span>
                                    </div>
                                    <div 
                                        className="bg-secondary h-5 flex items-center rounded-r-md transition-all duration-300 ease-out group-hover:bg-slate-500"
                                        style={{ width: `${previousBarWidth}%`, minWidth: '20px' }}
                                    >
                                        <span className="text-xs font-bold text-white pl-2 pr-1">{(item.previousValue || 0).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                         )
                    })}
                </div>
                 <div className="flex justify-center space-x-4 mt-4 text-sm">
                    <div className="flex items-center"><div className="w-3 h-3 rounded-sm bg-primary mr-2"></div><span>{comparisonYears?.current}</span></div>
                    <div className="flex items-center"><div className="w-3 h-3 rounded-sm bg-secondary mr-2"></div><span>{comparisonYears?.previous}</span></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3 p-2">
            {data.map((item) => {
                 const barWidth = ((item.value || 0) / maxValue) * 100;
                 return (
                    <div key={item.name} className="flex items-center group">
                        <div className="w-1/3 text-sm text-text-secondary truncate pr-2 text-right" title={item.name}>
                            {item.name}
                        </div>
                        <div className="w-2/3">
                            <div 
                                className="bg-primary h-7 flex items-center rounded-r-md transition-all duration-300 ease-out group-hover:bg-accent"
                                style={{ width: `${barWidth}%`, minWidth: '25px' }}
                            >
                                <span className="text-xs font-bold text-white pl-2 pr-1">{(item.value || 0).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                 )
            })}
        </div>
    );
};

export default HorizontalBarChart;
