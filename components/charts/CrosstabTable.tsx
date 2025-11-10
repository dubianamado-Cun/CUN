import React from 'react';

interface CrosstabData {
  rows: string[];
  columns: string[];
  data: { [row: string]: { [column: string]: number } };
}

interface CrosstabTableProps {
  data: CrosstabData;
}

const CrosstabTable: React.FC<CrosstabTableProps> = ({ data }) => {
    if (!data || data.rows.length === 0 || data.columns.length === 0) {
        return <div className="flex items-center justify-center h-full text-text-secondary">No hay datos para la tabla cruzada.</div>;
    }
    
    const { rows, columns, data: matrix } = data;

    const allValues = rows.flatMap(row => columns.map(col => matrix[row]?.[col] || 0));
    const maxVal = Math.max(...allValues);

    const getColor = (value: number) => {
        if (value <= 0) return 'bg-transparent text-text-secondary';
        if (maxVal === 0) return 'bg-transparent text-text-secondary';
        
        const ratio = value / maxVal;

        if (ratio > 0.8) return 'bg-green-600 text-white';
        if (ratio > 0.6) return 'bg-green-500 text-white';
        if (ratio > 0.4) return 'bg-green-400 text-black';
        if (ratio > 0.2) return 'bg-green-300 text-black';
        if (ratio > 0) return 'bg-green-100 text-black';
        return 'bg-transparent text-text-secondary';
    };


    return (
        <div className="overflow-x-auto w-full">
            <table className="w-full text-sm text-left border-collapse">
                <thead>
                    <tr className="bg-gray-50">
                        <th className="p-2 font-semibold border-b">Categoría</th>
                        {columns.map(col => (
                            <th key={col} className="p-2 font-semibold border-b text-center whitespace-nowrap">{col}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map(row => (
                        <tr key={row} className="hover:bg-gray-50">
                            <td className="p-2 font-medium border-b whitespace-nowrap">{row}</td>
                            {columns.map(col => {
                                const value = matrix[row]?.[col] || 0;
                                return (
                                    <td 
                                        key={col} 
                                        className={`p-2 border-b text-center font-bold transition-colors ${getColor(value)}`}
                                    >
                                        {value}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default CrosstabTable;