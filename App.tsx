import React, { useState } from 'react';
import DataUploader from './components/data-ingestion/DataUploader';
import Dashboard from './components/dashboard/Dashboard';
import { Ticket } from './types';
import DataPreview from './components/data-ingestion/DataPreview';

type AppState = 'upload' | 'preview' | 'dashboard';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('upload');
  const [data, setData] = useState<Ticket[] | null>(null);
  const [previewData, setPreviewData] = useState<Ticket[] | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handlePreviewReady = (loadedData: Ticket[], name: string, specificError?: string) => {
    setError(null); // Clear previous errors
    if (specificError) {
        setError(specificError);
        setAppState('upload');
        return;
    }

    if (loadedData.length === 0) {
      setError("El archivo subido está vacío o no se pudo procesar. Por favor, revisa el archivo e inténtalo de nuevo.");
      setAppState('upload');
    } else {
      setPreviewData(loadedData);
      setFileName(name);
      setAppState('preview');
    }
  };
  
  const handleConfirmPreview = () => {
    if (previewData) {
      setData(previewData);
      setAppState('dashboard');
      setPreviewData(null); // Clear preview data
    }
  };

  const handleCancelPreview = () => {
    setPreviewData(null);
    setFileName('');
    setError(null);
    setAppState('upload');
  };


  const handleReset = () => {
    setData(null);
    setFileName('');
    setError(null);
    setAppState('upload');
  };

  const renderContent = () => {
    switch(appState) {
        case 'preview':
            return (
                <DataPreview 
                    data={previewData!} 
                    fileName={fileName}
                    onConfirm={handleConfirmPreview}
                    onCancel={handleCancelPreview}
                />
            );
        case 'dashboard':
            return <Dashboard data={data!} fileName={fileName} onReset={handleReset} />;
        case 'upload':
        default:
            return <DataUploader onPreviewReady={handlePreviewReady} error={error} />;
    }
  }

  return (
    <div className="min-h-screen antialiased">
      {renderContent()}
    </div>
  );
};

export default App;
