import React from 'react';
import { Ticket } from '../../types';
import Card from '../ui/Card';
import { ArrowRight, File, Rows, Columns, X } from 'lucide-react';

interface DataPreviewProps {
    data: Ticket[];
    fileName: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const DataPreview: React.FC<DataPreviewProps> = ({ data, fileName, onConfirm, onCancel }) => {
    const previewRows = data.slice(0, 10);
    const headers = previewRows.length > 0 ? Object.keys(previewRows[0]) : [];

    const formatCell = (value: any): string => {
        if (value instanceof Date) {
            return value.toLocaleString('es-ES');
        }
        if (typeof value === 'boolean') {
            return value ? 'Sí' : 'No';
        }
        if (value === null || value === undefined) {
            return 'N/A';
        }
        return String(value);
    }
    
    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 flex flex-col items-center">
            <div className="w-full max-w-7xl">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Vista Previa de Datos</h1>
                <p className="text-gray-600 mb-6">Confirma que tus datos se han cargado e interpretado correctamente.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card className="flex items-center space-x-4">
                        <File className="w-8 h-8 text-primary" />
                        <div>
                            <p className="text-sm text-text-secondary">Nombre del Archivo</p>
                            <p className="font-bold text-text-primary truncate" title={fileName}>{fileName}</p>
                        </div>
                    </Card>
                     <Card className="flex items-center space-x-4">
                        <Rows className="w-8 h-8 text-primary" />
                        <div>
                            <p className="text-sm text-text-secondary">Filas Detectadas</p>
                            <p className="font-bold text-text-primary">{data.length.toLocaleString()}</p>
                        </div>
                    </Card>
                     <Card className="flex items-center space-x-4">
                        <Columns className="w-8 h-8 text-primary" />
                        <div>
                            <p className="text-sm text-text-secondary">Columnas Encontradas</p>
                            <p className="font-bold text-text-primary">{headers.length}</p>
                        </div>
                    </Card>
                </div>
                
                <Card title="Primeras 10 Filas">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    {headers.map(header => (
                                        <th key={header} className="px-4 py-2 text-left font-semibold text-text-secondary whitespace-nowrap">{header.replace(/_/g, ' ')}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {previewRows.map((row, rowIndex) => (
                                    <tr key={rowIndex}>
                                        {headers.map(header => (
                                            <td key={header} className="px-4 py-2 text-text-secondary whitespace-nowrap">
                                                <span className="truncate block max-w-xs">{formatCell(row[header])}</span>
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                <div className="mt-6 flex justify-end space-x-4">
                    <button
                        onClick={onCancel}
                        className="flex items-center px-6 py-2 text-sm font-semibold text-text-secondary bg-gray-200 rounded-md hover:bg-gray-300"
                    >
                        <X className="mr-2 h-4 w-4" />
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex items-center px-6 py-2 text-sm font-semibold text-white bg-primary rounded-md hover:bg-accent"
                    >
                        Continuar y Cargar
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DataPreview;
