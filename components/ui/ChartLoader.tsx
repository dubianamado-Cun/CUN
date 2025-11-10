import React from 'react';
import Loader from './Loader';

interface ChartLoaderProps {
    height?: string;
}

const ChartLoader: React.FC<ChartLoaderProps> = ({ height = 'h-64' }) => {
    return (
        <div className={`flex items-center justify-center ${height}`}>
            <Loader text="Calculando..." />
        </div>
    );
};

export default ChartLoader;
