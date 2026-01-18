import React, { useCallback, useState } from 'react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isLoading }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        onFileSelect(e.dataTransfer.files[0]);
      }
    },
    [onFileSelect]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
      // Reset giá trị input để sự kiện onChange có thể kích hoạt lại
      // ngay cả khi người dùng chọn lại cùng một file (ví dụ: retry sau khi lỗi)
      e.target.value = '';
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition-colors cursor-pointer min-h-[160px] ${
        isDragging
          ? 'border-blue-500 bg-blue-50'
          : 'border-slate-300 hover:border-slate-400 bg-slate-50'
      } ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => document.getElementById('fileInput')?.click()}
    >
      <input
        type="file"
        id="fileInput"
        className="hidden"
        accept="image/*,application/pdf"
        onChange={handleInputChange}
      />
      
      <div className="bg-blue-100 p-2 rounded-full mb-3">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      </div>
      
      <p className="text-sm font-medium text-slate-700 text-center">
        Nhấn để chọn file hoặc kéo thả
      </p>
      <p className="text-xs text-slate-500 mt-1 text-center">
        PDF, JPG, PNG
      </p>
    </div>
  );
};

export default FileUpload;