import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { UploadCloud } from 'lucide-react';
import { Ticket } from '../../types';
import Logo from '../ui/Logo';
import Card from '../ui/Card';
import Loader from '../ui/Loader';

interface DataUploaderProps {
  onPreviewReady: (data: Ticket[], fileName: string, error?: string) => void;
  error: string | null;
}

// Expanded and corrected mappings to match CSV and internal names.
const COLUMN_MAPPINGS: { [key: string]: string | string[] } = {
    'id': 'id',
    'asunto': 'asunto',
    // Legacy mapping for Licencia filter
    'department name': 'ticket_owner_name',
    // New mapping from provided CSV. This column will populate both the agent analysis and the Licencia filter.
    'ticket owner name': ['ticket_owner_name', 'ultimo_agente'],
    'ultimo agente': 'ultimo_agente', // For compatibility
    'estado': 'status',
    'hora de creación': 'creation_time',
    'hora de creacion': 'creation_time', // Without accent
    'hora de modificación': 'modification_time',
    'hora de modificacion': 'modification_time', // Without accent
    'número de reasignaciones': 'reassignments',
    'is first call resolution': 'is_first_call_resolution',
    'solicitud': 'category',
    'categoria': 'category',
    'sub categorias': 'sub_category',
    'sub categorías': 'sub_category',
    'regional sede': 'regional_sede',
    'programa': 'programa',
    'sentimiento': 'sentiment',
    'vencido': 'vencido',
};


const DataUploader: React.FC<DataUploaderProps> = ({ onPreviewReady, error }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);

    const processData = (results: Papa.ParseResult<any>, file: File) => {
        setIsLoading(true);
        const rawData = results.data;
        const headers = (results.meta.fields || []).map(h => h.trim());

        // FIX: Detect and report duplicate headers to the user.
        const headerCounts = headers.reduce((acc, header) => {
            const cleanHeader = header.replace(/\ufeff/g, '').toLowerCase().trim();
            acc[cleanHeader] = (acc[cleanHeader] || 0) + 1;
            return acc;
        }, {} as { [key: string]: number });

        // FIX: Use Object.keys to avoid TypeScript error where `count` in Object.entries
        // was inferred as `unknown`, preventing comparison.
        const duplicates = Object.keys(headerCounts)
            .filter((header) => headerCounts[header] > 1);

        if (duplicates.length > 0) {
            setIsLoading(false);
            onPreviewReady([], file.name, `Se encontraron columnas duplicadas: ${duplicates.join(', ')}. Por favor, renómbrelas para que sean únicas.`);
            return;
        }

        const headerSet = new Set(headers.map(h => h.replace(/\ufeff/g, '').toLowerCase().replace(/_/g, ' ').trim()));
        const hasCreationTime = headerSet.has('hora de creación') || headerSet.has('hora de creacion');
        const hasModificationTime = headerSet.has('hora de modificación') || headerSet.has('hora de modificacion');

        if (!hasCreationTime || !hasModificationTime) {
            setIsLoading(false);
            onPreviewReady([], file.name, `El archivo debe contener las columnas de fecha requeridas: 'Hora_de_creación' y 'Hora_de_modificación'.`);
            return;
        }

        const typedData: Ticket[] = rawData
            .map((row: any) => {
                const ticket: Partial<Ticket> = {};
                headers.forEach(header => {
                    let value = row[header];
                    // The BOM character might be part of the first header. Let's clean it.
                    const cleanHeaderKey = header.replace(/\ufeff/g, '').toLowerCase().replace(/_/g, ' ').trim();
                    const mappedHeaders = COLUMN_MAPPINGS[cleanHeaderKey] || cleanHeaderKey.replace(/ /g, '_');

                    // Data cleaning and type conversion
                    if (value === null || value === undefined || value === '' || String(value).toLowerCase() === 'null') {
                        value = null;
                    }

                    const processHeaderValue = (h: string, v: any) => {
                         if (v === null) {
                           ticket[h] = null;
                           return;
                        }
                        if (h === 'creation_time' || h === 'modification_time') {
                            const date = new Date(v);
                            ticket[h] = isNaN(date.getTime()) ? null : date;
                        } else if (h === 'is_first_call_resolution') {
                            ticket[h] = ['true', '1', 'yes', 'si', 'verdadero'].includes(String(v).toLowerCase());
                        } else if (['reassignments', 'year'].includes(h)) {
                             const num = Number(v);
                             ticket[h] = isNaN(num) ? null : num;
                        } else {
                            ticket[h] = String(v); // Ensure it's a string
                        }
                    };

                    if (Array.isArray(mappedHeaders)) {
                        mappedHeaders.forEach(h => processHeaderValue(h, value));
                    } else {
                        processHeaderValue(mappedHeaders, value);
                    }
                });

                 // Add year if not present
                if (ticket.creation_time instanceof Date && !ticket.year) {
                    ticket.year = ticket.creation_time.getFullYear();
                }
                
                // Don't include empty rows
                return Object.values(ticket).some(v => v !== null) ? ticket : null;
            })
            .filter((t): t is Ticket => t !== null && t.creation_time instanceof Date && t.modification_time instanceof Date);
        
        setIsLoading(false);
        onPreviewReady(typedData, file.name);
    };

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            setFileName(file.name);
            setIsLoading(true);
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                delimiter: ';', // Explicitly set delimiter for user's CSV format
                complete: (results) => processData(results, file),
                error: (err) => {
                    setIsLoading(false);
                    onPreviewReady([], file.name, `Error al procesar el archivo: ${err.message}`);
                }
            });
        }
    }, [onPreviewReady]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'text/csv': ['.csv'] },
        multiple: false
    });

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-2xl text-center">
                <Logo size="large" />
                <p className="mt-4 text-xl text-gray-600">Analiza tus datos de soporte para descubrir insights.</p>
                <Card className="mt-8">
                    {isLoading ? (
                        <Loader text={`Procesando ${fileName}...`} />
                    ) : (
                        <div {...getRootProps()} className={`p-10 border-2 border-dashed rounded-lg cursor-pointer transition-colors
                            ${isDragActive ? 'border-primary bg-emerald-50' : 'border-gray-300 hover:border-primary'}`}>
                            <input {...getInputProps()} />
                            <div className="flex flex-col items-center">
                                <UploadCloud className="w-12 h-12 text-gray-400 mb-4" />
                                <p className="text-lg font-semibold text-text-primary">
                                    {isDragActive ? 'Suelta el archivo aquí' : 'Arrastra y suelta tu archivo CSV aquí'}
                                 </p>
                                <p className="text-gray-500">o haz clic para seleccionar un archivo</p>
                                <p className="text-xs text-gray-400 mt-2">(Solo archivos .csv son soportados)</p>
                            </div>
                        </div>
                    )}
                     {error && (
                        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md flex items-center justify-between">
                            <span>{error}</span>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default DataUploader;