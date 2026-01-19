import React, { useState, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import ResultDisplay from './components/ResultDisplay';
import HistoryList from './components/HistoryList';
import Settings from './components/Settings';
import { extractBusinessLicense } from './services/geminiService';
import { BusinessLicenseData, HistoryItem } from './types';

// Constants for localStorage keys
const STORAGE_KEY_HISTORY = 'vn_license_history';
const STORAGE_KEY_LAST_SESSION = 'vn_license_last_session';
const STORAGE_KEY_API_KEY = 'gemini_api_key';

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<BusinessLicenseData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // App State
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  // History State
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load data from LocalStorage on Mount
  useEffect(() => {
    // 0. Load API Key
    const storedKey = localStorage.getItem(STORAGE_KEY_API_KEY);
    if (storedKey) {
      setApiKey(storedKey);
    } else {
      setShowSettings(true); // Force show settings if no key
    }

    // 1. Load History
    const savedHistory = localStorage.getItem(STORAGE_KEY_HISTORY);
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }

    // 2. Load Last Session (Auto restore)
    const lastSession = localStorage.getItem(STORAGE_KEY_LAST_SESSION);
    if (lastSession) {
      try {
        const parsedSession = JSON.parse(lastSession);
        // Only restore if valid data exists
        if (parsedSession && parsedSession.data) {
          setExtractedData(parsedSession.data);
        }
      } catch (e) {
        console.error("Failed to restore last session", e);
      }
    }
  }, []);

  const handleSaveApiKey = (key: string) => {
    localStorage.setItem(STORAGE_KEY_API_KEY, key);
    setApiKey(key);
    setShowSettings(false);
  };

  const saveToHistory = (data: BusinessLicenseData, fileName: string) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      fileName: fileName,
      timestamp: Date.now(),
      data: data
    };

    const newHistory = [newItem, ...history];
    setHistory(newHistory);
    
    // Persist to LocalStorage
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(newHistory));
    
    // Save current session
    localStorage.setItem(STORAGE_KEY_LAST_SESSION, JSON.stringify(newItem));
  };

  const handleDeleteHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering selection
    const newHistory = history.filter(item => item.id !== id);
    setHistory(newHistory);
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(newHistory));
  };

  const handleSelectHistory = (item: HistoryItem) => {
    setExtractedData(item.data);
    setShowHistory(false); // Close history view
    // Update last session so if they reload, this is what they see
    localStorage.setItem(STORAGE_KEY_LAST_SESSION, JSON.stringify(item));
  };

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
    setExtractedData(null);
    await processFile(selectedFile);
  };

  const processFile = async (currentFile: File) => {
    if (!apiKey) {
      setShowSettings(true);
      return;
    }

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
          // Auto Save to History
          saveToHistory(data, currentFile.name);
        } catch (err: any) {
          setError(err.message || "Lỗi trích xuất thông tin.");
          // If 403 or invalid key, prompt settings
          if (err.message && (err.message.includes("API Key") || err.message.includes("403"))) {
            setTimeout(() => setShowSettings(true), 2000);
          }
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
    // Clear last session from storage when user explicitly resets
    localStorage.removeItem(STORAGE_KEY_LAST_SESSION);
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden relative">
      {/* Settings Overlay */}
      {showSettings && (
        <Settings 
          onSave={handleSaveApiKey} 
          onClose={() => setShowSettings(false)}
          hasKey={!!apiKey}
        />
      )}

      {/* History List Overlay */}
      {showHistory && (
        <HistoryList 
          history={history} 
          onSelect={handleSelectHistory} 
          onDelete={handleDeleteHistory}
          onClose={() => setShowHistory(false)}
        />
      )}

      {/* Header Compact */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between flex-shrink-0 z-10">
        <div className="flex items-center gap-2">
           <div className="bg-blue-600 p-1 rounded-md">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
           </div>
           <h1 className="text-sm font-bold text-slate-800">VN Business License</h1>
        </div>
        
        <div className="flex items-center gap-2">
          {extractedData && (
            <button 
              onClick={handleReset}
              className="text-xs font-medium text-slate-600 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 px-2 py-1.5 rounded transition-colors"
            >
              Tải mới
            </button>
          )}
          
          <button
            onClick={() => setShowHistory(true)}
            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-full transition-colors relative"
            title="Lịch sử trích xuất"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {/* Dot indicator if history exists */}
            {history.length > 0 && (
               <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full border border-white"></span>
            )}
          </button>

          <button
            onClick={() => setShowSettings(true)}
            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-full transition-colors"
            title="Cài đặt"
          >
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow overflow-hidden relative">
        {isLoading ? (
          <div className="absolute inset-0 z-20 bg-white/90 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
             <div className="relative mb-4">
               <div className="w-12 h-12 border-4 border-slate-200 rounded-full"></div>
               <div className="w-12 h-12 border-blue-600 rounded-full border-4 border-t-transparent animate-spin absolute top-0 left-0"></div>
             </div>
             <h3 className="text-lg font-semibold text-slate-800">Đang xử lý với Gemini...</h3>
             <p className="text-sm text-slate-500 mt-1">Đang đọc và trích xuất dữ liệu</p>
          </div>
        ) : null}

        {!extractedData ? (
          <div className="h-full p-4 flex flex-col gap-4 overflow-y-auto animate-fade-in">
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
            
            {/* Show Empty State or Intro if history is empty, or quick tips */}
            <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
               <h3 className="text-xs font-bold text-blue-800 mb-2 uppercase">Hướng dẫn</h3>
               <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside opacity-80">
                 <li>Vào Cài đặt (icon bánh răng) nhập API Key.</li>
                 <li>Tải lên ảnh hoặc file PDF Giấy phép kinh doanh.</li>
                 <li>Chờ AI trích xuất thông tin tự động.</li>
                 <li>Mở tab AMIS CRM để tự động điền dữ liệu.</li>
               </ul>
            </div>

            <div className="mt-auto text-center text-xs text-slate-400 py-2">
              Powered Rickey
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col p-4 overflow-hidden animate-fade-in">
             <ResultDisplay data={extractedData} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;