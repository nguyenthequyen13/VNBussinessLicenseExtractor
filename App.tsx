import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import ResultDisplay from './components/ResultDisplay';
import { extractBusinessLicense } from './services/geminiService';
import { BusinessLicenseData } from './types';

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<BusinessLicenseData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
    setExtractedData(null);
    await processFile(selectedFile);
  };

  const processFile = async (currentFile: File) => {
    setIsLoading(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(currentFile);
      
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        try {
          const data = await extractBusinessLicense(base64String, currentFile.type);
          setExtractedData(data);
        } catch (err: any) {
          setError(err.message || "Lỗi trích xuất thông tin.");
        } finally {
          setIsLoading(false);
        }
      };

      reader.onerror = () => {
        setError("Lỗi khi đọc file.");
        setIsLoading(false);
      };

    } catch (err) {
      setError("Đã xảy ra lỗi không mong muốn.");
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setExtractedData(null);
    setError(null);
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden">
      {/* Header Compact */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between flex-shrink-0 z-10">
        <div className="flex items-center gap-2">
           <div className="bg-blue-600 p-1 rounded-md">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
           </div>
           <h1 className="text-sm font-bold text-slate-800">VN Business License Extractor</h1>
        </div>
        {extractedData && (
          <button 
            onClick={handleReset}
            className="text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded"
          >
            Tải file khác
          </button>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-grow overflow-hidden relative">
        {isLoading ? (
          <div className="absolute inset-0 z-20 bg-white/90 flex flex-col items-center justify-center p-6 text-center">
             <div className="relative mb-4">
               <div className="w-12 h-12 border-4 border-slate-200 rounded-full"></div>
               <div className="w-12 h-12 border-4 border-blue-600 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
             </div>
             <h3 className="text-lg font-semibold text-slate-800">Đang xử lý với Gemini...</h3>
             <p className="text-sm text-slate-500 mt-1">Đang đọc và trích xuất dữ liệu</p>
          </div>
        ) : null}

        {!extractedData ? (
          <div className="h-full p-4 flex flex-col gap-4 overflow-y-auto">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
               <h2 className="text-sm font-semibold text-slate-700 mb-3">Tải lên giấy phép (Ảnh/PDF)</h2>
               <FileUpload onFileSelect={handleFileSelect} isLoading={isLoading} />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-start gap-2">
                 <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 {error}
              </div>
            )}
            
            <div className="mt-auto text-center text-xs text-slate-400 py-2">
              Powered by Google Gemini 2.5 Flash
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col p-4 overflow-hidden">
             <ResultDisplay data={extractedData} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;